import { SocialApiKeyPage } from "../components/apiKeys/SocialApiKeyPage";
import type { ApiKeyPlatform } from "../components/apiKeys/SocialApiKeyHeader";

export function ApiKeysPage({ platform = "instagram" }: { platform?: ApiKeyPlatform }) {
  return <SocialApiKeyPage initialPlatform={platform} />;
}
