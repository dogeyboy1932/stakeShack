'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Profile, Apartment } from '@/lib/schema';

interface SummaryData {
  type: 'profile' | 'apartment';
  data: Profile | Apartment;
  summary?: string;
  isLoading?: boolean;
}

interface SummaryContextType {
  isOpen: boolean;
  summaryData: SummaryData | null;
  openSummary: (type: 'profile' | 'apartment', data: Profile | Apartment) => void;
  closeSummary: () => void;
  setSummary: (summary: string) => void;
  setLoading: (loading: boolean) => void;
}

const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

export function SummaryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  const openSummary = (type: 'profile' | 'apartment', data: Profile | Apartment) => {
    setSummaryData({
      type,
      data,
      summary: undefined,
      isLoading: true
    });
    setIsOpen(true);
  };

  const closeSummary = () => {
    setIsOpen(false);
    setSummaryData(null);
  };

  const setSummary = (summary: string) => {
    if (summaryData) {
      setSummaryData({
        ...summaryData,
        summary,
        isLoading: false
      });
    }
  };

  const setLoading = (loading: boolean) => {
    if (summaryData) {
      setSummaryData({
        ...summaryData,
        isLoading: loading
      });
    }
  };

  return (
    <SummaryContext.Provider value={{
      isOpen,
      summaryData,
      openSummary,
      closeSummary,
      setSummary,
      setLoading
    }}>
      {children}
    </SummaryContext.Provider>
  );
}

export function useSummary() {
  const context = useContext(SummaryContext);
  if (context === undefined) {
    throw new Error('useSummary must be used within a SummaryProvider');
  }
  return context;
} 