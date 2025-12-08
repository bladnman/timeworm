import { useMemo } from 'react';
import type { TimelineEvent } from '../../../types/timeline';
import { parseISOExtended } from '../../../utils/dateUtils';
import {
  TRAIN_JOURNEY_CONFIG,
  type Station,
  type EventWithPosition,
  type EventCluster,
} from '../constants';

interface UseEventPositioningConfig {
  events: TimelineEvent[];
  stations: Station[];
  getPosition: (dateStr: string) => number;
  pixelsPerYear: number;
}

interface UseEventPositioningResult {
  positionedEvents: EventWithPosition[];
  clusters: EventCluster[];
}

/**
 * Positions events along the track, handles stacking, and creates clusters
 * when events are too dense.
 */
export const useEventPositioning = (config: UseEventPositioningConfig): UseEventPositioningResult => {
  const { events, stations, getPosition } = config;

  return useMemo(() => {
    if (!events.length) {
      return { positionedEvents: [], clusters: [] };
    }

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.decimalYear - dateB.decimalYear;
    });

    // Position each event
    const positioned: EventWithPosition[] = sortedEvents.map((event) => {
      const xPos = getPosition(event.date_start);

      // Find nearest station
      let nearestStation: Station | null = null;
      let nearestDistance = Infinity;

      for (const station of stations) {
        const distance = Math.abs(station.xPos - xPos);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestStation = station;
        }
      }

      // Determine if event is "at" a station (within threshold)
      const stationThreshold = TRAIN_JOURNEY_CONFIG.minEventSpacing / 2;
      const stationId = nearestStation && nearestDistance < stationThreshold
        ? nearestStation.id
        : null;

      return {
        id: event.id,
        title: event.title,
        date_display: event.date_display,
        date_start: event.date_start,
        xPos,
        lane: 'above' as const,  // Will be assigned in stacking phase
        stackIndex: 0,
        stationId,
      };
    });

    // Stack events to avoid overlap
    const { stacked, clusters } = stackAndClusterEvents(positioned);

    return {
      positionedEvents: stacked,
      clusters,
    };
  }, [events, stations, getPosition]);
};

/**
 * Assigns lanes (above/below) and stack indices to prevent overlap.
 * Creates clusters when too many events are in the same area.
 */
function stackAndClusterEvents(
  events: EventWithPosition[]
): { stacked: EventWithPosition[]; clusters: EventCluster[] } {
  const minSpacing = TRAIN_JOURNEY_CONFIG.minEventSpacing;
  const cardWidth = TRAIN_JOURNEY_CONFIG.eventCardWidth;
  const clusterThreshold = TRAIN_JOURNEY_CONFIG.clusterThreshold;

  // Group events that would overlap
  const groups: EventWithPosition[][] = [];
  let currentGroup: EventWithPosition[] = [];

  for (const event of events) {
    if (currentGroup.length === 0) {
      currentGroup.push(event);
    } else {
      const lastEvent = currentGroup[currentGroup.length - 1];
      const distance = event.xPos - lastEvent.xPos;

      if (distance < cardWidth + minSpacing) {
        currentGroup.push(event);
      } else {
        groups.push(currentGroup);
        currentGroup = [event];
      }
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Process each group
  const stacked: EventWithPosition[] = [];
  const clusters: EventCluster[] = [];

  for (const group of groups) {
    if (group.length <= clusterThreshold) {
      // Stack events alternating above/below
      group.forEach((event, i) => {
        stacked.push({
          ...event,
          lane: i % 2 === 0 ? 'above' : 'below',
          stackIndex: Math.floor(i / 2),
        });
      });
    } else {
      // Create a cluster for dense groups
      const firstEvent = group[0];
      const lastEvent = group[group.length - 1];
      const firstDate = parseISOExtended(firstEvent.date_start);
      const lastDate = parseISOExtended(lastEvent.date_start);

      clusters.push({
        id: `cluster-${firstEvent.id}`,
        events: group.map((e, i) => ({
          ...e,
          lane: i % 2 === 0 ? 'above' as const : 'below' as const,
          stackIndex: Math.floor(i / 2),
        })),
        xPos: (firstEvent.xPos + lastEvent.xPos) / 2,
        startYear: firstDate.year,
        endYear: lastDate.year,
        lane: 'above',
      });
    }
  }

  return { stacked, clusters };
}
