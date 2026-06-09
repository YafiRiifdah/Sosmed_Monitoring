import { Music2 } from "lucide-react";
import { SocialApiKeyPlaceholder } from "./SocialApiKeyPlaceholder";

export function TikTokApiKeyManager() {
  return (
    <SocialApiKeyPlaceholder
      platformName="TikTok"
      description="Halaman quota TikTok sudah disiapkan tanpa koneksi backend."
      icon={<Music2 size={22} />}
    />
  );
}
