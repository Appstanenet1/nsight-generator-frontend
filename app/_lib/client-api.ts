import type { DashboardResponse, DateRangeOption } from './dashboard-types';

type ChatReply = {
  reply: string;
};

export async function fetchDashboardData(range: DateRangeOption, signal?: AbortSignal) {
  const response = await fetch(`/api/dashboard?range=${range}`, {
    method: 'GET',
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    const payload = (await readErrorPayload(response)) ?? 'Unable to load dashboard data.';
    throw new Error(payload);
  }

  return (await response.json()) as DashboardResponse;
}

export async function postChatMessage(message: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const payload = (await readErrorPayload(response)) ?? 'Unable to reach the insight service.';
    throw new Error(payload);
  }

  const data = (await response.json()) as ChatReply;
  return data.reply;
}

async function readErrorPayload(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? null;
  } catch {
    return null;
  }
}
