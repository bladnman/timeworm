import { useMemo } from 'react';
import type { TimelineData, TimelineEvent } from '../../../types/timeline';
import { HORIZONTAL_VIEW_CONFIG } from './constants';

export interface LayoutItem {
  type: 'event' | 'cluster';
  id: string;
  xPos: number;
  lane: 'above' | 'below';
  stackIndex: number; // For stacked events (0 = closest to track)
}

export interface LayoutEvent extends LayoutItem {
  type: 'event';
  event: TimelineEvent;
  isMilestone: boolean;
}

export interface LayoutCluster extends LayoutItem {
  type: 'cluster';
  events: TimelineEvent[];
  startYear: number;
  endYear: number;
}

export type TrackLayoutItem = LayoutEvent | LayoutCluster;

interface TrackLayoutConfig {
  cardWidth: number;
  cardHeight: number;
  gap: number;
  clusterThreshold: number; // Events beyond this count become a cluster
  getPosition: (dateStr: string) => number;
}

interface EventWithPosition {
  event: TimelineEvent;
  xPos: number;
  year: number;
  isMilestone: boolean;
}

/**
 * Smart track layout with clustering for dense areas.
 *
 * Strategy:
 * 1. Calculate x position for all events
 * 2. Group overlapping events (those within cardWidth + gap of each other)
 * 3. For small groups (2-3): stack them with slight vertical offset
 * 4. For large groups (4+): create a cluster badge
 * 5. Alternate lanes above/below the track for visual balance
 */
export const useTrackLayout = (
  data: TimelineData | null,
  config: Partial<TrackLayoutConfig> & Pick<TrackLayoutConfig, 'getPosition'>
) => {
  return useMemo(() => {
    if (!data || data.events.length === 0) {
      return { items: [], maxStackAbove: 0, maxStackBelow: 0 };
    }

    const {
      cardWidth = HORIZONTAL_VIEW_CONFIG.cardWidth,
      gap = HORIZONTAL_VIEW_CONFIG.gap,
      clusterThreshold = 4,
      getPosition,
    } = config;

    const minSeparation = cardWidth + gap;

    // Step 1: Calculate positions and sort by x
    const eventsWithPos: EventWithPosition[] = data.events
      .map((event) => {
        const xPos = getPosition(event.date_start);
        const year = new Date(event.date_start).getFullYear();
        const isMilestone = event.metrics?.milestone === true;
        return { event, xPos, year, isMilestone };
      })
      .sort((a, b) => a.xPos - b.xPos);

    // Step 2: Group overlapping events
    const groups: EventWithPosition[][] = [];
    let currentGroup: EventWithPosition[] = [];

    for (const item of eventsWithPos) {
      if (currentGroup.length === 0) {
        currentGroup.push(item);
      } else {
        // Check if this event overlaps with the first event in current group
        const groupStart = currentGroup[0].xPos;
        if (item.xPos - groupStart < minSeparation) {
          currentGroup.push(item);
        } else {
          groups.push(currentGroup);
          currentGroup = [item];
        }
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // Step 3: Convert groups to layout items
    const items: TrackLayoutItem[] = [];
    let laneIndex = 0;
    let maxStackAbove = 0;
    let maxStackBelow = 0;

    for (const group of groups) {
      const lane: 'above' | 'below' = laneIndex % 2 === 0 ? 'above' : 'below';
      const groupXPos = group[0].xPos;

      if (group.length >= clusterThreshold) {
        // Create a cluster
        const startYear = Math.min(...group.map((g) => g.year));
        const endYear = Math.max(...group.map((g) => g.year));

        items.push({
          type: 'cluster',
          id: `cluster-${groupXPos}`,
          xPos: groupXPos,
          lane,
          stackIndex: 0,
          events: group.map((g) => g.event),
          startYear,
          endYear,
        });
      } else {
        // Separate regular events and milestones within the group
        const regularEvents = group.filter(g => !g.isMilestone);
        const milestones = group.filter(g => g.isMilestone);

        // Add regular events with stack offsets (closer to axis)
        for (let i = 0; i < regularEvents.length; i++) {
          const stackIndex = i;
          items.push({
            type: 'event',
            id: regularEvents[i].event.id,
            xPos: regularEvents[i].xPos,
            lane,
            stackIndex,
            event: regularEvents[i].event,
            isMilestone: false,
          });

          // Track max stack depth
          if (lane === 'above') {
            maxStackAbove = Math.max(maxStackAbove, stackIndex + 1);
          } else {
            maxStackBelow = Math.max(maxStackBelow, stackIndex + 1);
          }
        }

        // Add milestones with higher stack offset (further from axis)
        // Push milestones at least 5 levels (100px) from axis for clear visual separation
        const milestoneBaseStack = Math.max(regularEvents.length + 4, 5);
        for (let i = 0; i < milestones.length; i++) {
          const stackIndex = milestoneBaseStack + i;
          items.push({
            type: 'event',
            id: milestones[i].event.id,
            xPos: milestones[i].xPos,
            lane,
            stackIndex,
            event: milestones[i].event,
            isMilestone: true,
          });

          // Track max stack depth
          if (lane === 'above') {
            maxStackAbove = Math.max(maxStackAbove, stackIndex + 1);
          } else {
            maxStackBelow = Math.max(maxStackBelow, stackIndex + 1);
          }
        }
      }

      laneIndex++;
    }

    return { items, maxStackAbove, maxStackBelow };
  }, [data, config]);
};
