import React, { useState, useCallback, type ReactNode } from 'react';
import type {
  TimelineData,
  TimelineEvent,
  TimelineGroup,
  TimelineMeta,
  ViewMode,
} from '../types/timeline';
import { TimelineContext } from './TimelineContext';

interface TimelineProviderProps {
  children: ReactNode;
}

/**
 * Generate a unique ID for new events/groups
 */
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

export const TimelineProvider: React.FC<TimelineProviderProps> = ({ children }) => {
  // Data state - no longer loaded from static import
  const [data, setDataRaw] = useState<TimelineData | null>(null);
  const [isLoading] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('vertical');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Edit state
  const [isDirty, setIsDirty] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  // Set data (from useTimelineLibrary)
  const setData = useCallback((newData: TimelineData | null) => {
    setDataRaw(newData);
    // Set viewMode from data's defaultView if present, otherwise default to 'vertical'
    if (newData?.meta?.defaultView) {
      setViewMode(newData.meta.defaultView);
    } else {
      setViewMode('vertical');
    }
    setIsDirty(false);
    setEditingEventId(null);
    setEditingGroupId(null);
    setSelectedEventId(null);
  }, []);

  // Mark as dirty (has unsaved changes)
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  // Mark as clean (changes saved)
  const markClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  // Event mutations
  const updateEvent = useCallback((id: string, updates: Partial<TimelineEvent>) => {
    setDataRaw((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        events: prev.events.map((event) =>
          event.id === id ? { ...event, ...updates } : event
        ),
      };
    });
    setIsDirty(true);
  }, []);

  const createEvent = useCallback((eventData: Omit<TimelineEvent, 'id'>): string => {
    const id = generateId('evt');
    const newEvent: TimelineEvent = {
      ...eventData,
      id,
    };

    setDataRaw((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        events: [...prev.events, newEvent],
      };
    });
    setIsDirty(true);
    return id;
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setDataRaw((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        events: prev.events.filter((event) => event.id !== id),
      };
    });

    // Clear selection if deleted event was selected
    setSelectedEventId((prev) => (prev === id ? null : prev));
    setEditingEventId((prev) => (prev === id ? null : prev));
    setIsDirty(true);
  }, []);

  // Group mutations
  const updateGroup = useCallback((id: string, updates: Partial<TimelineGroup>) => {
    setDataRaw((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        groups: prev.groups.map((group) =>
          group.id === id ? { ...group, ...updates } : group
        ),
      };
    });
    setIsDirty(true);
  }, []);

  const createGroup = useCallback((groupData: Omit<TimelineGroup, 'id'>): string => {
    const id = generateId('grp');
    const newGroup: TimelineGroup = {
      ...groupData,
      id,
    };

    setDataRaw((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        groups: [...prev.groups, newGroup],
      };
    });
    setIsDirty(true);
    return id;
  }, []);

  const deleteGroup = useCallback((id: string) => {
    setDataRaw((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        groups: prev.groups.filter((group) => group.id !== id),
        // Also remove group from all events
        events: prev.events.map((event) => ({
          ...event,
          group_ids: event.group_ids.filter((gid) => gid !== id),
        })),
      };
    });

    setEditingGroupId((prev) => (prev === id ? null : prev));
    setIsDirty(true);
  }, []);

  // Meta mutations
  const updateMeta = useCallback((updates: Partial<TimelineMeta>) => {
    setDataRaw((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        meta: { ...prev.meta, ...updates },
      };
    });
    setIsDirty(true);
  }, []);

  const value = {
    // Data
    data,
    isLoading,
    setData,

    // View state
    viewMode,
    selectedEventId,
    setViewMode,
    selectEvent: setSelectedEventId,

    // Edit state
    isDirty,
    editingEventId,
    editingGroupId,
    setEditingEventId,
    setEditingGroupId,

    // Event mutations
    updateEvent,
    createEvent,
    deleteEvent,

    // Group mutations
    updateGroup,
    createGroup,
    deleteGroup,

    // Meta mutations
    updateMeta,

    // Persistence
    markDirty,
    markClean,
  };

  return (
    <TimelineContext.Provider value={value}>
      {children}
    </TimelineContext.Provider>
  );
};
