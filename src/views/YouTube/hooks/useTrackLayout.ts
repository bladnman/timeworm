import { useMemo } from 'react';
import type { TimelineData, TimelineEvent } from '../../../types/timeline';
import { YOUTUBE_VIEW_CONFIG } from './constants';

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
 * 1. Separate milestones from regular events
 * 2. Milestones: Always above, in their own swim lane with independent stacking
 * 3. Regular events: Group overlapping ones, alternate above/below, cluster if dense
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
      cardWidth = YOUTUBE_VIEW_CONFIG.cardWidth,
      gap = YOUTUBE_VIEW_CONFIG.gap,
      clusterThreshold = 4,
      getPosition,
    } = config;

    const minSeparation = cardWidth + gap;
    const items: TrackLayoutItem[] = [];
    let maxStackAbove = 0;
    let maxStackBelow = 0;

    // Step 1: Separate milestones and regular events
    const allEvents: EventWithPosition[] = data.events
      .map((event) => {
        const xPos = getPosition(event.date_start);
        const year = new Date(event.date_start).getFullYear();
        const isMilestone = event.metrics?.milestone === true;
        return { event, xPos, year, isMilestone };
      })
      .sort((a, b) => a.xPos - b.xPos);

    const milestones = allEvents.filter(e => e.isMilestone);
    const regularEvents = allEvents.filter(e => !e.isMilestone);

    // Step 2: Process milestones - all go above with their own stacking
    // Group overlapping milestones for stacking
    const milestoneGroups: EventWithPosition[][] = [];
    let currentMilestoneGroup: EventWithPosition[] = [];

    for (const item of milestones) {
      if (currentMilestoneGroup.length === 0) {
        currentMilestoneGroup.push(item);
      } else {
        const groupStart = currentMilestoneGroup[0].xPos;
        if (item.xPos - groupStart < minSeparation) {
          currentMilestoneGroup.push(item);
        } else {
          milestoneGroups.push(currentMilestoneGroup);
          currentMilestoneGroup = [item];
        }
      }
    }
    if (currentMilestoneGroup.length > 0) {
      milestoneGroups.push(currentMilestoneGroup);
    }

    // Add milestones - all above, base stack at 5 (100px from axis)
    const milestoneBaseStack = 5;
    for (const group of milestoneGroups) {
      for (let i = 0; i < group.length; i++) {
        const stackIndex = milestoneBaseStack + i;
        items.push({
          type: 'event',
          id: group[i].event.id,
          xPos: group[i].xPos,
          lane: 'above',
          stackIndex,
          event: group[i].event,
          isMilestone: true,
        });
        maxStackAbove = Math.max(maxStackAbove, stackIndex + 1);
      }
    }

    // Step 3: Process regular events - group overlapping, alternate lanes
    const regularGroups: EventWithPosition[][] = [];
    let currentGroup: EventWithPosition[] = [];

    for (const item of regularEvents) {
      if (currentGroup.length === 0) {
        currentGroup.push(item);
      } else {
        const groupStart = currentGroup[0].xPos;
        if (item.xPos - groupStart < minSeparation) {
          currentGroup.push(item);
        } else {
          regularGroups.push(currentGroup);
          currentGroup = [item];
        }
      }
    }
    if (currentGroup.length > 0) {
      regularGroups.push(currentGroup);
    }

    // Add regular events with alternating lanes
    let laneIndex = 0;
    for (const group of regularGroups) {
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
        // Stack individual events
        for (let i = 0; i < group.length; i++) {
          const stackIndex = i;
          items.push({
            type: 'event',
            id: group[i].event.id,
            xPos: group[i].xPos,
            lane,
            stackIndex,
            event: group[i].event,
            isMilestone: false,
          });

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
