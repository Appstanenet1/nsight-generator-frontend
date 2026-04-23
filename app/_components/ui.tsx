'use client';

import { useState } from 'react';
import type {
  DashboardCampaign,
  DashboardInsight,
  DashboardKpi,
  DashboardTrendPoint,
  DateRangeOption,
  FocusArea,
  Tone,
} from '@/app/_lib/dashboard-types';
import { DATE_RANGE_OPTIONS } from '@/app/_lib/dashboard-types';

const toneStyles: Record<
  Tone,
  {
    badge: string;
    dot: string;
    emphasis: string;
    accent: string;
  }
> = {
  positive: {
    badge: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    dot: 'bg-emerald-400',
    emphasis: 'text-emerald-300',
    accent: 'from-emerald-500/25 via-emerald-400/10 to-transparent',
  },
  warning: {
    badge: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    dot: 'bg-amber-400',
    emphasis: 'text-amber-300',
    accent: 'from-amber-500/25 via-amber-400/10 to-transparent',
  },
  negative: {
    badge: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
    dot: 'bg-rose-400',
    emphasis: 'text-rose-300',
    accent: 'from-rose-500/25 via-rose-400/10 to-transparent',
  },
};

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SurfaceCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_35px_100px_-55px_rgba(15,23,42,0.98)] backdrop-blur-xl',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_35%)]" />
      <div className="relative">{children}</div>
    </section>
  );
}

export function PageLead({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">{description}</p>
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {badge ? <div className="shrink-0">{badge}</div> : null}
    </div>
  );
}

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const styles = toneStyles[kpi.tone];

  return (
    <SurfaceCard className="p-5">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${styles.accent}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', styles.dot)} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              {kpi.label}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="text-3xl font-semibold tracking-tight text-white">
              {kpi.format === 'currency' ? formatCurrency(kpi.value) : formatMultiple(kpi.value)}
            </p>
            <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', styles.badge)}>
              {formatSignedDelta(kpi.deltaPercent)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">{kpi.context}</p>
          <p className="mt-3 text-xs text-slate-500">
            Previous: {kpi.format === 'currency' ? formatCurrency(kpi.previousValue) : formatMultiple(kpi.previousValue)}
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function InsightCard({ insight }: { insight: DashboardInsight }) {
  const styles = toneStyles[insight.tone];

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-semibold', styles.badge)}>
          {insight.tone === 'positive'
            ? 'Opportunity'
            : insight.tone === 'warning'
              ? 'Watch'
              : 'Issue'}
        </span>
        <span className={cn('h-2.5 w-2.5 rounded-full animate-soft-pulse', styles.dot)} />
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Insight
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-white">{insight.title}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Supporting metric
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{insight.supportingMetric}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Suggested action
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{insight.action}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
              <InsightIcon />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-200">Insight source</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">{insight.source}</p>
            </div>
          </div>

          {insight.contributingMetrics.length > 0 ? (
            <details className="mt-3">
              <summary className="cursor-pointer list-none text-sm font-medium text-cyan-200 marker:hidden">
                Contributing metrics
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {insight.contributingMetrics.map((metric) => (
                  <div
                    key={`${insight.title}-${metric.label}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                  >
                    <span className="text-slate-500">{metric.label}:</span> {metric.value}
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FocusAreaCard({ area }: { area: FocusArea }) {
  const styles = toneStyles[area.tone];

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]">
      <div className="flex items-center gap-3">
        <span className={cn('h-2.5 w-2.5 rounded-full', styles.dot)} />
        <p className="text-sm font-semibold text-white">{area.title}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{area.detail}</p>
    </div>
  );
}

export function TrendChart({
  points,
  periodLabel,
}: {
  points: DashboardTrendPoint[];
  periodLabel: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const values = points.map((point) => point.roas);
  const chartPoints = getChartPoints(values, 420, 190);
  const linePath = getLinePath(chartPoints);
  const areaPath = getAreaPath(chartPoints, 190);
  const latestPoint = points.at(-1);
  const xAxisPoints = getTickPoints(points, 6);

  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-white">
            {latestPoint ? formatMultiple(latestPoint.roas) : '0.00x'}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Daily ROAS trend across enabled campaigns in the connected dataset.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
          {periodLabel}
        </span>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
        <div 
          className="relative h-48 w-full" 
          onMouseLeave={() => setHoverIndex(null)}
        >
          <svg className="h-full w-full" viewBox="0 0 420 190" aria-label="ROAS time series chart">
            <defs>
              <linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(56,189,248,0.35)" />
                <stop offset="100%" stopColor="rgba(56,189,248,0)" />
              </linearGradient>
            </defs>

            {[32, 72, 112, 152].map((offset) => (
              <line
                key={offset}
                x1="0"
                x2="420"
                y1={offset}
                y2={offset}
                stroke="rgba(148,163,184,0.14)"
                strokeDasharray="5 7"
              />
            ))}

            <path d={areaPath} fill="url(#trend-fill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#67e8f9"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />

            {chartPoints.map((point, index) => {
              const isHovered = hoverIndex === index;
              return (
                <g 
                  key={points[index]?.date ?? index}
                  onMouseEnter={() => setHoverIndex(index)}
                  className="cursor-pointer"
                >
                  {/* Invisible larger circle to make hovering much easier */}
                  <circle cx={point.x} cy={point.y} fill="transparent" r="20" />
                  
                  {/* Outer dark background circle */}
                  <circle 
                    cx={point.x} 
                    cy={point.y} 
                    fill="#08111f" 
                    r={isHovered ? "8" : "6"} 
                    className="transition-all duration-200" 
                    style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                  />
                  
                  {/* Inner cyan active point */}
                  <circle 
                    cx={point.x} 
                    cy={point.y} 
                    fill="#67e8f9" 
                    r={isHovered ? "5" : "3.5"} 
                    className="transition-all duration-200" 
                    style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Overlay Tooltip */}
          {hoverIndex !== null && chartPoints[hoverIndex] && points[hoverIndex] && (
            <div
              className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-full pb-3 transition-all duration-100 ease-out"
              style={{
                left: `${(chartPoints[hoverIndex].x / 420) * 100}%`,
                top: `${(chartPoints[hoverIndex].y / 190) * 100}%`,
              }}
            >
              <div className="whitespace-nowrap rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-xs shadow-2xl backdrop-blur-md">
                <p className="font-medium text-slate-400">
                  {formatDateLabel(points[hoverIndex].date)}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <p className="font-semibold text-white">
                    {formatMultiple(points[hoverIndex].roas)} ROAS
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            'mt-4 grid gap-2 text-xs font-medium text-slate-500',
            xAxisPoints.length <= 3 ? 'grid-cols-3' : 'grid-cols-6',
          )}
        >
          {xAxisPoints.map((point) => (
            <span key={point.date}>{formatShortDate(point.date)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CampaignBarChart({
  campaigns,
  periodLabel,
}: {
  campaigns: DashboardCampaign[];
  periodLabel: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  const maxSpend = Math.max(...campaigns.map((campaign) => campaign.spend), 1);

  return (
    <div className="mt-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-white">{campaigns.length}</p>
          <p className="mt-1 text-sm text-slate-400">
            Highest-spend campaigns across {periodLabel.toLowerCase()}.
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
          {periodLabel}
        </span>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
        {/* Updated Spend Scale Badge */}
        <div className="mb-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">Spend scale</span>
          <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-medium text-slate-300 shadow-sm">
            {formatCompactCurrency(maxSpend)} max
          </span>
        </div>
        
        <div className="flex h-64 items-end gap-3 pt-8">
          {campaigns.map((campaign, index) => {
            const tone = getCampaignTone(campaign.roas);
            const isHovered = hoverIndex === index;

            return (
              <div key={campaign.campaignName} className="flex min-w-0 flex-1 flex-col items-center gap-3 h-full">
                <div className="flex h-full w-full items-end">
                  <div
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                    className={cn(
                      'relative w-full rounded-t-md border-t-2 bg-gradient-to-t transition-all duration-300 cursor-pointer',
                      isHovered ? 'opacity-100 brightness-110' : 'opacity-70 hover:opacity-100', 
                      tone === 'positive'
                        ? 'border-emerald-400 from-emerald-500/0 to-emerald-500/30 shadow-[0_-8px_16px_-6px_rgba(52,211,153,0.25)]'
                        : tone === 'warning'
                          ? 'border-amber-400 from-amber-500/0 to-amber-500/30 shadow-[0_-8px_16px_-6px_rgba(251,191,36,0.25)]'
                          : 'border-rose-400 from-rose-500/0 to-rose-500/30 shadow-[0_-8px_16px_-6px_rgba(244,63,94,0.25)]',
                    )}
                    style={{ height: `${(campaign.spend / maxSpend) * 100}%` }}
                  >
                    {isHovered && (
                      <div className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 z-20 pointer-events-none">
                        <div className="whitespace-nowrap rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2.5 text-xs shadow-2xl backdrop-blur-md">
                          <p className="font-semibold text-white mb-2">{campaign.campaignName}</p>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400 font-medium">Spend</span>
                              <span className="font-semibold text-white">{formatCurrency(campaign.spend)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-slate-400 font-medium">ROAS</span>
                              <div className="flex items-center gap-1.5">
                                <span className={cn('h-1.5 w-1.5 rounded-full', toneStyles[tone].dot)} />
                                <span className="font-semibold text-white">{formatMultiple(campaign.roas)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full text-center">
                  <p 
                    className="truncate text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-default" 
                    title={campaign.campaignName}
                  >
                    {truncateLabel(campaign.campaignName, 14)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DateRangeSelector({
  value,
  onChange,
  disabled,
}: {
  value: DateRangeOption;
  onChange: (value: DateRangeOption) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-[24px] border border-white/10 bg-white/[0.04] p-2">
      {DATE_RANGE_OPTIONS.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-2xl px-4 py-2 text-sm font-medium',
              active
                ? 'bg-[linear-gradient(135deg,#06b6d4_0%,#2563eb_100%)] text-white shadow-[0_18px_40px_-22px_rgba(59,130,246,0.9)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white',
              disabled && 'cursor-not-allowed opacity-70',
            )}
            aria-pressed={active}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function LoadingBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
      <Spinner />
      {label}
    </span>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
        <div className="h-3 w-24 rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-72 rounded-full bg-white/10" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-white/10" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-[24px] border border-white/10 bg-white/[0.04] p-5"
          >
            <div className="h-3 w-16 rounded-full bg-white/10" />
            <div className="mt-6 h-10 w-28 rounded-full bg-white/10" />
            <div className="mt-4 h-4 w-full rounded-full bg-white/10" />
            <div className="mt-2 h-4 w-3/4 rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.95fr)]">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[28px] border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="h-3 w-20 rounded-full bg-white/10" />
              <div className="mt-4 h-8 w-48 rounded-full bg-white/10" />
              <div className="mt-4 h-56 rounded-[24px] bg-white/10" />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[28px] border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="h-3 w-24 rounded-full bg-white/10" />
              <div className="mt-4 h-8 w-56 rounded-full bg-white/10" />
              <div className="mt-5 space-y-3">
                <div className="h-20 rounded-[24px] bg-white/10" />
                <div className="h-20 rounded-[24px] bg-white/10" />
                <div className="h-20 rounded-[24px] bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DataStateCard({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <SurfaceCard className="p-8">
      <div className="flex flex-col items-start gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200">
          <InsightIcon />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#06b6d4_0%,#2563eb_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(59,130,246,0.9)]"
          >
            {actionLabel}
            <ArrowUpRightIcon />
          </button>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

export function Spinner() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function SparkleBadge() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3.75 13.53 8.47 18.25 10 13.53 11.53 12 16.25 10.47 11.53 5.75 10l4.72-1.53L12 3.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DashboardIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 5.75A1.75 1.75 0 0 1 5.75 4h4.5C11.22 4 12 4.78 12 5.75v4.5C12 11.22 11.22 12 10.25 12h-4.5A1.75 1.75 0 0 1 4 10.25v-4.5ZM12 13.75c0-.97.78-1.75 1.75-1.75h4.5c.97 0 1.75.78 1.75 1.75v4.5c0 .97-.78 1.75-1.75 1.75h-4.5A1.75 1.75 0 0 1 12 18.25v-4.5ZM4 13.75c0-.97.78-1.75 1.75-1.75h4.5c.97 0 1.75.78 1.75 1.75v4.5c0 .97-.78 1.75-1.75 1.75h-4.5A1.75 1.75 0 0 1 4 18.25v-4.5ZM12 5.75c0-.97.78-1.75 1.75-1.75h4.5c.97 0 1.75.78 1.75 1.75v4.5c0 .97-.78 1.75-1.75 1.75h-4.5A1.75 1.75 0 0 1 12 10.25v-4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function InsightIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="m12 3 1.95 4.97L19 10l-5.05 2.03L12 17l-1.95-4.97L5 10l5.05-2.03L12 3ZM5 18l.78 1.97L7.75 21l-1.97.78L5 23.75l-.78-1.97L2.25 21l1.97-.78L5 18ZM19 15l1.17 2.83L23 19l-2.83 1.17L19 23l-1.17-2.83L15 19l2.83-1.17L19 15Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function CampaignIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 18V9m7 9V5m7 13v-7M3 20h18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5ZM19.4 15a1.1 1.1 0 0 0 .22 1.21l.04.04a1.75 1.75 0 1 1-2.47 2.47l-.04-.04a1.1 1.1 0 0 0-1.21-.22 1.1 1.1 0 0 0-.67 1v.12a1.75 1.75 0 0 1-3.5 0v-.06a1.1 1.1 0 0 0-.74-1.04 1.1 1.1 0 0 0-1.21.22l-.04.04a1.75 1.75 0 1 1-2.47-2.47l.04-.04a1.1 1.1 0 0 0 .22-1.21 1.1 1.1 0 0 0-1-.67h-.12a1.75 1.75 0 0 1 0-3.5h.06a1.1 1.1 0 0 0 1.04-.74 1.1 1.1 0 0 0-.22-1.21l-.04-.04a1.75 1.75 0 1 1 2.47-2.47l.04.04a1.1 1.1 0 0 0 1.21.22h.01a1.1 1.1 0 0 0 .66-1V4.4a1.75 1.75 0 0 1 3.5 0v.06a1.1 1.1 0 0 0 .74 1.04 1.1 1.1 0 0 0 1.21-.22l.04-.04a1.75 1.75 0 1 1 2.47 2.47l-.04.04a1.1 1.1 0 0 0-.22 1.21v.01a1.1 1.1 0 0 0 1 .66h.12a1.75 1.75 0 0 1 0 3.5h-.06a1.1 1.1 0 0 0-1.04.74Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function LogoMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 16.25V7.75c0-.97.78-1.75 1.75-1.75h2.5c.97 0 1.75.78 1.75 1.75v8.5c0 .97-.78 1.75-1.75 1.75h-2.5A1.75 1.75 0 0 1 4 16.25ZM14 12.25V5.75c0-.97.78-1.75 1.75-1.75h2.5c.97 0 1.75.78 1.75 1.75v6.5c0 .97-.78 1.75-1.75 1.75h-2.5A1.75 1.75 0 0 1 14 12.25ZM9 18.25v-3.5c0-.97.78-1.75 1.75-1.75h2.5c.97 0 1.75.78 1.75 1.75v3.5c0 .97-.78 1.75-1.75 1.75h-2.5A1.75 1.75 0 0 1 9 18.25Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function ArrowUpRightIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 17 17 7M9.5 7H17v7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatMultiple(value: number) {
  return `${value.toFixed(2)}x`;
}

export function formatSignedDelta(value: number | null) {
  if (value === null) {
    return 'No baseline';
  }

  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${value}T00:00:00`));
}

function truncateLabel(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function getCampaignTone(roas: number): Tone {
  if (roas >= 0.75) {
    return 'positive';
  }

  if (roas >= 0.45) {
    return 'warning';
  }

  return 'negative';
}

type ChartPoint = {
  x: number;
  y: number;
};

function getChartPoints(values: number[], width: number, height: number, padding = 12) {
  if (values.length === 0) {
    return [] as ChartPoint[];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const xSpan = Math.max(values.length - 1, 1);

  return values.map((value, index) => {
    const x = padding + (index / xSpan) * (width - padding * 2);
    const y = padding + (1 - (value - min) / range) * (height - padding * 2);
    return { x, y };
  });
}

function getLinePath(points: ChartPoint[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}

function getAreaPath(points: ChartPoint[], height: number) {
  if (points.length === 0) {
    return '';
  }

  const baseY = height - 12;
  const linePath = getLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath} L ${last.x.toFixed(2)} ${baseY.toFixed(2)} L ${first.x.toFixed(2)} ${baseY.toFixed(2)} Z`;
}

function getTickPoints(points: DashboardTrendPoint[], targetCount: number) {
  if (points.length <= targetCount) {
    return points;
  }

  const indices = new Set<number>();
  const divisor = targetCount - 1;

  for (let index = 0; index < targetCount; index += 1) {
    indices.add(Math.round((index / divisor) * (points.length - 1)));
  }

  return [...indices].sort((left, right) => left - right).map((index) => points[index]);
}