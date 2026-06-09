import { SocialAccountPage } from "../components/accounts/SocialAccountPage";
import type { SocialPlatform } from "../components/accounts/SocialAccountPage";

export function TargetAccountsPage({ platform = "instagram" }: { platform?: SocialPlatform }) {
  return <SocialAccountPage kind="target" initialPlatform={platform} />;
}

export function MonitoredAccountsPage({ platform = "instagram" }: { platform?: SocialPlatform }) {
  return <SocialAccountPage kind="monitored" initialPlatform={platform} />;
}
