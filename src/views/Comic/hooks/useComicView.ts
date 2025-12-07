import { useMemo } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import type { TimelineEvent } from '../../../types/timeline';
import { parseISOExtended } from '../../../utils/dateUtils';
import { COMIC_VIEW_CONFIG, PANEL_LAYOUTS, type PanelSize } from './constants';

export interface ComicPanel {
  event: TimelineEvent;
  size: PanelSize;
  hasImage: boolean;
  gapYears: number | null;
  showChapterBreak: boolean;
}

export interface ComicRow {
  panels: ComicPanel[];
}

const calculateGapYears = (current: TimelineEvent, previous: TimelineEvent | null): number | null => {
  if (!previous) return null;
  const currentDate = parseISOExtended(current.date_start);
  const previousDate = parseISOExtended(previous.date_start);
  return Math.abs(currentDate.year - previousDate.year);
};

export const useComicView = () => {
  const { data, selectEvent, isLoading } = useTimeline();

  const rows = useMemo(() => {
    if (!data?.events) return [];

    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.year - dateB.year;
    });

    const panels: ComicPanel[] = sortedEvents.map((event, index) => {
      const previous = index > 0 ? sortedEvents[index - 1] : null;
      const gapYears = calculateGapYears(event, previous);
      const hasImage = event.image_urls.length > 0;

      return {
        event,
        size: 'medium' as PanelSize,
        hasImage,
        gapYears,
        showChapterBreak: gapYears !== null && gapYears >= COMIC_VIEW_CONFIG.gapThresholdYears,
      };
    });

    const result: ComicRow[] = [];
    let currentIndex = 0;
    let layoutIndex = 0;

    while (currentIndex < panels.length) {
      const layout = PANEL_LAYOUTS[layoutIndex % PANEL_LAYOUTS.length];
      const rowPanels: ComicPanel[] = [];

      for (let i = 0; i < layout.length && currentIndex < panels.length; i++) {
        const panel = panels[currentIndex];

        if (panel.showChapterBreak && rowPanels.length > 0) {
          break;
        }

        rowPanels.push({
          ...panel,
          size: layout[i],
        });
        currentIndex++;
      }

      if (rowPanels.length > 0) {
        result.push({ panels: rowPanels });
        layoutIndex++;
      }
    }

    return result;
  }, [data?.events]);

  return {
    rows,
    selectEvent,
    isLoading,
  };
};
