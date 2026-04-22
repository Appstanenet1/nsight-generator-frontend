import {
  DATE_RANGE_OPTIONS,
  type DateRangeOption,
} from '@/app/_lib/dashboard-types';
import { getDashboardData } from '@/app/_lib/dashboard-data';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const range = getValidatedRange(new URL(request.url).searchParams.get('range'));
    const payload = getDashboardData(range);

    return Response.json(payload, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Dashboard adapter failed:', error);

    return Response.json(
      {
        error: 'Unable to load dashboard data from the connected SQLite source.',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}

function getValidatedRange(value: string | null): DateRangeOption {
  const fallback = '7d' as const;

  if (!value) {
    return fallback;
  }

  const match = DATE_RANGE_OPTIONS.find((option) => option.value === value);
  return match?.value ?? fallback;
}
