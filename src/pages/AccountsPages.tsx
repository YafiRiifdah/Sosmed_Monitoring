import { AccountManager } from "../components/AccountManager";

export function TargetAccountsPage() {
  return <AccountManager title="Target Accounts" kind="target" />;
}

export function MonitoredAccountsPage() {
  return <AccountManager title="Monitored Accounts" kind="monitored" />;
}
