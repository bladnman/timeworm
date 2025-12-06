import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { TimelineProvider } from '../context/TimelineProvider';
import { useTimeline } from './useTimeline';

const wrapper = ({ children }: { children: ReactNode }) => (
  <TimelineProvider>{children}</TimelineProvider>
);

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

    expect(result.current.data).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.viewMode).toBe('vertical');
    expect(result.current.selectedEventId).toBeNull();
    expect(typeof result.current.setViewMode).toBe('function');
    expect(typeof result.current.selectEvent).toBe('function');
  });

  it('provides data with events', () => {
    const { result } = renderHook(() => useTimeline(), { wrapper });

    expect(result.current.data?.events).toBeDefined();
    expect(Array.isArray(result.current.data?.events)).toBe(true);
    expect(result.current.data?.events.length).toBeGreaterThan(0);
  });
});
