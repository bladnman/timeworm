/**
 * useTimelineLibrary Hook
 *
 * Manages timeline data via REST API.
 * - GET /api/timelines - Load manifest (list of all timelines)
 * - GET /api/timeline/:id - Load a specific timeline
 * - PUT /api/timeline/:id - Save a timeline
 */

import { useState, useCallback, useEffect } from 'react';
import type { TimelineData, ViewMode } from '../types/timeline';

/**
 * Timeline manifest entry from API
 */
export interface TimelineManifestEntry {
  id: string;
  filename: string;
  title: string;
  overview: string;
  eventCount: number;
  dateRange: string;
  defaultView: ViewMode;
}

export interface UseTimelineLibraryResult {
  /**
   * Timeline manifest (lightweight metadata for library tiles)
   */
  manifest: TimelineManifestEntry[];

  /**
   * Whether manifest is loading
   */
  isLoadingManifest: boolean;

  /**
   * Load a timeline by ID from the API
   */
  loadTimeline: (id: string) => Promise<TimelineData>;

  /**
   * Save a timeline to the API
   */
  saveTimeline: (id: string, data: TimelineData) => Promise<void>;

  /**
   * Refresh the manifest from the API
   */
  refreshManifest: () => Promise<void>;

  /**
   * Currently loading timeline ID (null if not loading)
   */
  loadingId: string | null;

  /**
   * Error message if something failed
   */
  error: string | null;
}

/**
 * Hook for managing timeline library via REST API.
 */
export const useTimelineLibrary = (): UseTimelineLibraryResult => {
  const [manifest, setManifest] = useState<TimelineManifestEntry[]>([]);
  const [isLoadingManifest, setIsLoadingManifest] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch manifest from API
  const refreshManifest = useCallback(async () => {
    setIsLoadingManifest(true);
    setError(null);

    try {
      const response = await fetch('/api/timelines');
      if (!response.ok) {
        throw new Error(`Failed to load timelines: ${response.status}`);
      }
      const data = await response.json();
      setManifest(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load timelines';
      setError(message);
      console.error('Failed to load manifest:', err);
    } finally {
      setIsLoadingManifest(false);
    }
  }, []);

  // Load manifest on mount
  useEffect(() => {
    refreshManifest();
  }, [refreshManifest]);

  // Load a specific timeline by ID
  const loadTimeline = useCallback(async (id: string): Promise<TimelineData> => {
    setLoadingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/timeline/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to load timeline: ${response.status}`);
      }
      const data = await response.json();
      return data as TimelineData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load timeline';
      setError(message);
      throw err;
    } finally {
      setLoadingId(null);
    }
  }, []);

  // Save a timeline
  const saveTimeline = useCallback(
    async (id: string, data: TimelineData): Promise<void> => {
      setError(null);

      try {
        const response = await fetch(`/api/timeline/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to save timeline: ${response.status}`);
        }

        // Refresh manifest to reflect any changes (title, event count, etc.)
        await refreshManifest();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save timeline';
        setError(message);
        throw err;
      }
    },
    [refreshManifest]
  );

  return {
    manifest,
    isLoadingManifest,
    loadTimeline,
    saveTimeline,
    refreshManifest,
    loadingId,
    error,
  };
};
