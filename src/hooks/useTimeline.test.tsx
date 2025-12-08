import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { TimelineProvider } from '../context/TimelineProvider';
import { useTimeline } from './useTimeline';
import type { TimelineData } from '../types/timeline';

const wrapper = ({ children }: { children: ReactNode }) => (
  <TimelineProvider>{children}</TimelineProvider>
);

// Mock timeline data for testing
const mockTimelineData: TimelineData = {
  meta: {
    title: 'Test Timeline',
    version: '1.0.0',
    generated_date: '2025-01-01',
    overview: 'Test overview',
    attribution: 'Test attribution',
  },
  groups: [
    {
      id: 'grp_1',
      title: 'Test Group',
      date_range: '1900 - 2000',
      description: 'Test group description',
    },
  ],
  events: [
    {
      id: 'evt_1',
      title: 'Test Event',
      date_display: '1950',
      date_start: '1950-01-01',
      group_ids: ['grp_1'],
      type: 'Test',
      innovation: 'Test innovation',
      image_urls: [],
      description: 'Test description',
      metrics: {},
    },
  ],
};

describe('useTimeline', () => {
  it('throws error when used outside of TimelineProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTimeline());
    }).toThrow('useTimeline must be used within a TimelineProvider');

    consoleSpy.mockRestore();
  });

  it('returns context values when used inside TimelineProvider', () => {
    const { result } = renderHook(() => useTimeline(), { wrapper });

    // Data is null until setData is called (new architecture)
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.viewMode).toBe('vertical');
    expect(result.current.selectedEventId).toBeNull();
    expect(typeof result.current.setViewMode).toBe('function');
    expect(typeof result.current.selectEvent).toBe('function');
    expect(typeof result.current.setData).toBe('function');
  });

  it('allows setting data via setData', () => {
    const { result } = renderHook(() => useTimeline(), { wrapper });

    act(() => {
      result.current.setData(mockTimelineData);
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.events).toBeDefined();
    expect(Array.isArray(result.current.data?.events)).toBe(true);
    expect(result.current.data?.events.length).toBe(1);
  });

  it('provides event mutation functions', () => {
    const { result } = renderHook(() => useTimeline(), { wrapper });

    act(() => {
      result.current.setData(mockTimelineData);
    });

    expect(typeof result.current.updateEvent).toBe('function');
    expect(typeof result.current.createEvent).toBe('function');
    expect(typeof result.current.deleteEvent).toBe('function');
  });

  it('can update an event', () => {
    const { result } = renderHook(() => useTimeline(), { wrapper });

    act(() => {
      result.current.setData(mockTimelineData);
    });

    act(() => {
      result.current.updateEvent('evt_1', { title: 'Updated Title' });
    });

    expect(result.current.data?.events[0].title).toBe('Updated Title');
    expect(result.current.isDirty).toBe(true);
  });

  it('can create a new event', () => {
    const { result } = renderHook(() => useTimeline(), { wrapper });

    act(() => {
      result.current.setData(mockTimelineData);
    });

    let newEventId: string;
    act(() => {
      newEventId = result.current.createEvent({
        title: 'New Event',
        date_display: '1960',
        date_start: '1960-01-01',
        group_ids: [],
        type: 'New',
        innovation: 'New innovation',
        image_urls: [],
        description: 'New description',
        metrics: {},
      });
    });

    expect(result.current.data?.events.length).toBe(2);
    expect(result.current.data?.events.find((e) => e.id === newEventId!)).toBeDefined();
    expect(result.current.isDirty).toBe(true);
  });

  it('can delete an event', () => {
    const { result } = renderHook(() => useTimeline(), { wrapper });

    act(() => {
      result.current.setData(mockTimelineData);
    });

    act(() => {
      result.current.deleteEvent('evt_1');
    });

    expect(result.current.data?.events.length).toBe(0);
    expect(result.current.isDirty).toBe(true);
  });
});
