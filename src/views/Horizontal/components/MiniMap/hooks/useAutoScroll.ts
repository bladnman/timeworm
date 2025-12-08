import { useRef, useCallback } from 'react';
import { MINIMAP_CONFIG } from '../../../hooks/constants';

interface UseAutoScrollOptions {
  minimapYearsVisible: number;
  onScroll: (deltaYears: number) => void;
}

interface UseAutoScrollReturn {
  startAutoScroll: (direction: 'left' | 'right') => void;
  stopAutoScroll: () => void;
  isAutoScrolling: boolean;
  checkEdgeProximity: (positionPercent: number) => 'left' | 'right' | null;
}

export function useAutoScroll({
  minimapYearsVisible,
  onScroll,
}: UseAutoScrollOptions): UseAutoScrollReturn {
  const intervalRef = useRef<number | null>(null);
  const directionRef = useRef<'left' | 'right' | null>(null);

  const stopAutoScroll = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    directionRef.current = null;
  }, []);

  const startAutoScroll = useCallback(
    (direction: 'left' | 'right') => {
      // Already scrolling in this direction
      if (directionRef.current === direction) return;

      // Stop any existing scroll
      stopAutoScroll();

      directionRef.current = direction;

      intervalRef.current = window.setInterval(() => {
        const { autoScrollStepPercent } = MINIMAP_CONFIG;

        // Calculate scroll amount based on current visible range
        const scrollYears = minimapYearsVisible * (autoScrollStepPercent / 100);

        // Apply scroll in the appropriate direction
        const delta = direction === 'left' ? -scrollYears : scrollYears;

        onScroll(delta);
      }, MINIMAP_CONFIG.autoScrollIntervalMs);
    },
    [minimapYearsVisible, onScroll, stopAutoScroll]
  );

  const checkEdgeProximity = useCallback(
    (positionPercent: number): 'left' | 'right' | null => {
      const { edgeThresholdPercent } = MINIMAP_CONFIG;

      if (positionPercent <= edgeThresholdPercent) {
        return 'left';
      }
      if (positionPercent >= 100 - edgeThresholdPercent) {
        return 'right';
      }
      return null;
    },
    []
  );

  return {
    startAutoScroll,
    stopAutoScroll,
    isAutoScrolling: intervalRef.current !== null,
    checkEdgeProximity,
  };
}
