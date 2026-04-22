'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardIcon,
  InsightIcon,
  LogoMark,
  SparkleBadge,
  cn,
} from './ui';

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
    description: 'Real metrics, trends, and backend-generated insights from the connected SQLite dataset.',
  },
  '/insights': {
    eyebrow: 'AI Analyst',
    title: 'Dedicated insights chat',
    description: 'A focused conversation surface for querying campaign performance without dashboard clutter.',
  },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? pageMeta['/dashboard'];

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_22%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_30%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1680px]">
        <aside className="hidden w-[280px] shrink-0 xl:flex">
          <div className="sticky top-0 flex h-screen w-full flex-col border-r border-white/10 bg-[#07101d]/90 px-6 py-6 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(34,211,238,0.95),rgba(37,99,235,0.95))] text-white shadow-[0_18px_40px_-22px_rgba(56,189,248,0.9)]">
                <LogoMark />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Insight OS</p>
                <p className="text-xs text-slate-400">SQLite-backed workspace</p>
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
                        ? 'border border-white/10 bg-white/10 text-white shadow-[0_14px_32px_-26px_rgba(148,163,184,0.8)]'
                        : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-slate-200',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center rounded-xl',
                        active ? 'bg-white/10 text-cyan-200' : 'bg-white/5 text-slate-300',
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

            <div className="mt-auto rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.9)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Workspace
              </p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
                Two focused surfaces, one persistent shell.
              </h2>
              <div className="mt-5 space-y-3 text-sm leading-6 text-slate-400">
                <p>The dashboard handles monitored metrics, charts, and range-based analysis.</p>
                <p>The insights page keeps the conversation persistent without crowding the dashboard.</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08111f]/75 backdrop-blur-2xl">
            <div className="px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
                    <SparkleBadge />
                    {meta.eyebrow}
                  </span>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {meta.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                    {meta.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                  <HeaderStat
                    label="Data source"
                    value="mock_database.db"
                    meta="Read-only API adapter"
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
                          ? 'border-white/10 bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 text-slate-300',
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
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.95)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{meta}</p>
    </div>
  );
}
