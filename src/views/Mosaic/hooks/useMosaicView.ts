import { useMemo, useState, useCallback } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import type { TimelineEvent } from '../../../types/timeline';
import { parseISOExtended, type ParsedDate } from '../../../utils/dateUtils';
import {
  MOSAIC_VIEW_CONFIG,
  BUCKET_CONFIGS,
  DENSITY_COLORS,
  type BucketType,
  type BucketConfig,
} from './constants';

/**
 * Represents a single cell in the mosaic grid
 */
export interface MosaicCell {
  /** X position in grid (0-indexed) */
  x: number;
  /** Y position in grid (0-indexed) */
  y: number;
  /** Start date of this cell's time bucket */
  startDate: ParsedDate;
  /** End date of this cell's time bucket */
  endDate: ParsedDate;
  /** Events occurring in this time bucket */
  events: TimelineEvent[];
  /** Number of events (for quick access) */
  eventCount: number;
  /** Normalized density (0-1) for color intensity */
  density: number;
  /** Human-readable label for this cell */
  label: string;
}

/**
 * Represents a row in the mosaic grid
 */
export interface MosaicRow {
  /** Y index of this row */
  index: number;
  /** Label for this row (e.g., "1990s", "2020") */
  label: string;
  /** Cells in this row */
  cells: MosaicCell[];
}

/**
 * Grid axis metadata
 */
export interface GridAxis {
  label: string;
  values: string[];
}

/**
 * Complete grid structure
 */
export interface MosaicGrid {
  rows: MosaicRow[];
  xAxis: GridAxis;
  yAxis: GridAxis;
  bucketConfig: BucketConfig;
  maxEventCount: number;
  totalEvents: number;
}

/**
 * Determines the appropriate bucket configuration based on time span
 */
const selectBucketConfig = (totalYears: number): BucketConfig => {
  for (const config of BUCKET_CONFIGS) {
    if (totalYears >= config.minYearsSpan && totalYears < config.maxYearsSpan) {
      return config;
    }
  }
  return BUCKET_CONFIGS[BUCKET_CONFIGS.length - 1];
};

/**
 * Gets the bucket configuration for a specific bucket type
 */
const getBucketConfigByType = (type: BucketType): BucketConfig => {
  return BUCKET_CONFIGS.find((c) => c.type === type) || BUCKET_CONFIGS[2];
};

/**
 * Calculates which grid cell an event belongs to based on bucket type
 */
const getEventGridPosition = (
  event: TimelineEvent,
  bucketType: BucketType,
  minYear: number
): { x: number; y: number } => {
  const date = parseISOExtended(event.date_start);

  switch (bucketType) {
    case 'day': {
      // X = day of month (0-30), Y = month offset from start
      const x = date.day - 1;
      const monthsFromStart = (date.year - minYear) * 12 + (date.month - 1);
      return { x, y: monthsFromStart };
    }
    case 'month': {
      // X = month (0-11), Y = year offset from start
      const x = date.month - 1;
      const y = date.year - minYear;
      return { x, y };
    }
    case 'year': {
      // X = year within decade (0-9), Y = decade offset
      const x = ((date.year % 10) + 10) % 10;
      const decadeStart = Math.floor(minYear / 10) * 10;
      const y = Math.floor((date.year - decadeStart) / 10);
      return { x, y };
    }
    case 'decade': {
      // X = decade within century (0-9), Y = century offset
      const decade = Math.floor(((date.year % 100) + 100) % 100 / 10);
      const centuryStart = Math.floor(minYear / 100) * 100;
      const y = Math.floor((date.year - centuryStart) / 100);
      return { x: decade, y };
    }
    case 'century': {
      // X = century within millennium (0-9), Y = millennium offset
      const century = Math.floor(((date.year % 1000) + 1000) % 1000 / 100);
      const millenniumStart = Math.floor(minYear / 1000) * 1000;
      const y = Math.floor((date.year - millenniumStart) / 1000);
      return { x: century, y };
    }
    default:
      return { x: 0, y: 0 };
  }
};

/**
 * Creates a ParsedDate for a specific grid cell
 */
const getCellDateRange = (
  x: number,
  y: number,
  bucketType: BucketType,
  minYear: number
): { start: ParsedDate; end: ParsedDate } => {
  switch (bucketType) {
    case 'day': {
      const month = (y % 12) + 1;
      const year = minYear + Math.floor(y / 12);
      const day = x + 1;
      return {
        start: { year, month, day, decimalYear: year + (y % 12) / 12 + x / 365 },
        end: { year, month, day, decimalYear: year + (y % 12) / 12 + (x + 1) / 365 },
      };
    }
    case 'month': {
      const year = minYear + y;
      const month = x + 1;
      return {
        start: { year, month, day: 1, decimalYear: year + x / 12 },
        end: { year, month, day: 28, decimalYear: year + (x + 1) / 12 },
      };
    }
    case 'year': {
      const decadeStart = Math.floor(minYear / 10) * 10;
      const year = decadeStart + y * 10 + x;
      return {
        start: { year, month: 1, day: 1, decimalYear: year },
        end: { year, month: 12, day: 31, decimalYear: year + 1 },
      };
    }
    case 'decade': {
      const centuryStart = Math.floor(minYear / 100) * 100;
      const decadeStart = centuryStart + y * 100 + x * 10;
      return {
        start: { year: decadeStart, month: 1, day: 1, decimalYear: decadeStart },
        end: { year: decadeStart + 9, month: 12, day: 31, decimalYear: decadeStart + 10 },
      };
    }
    case 'century': {
      const millenniumStart = Math.floor(minYear / 1000) * 1000;
      const centuryStart = millenniumStart + y * 1000 + x * 100;
      return {
        start: { year: centuryStart, month: 1, day: 1, decimalYear: centuryStart },
        end: { year: centuryStart + 99, month: 12, day: 31, decimalYear: centuryStart + 100 },
      };
    }
    default:
      return {
        start: { year: 0, month: 1, day: 1, decimalYear: 0 },
        end: { year: 0, month: 12, day: 31, decimalYear: 1 },
      };
  }
};

/**
 * Formats a cell label based on bucket type
 */
const formatCellLabel = (
  x: number,
  y: number,
  bucketType: BucketType,
  minYear: number
): string => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  switch (bucketType) {
    case 'day': {
      const month = (y % 12) + 1;
      const year = minYear + Math.floor(y / 12);
      return `${monthNames[month - 1]} ${x + 1}, ${year}`;
    }
    case 'month': {
      const year = minYear + y;
      return `${monthNames[x]} ${year}`;
    }
    case 'year': {
      const decadeStart = Math.floor(minYear / 10) * 10;
      const year = decadeStart + y * 10 + x;
      return `${year}`;
    }
    case 'decade': {
      const centuryStart = Math.floor(minYear / 100) * 100;
      const decadeStart = centuryStart + y * 100 + x * 10;
      return `${decadeStart}s`;
    }
    case 'century': {
      const millenniumStart = Math.floor(minYear / 1000) * 1000;
      const centuryStart = millenniumStart + y * 1000 + x * 100;
      const suffix = centuryStart < 0 ? ' BCE' : '';
      return `${Math.abs(Math.floor(centuryStart / 100)) + 1}th c.${suffix}`;
    }
    default:
      return '';
  }
};

/**
 * Formats row labels based on bucket type
 */
const formatRowLabel = (y: number, bucketType: BucketType, minYear: number): string => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  switch (bucketType) {
    case 'day': {
      const month = (y % 12) + 1;
      const year = minYear + Math.floor(y / 12);
      return `${monthNames[month - 1]} ${year}`;
    }
    case 'month':
      return `${minYear + y}`;
    case 'year': {
      const decadeStart = Math.floor(minYear / 10) * 10;
      return `${decadeStart + y * 10}s`;
    }
    case 'decade': {
      const centuryStart = Math.floor(minYear / 100) * 100;
      const century = centuryStart + y * 100;
      const suffix = century < 0 ? ' BCE' : '';
      return `${Math.abs(Math.floor(century / 100)) + 1}th c.${suffix}`;
    }
    case 'century': {
      const millenniumStart = Math.floor(minYear / 1000) * 1000;
      const millennium = millenniumStart + y * 1000;
      const suffix = millennium < 0 ? ' BCE' : ' CE';
      return `${Math.abs(millennium / 1000)}${suffix}`;
    }
    default:
      return '';
  }
};

/**
 * Formats column labels for X-axis based on bucket type
 */
const getXAxisLabels = (bucketType: BucketType): string[] => {
  const monthNames = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  switch (bucketType) {
    case 'day':
      return Array.from({ length: 31 }, (_, i) => String(i + 1));
    case 'month':
      return monthNames;
    case 'year':
      return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    case 'decade':
      return ['00s', '10s', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s'];
    case 'century':
      return ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
    default:
      return [];
  }
};

/**
 * Main hook for Mosaic Grid view
 */
export const useMosaicView = () => {
  const { data, selectEvent, isLoading } = useTimeline();
  const [selectedCell, setSelectedCell] = useState<MosaicCell | null>(null);
  const [hoveredCell, setHoveredCell] = useState<MosaicCell | null>(null);
  const [cellSize, setCellSize] = useState<number>(MOSAIC_VIEW_CONFIG.defaultCellSize);
  const [manualBucketType, setManualBucketType] = useState<BucketType | null>(null);

  // Calculate grid data
  const gridData = useMemo((): MosaicGrid | null => {
    if (!data?.events || data.events.length === 0) {
      return null;
    }

    // Sort events and find date range
    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.decimalYear - dateB.decimalYear;
    });

    const minDate = parseISOExtended(sortedEvents[0].date_start);
    const maxDate = parseISOExtended(sortedEvents[sortedEvents.length - 1].date_start);
    const totalYears = maxDate.year - minDate.year + 1;

    // Select bucket configuration
    const bucketConfig = manualBucketType
      ? getBucketConfigByType(manualBucketType)
      : selectBucketConfig(totalYears);

    // Group events by grid position
    const eventsByCell = new Map<string, TimelineEvent[]>();
    let maxY = 0;

    for (const event of sortedEvents) {
      const { x, y } = getEventGridPosition(event, bucketConfig.type, minDate.year);
      const key = `${x},${y}`;

      if (!eventsByCell.has(key)) {
        eventsByCell.set(key, []);
      }
      eventsByCell.get(key)!.push(event);
      maxY = Math.max(maxY, y);
    }

    // Find max event count for density normalization
    let maxEventCount = 0;
    for (const events of eventsByCell.values()) {
      maxEventCount = Math.max(maxEventCount, events.length);
    }

    // Build grid rows
    const rows: MosaicRow[] = [];
    for (let y = 0; y <= maxY; y++) {
      const cells: MosaicCell[] = [];

      for (let x = 0; x < bucketConfig.xCount; x++) {
        const key = `${x},${y}`;
        const events = eventsByCell.get(key) || [];
        const dateRange = getCellDateRange(x, y, bucketConfig.type, minDate.year);

        cells.push({
          x,
          y,
          startDate: dateRange.start,
          endDate: dateRange.end,
          events,
          eventCount: events.length,
          density: maxEventCount > 0 ? events.length / maxEventCount : 0,
          label: formatCellLabel(x, y, bucketConfig.type, minDate.year),
        });
      }

      rows.push({
        index: y,
        label: formatRowLabel(y, bucketConfig.type, minDate.year),
        cells,
      });
    }

    // Build axis labels
    const xAxis: GridAxis = {
      label: bucketConfig.xAxisLabel,
      values: getXAxisLabels(bucketConfig.type),
    };

    const yAxis: GridAxis = {
      label: bucketConfig.yAxisLabel,
      values: rows.map((r) => r.label),
    };

    return {
      rows,
      xAxis,
      yAxis,
      bucketConfig,
      maxEventCount,
      totalEvents: sortedEvents.length,
    };
  }, [data?.events, manualBucketType]);

  // Cell interaction handlers
  const handleCellClick = useCallback((cell: MosaicCell) => {
    if (cell.eventCount === 0) {
      setSelectedCell(null);
      return;
    }

    if (cell.eventCount === 1) {
      // Single event - open detail overlay
      selectEvent(cell.events[0].id);
    } else {
      // Multiple events - toggle cell expansion
      setSelectedCell((prev) => (prev?.x === cell.x && prev?.y === cell.y ? null : cell));
    }
  }, [selectEvent]);

  const handleCellHover = useCallback((cell: MosaicCell | null) => {
    setHoveredCell(cell);
  }, []);

  const handleEventClick = useCallback((event: TimelineEvent) => {
    selectEvent(event.id);
  }, [selectEvent]);

  const handleZoomChange = useCallback((newSize: number) => {
    setCellSize(Math.max(MOSAIC_VIEW_CONFIG.minCellSize, Math.min(MOSAIC_VIEW_CONFIG.maxCellSize, newSize)));
  }, []);

  const handleBucketChange = useCallback((type: BucketType | null) => {
    setManualBucketType(type);
    setSelectedCell(null);
  }, []);

  // Calculate cell color based on density
  const getCellColor = useCallback((density: number, hasEvents: boolean): string => {
    if (!hasEvents) {
      return 'transparent';
    }

    const { hue, saturation, lightness, minOpacity, maxOpacity } = DENSITY_COLORS;
    const opacity = minOpacity + density * (maxOpacity - minOpacity);

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  }, []);

  return {
    // Data
    grid: gridData,
    isLoading,

    // State
    selectedCell,
    hoveredCell,
    cellSize,
    manualBucketType,

    // Handlers
    handleCellClick,
    handleCellHover,
    handleEventClick,
    handleZoomChange,
    handleBucketChange,
    getCellColor,

    // Config
    config: MOSAIC_VIEW_CONFIG,
  };
};
