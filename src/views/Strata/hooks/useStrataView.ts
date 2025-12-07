import { useMemo } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { parseISOExtended, differenceInYears } from '../../../utils/dateUtils';
import type { TimelineEvent } from '../../../types/timeline';
import {
  STRATA_VIEW_CONFIG,
  GRANULARITY_THRESHOLDS,
  GRANULARITY_INTERVAL,
  type LayerGranularity,
} from './constants';

/**
 * Represents a single stratum (layer) in the geological timeline.
 */
export interface StrataLayer {
  id: string;
  startYear: number;
  endYear: number;
  durationYears: number;
  heightPx: number;
  events: TimelineEvent[];
  label: string;
  index: number;
  colorIndex: number; // For alternating visual distinction
}

/**
 * Summary data for a layer (used in hover/tap tooltips).
 */
export interface LayerSummary {
  eventCount: number;
  timeSpan: string;
  highlights: string[]; // First few event titles
}

/**
 * Determine appropriate granularity based on total time span.
 */
const selectGranularity = (totalYears: number): LayerGranularity => {
  if (totalYears < GRANULARITY_THRESHOLDS.year) return 'year';
  if (totalYears < GRANULARITY_THRESHOLDS.decade) return 'decade';
  if (totalYears < GRANULARITY_THRESHOLDS.quarterCentury) return 'quarter-century';
  if (totalYears < GRANULARITY_THRESHOLDS.century) return 'century';
  return 'millennium';
};

/**
 * Get the layer boundary year for a given year and granularity.
 * This rounds down to the start of the interval.
 */
const getLayerBoundary = (year: number, granularity: LayerGranularity): number => {
  const interval = GRANULARITY_INTERVAL[granularity];
  return Math.floor(year / interval) * interval;
};

/**
 * Generate a human-readable label for a layer.
 */
const generateLayerLabel = (
  startYear: number,
  endYear: number,
  granularity: LayerGranularity
): string => {
  const formatYear = (y: number): string => {
    if (y < 0) return `${Math.abs(y)} BCE`;
    return `${y}`;
  };

  switch (granularity) {
    case 'year':
      return formatYear(startYear);
    case 'decade':
      return `${formatYear(startYear)}s`;
    case 'quarter-century':
    case 'century':
      return `${formatYear(startYear)}–${formatYear(endYear)}`;
    case 'millennium':
      if (startYear < 0) {
        return `${Math.abs(Math.floor(startYear / 1000)) + 1}k BCE`;
      }
      return `${Math.floor(startYear / 1000) + 1}k`;
    default:
      return `${formatYear(startYear)}–${formatYear(endYear)}`;
  }
};

/**
 * Calculate pixel height for a layer based on its duration.
 * Uses proportional scaling with min/max constraints.
 */
const calculateLayerHeight = (
  durationYears: number,
  totalDuration: number,
  availableHeight: number
): number => {
  // Proportional height
  const proportionalHeight = (durationYears / totalDuration) * availableHeight;

  // Apply constraints
  return Math.max(
    STRATA_VIEW_CONFIG.minLayerHeight,
    Math.min(STRATA_VIEW_CONFIG.maxLayerHeight, proportionalHeight)
  );
};

/**
 * Main hook for the Strata timeline view.
 * Transforms timeline events into geological-style layers.
 */
export const useStrataView = () => {
  const { data, selectEvent, selectedEventId, isLoading } = useTimeline();

  const { layers, granularity, totalYears } = useMemo(() => {
    if (!data || data.events.length === 0) {
      return { layers: [] as StrataLayer[], granularity: 'decade' as LayerGranularity, totalYears: 0 };
    }

    // Parse all dates and sort events by date (oldest first)
    const eventsWithDates = data.events.map((event) => ({
      event,
      date: parseISOExtended(event.date_start),
    }));

    eventsWithDates.sort((a, b) => a.date.decimalYear - b.date.decimalYear);

    // Calculate time span
    const minDate = eventsWithDates[0].date;
    const maxDate = eventsWithDates[eventsWithDates.length - 1].date;
    const totalYears = Math.max(1, differenceInYears(minDate, maxDate));

    // Select appropriate granularity
    const granularity = selectGranularity(totalYears);
    const interval = GRANULARITY_INTERVAL[granularity];

    // Determine layer boundaries
    const firstLayerStart = getLayerBoundary(minDate.year, granularity);
    const lastLayerEnd = getLayerBoundary(maxDate.year, granularity) + interval;

    // Create layer map
    const layerMap = new Map<number, { events: TimelineEvent[]; startYear: number; endYear: number }>();

    for (let year = firstLayerStart; year < lastLayerEnd; year += interval) {
      layerMap.set(year, {
        events: [],
        startYear: year,
        endYear: year + interval,
      });
    }

    // Assign events to layers
    for (const { event, date } of eventsWithDates) {
      const layerStart = getLayerBoundary(date.year, granularity);
      const layer = layerMap.get(layerStart);
      if (layer) {
        layer.events.push(event);
      }
    }

    // Calculate total duration for proportional height
    const layerEntries = Array.from(layerMap.entries()).sort((a, b) => a[0] - b[0]);
    const layersWithDuration = layerEntries.map(([, layer]) => ({
      ...layer,
      durationYears: layer.endYear - layer.startYear,
    }));

    const totalLayerDuration = layersWithDuration.reduce((sum, l) => sum + l.durationYears, 0);

    // Estimate available height (rough estimate, will be constrained by viewport)
    const estimatedAvailableHeight = Math.max(
      600,
      layersWithDuration.length * STRATA_VIEW_CONFIG.minLayerHeight * 1.5
    );

    // Build final layer objects
    const layers: StrataLayer[] = layersWithDuration.map((layer, index) => ({
      id: `layer-${layer.startYear}`,
      startYear: layer.startYear,
      endYear: layer.endYear,
      durationYears: layer.durationYears,
      heightPx: calculateLayerHeight(layer.durationYears, totalLayerDuration, estimatedAvailableHeight),
      events: layer.events,
      label: generateLayerLabel(layer.startYear, layer.endYear, granularity),
      index,
      colorIndex: index % 4, // Cycle through 4 color variants
    }));

    return { layers, granularity, totalYears };
  }, [data]);

  /**
   * Get summary for a specific layer (for tooltips).
   */
  const getLayerSummary = (layer: StrataLayer): LayerSummary => {
    return {
      eventCount: layer.events.length,
      timeSpan: `${Math.abs(layer.durationYears)} years`,
      highlights: layer.events.slice(0, 3).map((e) => e.title),
    };
  };

  return {
    layers,
    granularity,
    totalYears,
    selectEvent,
    selectedEventId,
    getLayerSummary,
    isLoading,
  };
};

/**
 * Format a year for display, handling BCE dates.
 */
export const formatYear = (year: number): string => {
  if (year < 0) return `${Math.abs(year)} BCE`;
  if (year === 0) return '1 BCE'; // There is no year 0
  return `${year}`;
};
