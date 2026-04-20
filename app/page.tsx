'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'ai';
  content: string;
};

export default function ChatDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input } as Message];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Dynamic API URL: Uses the environment variable if present, otherwise defaults to localhost
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      console.error('Error connecting to backend:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: '🚨 **Connection Error:** Python server unreachable. Please ensure the backend is running.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Sleek Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-5 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            DataCore <span className="text-slate-500 font-medium">Insight Engine</span>
          </h1>
        </div>
        <div className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
          Agent Status: ONLINE
        </div>
      </header>

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-8 pb-4">
          {messages.length === 0 && (
            <div className="text-center mt-32 flex flex-col items-center animate-fade-in">
              <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6 border border-slate-700/50">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-200 mb-2">Query your marketing stack.</h2>
              <p className="text-slate-500 text-sm max-w-md">
                Connects directly to your local SQLite Mart. Ask about ROAS, CPA, and campaign performance over time.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-5 shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-sm shadow-cyan-900/20'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 rounded-bl-sm backdrop-blur-sm'
                }`}
              >
                {/* Markdown Renderer Wrapped in Div to avoid react-markdown v10 className error */}
                {msg.role === 'ai' ? (
                  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-strong:text-cyan-400">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* Upgraded Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl rounded-bl-sm p-5 shadow-sm flex flex-col gap-3 min-w-[250px]">
                <div className="flex items-center gap-3 text-cyan-400 text-sm font-medium">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Agent is thinking...
                </div>
                <div className="text-xs text-slate-500 font-mono flex flex-col gap-1">
                  <span className="animate-pulse">&gt; Writing SQL query...</span>
                  <span className="animate-pulse animation-delay-200">&gt; Executing against local DB...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Form */}
      <footer className="bg-slate-900/50 backdrop-blur-md border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your Google Ads data..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-5 pr-32 py-4 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-inner placeholder:text-slate-600"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Query
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}