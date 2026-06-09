import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  TrendingUp,
  Calendar,
  Filter,
  Info,
  ChevronRight,
} from "lucide-react";

// --- Data ---
const platformData = [
  { name: "Instagram", value: 8298, percent: 33.8, change: 15.3, color: "#E1306C" },
  { name: "TikTok", value: 9470, percent: 38.6, change: 20.1, color: "#000000" },
  { name: "Facebook", value: 6770, percent: 27.6, change: 12.4, color: "#1877F2" },
];

const engagementTargetData = [
  { date: "16 Mei", dpc: 8200, dpd: 6800, dpp: 5800 },
  { date: "17 Mei", dpc: 8400, dpd: 7000, dpp: 6100 },
  { date: "18 Mei", dpc: 8500, dpd: 7100, dpp: 6200 },
  { date: "19 Mei", dpc: 8600, dpd: 7200, dpp: 6300 },
  { date: "20 Mei", dpc: 8500, dpd: 7100, dpp: 6200 },
  { date: "21 Mei", dpc: 8400, dpd: 7000, dpp: 6100 },
  { date: "22 Mei", dpc: 8300, dpd: 6900, dpp: 6000 },
];

const kinerjaData = [
  {
    id: 1,
    name: "PAC Gubeng",
    handle: "@pacgubeng",
    platform: "Instagram",
    totalEngagement: 9412,
    dpc: 3312,
    dpcPercent: 35.2,
    dpd: 3021,
    dpdPercent: 32.1,
    dpp: 3079,
    dppPercent: 32.7,
    score: 92,
    rating: "Sangat Baik",
  },
  {
    id: 2,
    name: "PAC Tambaksari",
    handle: "@pactambaksari",
    platform: "TikTok",
    totalEngagement: 8156,
    dpc: 2842,
    dpcPercent: 34.8,
    dpd: 2601,
    dpdPercent: 31.9,
    dpp: 2713,
    dppPercent: 33.3,
    score: 85,
    rating: "Sangat Baik",
  },
  {
    id: 3,
    name: "PAC Rungkut",
    handle: "@pacrungkut",
    platform: "Facebook",
    totalEngagement: 6970,
    dpc: 2498,
    dpcPercent: 35.9,
    dpd: 2270,
    dpdPercent: 32.6,
    dpp: 2202,
    dppPercent: 31.6,
    score: 78,
    rating: "Baik",
  },
];

const distribusiSkorData = [
  { name: "Sangat Baik (80-100)", value: 1, percent: 33.3, color: "#22C55E" },
  { name: "Baik (60-79)", value: 2, percent: 66.7, color: "#3B82F6" },
  { name: "Cukup (40-59)", value: 0, percent: 0, color: "#F59E0B" },
  { name: "Kurang (<40)", value: 0, percent: 0, color: "#EF4444" },
];

const topPACData = [
  { rank: 1, name: "PAC Gubeng", handle: "@pacgubeng", engagement: 9412 },
  { rank: 2, name: "PAC Tambaksari", handle: "@pactambaksari", engagement: 8156 },
  { rank: 3, name: "PAC Rungkut", handle: "@pacrungkut", engagement: 6970 },
];

// --- Icon Components ---
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  if (platform === "Instagram") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
        <InstagramIcon className="h-4 w-4 text-white" />
      </div>
    );
  }

  if (platform === "TikTok") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black">
        <TikTokIcon className="h-4 w-4 text-white" />
      </div>
    );
  }

  if (platform === "Facebook") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1877F2]">
        <FacebookIcon className="h-4 w-4 text-white" />
      </div>
    );
  }

  return null;
}

function StatCard({
  icon,
  iconBg,
  title,
  value,
  subtitle,
  change,
  changeColor = "text-[var(--success)]",
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  subtitle: string;
  change: string;
  changeColor?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] sm:gap-4 sm:p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${iconBg}`}>
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text-subtle)]">{title}</p>
        <p className="mt-1 truncate text-xl font-bold leading-tight text-[var(--text)] sm:text-2xl">
          {value}
        </p>
        <p className="mt-1 truncate text-xs text-[var(--text-subtle)]">{subtitle}</p>
        <p className={`mt-1 truncate text-xs font-medium ${changeColor}`}>
          + {change} dari periode lalu
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-3">
      <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--text)]">
        {value}
      </p>
    </div>
  );
}

export function AnalyticsPage() {
  const [dateRange] = useState("23 Mei 2024 - 22 Mei 2024");
  const [chartPeriod, setChartPeriod] = useState("Harian");

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden text-[var(--text-muted)]">
      {/* Header */}
      <div className="px-3 py-4 sm:px-4 md:px-6">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-[var(--text)]">
              Analytics
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-subtle)]">
              Pantau kinerja akun PAC dalam memberikan engagement kepada akun DPC,
              DPD, dan DPP
            </p>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap xl:w-auto xl:justify-end">
            <div className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--field-bg)] px-3 py-2 text-sm text-[var(--text-muted)] sm:w-auto">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">{dateRange}</span>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--field-bg)] px-4 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-hover)] sm:w-auto">
              <Filter className="h-4 w-4 shrink-0" />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-3 pb-6 sm:px-4 md:px-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          <StatCard
            icon={<Users className="h-6 w-6 text-[var(--accent)]" />}
            iconBg="bg-[var(--accent-soft)]"
            title="Total Akun PAC"
            value="3"
            subtitle="Akun Aktif"
            change="12%"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6 text-[var(--info)]" />}
            iconBg="bg-[var(--info-soft)]"
            title="Total Engagement"
            value="24.538"
            subtitle="Semua Platform"
            change="18.7%"
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-[var(--success)]" />}
            iconBg="bg-[var(--success-soft)]"
            title="Engagement ke DPC"
            value="8.652"
            subtitle="35.2% dari total"
            change="15.3%"
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-[var(--warning)]" />}
            iconBg="bg-[var(--warning-soft)]"
            title="Engagement ke DPD"
            value="7.892"
            subtitle="32.1% dari total"
            change="10.6%"
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-[var(--danger)]" />}
            iconBg="bg-[var(--danger-soft)]"
            title="Engagement ke DPP"
            value="8.994"
            subtitle="32.7% dari total"
            change="21.8%"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] sm:p-6">
            <h3 className="mb-4 text-base font-semibold text-[var(--text)]">
              Engagement Berdasarkan Platform
            </h3>

            <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center">
              <div className="relative mx-auto h-[190px] w-[190px] shrink-0 sm:h-[210px] sm:w-[210px] lg:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[var(--text)]">
                    24.538
                  </span>
                  <span className="text-xs text-[var(--text-subtle)]">
                    Total
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-4">
                {platformData.map((item) => (
                  <div key={item.name} className="flex min-w-0 items-center gap-3">
                    <PlatformBadge platform={item.name} />

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <span className="min-w-0 truncate text-sm font-medium text-[var(--text-muted)]">
                          {item.name}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-[var(--text)]">
                          {item.value.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-[var(--text-subtle)]">
                          {item.percent}%
                        </span>
                        <span className="text-xs font-medium text-[var(--success)]">
                          + {item.change}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] sm:p-6">
            <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="min-w-0 truncate text-base font-semibold text-[var(--text)]">
                  Engagement ke Akun Target
                </h3>
                <Info className="h-4 w-4 shrink-0 text-[var(--text-subtle)]" />
              </div>

              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--field-bg)] px-3 py-1.5 text-sm text-[var(--text-muted)] sm:w-auto"
              >
                <option>Harian</option>
                <option>Mingguan</option>
                <option>Bulanan</option>
              </select>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-green-500" />
                ke DPC
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-orange-400" />
                ke DPD
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-red-500" />
                ke DPP
              </span>
            </div>

            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementTargetData} barGap={2} barCategoryGap="18%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-soft)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--text-subtle)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    width={34}
                    tick={{ fontSize: 10, fill: "var(--text-subtle)" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v / 1000}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      backgroundColor: "var(--surface-strong)",
                      border: "1px solid var(--border-soft)",
                      color: "var(--text)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="dpc" fill="#22C55E" radius={[4, 4, 0, 0]} name="ke DPC" />
                  <Bar dataKey="dpd" fill="#F97316" radius={[4, 4, 0, 0]} name="ke DPD" />
                  <Bar dataKey="dpp" fill="#EF4444" radius={[4, 4, 0, 0]} name="ke DPP" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
          <div className="min-w-0 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] sm:p-6 2xl:col-span-2">
            <h3 className="mb-4 text-base font-semibold text-[var(--text)]">
              Kinerja PAC
            </h3>

            {/* Mobile / Tablet Cards */}
            <div className="space-y-4 xl:hidden">
              {kinerjaData.map((row) => (
                <div
                  key={row.id}
                  className="min-w-0 rounded-xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4"
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--text-subtle)]">
                          #{row.id}
                        </span>
                        <PlatformBadge platform={row.platform} />
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-[var(--text)]">
                        {row.name}
                      </p>
                      <p className="truncate text-xs text-[var(--text-subtle)]">
                        {row.handle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[var(--success-soft)] px-2 text-sm font-bold text-[var(--success)]">
                        {row.score}
                      </span>
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        {row.rating}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Metric label="Total Engagement" value={row.totalEngagement.toLocaleString("id-ID")} />
                    <Metric label="ke DPC" value={`${row.dpc.toLocaleString("id-ID")} (${row.dpcPercent}%)`} />
                    <Metric label="ke DPD" value={`${row.dpd.toLocaleString("id-ID")} (${row.dpdPercent}%)`} />
                    <Metric label="ke DPP" value={`${row.dpp.toLocaleString("id-ID")} (${row.dppPercent}%)`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-soft)]">
                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase text-[var(--text-subtle)]">#</th>
                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase text-[var(--text-subtle)]">Akun PAC</th>
                    <th className="px-2 py-3 text-left text-xs font-semibold uppercase text-[var(--text-subtle)]">Platform</th>
                    <th className="px-2 py-3 text-right text-xs font-semibold uppercase text-[var(--text-subtle)]">Total</th>
                    <th className="px-2 py-3 text-right text-xs font-semibold uppercase text-[var(--text-subtle)]">DPC</th>
                    <th className="px-2 py-3 text-right text-xs font-semibold uppercase text-[var(--text-subtle)]">DPD</th>
                    <th className="px-2 py-3 text-right text-xs font-semibold uppercase text-[var(--text-subtle)]">DPP</th>
                    <th className="px-2 py-3 text-center text-xs font-semibold uppercase text-[var(--text-subtle)]">Skor</th>
                  </tr>
                </thead>

                <tbody>
                  {kinerjaData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--border-soft)] hover:bg-[var(--surface-hover)]"
                    >
                      <td className="px-2 py-4 font-medium text-[var(--text-subtle)]">
                        {row.id}
                      </td>
                      <td className="px-2 py-4">
                        <p className="font-semibold text-[var(--text)]">{row.name}</p>
                        <p className="text-xs text-[var(--text-subtle)]">{row.handle}</p>
                      </td>
                      <td className="px-2 py-4">
                        <PlatformBadge platform={row.platform} />
                      </td>
                      <td className="px-2 py-4 text-right font-semibold text-[var(--text)]">
                        {row.totalEngagement.toLocaleString("id-ID")}
                      </td>
                      <td className="px-2 py-4 text-right text-[var(--text)]">
                        {row.dpc.toLocaleString("id-ID")}
                        <div className="text-xs text-[var(--text-subtle)]">
                          ({row.dpcPercent}%)
                        </div>
                      </td>
                      <td className="px-2 py-4 text-right text-[var(--text)]">
                        {row.dpd.toLocaleString("id-ID")}
                        <div className="text-xs text-[var(--text-subtle)]">
                          ({row.dpdPercent}%)
                        </div>
                      </td>
                      <td className="px-2 py-4 text-right text-[var(--text)]">
                        {row.dpp.toLocaleString("id-ID")}
                        <div className="text-xs text-[var(--text-subtle)]">
                          ({row.dppPercent}%)
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success-soft)] text-sm font-bold text-[var(--success)]">
                            {row.score}
                          </span>
                          <span className="text-xs font-medium text-[var(--success)]">
                            {row.rating}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-xs text-[var(--text-subtle)]">
              Menampilkan 1 - 3 dari 3 PAC
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="min-w-0 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] sm:p-6">
              <h3 className="mb-4 text-base font-semibold text-[var(--text)]">
                Distribusi Skor Kinerja PAC
              </h3>

              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center 2xl:flex-col 2xl:items-start">
                <div className="relative mx-auto h-[140px] w-[140px] shrink-0 sm:mx-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribusiSkorData.filter((d) => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {distribusiSkorData
                          .filter((d) => d.value > 0)
                          .map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-[var(--text)]">3</span>
                    <span className="text-[10px] text-[var(--text-subtle)]">
                      Total
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-2.5">
                  {distribusiSkorData.map((item) => (
                    <div key={item.name} className="flex min-w-0 items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="min-w-0 flex-1 truncate text-xs text-[var(--text-muted)]">
                        {item.name}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-[var(--text)]">
                        {item.value}
                      </span>
                      <span className="shrink-0 text-xs text-[var(--text-subtle)]">
                        ({item.percent}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-[var(--card-shadow)] sm:p-6">
              <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between 2xl:flex-col 2xl:items-start">
                <h3 className="text-base font-semibold text-[var(--text)]">
                  Top PAC Berdasarkan Engagement
                </h3>

                <select className="w-full rounded-lg border border-[var(--border)] bg-[var(--field-bg)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] sm:w-auto 2xl:w-full">
                  <option>Semua Platform</option>
                  <option>Instagram</option>
                  <option>TikTok</option>
                  <option>Facebook</option>
                </select>
              </div>

              <div className="space-y-3">
                {topPACData.map((item) => (
                  <div
                    key={item.rank}
                    className="flex min-w-0 items-center gap-3 border-b border-[var(--border-soft)] py-2 last:border-0"
                  >
                    <span className="w-5 shrink-0 text-sm font-bold text-[var(--text-subtle)]">
                      {item.rank}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text)]">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-[var(--text-subtle)]">
                        {item.handle}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-bold text-[var(--text)]">
                      {item.engagement.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              <button className="mt-4 flex w-full items-center justify-between border-t border-[var(--border-soft)] pt-3 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
                <span>Lihat semua PAC</span>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}