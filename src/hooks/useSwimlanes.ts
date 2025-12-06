import { useMemo } from 'react';
import type { TimelineData, TimelineEvent } from '../types/timeline';

interface SwimlaneEvent extends TimelineEvent {
  lane: number;
  xPos: number;
}

interface SwimlaneConfig {
  cardWidth: number;
  gap: number;
  getPosition: (dateStr: string) => number;
}

export const useSwimlanes = (data: TimelineData | null, config: SwimlaneConfig) => {
  const layout = useMemo(() => {
    if (!data) return { events: [], maxLane: 0 };

    const { cardWidth, gap, getPosition } = config;
    const lanes: number[] = []; // End position of the last event in each lane

    // Process events sorted by start time
    const sortedEvents = [...data.events].sort((a, b) =>
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
    );

    const laidOutEvents: SwimlaneEvent[] = sortedEvents.map((event) => {
      const startPos = getPosition(event.date_start);
      const endPos = startPos + cardWidth + gap;

      // Find first lane where this fits
      let laneIndex = -1;
      for (let i = 0; i < lanes.length; i++) {
        if (lanes[i] < startPos) {
          laneIndex = i;
          break;
        }
      }

      // If no lane found, create new one
      if (laneIndex === -1) {
        laneIndex = lanes.length;
        lanes.push(endPos);
      } else {
        lanes[laneIndex] = endPos;
      }

      return {
        ...event,
        lane: laneIndex,
        xPos: startPos
      };
    });

    return {
      events: laidOutEvents,
      maxLane: lanes.length
    };
  }, [data, config]);

  return layout;
};
