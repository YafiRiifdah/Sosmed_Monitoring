import { Facebook } from "lucide-react";
import { SocialApiKeyPlaceholder } from "./SocialApiKeyPlaceholder";

export function FacebookApiKeyManager() {
  return (
    <SocialApiKeyPlaceholder
      platformName="Facebook"
      description="Halaman quota Facebook sudah disiapkan tanpa koneksi backend."
      icon={<Facebook size={22} />}
    />
  );
}
