'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { postChatMessage } from '@/app/_lib/client-api';
import { useWorkspaceState } from './workspace-provider';
import { ArrowUpRightIcon, InsightIcon, PageLead, Spinner, SurfaceCard } from './ui';

const exampleQueries = [
  'Why is my ROAS dropping?',
  'Top performing campaigns in the last 7 days',
  'Where am I wasting budget?',
];

export default function ChatScreen() {
  const { chatMessages, setChatMessages, chatDraft, setChatDraft } = useWorkspaceState();
  const [isLoading, setIsLoading] = useState(false);
  const endOfFeedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endOfFeedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatMessages, isLoading]);

  const handleExampleQuery = (query: string) => {
    setChatDraft(query);
    inputRef.current?.focus();
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!chatDraft.trim() || isLoading) {
      return;
    }

    const userMessage = chatDraft;
    setChatMessages((current) => [...current, { role: 'user', content: userMessage }]);
    setChatDraft('');
    setIsLoading(true);

    try {
      const reply = await postChatMessage(userMessage);
      setChatMessages((current) => [...current, { role: 'ai', content: reply }]);
    } catch (error) {
      const fallbackMessage =
        error instanceof Error
          ? error.message
          : 'Unable to connect to the insight backend. Please verify the API is running.';

      setChatMessages((current) => [
        ...current,
        {
          role: 'ai',
          content: `**Connection Error:** ${fallbackMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-13rem)] flex-col gap-6">
      <SurfaceCard className="p-6 sm:p-7">
        <PageLead
          eyebrow="Dedicated chat"
          title="Ask the analyst without dashboard clutter"
          description="The chat experience lives on its own route, with a full-height message thread and a sticky composer. The AI is querying live, real-time campaign performance data through the backend API, and session state still survives route changes."
        />
      </SurfaceCard>

      <SurfaceCard className="flex min-h-[640px] flex-1 flex-col p-4 sm:p-6">
        <div className="flex-1 overflow-y-auto pr-1">
          {chatMessages.length === 0 ? (
            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(145deg,rgba(224,242,254,0.95),rgba(255,255,255,0.98))] p-6 sm:p-8">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                  <InsightIcon />
                  Ask anything about your ads performance
                </span>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Start with a focused question and keep the dashboard separate.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  This page keeps the chat experience isolated so KPI cards, charts, and widgets do
                  not compete with a live conversation about real-time campaign performance.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {exampleQueries.map((query) => (
                  <button
                    key={query}
                    type="button"
                    onClick={() => handleExampleQuery(query)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <MessageCard key={`${message.role}-${index}`} role={message.role} content={message.content} />
              ))}

              {isLoading ? <LoadingMessageCard /> : null}
              <div ref={endOfFeedRef} />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 mt-6 border-t border-slate-200 bg-white/90 pt-4 backdrop-blur-xl">
          <form onSubmit={sendMessage}>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50/90 p-4 shadow-[0_30px_80px_-52px_rgba(14,165,233,0.18)]">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={chatDraft}
                    onChange={(event) => setChatDraft(event.target.value)}
                    placeholder="Ask a question about your campaign performance..."
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-20 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isLoading}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    {chatDraft.length}/160
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !chatDraft.trim()}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#06b6d4_0%,#2563eb_100%)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(59,130,246,0.9)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Send message
                      <ArrowUpRightIcon />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </SurfaceCard>
    </div>
  );
}

function MessageCard({ role, content }: { role: 'user' | 'ai'; content: string }) {
  const isUser = role === 'user';

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <article
        className={
          isUser
            ? 'max-w-3xl rounded-[26px] border border-cyan-200 bg-[linear-gradient(135deg,rgba(224,242,254,0.98),rgba(219,234,254,0.98))] p-5 text-slate-900 shadow-[0_26px_80px_-52px_rgba(15,23,42,0.18)]'
            : 'max-w-3xl rounded-[26px] border border-slate-200 bg-white p-5 text-slate-700 shadow-[0_26px_80px_-52px_rgba(15,23,42,0.14)]'
        }
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={
                isUser
                  ? 'h-2.5 w-2.5 rounded-full bg-cyan-500'
                  : 'h-2.5 w-2.5 rounded-full bg-emerald-500'
              }
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              {isUser ? 'Your Query' : 'AI Insight'}
            </span>
          </div>
        </div>

        {isUser ? (
          <p className="text-sm leading-7 text-slate-900">{content}</p>
        ) : (
          <div className="text-sm leading-7 text-slate-700 [&_a]:text-cyan-700 [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_ol]:ml-5 [&_ol]:list-decimal [&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-slate-200 [&_pre]:bg-slate-50 [&_pre]:p-4 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_ul]:ml-5 [&_ul]:list-disc">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </article>
    </div>
  );
}

function LoadingMessageCard() {
  return (
    <div className="flex justify-start">
      <div className="max-w-3xl rounded-[26px] border border-cyan-200 bg-[linear-gradient(135deg,rgba(236,254,255,0.98),rgba(240,249,255,0.98))] p-5 shadow-[0_26px_80px_-52px_rgba(15,23,42,0.14)]">
        <div className="flex items-center gap-3 text-sm font-medium text-cyan-700">
          <Spinner />
          Analyzing campaign data...
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>Detecting anomalies...</p>
          <p>Generating insights...</p>
        </div>
      </div>
    </div>
  );
}
