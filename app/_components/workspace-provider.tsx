'use client';

import { createContext, useContext, useState } from 'react';
import type { ChatMessage, DateRangeOption } from '@/app/_lib/dashboard-types';

type WorkspaceContextValue = {
  selectedRange: DateRangeOption;
  setSelectedRange: React.Dispatch<React.SetStateAction<DateRangeOption>>;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  chatDraft: string;
  setChatDraft: React.Dispatch<React.SetStateAction<string>>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>('7d');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState('');

  return (
    <WorkspaceContext.Provider
      value={{
        selectedRange,
        setSelectedRange,
        chatMessages,
        setChatMessages,
        chatDraft,
        setChatDraft,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceState() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspaceState must be used within a WorkspaceProvider.');
  }

  return context;
}
