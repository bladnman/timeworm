import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TimelineData } from '../types/timeline';
import { useSwimlanes } from './useSwimlanes';

const createMockData = (events: Array<{ id: string; date_start: string }>): TimelineData => ({
  meta: {
    title: 'Test',
    version: '1.0',
    generated_date: '2025-01-01',
    overview: 'Test data',
    attribution: 'Test',
  },
  groups: [],
  events: events.map((e) => ({
    id: e.id,
    title: `Event ${e.id}`,
    date_display: e.date_start,
    date_start: e.date_start,
    group_ids: [],
    type: 'test',
    innovator: 'Test',
    innovation: 'Test',
    image_urls: [],
    description: 'Test description',
    metrics: {},
    links: [],
  })),
});

describe('useSwimlanes', () => {
  const defaultConfig = {
    cardWidth: 100,
    gap: 10,
    getPosition: (dateStr: string) => {
      // Extract year from ISO date string directly to avoid timezone issues
      const year = parseInt(dateStr.split('-')[0], 10);
      return (year - 2000) * 100;
    },
  };

  it('returns empty events for null data', () => {
    const { result } = renderHook(() => useSwimlanes(null, defaultConfig));

    expect(result.current.events).toEqual([]);
    expect(result.current.maxLane).toBe(0);
  });

  it('returns empty events for empty events array', () => {
    const data = createMockData([]);
    const { result } = renderHook(() => useSwimlanes(data, defaultConfig));

    expect(result.current.events).toEqual([]);
    expect(result.current.maxLane).toBe(0);
  });

  it('assigns lane 0 to a single event', () => {
    const data = createMockData([
      { id: 'e1', date_start: '2000-01-01' },
    ]);
    const { result } = renderHook(() => useSwimlanes(data, defaultConfig));

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].lane).toBe(0);
    expect(result.current.maxLane).toBe(1);
  });

  it('assigns same lane to non-overlapping events', () => {
    const data = createMockData([
      { id: 'e1', date_start: '2000-01-01' },
      { id: 'e2', date_start: '2005-01-01' }, // 500px apart, way more than cardWidth+gap (110)
    ]);
    const { result } = renderHook(() => useSwimlanes(data, defaultConfig));

    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0].lane).toBe(0);
    expect(result.current.events[1].lane).toBe(0); // Same lane since they don't overlap
    expect(result.current.maxLane).toBe(1);
  });

  it('assigns different lanes to overlapping events', () => {
    const data = createMockData([
      { id: 'e1', date_start: '2000-01-01' }, // position 0
      { id: 'e2', date_start: '2000-06-01' }, // position ~50, overlaps with e1
    ]);
    const { result } = renderHook(() => useSwimlanes(data, defaultConfig));

    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0].lane).toBe(0);
    expect(result.current.events[1].lane).toBe(1); // Different lane
    expect(result.current.maxLane).toBe(2);
  });

  it('sorts events by date before lane assignment', () => {
    const data = createMockData([
      { id: 'e2', date_start: '2005-01-01' },
      { id: 'e1', date_start: '2000-01-01' },
      { id: 'e3', date_start: '2010-01-01' },
    ]);
    const { result } = renderHook(() => useSwimlanes(data, defaultConfig));

    // Events should be sorted by date in the output
    expect(result.current.events[0].id).toBe('e1');
    expect(result.current.events[1].id).toBe('e2');
    expect(result.current.events[2].id).toBe('e3');
  });

  it('calculates xPos based on getPosition', () => {
    const data = createMockData([
      { id: 'e1', date_start: '2001-01-01' },
      { id: 'e2', date_start: '2011-01-01' },
    ]);
    const { result } = renderHook(() => useSwimlanes(data, defaultConfig));

    expect(result.current.events[0].xPos).toBe(100); // (2001-2000)*100
    expect(result.current.events[1].xPos).toBe(1100); // (2011-2000)*100
  });

  it('reuses lanes when events no longer overlap', () => {
    const data = createMockData([
      { id: 'e1', date_start: '2000-01-01' }, // position 0
      { id: 'e2', date_start: '2000-06-01' }, // position ~50, overlaps e1 -> lane 1
      { id: 'e3', date_start: '2005-01-01' }, // position 500, no overlap -> lane 0
    ]);
    const { result } = renderHook(() => useSwimlanes(data, defaultConfig));

    expect(result.current.events[0].lane).toBe(0);
    expect(result.current.events[1].lane).toBe(1);
    expect(result.current.events[2].lane).toBe(0); // Reuses lane 0
  });
});
