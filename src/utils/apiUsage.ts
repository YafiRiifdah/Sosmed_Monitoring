import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

export type ApiKeyUsage = {
  key: string;
  limit: number;
  remaining: number;
  resetAt?: string;
  updatedAt: string;
};

export type RotationEvent = {
  timestamp: string;
  fromKey: string;
  toKey: string;
  reason: string;
};

export type RotationStats = {
  rotationCount: number;
  history: RotationEvent[];
};

async function autoRegisterKeyInRegistry(key: string, provider: "rapidapi" | "apify") {
  try {
    const registryPath = path.join(process.cwd(), "accounts", "accounts_registry.json");
    const securePath = path.join(process.cwd(), "accounts", "accounts_secure.json");
    const maskedKey = key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : "unknown";

    let registry: any[] = [];
    try {
      const content = await readFile(registryPath, "utf8");
      registry = JSON.parse(content);
    } catch {
      return; // Fail silently if registry folder/file is not accessible
    }

    const exists = registry.some((acc) => acc.apiKeyMasked === maskedKey);
    if (!exists) {
      const nextNum = registry.filter((acc) => acc.provider === provider).length + 1;
      const nextId = `${provider}-${String(nextNum).padStart(2, "0")}`;

      const newAccount = {
        id: nextId,
        provider,
        accountName: provider === "rapidapi" ? `RapidAPI Farm ${String(nextNum).padStart(2, "0")}` : `Apify Farm ${String(nextNum).padStart(2, "0")}`,
        email: "yafilala2@gmail.com",
        apiKeyMasked: maskedKey,
        createdAt: new Date().toISOString().slice(0, 10),
        status: "active",
        notes: "Otomatis terdeteksi dan didaftarkan oleh sistem dari file .env."
      };

      registry.push(newAccount);
      await writeFile(registryPath, JSON.stringify(registry, null, 2), "utf8");

      // Save raw key mapping securely
      let secureKeys: Record<string, string> = {};
      try {
        const secureContent = await readFile(securePath, "utf8");
        secureKeys = JSON.parse(secureContent);
      } catch {
        secureKeys = {};
      }
      secureKeys[maskedKey] = key;
      await writeFile(securePath, JSON.stringify(secureKeys, null, 2), "utf8");
    }
  } catch {
    // Fail silently
  }
}

export async function updateApiKeyUsage(key: string, limit: number, remaining: number, resetSeconds?: number) {
  // Automatically register in accounts registry if not already present
  await autoRegisterKeyInRegistry(key, "rapidapi");

  try {
    const filePath = path.join(env.SCRAPE_DEBUG_DIR, "api_usage.json");
    let data: Record<string, ApiKeyUsage> = {};
    try {
      const content = await readFile(filePath, "utf8");
      data = JSON.parse(content);
    } catch {
      // File does not exist yet
    }

    const maskedKey = key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : "unknown";
    const resetAt = resetSeconds ? new Date(Date.now() + resetSeconds * 1000).toISOString() : undefined;

    data[key] = {
      key: maskedKey,
      limit,
      remaining,
      resetAt,
      updatedAt: new Date().toISOString()
    };

    await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");

    // Automatically trigger rotation if remaining is exactly 0
    if (remaining === 0) {
      await rotateApiKey(
        "rapidapi",
        maskedKey,
        "Auto-rotation: Kuota limit habis (sisa = 0)"
      ).catch(() => undefined);
    }
  } catch (error) {
    // Fail silently to avoid breaking scrapers
  }
}

export async function getRotationStats(): Promise<RotationStats> {
  try {
    const statsPath = path.join(process.cwd(), "accounts", "rotation_stats.json");
    const content = await readFile(statsPath, "utf8");
    return JSON.parse(content);
  } catch {
    return { rotationCount: 0, history: [] };
  }
}

export async function logRotation(fromKey: string, toKey: string, reason: string): Promise<void> {
  try {
    const statsPath = path.join(process.cwd(), "accounts", "rotation_stats.json");
    let stats: RotationStats = { rotationCount: 0, history: [] };
    try {
      const content = await readFile(statsPath, "utf8");
      stats = JSON.parse(content);
    } catch {
      // stats stays default
    }

    stats.rotationCount += 1;
    stats.history.unshift({
      timestamp: new Date().toISOString(),
      fromKey,
      toKey,
      reason
    });

    if (stats.history.length > 50) {
      stats.history = stats.history.slice(0, 50);
    }

    await writeFile(statsPath, JSON.stringify(stats, null, 2), "utf8");
  } catch (error) {
    // Fail silently
  }
}

export async function rotateApiKey(
  provider: "rapidapi" | "apify",
  currentKeyMasked: string,
  reason: string
): Promise<string | undefined> {
  try {
    const registryPath = path.join(process.cwd(), "accounts", "accounts_registry.json");
    const securePath = path.join(process.cwd(), "accounts", "accounts_secure.json");

    let registry: any[] = [];
    try {
      const content = await readFile(registryPath, "utf8");
      registry = JSON.parse(content);
    } catch {
      return undefined;
    }

    const activeAccount = registry.find(
      (acc) => acc.provider === provider && acc.apiKeyMasked === currentKeyMasked && acc.status === "active"
    ) || registry.find((acc) => acc.provider === provider && acc.status === "active");

    if (!activeAccount) {
      return undefined;
    }

    const candidates = registry.filter(
      (acc) => acc.provider === provider && acc.apiKeyMasked !== activeAccount.apiKeyMasked && acc.status === "inactive"
    );

    if (candidates.length === 0) {
      return undefined;
    }

    const nextAccount = candidates[0];

    registry = registry.map((acc) => {
      if (acc.id === activeAccount.id) {
        return { ...acc, status: "inactive" };
      }
      if (acc.id === nextAccount.id) {
        return { ...acc, status: "active" };
      }
      return acc;
    });

    await writeFile(registryPath, JSON.stringify(registry, null, 2), "utf8");

    let secureKeys: Record<string, string> = {};
    try {
      const secureContent = await readFile(securePath, "utf8");
      secureKeys = JSON.parse(secureContent);
    } catch {
      // ignore
    }

    const nextRawKey = secureKeys[nextAccount.apiKeyMasked];

    if (provider === "rapidapi" && nextRawKey) {
      try {
        const envPath = path.join(process.cwd(), ".env");
        let envContent = await readFile(envPath, "utf8");
        if (envContent.includes("RAPIDAPI_KEY=")) {
          envContent = envContent.replace(/RAPIDAPI_KEY=.*/, `RAPIDAPI_KEY=${nextRawKey}`);
        } else {
          envContent += `\nRAPIDAPI_KEY=${nextRawKey}`;
        }
        await writeFile(envPath, envContent, "utf8");
      } catch {
        // ignore
      }
    }

    await logRotation(activeAccount.apiKeyMasked, nextAccount.apiKeyMasked, reason);

    return nextRawKey;
  } catch (error) {
    return undefined;
  }
}

export async function activateApiKey(
  provider: "rapidapi" | "apify",
  targetMaskedKey: string
): Promise<any> {
  const registryPath = path.join(process.cwd(), "accounts", "accounts_registry.json");
  const securePath = path.join(process.cwd(), "accounts", "accounts_secure.json");

  let registry: any[] = [];
  try {
    const content = await readFile(registryPath, "utf8");
    registry = JSON.parse(content);
  } catch {
    throw new Error("Gagal membaca daftar akun API.");
  }

  const activeAccount = registry.find((acc) => acc.provider === provider && acc.status === "active");
  const targetAccount = registry.find((acc) => acc.provider === provider && acc.apiKeyMasked === targetMaskedKey);

  if (!targetAccount) {
    throw new Error("Kunci API KEY target tidak ditemukan.");
  }

  if (targetAccount.status === "invalid") {
    throw new Error("Kunci API KEY target tidak valid (dummy) dan tidak dapat diaktifkan sebelum diverifikasi.");
  }

  if (activeAccount && activeAccount.apiKeyMasked === targetMaskedKey) {
    return targetAccount;
  }

  const fromMaskedKey = activeAccount ? activeAccount.apiKeyMasked : "none";

  registry = registry.map((acc) => {
    if (acc.provider === provider) {
      if (acc.apiKeyMasked === targetMaskedKey) {
        return { ...acc, status: "active" };
      } else {
        return { ...acc, status: "inactive" };
      }
    }
    return acc;
  });

  await writeFile(registryPath, JSON.stringify(registry, null, 2), "utf8");

  let secureKeys: Record<string, string> = {};
  try {
    const secureContent = await readFile(securePath, "utf8");
    secureKeys = JSON.parse(secureContent);
  } catch {
    // ignore
  }

  const rawKey = secureKeys[targetMaskedKey];

  if (provider === "rapidapi" && rawKey) {
    try {
      const envPath = path.join(process.cwd(), ".env");
      let envContent = await readFile(envPath, "utf8");
      if (envContent.includes("RAPIDAPI_KEY=")) {
        envContent = envContent.replace(/RAPIDAPI_KEY=.*/, `RAPIDAPI_KEY=${rawKey}`);
      } else {
        envContent += `\nRAPIDAPI_KEY=${rawKey}`;
      }
      await writeFile(envPath, envContent, "utf8");
    } catch {
      // ignore
    }
  }

  await logRotation(
    fromMaskedKey,
    targetMaskedKey,
    `Manual: User memicu aktivasi via Dashboard (${targetAccount.accountName})`
  );

  return targetAccount;
}
export async function verifyRapidApiKey(apiKey: string): Promise<{ success: boolean; limit?: number; remaining?: number; message?: string }> {
  try {
    const response = await fetch(`${env.RAPIDAPI_LIKES_URL}?short_code=C75vWvMh9-G`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": env.RAPIDAPI_HOST
      }
    });

    const status = response.status;
    const errText = status !== 200 ? await response.text().catch(() => "") : "";

    if (status === 401 || status === 403 || errText.toLowerCase().includes("invalid api key") || errText.toLowerCase().includes("not subscribed") || errText.toLowerCase().includes("blocked")) {
      return { success: false, message: "Kunci API ditolak oleh RapidAPI (Kunci salah atau belum berlangganan)." };
    }

    const remainingHeader = response.headers.get("x-ratelimit-requests-remaining");
    const limitHeader = response.headers.get("x-ratelimit-requests-limit");

    if (remainingHeader && limitHeader) {
      const remaining = parseInt(remainingHeader, 10);
      const limit = parseInt(limitHeader, 10);
      return { success: true, limit, remaining };
    }

    if (status === 200 || status === 404) {
      return { success: true, limit: 100, remaining: 100 };
    }

    return { success: false, message: `Verifikasi gagal dengan status HTTP ${status}.` };
  } catch (error: any) {
    return { success: false, message: `Koneksi ke RapidAPI gagal: ${error.message}` };
  }
}

export async function verifyApifyToken(token: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`https://api.apify.com/v2/users/me?token=${token}`);
    if (response.ok) {
      return { success: true };
    }
    return { success: false, message: "Token Apify tidak valid atau tidak memiliki akses." };
  } catch (error: any) {
    return { success: false, message: `Koneksi ke Apify gagal: ${error.message}` };
  }
}

export async function verifyApiKey(
  provider: "rapidapi" | "apify",
  apiKeyMasked: string
): Promise<{ success: boolean; message: string; limit?: number; remaining?: number }> {
  const securePath = path.join(process.cwd(), "accounts", "accounts_secure.json");
  let rawKey: string | undefined = undefined;

  try {
    const secureContent = await readFile(securePath, "utf8");
    const secureKeys = JSON.parse(secureContent);
    rawKey = secureKeys[apiKeyMasked];
  } catch {
    // Ignore
  }

  // Fallback to env if matches
  if (!rawKey && provider === "rapidapi" && env.RAPIDAPI_KEY) {
    const maskedEnvKey = env.RAPIDAPI_KEY.length > 8
      ? `${env.RAPIDAPI_KEY.slice(0, 4)}...${env.RAPIDAPI_KEY.slice(-4)}`
      : "unknown";
    if (maskedEnvKey === apiKeyMasked) {
      rawKey = env.RAPIDAPI_KEY;
    }
  }

  if (!rawKey) {
    return { success: false, message: "API KEY rahasia (raw key) tidak ditemukan di server (kunci dummy)." };
  }

  if (provider === "rapidapi") {
    const check = await verifyRapidApiKey(rawKey);
    return {
      success: check.success,
      message: check.message || (check.success ? "API KEY RapidAPI valid." : "API KEY RapidAPI tidak valid."),
      limit: check.limit,
      remaining: check.remaining
    };
  } else {
    const apifyCheck = await verifyApifyToken(rawKey);
    return apifyCheck.success
      ? { success: true, limit: 100, remaining: 100, message: "Token Apify valid." }
      : { success: false, message: apifyCheck.message || "Token Apify tidak valid." };
  }
}

export async function verifyAndSaveApiKey(
  provider: "rapidapi" | "apify",
  apiKeyMasked: string
): Promise<{ success: boolean; message: string; limit?: number; remaining?: number }> {
  const check = await verifyApiKey(provider, apiKeyMasked);

  const registryPath = path.join(process.cwd(), "accounts", "accounts_registry.json");
  let registry: any[] = [];
  try {
    const content = await readFile(registryPath, "utf8");
    registry = JSON.parse(content);
  } catch {
    // ignore
  }

  const account = registry.find((acc) => acc.provider === provider && acc.apiKeyMasked === apiKeyMasked);
  if (!account) {
    return check;
  }

  if (check.success) {
    // Update status in registry from invalid to inactive (or active if it's currently active)
    if (account.status === "invalid") {
      account.status = "inactive";
      await writeFile(registryPath, JSON.stringify(registry, null, 2), "utf8");
    }

    // Save quota usage in api_usage.json
    if (check.limit !== undefined && check.remaining !== undefined) {
      const securePath = path.join(process.cwd(), "accounts", "accounts_secure.json");
      let rawKey: string | undefined = undefined;
      try {
        const secureContent = await readFile(securePath, "utf8");
        const secureKeys = JSON.parse(secureContent);
        rawKey = secureKeys[apiKeyMasked];
      } catch {
        // ignore
      }
      if (!rawKey && provider === "rapidapi" && env.RAPIDAPI_KEY) {
        rawKey = env.RAPIDAPI_KEY;
      }
      if (rawKey) {
        await updateApiKeyUsage(rawKey, check.limit, check.remaining);
      }
    }
  } else {
    // Mark as invalid in registry
    account.status = "invalid";
    await writeFile(registryPath, JSON.stringify(registry, null, 2), "utf8");
  }

  return check;
}


export async function getAccountsRegistry(): Promise<any[]> {
  try {
    const registryPath = path.join(process.cwd(), "accounts", "accounts_registry.json");
    const content = await readFile(registryPath, "utf8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function getApiKeyUsage(): Promise<ApiKeyUsage[]> {
  try {
    const filePath = path.join(env.SCRAPE_DEBUG_DIR, "api_usage.json");
    const content = await readFile(filePath, "utf8");
    const data: Record<string, ApiKeyUsage> = JSON.parse(content);
    return Object.values(data);
  } catch {
    return [];
  }
}

export async function registerNewApiKey(
  provider: "rapidapi" | "apify",
  accountName: string,
  email: string,
  apiKey: string,
  notes?: string
) {
  // Verify key before registering
  if (provider === "rapidapi") {
    const check = await verifyRapidApiKey(apiKey);
    if (!check.success) {
      throw new Error(check.message || "Registrasi gagal karena API KEY RapidAPI tidak valid.");
    }
  } else {
    const check = await verifyApifyToken(apiKey);
    if (!check.success) {
      throw new Error(check.message || "Registrasi gagal karena token Apify tidak valid.");
    }
  }

  const registryPath = path.join(process.cwd(), "accounts", "accounts_registry.json");
  const securePath = path.join(process.cwd(), "accounts", "accounts_secure.json");
  const maskedKey = apiKey.length > 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "unknown";

  // 1. Update accounts_registry.json (Public Info)
  let registry: any[] = [];
  try {
    const content = await readFile(registryPath, "utf8");
    registry = JSON.parse(content);
  } catch {
    registry = [];
  }

  // Deactivate other keys for same provider to make this one the only active key
  registry = registry.map((acc) => {
    if (acc.provider === provider) {
      return { ...acc, status: "inactive" };
    }
    return acc;
  });

  // Remove existing duplicate entry with same masked key if any
  registry = registry.filter((acc) => acc.apiKeyMasked !== maskedKey);

  const nextNum = registry.filter((acc) => acc.provider === provider).length + 1;
  const nextId = `${provider}-${String(nextNum).padStart(2, "0")}`;

  const newAccount = {
    id: nextId,
    provider,
    accountName,
    email,
    apiKeyMasked: maskedKey,
    createdAt: new Date().toISOString().slice(0, 10),
    status: "active",
    notes: notes || "Didaftarkan secara manual melalui Dashboard."
  };

  registry.push(newAccount);
  await writeFile(registryPath, JSON.stringify(registry, null, 2), "utf8");

  // 2. Update accounts_secure.json (Private raw key)
  let secureKeys: Record<string, string> = {};
  try {
    const secureContent = await readFile(securePath, "utf8");
    secureKeys = JSON.parse(secureContent);
  } catch {
    secureKeys = {};
  }

  secureKeys[maskedKey] = apiKey;
  await writeFile(securePath, JSON.stringify(secureKeys, null, 2), "utf8");

  // 3. Update env / .env file
  try {
    const envPath = path.join(process.cwd(), ".env");
    let envContent = await readFile(envPath, "utf8");

    if (provider === "rapidapi") {
      if (envContent.includes("RAPIDAPI_KEY=")) {
        envContent = envContent.replace(/RAPIDAPI_KEY=.*/, `RAPIDAPI_KEY=${apiKey}`);
      } else {
        envContent += `\nRAPIDAPI_KEY=${apiKey}`;
      }
      await writeFile(envPath, envContent, "utf8");
    }
  } catch (error) {
    // Fail silently on env writing
  }

  return newAccount;
}

export async function getActiveApiKey(provider: "rapidapi" | "apify"): Promise<string | undefined> {
  try {
    const registryPath = path.join(process.cwd(), "accounts", "accounts_registry.json");
    const securePath = path.join(process.cwd(), "accounts", "accounts_secure.json");

    const content = await readFile(registryPath, "utf8");
    const registry = JSON.parse(content);

    const activeAccount = registry.find((acc: any) => acc.provider === provider && acc.status === "active");
    if (activeAccount) {
      const secureContent = await readFile(securePath, "utf8");
      const secureKeys = JSON.parse(secureContent);
      const rawKey = secureKeys[activeAccount.apiKeyMasked];
      if (rawKey) return rawKey;
    }
  } catch {
    // Fail silently, fallback to env
  }

  return provider === "rapidapi" ? env.RAPIDAPI_KEY : undefined;
}

