import React, { useState, type ReactNode } from 'react';
import rawData from '../../data/ai_history_data.json';
import type { TimelineData, ViewMode } from '../types/timeline';
import { TimelineContext } from './TimelineContext';

// Cast the raw json to our typed interface
const initialData: TimelineData = rawData as unknown as TimelineData;

interface TimelineProviderProps {
  children: ReactNode;
}

export const TimelineProvider: React.FC<TimelineProviderProps> = ({ children }) => {
  // Use lazy initialization - data is synchronously available from import
  const [data] = useState<TimelineData | null>(() => initialData);
  const [isLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('vertical');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const value = {
    data,
    isLoading,
    viewMode,
    selectedEventId,
    setViewMode,
    selectEvent: setSelectedEventId,
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};
