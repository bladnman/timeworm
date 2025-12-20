import { useMemo, useCallback } from 'react';

// URL parameter keys
const URL_PARAM_START = 's';
const URL_PARAM_END = 'e';

export interface UrlRangeState {
  start: number | null;  // Normalized 0-1 position
  end: number | null;    // Normalized 0-1 position
}

export interface UseUrlStateResult {
  /** Initial range from URL params (null if not present) */
  initialRange: UrlRangeState;

  /** Generate a shareable URL with current range state */
  generateShareUrl: (start: number, end: number) => string;

  /** Clear range params from URL (keeps timeline ID) */
  clearRangeParams: () => void;
}

/**
 * Hook for managing viewport range state in URL query parameters.
 *
 * Parameters:
 * - `s`: Start position (normalized 0-1)
 * - `e`: End position (normalized 0-1)
 *
 * Usage:
 * - On mount, check `initialRange` to restore viewport from URL
 * - Use `generateShareUrl` to create shareable links
 * - Range params are optional; timeline ID (`t`) is managed by AppProvider
 */
export function useUrlState(): UseUrlStateResult {
  // Read initial range from URL (only on first render)
  const initialRange = useMemo((): UrlRangeState => {
    const params = new URLSearchParams(window.location.search);
    const startStr = params.get(URL_PARAM_START);
    const endStr = params.get(URL_PARAM_END);

    const start = startStr !== null ? parseFloat(startStr) : null;
    const end = endStr !== null ? parseFloat(endStr) : null;

    // Validate: both must be present and valid numbers in 0-1 range
    if (
      start !== null && end !== null &&
      !isNaN(start) && !isNaN(end) &&
      start >= 0 && start <= 1 &&
      end >= 0 && end <= 1 &&
      start < end
    ) {
      return { start, end };
    }

    return { start: null, end: null };
  }, []);

  // Generate a shareable URL with current range
  const generateShareUrl = useCallback((start: number, end: number): string => {
    const url = new URL(window.location.href);

    // Clamp and format to 4 decimal places for reasonable precision
    const clampedStart = Math.max(0, Math.min(1, start));
    const clampedEnd = Math.max(0, Math.min(1, end));

    url.searchParams.set(URL_PARAM_START, clampedStart.toFixed(4));
    url.searchParams.set(URL_PARAM_END, clampedEnd.toFixed(4));

    return url.toString();
  }, []);

  // Clear range params from URL
  const clearRangeParams = useCallback((): void => {
    const url = new URL(window.location.href);
    url.searchParams.delete(URL_PARAM_START);
    url.searchParams.delete(URL_PARAM_END);
    window.history.replaceState({}, '', url.toString());
  }, []);

  return {
    initialRange,
    generateShareUrl,
    clearRangeParams,
  };
}
