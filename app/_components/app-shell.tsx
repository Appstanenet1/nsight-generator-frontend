'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardIcon, InsightIcon, LogoMark, SparkleBadge, cn } from './ui';

type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const navigationItems: NavigationItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    description: 'Portfolio metrics',
    icon: <DashboardIcon />,
  },
  {
    href: '/insights',
    label: 'Insights',
    description: 'AI analyst chat',
    icon: <InsightIcon />,
  },
];

const pageMeta: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  '/dashboard': {
    eyebrow: 'Live Workspace',
    title: 'Marketing performance dashboard',
    description:
      'Real-time metrics, trends, and AI-generated insights pulled directly from live campaign performance data through your connected cloud source.',
  },
  '/insights': {
    eyebrow: 'AI Analyst',
    title: 'Dedicated insights chat',
    description:
      'A focused conversation surface where the AI queries live, real-time campaign performance data directly instead of relying on a static database snapshot.',
  },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? pageMeta['/dashboard'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.08),transparent_22%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.08),transparent_30%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1680px]">
        <aside className="hidden w-[280px] shrink-0 xl:flex">
          <div className="sticky top-0 flex h-screen w-full flex-col border-r border-slate-200/80 bg-white/90 px-6 py-6 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(34,211,238,0.95),rgba(37,99,235,0.95))] text-white shadow-[0_18px_40px_-22px_rgba(56,189,248,0.9)]">
                <LogoMark />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Insight OS</p>
                <p className="text-xs text-slate-500">Live Cloud Data</p>
              </div>
            </div>

            <nav className="mt-8 space-y-2">
              {navigationItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3',
                      active
                        ? 'border border-slate-200 bg-slate-100 text-slate-900 shadow-[0_14px_32px_-26px_rgba(148,163,184,0.5)]'
                        : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100/80 hover:text-slate-900',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center rounded-xl',
                        active ? 'bg-white text-cyan-600' : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-[28px] border border-slate-200 bg-slate-50/90 p-5 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.18)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Workspace
              </p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                Two focused surfaces, one persistent shell.
              </h2>
              <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                <p>The dashboard monitors live campaign metrics, charts, and range-based analysis.</p>
                <p>The insights page keeps the conversation persistent while the AI queries real-time performance data.</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-2xl">
            <div className="px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                    <SparkleBadge />
                    {meta.eyebrow}
                  </span>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    {meta.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                    {meta.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                  <HeaderStat
                    label="Data source"
                    value="Google Ads (BigQuery)"
                    meta="Live Data Connection"
                  />
                  <HeaderStat label="Views" value="Dashboard + Insights" meta="Shared shell persists" />
                </div>
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1 xl:hidden">
                {navigationItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-full border px-3 py-2 text-sm',
                        active
                          ? 'border-slate-200 bg-slate-100 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600',
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function HeaderStat({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.16)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{meta}</p>
    </div>
  );
}
