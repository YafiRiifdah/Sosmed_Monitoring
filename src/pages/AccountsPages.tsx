import { SocialAccountPage } from "../components/accounts/SocialAccountPage";

export function TargetAccountsPage() {
  return <SocialAccountPage kind="target" />;
}

export function MonitoredAccountsPage() {
  return <SocialAccountPage kind="monitored" />;
}
