export type Tone = 'positive' | 'warning' | 'negative';

export type DateRangeOption = '7d' | '14d' | '30d';

export const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '14d', label: 'Last 14 days', days: 14 },
  { value: '30d', label: 'Last 30 days', days: 30 },
] as const satisfies ReadonlyArray<{
  value: DateRangeOption;
  label: string;
  days: number;
}>;

export type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
};

export type DashboardKpi = {
  key: 'roas' | 'cpa' | 'spend' | 'revenue';
  label: string;
  value: number;
  previousValue: number;
  deltaPercent: number | null;
  format: 'currency' | 'multiple';
  tone: Tone;
  context: string;
};

export type DashboardTrendPoint = {
  date: string;
  spend: number;
  revenue: number;
  roas: number;
  cpa: number;
};

export type DashboardCampaign = {
  campaignName: string;
  spend: number;
  revenue: number;
  roas: number;
  cpa: number;
  conversions: number;
};

export type DashboardInsight = {
  title: string;
  supportingMetric: string;
  action: string;
  tone: Tone;
  source: string;
  contributingMetrics: Array<{
    label: string;
    value: string;
  }>;
};

export type FocusArea = {
  title: string;
  detail: string;
  tone: Tone;
};

export type DashboardResponse = {
  asOfDate: string;
  selectedRange: DateRangeOption;
  rangeDays: number;
  periodLabel: string;
  comparisonLabel: string;
  kpis: DashboardKpi[];
  trend: DashboardTrendPoint[];
  campaigns: DashboardCampaign[];
  insights: DashboardInsight[];
  focusAreas: FocusArea[];
};
