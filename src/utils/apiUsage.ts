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
  } catch (error) {
    // Fail silently to avoid breaking scrapers
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

