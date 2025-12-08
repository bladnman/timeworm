/**
 * useAutoSave Hook
 *
 * Auto-saves timeline data to the backend API with debouncing.
 * Provides save status for UI feedback.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { TimelineData } from '../types/timeline';

/**
 * Auto-save debounce delay in milliseconds
 */
const AUTOSAVE_DELAY_MS = 2000;

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface UseAutoSaveConfig {
  /**
   * Timeline ID for API endpoint
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
}

/**
 * Hook for auto-saving timeline data to the backend API with debouncing.
 * Provides save status for UI feedback.
 */
export const useAutoSave = (config: UseAutoSaveConfig): UseAutoSaveResult => {
  const { timelineId, data, isDirty, onSaved } = config;

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Refs for debounce timer
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIndicatorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save function
  const save = useCallback(async () => {
    if (!timelineId || !data) return;

    setStatus('saving');

    try {
      const response = await fetch(`/api/timeline/${timelineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save: ${response.status}`);
      }

      const savedAt = new Date().toISOString();
      setLastSaved(savedAt);
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
  }, [timelineId, data, onSaved]);

  // Manual save
  const saveNow = useCallback(() => {
    // Clear any pending auto-save
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    save();
  }, [save]);

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
  };
};
