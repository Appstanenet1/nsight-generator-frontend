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
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-400',
    emphasis: 'text-emerald-700',
    accent: 'from-emerald-500/18 via-emerald-400/8 to-transparent',
  },
  warning: {
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    dot: 'bg-amber-400',
    emphasis: 'text-amber-700',
    accent: 'from-amber-500/18 via-amber-400/8 to-transparent',
  },
  negative: {
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    dot: 'bg-rose-400',
    emphasis: 'text-rose-700',
    accent: 'from-rose-500/18 via-rose-400/8 to-transparent',
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
        'relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_35px_100px_-60px_rgba(15,23,42,0.18)] backdrop-blur-xl',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),transparent_35%)]" />
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
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
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
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
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
            <p className="text-3xl font-semibold tracking-tight text-slate-900">
              {kpi.format === 'currency' ? formatCurrency(kpi.value) : formatMultiple(kpi.value)}
            </p>
            <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', styles.badge)}>
              {formatSignedDelta(kpi.deltaPercent)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{kpi.context}</p>
          <p className="mt-3 text-xs text-slate-500">
            Previous:{' '}
            {kpi.format === 'currency' ? formatCurrency(kpi.previousValue) : formatMultiple(kpi.previousValue)}
          </p>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function InsightCard({ insight }: { insight: DashboardInsight }) {
  const styles = toneStyles[insight.tone];
  const [isExpanded, setIsExpanded] = useState(insight.tone === 'negative');

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50/80">
      <div
        className="group flex cursor-pointer items-start justify-between gap-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={cn('inline-flex rounded-full border px-3 py-1 text-xs font-semibold', styles.badge)}>
              {insight.tone === 'positive'
                ? 'Opportunity'
                : insight.tone === 'warning'
                  ? 'Watch'
                  : 'Issue'}
            </span>
            <span className={cn('h-2.5 w-2.5 rounded-full animate-soft-pulse', styles.dot)} />
          </div>

          <p className="mt-4 text-sm font-semibold leading-6 text-slate-900">{insight.title}</p>
        </div>

        <div className="shrink-0 rounded-full bg-slate-100 p-1.5 text-slate-500 transition-colors group-hover:bg-slate-200 group-hover:text-slate-900">
          <svg
            className={cn('h-4 w-4 transition-transform duration-200', isExpanded && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-in fade-in slide-in-from-top-2 mt-4 space-y-4 duration-200">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Supporting metric
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{insight.supportingMetric}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              Suggested action
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{insight.action}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
                <InsightIcon />
              </span>
              <div>
                <p className="text-xs font-medium text-slate-800">Insight source</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{insight.source}</p>
              </div>
            </div>

            {insight.contributingMetrics.length > 0 ? (
              <details className="mt-3">
                <summary className="cursor-pointer list-none text-sm font-medium text-cyan-700 marker:hidden">
                  Contributing metrics
                </summary>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insight.contributingMetrics.map((metric) => (
                    <div
                      key={`${insight.title}-${metric.label}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                    >
                      <span className="text-slate-500">{metric.label}:</span> {metric.value}
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function ToneIcon({ tone }: { tone: Tone }) {
  if (tone === 'positive') {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    );
  }
  if (tone === 'warning') {
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function FocusAreaCard({ area }: { area: FocusArea }) {
  const styles = toneStyles[area.tone];

  return (
    <div
      className={cn(
        'relative cursor-default overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        area.tone === 'positive'
          ? 'hover:border-emerald-500/30 hover:shadow-emerald-500/10'
          : area.tone === 'warning'
            ? 'hover:border-amber-500/30 hover:shadow-amber-500/10'
            : 'hover:border-rose-500/30 hover:shadow-rose-500/10',
      )}
    >
      <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-[0.15]', styles.dot)} />

      <div className="relative flex items-start gap-4">
        <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border', styles.badge)}>
          <ToneIcon tone={area.tone} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">{area.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{area.detail}</p>
        </div>
      </div>
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
          <p className="text-3xl font-semibold tracking-tight text-slate-900">
            {latestPoint ? formatMultiple(latestPoint.roas) : '0.00x'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Daily ROAS trend across enabled campaigns in the connected dataset.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {periodLabel}
        </span>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="relative h-48 w-full" onMouseLeave={() => setHoverIndex(null)}>
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
                stroke="rgba(148,163,184,0.22)"
                strokeDasharray="5 7"
              />
            ))}

            <path d={areaPath} fill="url(#trend-fill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#06b6d4"
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
                  <circle cx={point.x} cy={point.y} fill="transparent" r="20" />

                  <circle
                    cx={point.x}
                    cy={point.y}
                    fill="#ffffff"
                    r={isHovered ? '8' : '6'}
                    className="transition-all duration-200"
                    style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                  />

                  <circle
                    cx={point.x}
                    cy={point.y}
                    fill="#06b6d4"
                    r={isHovered ? '5' : '3.5'}
                    className="transition-all duration-200"
                    style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                  />
                </g>
              );
            })}
          </svg>

          {hoverIndex !== null && chartPoints[hoverIndex] && points[hoverIndex] && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full pb-3 transition-all duration-100 ease-out"
              style={{
                left: `${(chartPoints[hoverIndex].x / 420) * 100}%`,
                top: `${(chartPoints[hoverIndex].y / 190) * 100}%`,
              }}
            >
              <div className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl">
                <p className="font-medium text-slate-500">{formatDateLabel(points[hoverIndex].date)}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.45)]" />
                  <p className="font-semibold text-slate-900">
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
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{campaigns.length}</p>
          <p className="mt-1 text-sm text-slate-600">
            Highest-spend campaigns across {periodLabel.toLowerCase()}.
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          {periodLabel}
        </span>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">Spend scale</span>
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 shadow-sm">
            {formatCompactCurrency(maxSpend)} max
          </span>
        </div>

        <div className="flex h-64 items-end gap-3 pt-8">
          {campaigns.map((campaign, index) => {
            const tone = getCampaignTone(campaign.roas);
            const isHovered = hoverIndex === index;

            return (
              <div key={campaign.campaignName} className="flex h-full min-w-0 flex-1 flex-col items-center gap-3">
                <div className="flex h-full w-full items-end">
                  <div
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                    className={cn(
                      'relative w-full cursor-pointer rounded-t-md border-t-2 bg-gradient-to-t transition-all duration-300',
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
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2">
                        <div className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-xl">
                          <p className="mb-2 font-semibold text-slate-900">{campaign.campaignName}</p>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-medium text-slate-500">Spend</span>
                              <span className="font-semibold text-slate-900">{formatCurrency(campaign.spend)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-medium text-slate-500">ROAS</span>
                              <div className="flex items-center gap-1.5">
                                <span className={cn('h-1.5 w-1.5 rounded-full', toneStyles[tone].dot)} />
                                <span className="font-semibold text-slate-900">{formatMultiple(campaign.roas)}</span>
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
                    className="cursor-default truncate text-[11px] font-medium text-slate-500 transition-colors hover:text-slate-800"
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
    <div className="relative w-full sm:w-[200px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DateRangeOption)}
        disabled={disabled}
        className={cn(
          'w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-900 outline-none transition-all hover:bg-slate-50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm',
          disabled && 'cursor-not-allowed opacity-70',
        )}
      >
        {DATE_RANGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-white text-slate-900">
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </div>
    </div>
  );
}

export function LoadingBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
      <Spinner />
      {label}
    </span>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-6">
        <div className="h-3 w-24 rounded-full bg-slate-200" />
        <div className="mt-4 h-10 w-72 rounded-full bg-slate-200" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded-full bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="h-3 w-16 rounded-full bg-slate-200" />
            <div className="mt-6 h-10 w-28 rounded-full bg-slate-200" />
            <div className="mt-4 h-4 w-full rounded-full bg-slate-200" />
            <div className="mt-2 h-4 w-3/4 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.95fr)]">
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="h-3 w-20 rounded-full bg-slate-200" />
              <div className="mt-4 h-8 w-48 rounded-full bg-slate-200" />
              <div className="mt-4 h-56 rounded-[24px] bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-6">
              <div className="h-3 w-24 rounded-full bg-slate-200" />
              <div className="mt-4 h-8 w-56 rounded-full bg-slate-200" />
              <div className="mt-5 space-y-3">
                <div className="h-20 rounded-[24px] bg-slate-200" />
                <div className="h-20 rounded-[24px] bg-slate-200" />
                <div className="h-20 rounded-[24px] bg-slate-200" />
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
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
          <InsightIcon />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
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
