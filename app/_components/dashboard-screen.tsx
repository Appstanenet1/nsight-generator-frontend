'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import { fetchDashboardData } from '@/app/_lib/client-api';
import type { DashboardResponse, DateRangeOption } from '@/app/_lib/dashboard-types';
import { useWorkspaceState } from './workspace-provider';
import {
  CampaignBarChart,
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
  TrendChart,
  cn,
  formatDateLabel,
} from './ui';

export default function DashboardScreen() {
  const { selectedRange, setSelectedRange } = useWorkspaceState();
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedDataRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const hasExistingData = hasLoadedDataRef.current;
    setError(null);

    if (hasExistingData) {
      setIsRefreshing(true);
    }

    async function loadDashboard() {
      try {
        const nextData = await fetchDashboardData(selectedRange, controller.signal);
        hasLoadedDataRef.current = true;
        setData(nextData);
        setError(null);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load dashboard data from the connected adapter.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsRefreshing(false);
        }
      }
    }

    void loadDashboard();

    return () => controller.abort();
  }, [reloadKey, selectedRange]);

  if (!data && !error) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <DataStateCard
        title="Dashboard data could not be loaded"
        description={`${error} Verify the SQLite-backed adapter and refresh once the data source is available.`}
        actionLabel="Retry"
        onAction={() => setReloadKey((current) => current + 1)}
      />
    );
  }

  if (!data || data.kpis.length === 0 || data.trend.length === 0) {
    return (
      <DataStateCard
        title="No dashboard data is available"
        description="The dashboard adapter returned an empty payload. Check the source database or refresh after new data is available."
        actionLabel="Refresh"
        onAction={() => setReloadKey((current) => current + 1)}
      />
    );
  }

  const handleRangeChange = (nextRange: DateRangeOption) => {
    if (nextRange === selectedRange) {
      return;
    }

    startTransition(() => {
      setSelectedRange(nextRange);
    });
  };

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6 sm:p-7">
        <PageLead
          eyebrow="Performance overview"
          title="Real campaign metrics, routed cleanly"
          description="The dashboard now consumes live values through the API layer, so KPI cards, charts, and insight cards all reflect the connected SQLite dataset instead of mock content."
          aside={
            <div className="flex w-full max-w-[360px] flex-col gap-3">
              <DateRangeSelector
                value={selectedRange}
                onChange={handleRangeChange}
                disabled={isRefreshing}
              />

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Snapshot
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{data.periodLabel}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Ending {formatDateLabel(data.asOfDate)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Comparison baseline: {data.comparisonLabel}
                    </p>
                  </div>
                  {isRefreshing ? <LoadingBadge label="Updating data" /> : null}
                </div>
              </div>
            </div>
          }
        />
      </SurfaceCard>

      {error ? (
        <SurfaceCard className="border-rose-400/20 bg-rose-400/[0.05] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-rose-100">
              The latest range refresh failed. Showing the last successful dataset.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-medium text-rose-100"
            >
              Retry refresh
            </button>
          </div>
        </SurfaceCard>
      ) : null}

      <div className={cn('space-y-6 transition-opacity duration-300', isRefreshing && 'opacity-80')}>
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4" aria-busy={isRefreshing}>
          {data.kpis.map((kpi) => (
            <KpiCard key={kpi.key} kpi={kpi} />
          ))}
        </section>

        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.95fr)]">
          <div className="space-y-6">
            <SurfaceCard className="p-6 sm:p-7">
              <SectionHeader
                eyebrow="Trend"
                title="ROAS over time"
                description={`Daily time-series data from the connected database for ${data.periodLabel.toLowerCase()}.`}
                badge={isRefreshing ? <LoadingBadge label="Refreshing chart" /> : undefined}
              />
              <TrendChart points={data.trend} periodLabel={data.periodLabel} />
            </SurfaceCard>

            <SurfaceCard className="p-6 sm:p-7">
              <SectionHeader
                eyebrow="Campaign comparison"
                title="Top-spend campaigns"
                description={`Spend-weighted campaign comparison for ${data.periodLabel.toLowerCase()}, now visualized directly in-chart.`}
                badge={isRefreshing ? <LoadingBadge label="Refreshing campaigns" /> : undefined}
              />
              <CampaignBarChart campaigns={data.campaigns} periodLabel={data.periodLabel} />
            </SurfaceCard>
          </div>

          <div className="space-y-6">
            <SurfaceCard className="p-6 sm:p-7">
              <SectionHeader
                eyebrow="Backend insights"
                title="Insight cards"
                description="Insights now include source transparency and the specific metrics contributing to each callout."
                badge={isRefreshing ? <LoadingBadge label="Refreshing insights" /> : undefined}
              />
              <div className="mt-5 space-y-4">
                {data.insights.map((insight) => (
                  <InsightCard key={insight.title} insight={insight} />
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-6 sm:p-7">
              <SectionHeader
                eyebrow="Suggested focus"
                title="Where to look next"
                description="Priority focus areas derived from current spend concentration, efficiency, and recent trend movement."
              />
              <div className="mt-5 space-y-3">
                {data.focusAreas.map((focusArea) => (
                  <FocusAreaCard key={focusArea.title} area={focusArea} />
                ))}
              </div>
            </SurfaceCard>
          </div>
        </section>
      </div>
    </div>
  );
}
