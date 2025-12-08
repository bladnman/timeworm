import { useEffect, useRef, useCallback, useState } from 'react';
import type { TimelineData } from '../types/timeline';

/**
 * Storage key prefix for localStorage persistence
 */
const STORAGE_PREFIX = 'timeworm:timeline:';

/**
 * Auto-save debounce delay in milliseconds
 */
const AUTOSAVE_DELAY_MS = 2000;

/**
 * Stored timeline data shape
 */
interface StoredTimeline {
  data: TimelineData;
  lastModified: string;
  version: number;
}

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface UseAutoSaveConfig {
  /**
   * Timeline ID for storage key
   */
  timelineId: string | null;

  /**
   * Current timeline data
   */
  data: TimelineData | null;

  /**
   * Whether there are unsaved changes
   */
  isDirty: boolean;

  /**
   * Callback when save completes
   */
  onSaved?: () => void;
}

interface UseAutoSaveResult {
  /**
   * Current save status
   */
  status: SaveStatus;

  /**
   * Last save timestamp
   */
  lastSaved: string | null;

  /**
   * Manually trigger save
   */
  saveNow: () => void;

  /**
   * Clear saved data for this timeline
   */
  clearSaved: () => void;
}

/**
 * Hook for auto-saving timeline data to localStorage with debouncing.
 * Provides save status for UI feedback.
 */
export const useAutoSave = (config: UseAutoSaveConfig): UseAutoSaveResult => {
  const { timelineId, data, isDirty, onSaved } = config;

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Refs for debounce timer
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get storage key
  const getStorageKey = useCallback(() => {
    if (!timelineId) return null;
    return `${STORAGE_PREFIX}${timelineId}`;
  }, [timelineId]);

  // Save function
  const save = useCallback(() => {
    const storageKey = getStorageKey();
    if (!storageKey || !data) return;

    setStatus('saving');

    try {
      const stored: StoredTimeline = {
        data,
        lastModified: new Date().toISOString(),
        version: 1,
      };

      localStorage.setItem(storageKey, JSON.stringify(stored));

      setLastSaved(stored.lastModified);
      setStatus('saved');
      onSaved?.();

      // Reset status to idle after showing "saved" briefly
      savedIndicatorTimerRef.current = setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to save timeline:', err);
      setStatus('error');
    }
  }, [getStorageKey, data, onSaved]);

  // Manual save
  const saveNow = useCallback(() => {
    // Clear any pending auto-save
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    save();
  }, [save]);

  // Clear saved data
  const clearSaved = useCallback(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
      setStatus('idle');
    }
  }, [getStorageKey]);

  // Auto-save when dirty
  useEffect(() => {
    if (!isDirty || !timelineId || !data) {
      return;
    }

    // Clear any existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setStatus('pending');

    // Set new timer for debounced save
    saveTimerRef.current = setTimeout(() => {
      save();
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [isDirty, timelineId, data, save]);

  // Load last saved timestamp on mount
  useEffect(() => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: StoredTimeline = JSON.parse(stored);
        setLastSaved(parsed.lastModified);
      }
    } catch {
      // Ignore parse errors
    }
  }, [getStorageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (savedIndicatorTimerRef.current) {
        clearTimeout(savedIndicatorTimerRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    saveNow,
    clearSaved,
  };
};
