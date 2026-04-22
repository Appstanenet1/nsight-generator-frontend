import 'server-only';

import { DatabaseSync } from 'node:sqlite';
import type {
  DashboardCampaign,
  DashboardInsight,
  DashboardKpi,
  DashboardResponse,
  DashboardTrendPoint,
  DateRangeOption,
  FocusArea,
  Tone,
} from './dashboard-types';
import { DATE_RANGE_OPTIONS } from './dashboard-types';

const DASHBOARD_DB_PATH =
  process.env.INSIGHT_DB_PATH ?? 'D:/Dev/insight-generator/mock_database.db';

type SummaryRow = {
  spend: number | null;
  revenue: number | null;
  roas: number | null;
  cpa: number | null;
  conversions: number | null;
};

type LatestRow = {
  maxDate: string | null;
};

type CampaignRow = {
  campaignName: string;
  spend: number;
  revenue: number;
  roas: number;
  cpa: number;
  conversions: number;
};

type TrendRow = {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
  cpa: number;
};

export function getDashboardData(selectedRange: DateRangeOption = '7d'): DashboardResponse {
  let database: DatabaseSync;
  const rangeConfig = getRangeConfig(selectedRange);

  try {
    database = new DatabaseSync(DASHBOARD_DB_PATH, { readonly: true });
  } catch (error) {
    throw new Error(
      `Dashboard database could not be opened at ${DASHBOARD_DB_PATH}: ${getErrorMessage(error)}`,
    );
  }

  try {
    const latest = queryOne<LatestRow>(
      database,
      `
        SELECT MAX(date) AS maxDate
        FROM ai_campaign_performance_mart
        WHERE campaign_status = 'ENABLED'
      `,
    );

    if (!latest.maxDate) {
      return {
        asOfDate: '',
        selectedRange,
        rangeDays: rangeConfig.days,
        periodLabel: rangeConfig.label,
        comparisonLabel: `Previous ${rangeConfig.days} days`,
        kpis: [],
        trend: [],
        campaigns: [],
        insights: [],
        focusAreas: [],
      };
    }

    const currentSummary = normalizeSummary(
      queryOne<SummaryRow>(
        database,
        `
          SELECT
            SUM(cost_inr) AS spend,
            SUM(conversion_value) AS revenue,
            SUM(conversion_value) / NULLIF(SUM(cost_inr), 0) AS roas,
            SUM(cost_inr) / NULLIF(SUM(conversions), 0) AS cpa,
            SUM(conversions) AS conversions
          FROM ai_campaign_performance_mart
          WHERE campaign_status = 'ENABLED'
            AND date BETWEEN date(:latestDate, :currentStartOffset) AND :latestDate
        `,
        {
          latestDate: latest.maxDate,
          currentStartOffset: rangeConfig.currentStartOffset,
        },
      ),
    );

    const previousSummary = normalizeSummary(
      queryOne<SummaryRow>(
        database,
        `
          SELECT
            SUM(cost_inr) AS spend,
            SUM(conversion_value) AS revenue,
            SUM(conversion_value) / NULLIF(SUM(cost_inr), 0) AS roas,
            SUM(cost_inr) / NULLIF(SUM(conversions), 0) AS cpa,
            SUM(conversions) AS conversions
          FROM ai_campaign_performance_mart
          WHERE campaign_status = 'ENABLED'
            AND date BETWEEN date(:latestDate, :previousStartOffset) AND date(:latestDate, :previousEndOffset)
        `,
        {
          latestDate: latest.maxDate,
          previousStartOffset: rangeConfig.previousStartOffset,
          previousEndOffset: rangeConfig.previousEndOffset,
        },
      ),
    );

    const trend = queryAll<TrendRow>(
      database,
      `
        SELECT
          date,
          SUM(cost_inr) AS spend,
          SUM(conversion_value) AS revenue,
          SUM(conversion_value) / NULLIF(SUM(cost_inr), 0) AS roas,
          SUM(cost_inr) / NULLIF(SUM(conversions), 0) AS cpa
        FROM ai_campaign_performance_mart
        WHERE campaign_status = 'ENABLED'
          AND date BETWEEN date(:latestDate, :currentStartOffset) AND :latestDate
        GROUP BY date
        ORDER BY date
      `,
      {
        latestDate: latest.maxDate,
        currentStartOffset: rangeConfig.currentStartOffset,
      },
    ).map((row) => ({
      date: row.date,
      spend: toNumber(row.spend),
      revenue: toNumber(row.revenue),
      roas: toNumber(row.roas),
      cpa: toNumber(row.cpa),
    }));

    const campaigns = queryAll<CampaignRow>(
      database,
      `
        SELECT
          campaign_name AS campaignName,
          SUM(cost_inr) AS spend,
          SUM(conversion_value) AS revenue,
          SUM(conversion_value) / NULLIF(SUM(cost_inr), 0) AS roas,
          SUM(cost_inr) / NULLIF(SUM(conversions), 0) AS cpa,
          SUM(conversions) AS conversions
        FROM ai_campaign_performance_mart
        WHERE campaign_status = 'ENABLED'
          AND date BETWEEN date(:latestDate, :currentStartOffset) AND :latestDate
        GROUP BY campaign_name
        HAVING SUM(cost_inr) > 100
        ORDER BY spend DESC
        LIMIT 8
      `,
      {
        latestDate: latest.maxDate,
        currentStartOffset: rangeConfig.currentStartOffset,
      },
    ).map((row) => ({
      campaignName: row.campaignName,
      spend: toNumber(row.spend),
      revenue: toNumber(row.revenue),
      roas: toNumber(row.roas),
      cpa: toNumber(row.cpa),
      conversions: toNumber(row.conversions),
    }));

    const kpis = buildKpis(currentSummary, previousSummary, latest.maxDate, rangeConfig.label);
    const insights = buildInsights(
      currentSummary,
      previousSummary,
      campaigns,
      trend,
      rangeConfig.label,
    );
    const focusAreas = buildFocusAreas(currentSummary, campaigns, trend);

    return {
      asOfDate: latest.maxDate,
      selectedRange,
      rangeDays: rangeConfig.days,
      periodLabel: rangeConfig.label,
      comparisonLabel: `Previous ${rangeConfig.days} days`,
      kpis,
      trend,
      campaigns: campaigns.slice(0, 6),
      insights,
      focusAreas,
    };
  } finally {
    database.close();
  }
}

function buildKpis(
  currentSummary: NormalizedSummary,
  previousSummary: NormalizedSummary,
  latestDate: string,
  periodLabel: string,
): DashboardKpi[] {
  const shortPeriodLabel = periodLabel.replace('Last ', '').toLowerCase();
  const roasDelta = calculatePercentChange(currentSummary.roas, previousSummary.roas);
  const cpaDelta = calculatePercentChange(currentSummary.cpa, previousSummary.cpa);
  const spendDelta = calculatePercentChange(currentSummary.spend, previousSummary.spend);
  const revenueDelta = calculatePercentChange(currentSummary.revenue, previousSummary.revenue);

  return [
    {
      key: 'roas',
      label: 'ROAS',
      value: currentSummary.roas,
      previousValue: previousSummary.roas,
      deltaPercent: roasDelta,
      format: 'multiple',
      tone: getPositiveMetricTone(roasDelta),
      context: `Blended return for the ${shortPeriodLabel} ending ${latestDate}.`,
    },
    {
      key: 'cpa',
      label: 'CPA',
      value: currentSummary.cpa,
      previousValue: previousSummary.cpa,
      deltaPercent: cpaDelta,
      format: 'currency',
      tone: getNegativeMetricTone(cpaDelta),
      context: `Cost per conversion across enabled campaigns during the same ${shortPeriodLabel} window.`,
    },
    {
      key: 'spend',
      label: 'Spend',
      value: currentSummary.spend,
      previousValue: previousSummary.spend,
      deltaPercent: spendDelta,
      format: 'currency',
      tone: getSpendTone(spendDelta, roasDelta),
      context: `Media spend across enabled campaigns, compared to the prior ${shortPeriodLabel}.`,
    },
    {
      key: 'revenue',
      label: 'Revenue',
      value: currentSummary.revenue,
      previousValue: previousSummary.revenue,
      deltaPercent: revenueDelta,
      format: 'currency',
      tone: getPositiveMetricTone(revenueDelta),
      context: 'Tracked conversion value across the connected SQLite dataset.',
    },
  ];
}

function buildInsights(
  currentSummary: NormalizedSummary,
  previousSummary: NormalizedSummary,
  campaigns: DashboardCampaign[],
  trend: DashboardTrendPoint[],
  periodLabel: string,
): DashboardInsight[] {
  const spendDelta = calculatePercentChange(currentSummary.spend, previousSummary.spend);
  const roasDelta = calculatePercentChange(currentSummary.roas, previousSummary.roas);
  const revenueDelta = calculatePercentChange(currentSummary.revenue, previousSummary.revenue);

  const weakestHighSpendCampaign =
    [...campaigns].sort((left, right) => left.roas - right.roas)[0] ?? null;
  const strongestCampaign =
    [...campaigns]
      .filter((campaign) => campaign.spend >= 10000)
      .sort((left, right) => right.roas - left.roas)[0] ?? campaigns[0] ?? null;
  const latestTrendPoint = trend.at(-1);

  const insights: DashboardInsight[] = [
    {
      title: `Spend ${formatSignedPercent(spendDelta)} while ROAS ${formatSignedPercent(roasDelta)} over ${periodLabel.toLowerCase()}.`,
      supportingMetric: `Spend moved from ${formatCurrency(previousSummary.spend)} to ${formatCurrency(currentSummary.spend)}, while revenue shifted from ${formatCurrency(previousSummary.revenue)} to ${formatCurrency(currentSummary.revenue)} (${formatSignedPercent(revenueDelta)}).`,
      action: 'Audit incremental budget allocation before scaling further into the current mix.',
      tone: roasDelta !== null && roasDelta < 0 ? 'negative' : 'positive',
      source: 'Generated from backend analysis of campaign performance data.',
      contributingMetrics: [
        { label: 'Spend', value: formatCurrency(currentSummary.spend) },
        { label: 'ROAS', value: formatMultiple(currentSummary.roas) },
        { label: 'CPA', value: formatCurrency(currentSummary.cpa) },
      ],
    },
  ];

  if (weakestHighSpendCampaign) {
    insights.push({
      title: `${weakestHighSpendCampaign.campaignName} is the weakest performer among the top-spend campaigns.`,
      supportingMetric: `It spent ${formatCurrency(weakestHighSpendCampaign.spend)} at ${formatMultiple(weakestHighSpendCampaign.roas)} ROAS and ${formatCurrency(weakestHighSpendCampaign.cpa)} CPA.`,
      action: 'Review targeting, creative, and budget caps before preserving its current spend level.',
      tone: 'warning',
      source: 'Generated from backend analysis of campaign performance data.',
      contributingMetrics: [
        { label: 'Spend', value: formatCurrency(weakestHighSpendCampaign.spend) },
        { label: 'ROAS', value: formatMultiple(weakestHighSpendCampaign.roas) },
        { label: 'CPA', value: formatCurrency(weakestHighSpendCampaign.cpa) },
      ],
    });
  }

  if (strongestCampaign) {
    insights.push({
      title: `${strongestCampaign.campaignName} is the current efficiency anchor.`,
      supportingMetric: `It generated ${formatCurrency(strongestCampaign.revenue)} on ${formatCurrency(strongestCampaign.spend)} spend with ${formatMultiple(strongestCampaign.roas)} ROAS.`,
      action: 'Protect delivery here and use it as the benchmark when reallocating budget.',
      tone: 'positive',
      source: 'Generated from backend analysis of campaign performance data.',
      contributingMetrics: [
        { label: 'Spend', value: formatCurrency(strongestCampaign.spend) },
        { label: 'ROAS', value: formatMultiple(strongestCampaign.roas) },
        { label: 'CPA', value: formatCurrency(strongestCampaign.cpa) },
      ],
    });
  }

  if (insights.length < 3 && latestTrendPoint) {
    insights.push({
      title: `The latest daily snapshot closed at ${formatMultiple(latestTrendPoint.roas)} ROAS.`,
      supportingMetric: `${latestTrendPoint.date} recorded ${formatCurrency(latestTrendPoint.spend)} spend, ${formatCurrency(latestTrendPoint.revenue)} revenue, and ${formatCurrency(latestTrendPoint.cpa)} CPA.`,
      action: 'Compare the latest few days against the earlier trend to identify where efficiency broke down.',
      tone: 'warning',
      source: 'Generated from backend analysis of campaign performance data.',
      contributingMetrics: [
        { label: 'Spend', value: formatCurrency(latestTrendPoint.spend) },
        { label: 'ROAS', value: formatMultiple(latestTrendPoint.roas) },
        { label: 'CPA', value: formatCurrency(latestTrendPoint.cpa) },
      ],
    });
  }

  return insights.slice(0, 3);
}

function buildFocusAreas(
  currentSummary: NormalizedSummary,
  campaigns: DashboardCampaign[],
  trend: DashboardTrendPoint[],
): FocusArea[] {
  const biggestBudgetOwner = campaigns[0] ?? null;
  const belowAverageCampaign =
    [...campaigns].find((campaign) => campaign.roas < currentSummary.roas) ?? campaigns[0] ?? null;
  const lastThreeDays = trend.slice(-3);
  const firstThreeDays = trend.slice(0, 3);

  const focusAreas: FocusArea[] = [];

  if (biggestBudgetOwner) {
    focusAreas.push({
      title: 'Budget concentration',
      detail: `${biggestBudgetOwner.campaignName} accounts for ${formatPercent((biggestBudgetOwner.spend / currentSummary.spend) * 100)} of 7-day spend with ${formatMultiple(biggestBudgetOwner.roas)} ROAS.`,
      tone: biggestBudgetOwner.roas >= currentSummary.roas ? 'positive' : 'warning',
    });
  }

  if (belowAverageCampaign) {
    focusAreas.push({
      title: 'Below-average efficiency',
      detail: `${belowAverageCampaign.campaignName} sits below the blended ${formatMultiple(currentSummary.roas)} ROAS benchmark while spending ${formatCurrency(belowAverageCampaign.spend)}.`,
      tone: 'negative',
    });
  }

  if (lastThreeDays.length === 3 && firstThreeDays.length === 3) {
    const firstThreeAverage = average(firstThreeDays.map((point) => point.roas));
    const lastThreeAverage = average(lastThreeDays.map((point) => point.roas));
    const change = calculatePercentChange(lastThreeAverage, firstThreeAverage);

    focusAreas.push({
      title: 'Recent momentum',
      detail: `The latest 3-day ROAS average is ${formatMultiple(lastThreeAverage)}, ${formatSignedPercent(change)} versus the first 3 days in the 14-day trend.`,
      tone: change !== null && change < 0 ? 'warning' : 'positive',
    });
  }

  return focusAreas.slice(0, 3);
}

type NormalizedSummary = {
  spend: number;
  revenue: number;
  roas: number;
  cpa: number;
  conversions: number;
};

function normalizeSummary(summary: SummaryRow): NormalizedSummary {
  return {
    spend: toNumber(summary.spend),
    revenue: toNumber(summary.revenue),
    roas: toNumber(summary.roas),
    cpa: toNumber(summary.cpa),
    conversions: toNumber(summary.conversions),
  };
}

function queryOne<T extends object>(
  database: DatabaseSync,
  sql: string,
  parameters: Record<string, string | number> = {},
): T {
  return database.prepare(sql).get(parameters) as T;
}

function queryAll<T extends object>(
  database: DatabaseSync,
  sql: string,
  parameters: Record<string, string | number> = {},
): T[] {
  return database.prepare(sql).all(parameters) as T[];
}

function toNumber(value: number | string | null | undefined) {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function calculatePercentChange(current: number, previous: number) {
  if (!Number.isFinite(previous) || previous === 0) {
    return null;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

function getPositiveMetricTone(delta: number | null): Tone {
  if (delta === null) {
    return 'warning';
  }

  if (delta > 2) {
    return 'positive';
  }

  if (delta < -2) {
    return 'negative';
  }

  return 'warning';
}

function getNegativeMetricTone(delta: number | null): Tone {
  if (delta === null) {
    return 'warning';
  }

  if (delta < -2) {
    return 'positive';
  }

  if (delta > 2) {
    return 'negative';
  }

  return 'warning';
}

function getSpendTone(spendDelta: number | null, roasDelta: number | null): Tone {
  if (spendDelta === null || roasDelta === null) {
    return 'warning';
  }

  if (spendDelta > 0 && roasDelta < 0) {
    return 'warning';
  }

  if (spendDelta < 0 && roasDelta > 0) {
    return 'positive';
  }

  return spendDelta > 0 ? 'positive' : 'warning';
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMultiple(value: number) {
  return `${value.toFixed(2)}x`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatSignedPercent(value: number | null) {
  if (value === null) {
    return 'flat';
  }

  const prefix = value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown database error';
}

function getRangeConfig(selectedRange: DateRangeOption) {
  const config =
    DATE_RANGE_OPTIONS.find((option) => option.value === selectedRange) ?? DATE_RANGE_OPTIONS[0];

  return {
    ...config,
    currentStartOffset: `-${config.days - 1} day`,
    previousStartOffset: `-${config.days * 2 - 1} day`,
    previousEndOffset: `-${config.days} day`,
  };
}
