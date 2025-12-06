import { useMemo, useState } from 'react';
import { eachYearOfInterval } from 'date-fns';
import { useSwimlanes } from '../../../hooks/useSwimlanes';
import { useTimeline } from '../../../hooks/useTimeline';
import { useTimeScale } from '../../../hooks/useTimeScale';
import { HORIZONTAL_VIEW_CONFIG } from './constants';

export interface Tick {
  date: Date;
  label: string;
  major: boolean;
}

export const useHorizontalView = () => {
  const { data, selectEvent } = useTimeline();
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(HORIZONTAL_VIEW_CONFIG.defaultPixelsPerYear);

  const { totalWidth, getPosition, minDate, maxDate } = useTimeScale(data, { pixelsPerYear });

  const { events, maxLane } = useSwimlanes(data, {
    cardWidth: HORIZONTAL_VIEW_CONFIG.cardWidth,
    gap: HORIZONTAL_VIEW_CONFIG.gap,
    getPosition
  });

  const ticks = useMemo((): Tick[] => {
    if (!minDate || !maxDate) return [];
    // If super zoomed out (< 10px/yr), show Decades
    if (pixelsPerYear < 10) {
      return eachYearOfInterval({ start: minDate, end: maxDate })
        .filter(d => d.getFullYear() % 10 === 0)
        .map(d => ({
          date: d,
          label: d.getFullYear().toString(),
          major: true
        }));
    }
    // Otherwise show Years
    return eachYearOfInterval({ start: minDate, end: maxDate }).map(d => ({
      date: d,
      label: d.getFullYear().toString(),
      major: d.getFullYear() % 10 === 0
    }));
  }, [minDate, maxDate, pixelsPerYear]);

  const handleZoomChange = (value: number) => {
    setPixelsPerYear(value);
  };

  return {
    // State
    data,
    events,
    ticks,
    pixelsPerYear,
    totalWidth,
    maxLane,
    // Handlers
    handleZoomChange,
    selectEvent,
    getPosition,
    // Config
    cardHeight: HORIZONTAL_VIEW_CONFIG.cardHeight,
    zoomMin: HORIZONTAL_VIEW_CONFIG.zoomMin,
    zoomMax: HORIZONTAL_VIEW_CONFIG.zoomMax,
    zoomStep: HORIZONTAL_VIEW_CONFIG.zoomStep,
  };
};
