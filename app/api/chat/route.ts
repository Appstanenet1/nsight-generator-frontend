type ChatRequest = {
  message?: string;
};

const BACKEND_URL =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let payload: ChatRequest;

  try {
    payload = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  if (!payload.message?.trim()) {
    return Response.json({ error: 'Message is required.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: payload.message }),
      cache: 'no-store',
    });

    const data = (await response.json()) as { reply?: string };

    if (!response.ok) {
      return Response.json(
        {
          error: data.reply ?? 'The insight backend returned an error.',
        },
        { status: response.status },
      );
    }

    return Response.json(
      {
        reply: data.reply ?? 'No response returned from the insight backend.',
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('Chat proxy failed:', error);

    return Response.json(
      {
        error: 'Unable to connect to the insight backend. Verify the Python API is running.',
      },
      {
        status: 502,
      },
    );
  }
}
