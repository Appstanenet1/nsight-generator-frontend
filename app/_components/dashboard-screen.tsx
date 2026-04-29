'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  DashboardInsight,
  DashboardKpi,
  DashboardMetricsResponse,
  DateRangeOption,
  FocusArea,
} from '@/app/_lib/dashboard-types';
import { useWorkspaceState } from './workspace-provider';
import {
  DashboardSkeleton,
  DataStateCard,
  DateRangeSelector,
  FocusAreaCard,
  InsightCard,
  KpiCard,
  LoadingBadge,
  PageLead,
  SectionHeader,
  SurfaceCard,
  cn,
  formatDateLabel,
  formatCurrency,
  formatMultiple,
} from './ui';

const DASHBOARD_API_URL = `${
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
}/api/dashboard-metrics`;

type Tab = 'performance' | 'insights';

export default function DashboardScreen() {
  const { selectedRange, setSelectedRange } = useWorkspaceState();
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<DashboardMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('performance');
  const hasLoadedDataRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboardMetrics() {
      try {
        const response = await fetch(`${DASHBOARD_API_URL}?range=${selectedRange}`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = (await readErrorPayload(response)) ?? 'Unable to load dashboard data from the live cloud API.';
          throw new Error(payload);
        }

        const payload = (await response.json()) as DashboardMetricsResponse & { error?: string };

        if (payload.error) {
          throw new Error(payload.error);
        }

        hasLoadedDataRef.current = true;
        setData(payload);
        setError(null);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load dashboard data from the live cloud API.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    void loadDashboardMetrics();

    return () => controller.abort();
  }, [reloadKey, selectedRange]);

  const kpis = useMemo<DashboardKpi[]>(() => {
    if (!data) {
      return [];
    }

    return [
      {
        key: 'roas',
        label: 'ROAS',
        value: data.metrics.overallRoas.value,
        previousValue: data.metrics.overallRoas.previousValue,
        deltaPercent: data.metrics.overallRoas.deltaPercent,
        format: 'multiple',
        tone: getPositiveTone(data.metrics.overallRoas.deltaPercent),
        context: `Overall return across ${data.periodLabel.toLowerCase()} from the live cloud API.`,
      },
      {
        key: 'cpa',
        label: 'CPA',
        value: data.metrics.averageCpa.value,
        previousValue: data.metrics.averageCpa.previousValue,
        deltaPercent: data.metrics.averageCpa.deltaPercent,
        format: 'currency',
        tone: getInverseTone(data.metrics.averageCpa.deltaPercent),
        context: `Average cost per conversion across enabled campaigns in ${data.periodLabel.toLowerCase()}.`,
      },
      {
        key: 'spend',
        label: 'Spend',
        value: data.metrics.totalCost.value,
        previousValue: data.metrics.totalCost.previousValue,
        deltaPercent: data.metrics.totalCost.deltaPercent,
        format: 'currency',
        tone: getSpendTone(data.metrics.totalCost.deltaPercent, data.metrics.overallRoas.deltaPercent),
        context: `Total media cost returned by the live cloud API for ${data.periodLabel.toLowerCase()}.`,
      },
      {
        key: 'revenue',
        label: 'Revenue',
        value: data.metrics.totalRevenue.value,
        previousValue: data.metrics.totalRevenue.previousValue,
        deltaPercent: data.metrics.totalRevenue.deltaPercent,
        format: 'currency',
        tone: getPositiveTone(data.metrics.totalRevenue.deltaPercent),
        context: `Total conversion value from the BigQuery-backed reporting source.`,
      },
    ];
  }, [data]);

  const insights = useMemo<DashboardInsight[]>(() => {
    if (!data) {
      return [];
    }

    return [
      {
        title: `ROAS moved ${formatDeltaPercent(data.metrics.overallRoas.deltaPercent)} over ${data.periodLabel.toLowerCase()}.`,
        supportingMetric: `Overall ROAS is ${formatMultiple(data.metrics.overallRoas.value)} versus ${formatMultiple(
          data.metrics.overallRoas.previousValue,
        )} in the comparison window.`,
        action: 'Review campaign mix, search terms, and creative changes that landed during this range before scaling budget further.',
        tone: getPositiveTone(data.metrics.overallRoas.deltaPercent),
        source: 'Generated from the live BigQuery-backed dashboard metrics API.',
        contributingMetrics: [
          { label: 'ROAS', value: formatMultiple(data.metrics.overallRoas.value) },
          { label: 'Revenue', value: formatCurrency(data.metrics.totalRevenue.value) },
          { label: 'Spend', value: formatCurrency(data.metrics.totalCost.value) },
        ],
      },
      {
        title: `CPA is ${formatDeltaPercent(data.metrics.averageCpa.deltaPercent)} against the previous period.`,
        supportingMetric: `Average CPA is ${formatCurrency(data.metrics.averageCpa.value)} versus ${formatCurrency(
          data.metrics.averageCpa.previousValue,
        )}.`,
        action: 'Audit cost inflation drivers and prioritize ad groups or targeting segments that are still converting below the blended CPA.',
        tone: getInverseTone(data.metrics.averageCpa.deltaPercent),
        source: 'Generated from the live BigQuery-backed dashboard metrics API.',
        contributingMetrics: [
          { label: 'CPA', value: formatCurrency(data.metrics.averageCpa.value) },
          { label: 'Conversions', value: Math.round(data.metrics.totalConversions.value).toLocaleString('en-IN') },
          { label: 'Spend', value: formatCurrency(data.metrics.totalCost.value) },
        ],
      },
      {
        title: `Revenue is ${formatDeltaPercent(data.metrics.totalRevenue.deltaPercent)} for ${data.periodLabel.toLowerCase()}.`,
        supportingMetric: `Tracked conversion value is ${formatCurrency(data.metrics.totalRevenue.value)} on ${formatCurrency(
          data.metrics.totalCost.value,
        )} spend.`,
        action: 'Validate whether the current spend level is preserving high-value conversions or shifting budget into lower-return inventory.',
        tone: getPositiveTone(data.metrics.totalRevenue.deltaPercent),
        source: 'Generated from the live BigQuery-backed dashboard metrics API.',
        contributingMetrics: [
          { label: 'Revenue', value: formatCurrency(data.metrics.totalRevenue.value) },
          { label: 'Spend', value: formatCurrency(data.metrics.totalCost.value) },
          { label: 'ROAS', value: formatMultiple(data.metrics.overallRoas.value) },
        ],
      },
    ];
  }, [data]);

  const focusAreas = useMemo<FocusArea[]>(() => {
    if (!data) {
      return [];
    }

    return [
      {
        title: 'Efficiency watch',
        detail: `CPA is currently ${formatCurrency(data.metrics.averageCpa.value)} with a ${formatDeltaPercent(
          data.metrics.averageCpa.deltaPercent,
        )} shift versus the comparison period.`,
        tone: getInverseTone(data.metrics.averageCpa.deltaPercent),
      },
      {
        title: 'Return on spend',
        detail: `Blended ROAS is ${formatMultiple(data.metrics.overallRoas.value)} while spend sits at ${formatCurrency(
          data.metrics.totalCost.value,
        )}.`,
        tone: getPositiveTone(data.metrics.overallRoas.deltaPercent),
      },
      {
        title: 'Conversion volume',
        detail: `${Math.round(data.metrics.totalConversions.value).toLocaleString(
          'en-IN',
        )} conversions were recorded in ${data.periodLabel.toLowerCase()}, a ${formatDeltaPercent(
          data.metrics.totalConversions.deltaPercent,
        )} change from the prior window.`,
        tone: getPositiveTone(data.metrics.totalConversions.deltaPercent),
      },
    ];
  }, [data]);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <DataStateCard
        title="Dashboard data could not be loaded"
        description="Unable to load dashboard data from the live cloud API."
        actionLabel="Retry"
        onAction={() => {
          setIsLoading(true);
          setReloadKey((current) => current + 1);
        }}
      />
    );
  }

  if (!data) {
    return (
      <DataStateCard
        title="No dashboard data is available"
        description="Unable to load dashboard data from the live cloud API."
        actionLabel="Retry"
        onAction={() => {
          setIsLoading(true);
          setReloadKey((current) => current + 1);
        }}
      />
    );
  }

  const handleReload = () => {
    if (hasLoadedDataRef.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setReloadKey((current) => current + 1);
  };

  const handleRangeChange = (nextRange: DateRangeOption) => {
    if (nextRange === selectedRange) {
      return;
    }

    if (hasLoadedDataRef.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setSelectedRange(nextRange);
  };

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6 sm:p-7">
        <PageLead
          eyebrow="Performance overview"
          title="Real campaign metrics, routed cleanly"
          description="This dashboard now loads all campaign metrics from the FastAPI service, which queries live BigQuery data instead of reading from a local SQLite file."
          aside={
            <div className="flex w-full max-w-[360px] flex-col gap-3">
              <DateRangeSelector
                value={selectedRange}
                onChange={handleRangeChange}
                disabled={isRefreshing}
              />

              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Snapshot
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{data.periodLabel}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Ending {data.asOfDate ? formatDateLabel(data.asOfDate) : 'No data'}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Comparison baseline: {data.comparisonLabel}
                    </p>
                  </div>
                  {isRefreshing ? <LoadingBadge label="Refreshing data" /> : null}
                </div>
              </div>
            </div>
          }
        />
      </SurfaceCard>

      {error ? (
        <SurfaceCard className="border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-amber-800">
              Unable to load dashboard data from the live cloud API.
            </p>
            <button
              type="button"
              onClick={handleReload}
              className="rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800"
            >
              Retry refresh
            </button>
          </div>
        </SurfaceCard>
      ) : null}

      <div className="flex items-center justify-end">
        <div className="inline-flex max-w-full overflow-x-auto rounded-[20px] border border-slate-200 bg-white p-1.5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            className={cn(
              'shrink-0 rounded-2xl px-6 py-2.5 text-sm font-medium transition-all duration-300',
              activeTab === 'performance'
                ? 'bg-[linear-gradient(135deg,#06b6d4_0%,#2563eb_100%)] text-white shadow-[0_8px_20px_-10px_rgba(59,130,246,0.8)]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            Performance Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={cn(
              'shrink-0 rounded-2xl px-6 py-2.5 text-sm font-medium transition-all duration-300',
              activeTab === 'insights'
                ? 'bg-[linear-gradient(135deg,#06b6d4_0%,#2563eb_100%)] text-white shadow-[0_8px_20px_-10px_rgba(59,130,246,0.8)]'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            AI Insights & Actions
          </button>
        </div>
      </div>

      <div className={cn('space-y-6 transition-opacity duration-300', isRefreshing && 'opacity-80')}>
        {activeTab === 'performance' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-busy={isRefreshing}>
              {kpis.map((kpi) => (
                <KpiCard key={kpi.key} kpi={kpi} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <SurfaceCard className="p-6 sm:p-7">
                <SectionHeader
                  eyebrow="Conversions"
                  title="Conversion volume"
                  description={`Total conversions returned by the live BigQuery-backed API for ${data.periodLabel.toLowerCase()}.`}
                  badge={isRefreshing ? <LoadingBadge label="Updating" /> : undefined}
                />
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-3xl font-semibold tracking-tight text-slate-900">
                    {Math.round(data.metrics.totalConversions.value).toLocaleString('en-IN')}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    Previous period:{' '}
                    {Math.round(data.metrics.totalConversions.previousValue).toLocaleString('en-IN')}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Delta: {formatDeltaPercent(data.metrics.totalConversions.deltaPercent)}
                  </p>
                </div>
              </SurfaceCard>

              <SurfaceCard className="p-6 sm:p-7">
                <SectionHeader
                  eyebrow="API source"
                  title="FastAPI to BigQuery"
                  description="The dashboard is now populated from the live cloud API instead of direct frontend database access."
                />
                <div className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
                  <p>Endpoint: {DASHBOARD_API_URL}</p>
                  <p>Total Cost: {formatCurrency(data.metrics.totalCost.value)}</p>
                  <p>Average CPA: {formatCurrency(data.metrics.averageCpa.value)}</p>
                  <p>Overall ROAS: {formatMultiple(data.metrics.overallRoas.value)}</p>
                </div>
              </SurfaceCard>
            </section>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <section className="grid gap-6 xl:grid-cols-2">
              <SurfaceCard className="h-fit p-6 sm:p-7">
                <SectionHeader
                  eyebrow="Backend insights"
                  title="Insight cards"
                  description="Metric-based callouts generated from the live dashboard payload."
                  badge={isRefreshing ? <LoadingBadge label="Refreshing insights" /> : undefined}
                />
                <div className="mt-5 space-y-4">
                  {insights.map((insight) => (
                    <InsightCard key={insight.title} insight={insight} />
                  ))}
                </div>
              </SurfaceCard>

              <SurfaceCard className="h-fit p-6 sm:p-7">
                <SectionHeader
                  eyebrow="Suggested focus"
                  title="Where to look next"
                  description="Priority areas inferred from live spend, CPA, revenue, and ROAS movement."
                />
                <div className="mt-5 space-y-3">
                  {focusAreas.map((focusArea) => (
                    <FocusAreaCard key={focusArea.title} area={focusArea} />
                  ))}
                </div>
              </SurfaceCard>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

async function readErrorPayload(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error ?? null;
  } catch {
    return null;
  }
}

function getPositiveTone(deltaPercent: number | null): DashboardKpi['tone'] {
  if (deltaPercent === null) {
    return 'warning';
  }

  if (deltaPercent > 2) {
    return 'positive';
  }

  if (deltaPercent < -2) {
    return 'negative';
  }

  return 'warning';
}

function getInverseTone(deltaPercent: number | null): DashboardKpi['tone'] {
  if (deltaPercent === null) {
    return 'warning';
  }

  if (deltaPercent < -2) {
    return 'positive';
  }

  if (deltaPercent > 2) {
    return 'negative';
  }

  return 'warning';
}

function getSpendTone(
  spendDeltaPercent: number | null,
  roasDeltaPercent: number | null,
): DashboardKpi['tone'] {
  if (spendDeltaPercent === null || roasDeltaPercent === null) {
    return 'warning';
  }

  if (spendDeltaPercent > 0 && roasDeltaPercent < 0) {
    return 'warning';
  }

  if (spendDeltaPercent < 0 && roasDeltaPercent > 0) {
    return 'positive';
  }

  return spendDeltaPercent > 0 ? 'positive' : 'warning';
}

function formatDeltaPercent(value: number | null) {
  if (value === null) {
    return 'No baseline';
  }

  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}
