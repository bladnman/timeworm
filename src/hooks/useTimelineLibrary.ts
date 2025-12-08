import { useState, useCallback, useEffect } from 'react';
import { timelineManifest, type TimelineManifestEntry } from '../../data/manifest';
import type { TimelineData } from '../types/timeline';

/**
 * Storage key prefix for localStorage persistence
 */
const STORAGE_PREFIX = 'timeworm:timeline:';

/**
 * Get storage key for a timeline
 */
const getStorageKey = (timelineId: string) => `${STORAGE_PREFIX}${timelineId}`;

/**
 * Stored timeline data shape
 */
interface StoredTimeline {
  data: TimelineData;
  lastModified: string;
  version: number;
}

/**
 * Dynamic import map for timeline data files.
 * Vite requires the import paths to be statically analyzable,
 * so we map IDs to their import functions.
 * We use `unknown` and cast at runtime since JSON data may vary slightly.
 */
const timelineImports: Record<string, () => Promise<unknown>> = {
  ai_history: () => import('../../data/ai_history_data.json'),
  bicycle_history: () => import('../../data/bicycle_history_data.json'),
  board_game_history: () => import('../../data/board_game_history_data.json'),
  competitive_eating_history: () => import('../../data/competitive_eating_history_data.json'),
  fortune_cookie_history: () => import('../../data/fortune_cookie_history_data.json'),
  godzilla_history: () => import('../../data/godzilla_history_data.json'),
  kpop_history: () => import('../../data/kpop_history_data.json'),
  lego_history: () => import('../../data/lego_history_data.json'),
  sneaker_history: () => import('../../data/sneaker_history_data.json'),
  tattoo_history: () => import('../../data/tattoo_history_data.json'),
  theme_park_history: () => import('../../data/theme_park_history_data.json'),
};

export interface UseTimelineLibraryResult {
  /**
   * Timeline manifest (lightweight metadata)
   */
  manifest: TimelineManifestEntry[];

  /**
   * Map of loaded timeline data by ID
   */
  loadedTimelines: Map<string, TimelineData>;

  /**
   * Load a timeline by ID.
   * Checks localStorage first for user edits, then falls back to bundled data.
   */
  loadTimeline: (id: string) => Promise<TimelineData>;

  /**
   * Check if a timeline is already loaded in memory
   */
  isLoaded: (id: string) => boolean;

  /**
   * Check if a timeline has local edits in localStorage
   */
  hasLocalEdits: (id: string) => boolean;

  /**
   * Get the last modified date for local edits
   */
  getLastModified: (id: string) => string | null;

  /**
   * Clear local edits for a timeline (revert to bundled data)
   */
  clearLocalEdits: (id: string) => void;

  /**
   * Save timeline data to localStorage
   */
  saveTimeline: (id: string, data: TimelineData) => void;

  /**
   * Currently loading timeline ID (null if not loading)
   */
  loadingId: string | null;

  /**
   * Error if loading failed
   */
  error: string | null;
}

/**
 * Hook for managing the timeline library.
 * Provides access to manifest, loading, and persistence.
 */
export const useTimelineLibrary = (): UseTimelineLibraryResult => {
  const [loadedTimelines, setLoadedTimelines] = useState<Map<string, TimelineData>>(new Map());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if timeline has local edits
  const hasLocalEdits = useCallback((id: string): boolean => {
    try {
      const stored = localStorage.getItem(getStorageKey(id));
      return stored !== null;
    } catch {
      return false;
    }
  }, []);

  // Get last modified date for local edits
  const getLastModified = useCallback((id: string): string | null => {
    try {
      const stored = localStorage.getItem(getStorageKey(id));
      if (stored) {
        const parsed: StoredTimeline = JSON.parse(stored);
        return parsed.lastModified;
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  }, []);

  // Clear local edits
  const clearLocalEdits = useCallback((id: string): void => {
    try {
      localStorage.removeItem(getStorageKey(id));
      // Also clear from memory to force reload from bundled data
      setLoadedTimelines((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save timeline to localStorage
  const saveTimeline = useCallback((id: string, data: TimelineData): void => {
    try {
      const stored: StoredTimeline = {
        data,
        lastModified: new Date().toISOString(),
        version: 1,
      };
      localStorage.setItem(getStorageKey(id), JSON.stringify(stored));

      // Also update in-memory cache
      setLoadedTimelines((prev) => new Map(prev).set(id, data));
    } catch (err) {
      console.error('Failed to save timeline to localStorage:', err);
    }
  }, []);

  // Load timeline by ID
  const loadTimeline = useCallback(
    async (id: string): Promise<TimelineData> => {
      // Return from cache if already loaded
      const cached = loadedTimelines.get(id);
      if (cached) {
        return cached;
      }

      setLoadingId(id);
      setError(null);

      try {
        // First check localStorage for user edits
        const storedJson = localStorage.getItem(getStorageKey(id));
        if (storedJson) {
          const stored: StoredTimeline = JSON.parse(storedJson);
          setLoadedTimelines((prev) => new Map(prev).set(id, stored.data));
          setLoadingId(null);
          return stored.data;
        }

        // Otherwise load from bundled data
        const importFn = timelineImports[id];
        if (!importFn) {
          throw new Error(`Unknown timeline ID: ${id}`);
        }

        const module = await importFn() as { default: TimelineData };
        const data = module.default;

        setLoadedTimelines((prev) => new Map(prev).set(id, data));
        setLoadingId(null);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load timeline';
        setError(message);
        setLoadingId(null);
        throw err;
      }
    },
    [loadedTimelines]
  );

  // Check if timeline is loaded
  const isLoaded = useCallback(
    (id: string): boolean => {
      return loadedTimelines.has(id);
    },
    [loadedTimelines]
  );

  // Preload the first timeline on mount (optional - can be removed if not desired)
  useEffect(() => {
    // Don't preload - let Home screen drive loading
  }, []);

  return {
    manifest: timelineManifest,
    loadedTimelines,
    loadTimeline,
    isLoaded,
    hasLocalEdits,
    getLastModified,
    clearLocalEdits,
    saveTimeline,
    loadingId,
    error,
  };
};
