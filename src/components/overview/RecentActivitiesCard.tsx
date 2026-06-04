import { Clock } from "lucide-react";
import { Card } from "../Card";

export type OverviewActivity = {
  title: string;
  time: string;
  status: string;
};

type Props = {
  activities: OverviewActivity[];
};

export function RecentActivitiesCard({ activities }: Props) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[var(--text)]">
            Recent Activities
          </h2>
          <p className="text-xs text-[var(--text-subtle)]">
            Dummy log sementara sebelum fetching manual.
          </p>
        </div>
        <Clock size={18} className="text-[var(--accent)]" />
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.title}
            className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-3"
          >
            <div>
              <div className="text-sm font-medium text-[var(--text)]">
                {activity.title}
              </div>
              <div className="text-xs text-[var(--text-subtle)]">
                {activity.time}
              </div>
            </div>

            <span className="rounded-full border border-[var(--accent-ring)] bg-[var(--accent-soft)] px-2.5 py-1 text-xs text-[var(--accent)]">
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
