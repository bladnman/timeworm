import { useMemo } from 'react';
import { BIKE_RIDE_CONFIG } from './constants';

export interface PathPoint {
  x: number;
  y: number;
  t: number; // Normalized time (0-1) along the path
  length: number; // Cumulative length at this point
}

export interface GeneratedPath {
  points: PathPoint[];
  svgPath: string;
  totalLength: number;
  getPointAtTime: (t: number) => { x: number; y: number };
  getTimeAtX: (x: number) => number;
}

/**
 * Attempt to use a seeded random for consistent path generation.
 * Falls back to Math.random if crypto is unavailable.
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Attempt to generate smooth noise using multiple sine waves.
 * This creates a more natural-looking path than pure random noise.
 */
function smoothNoise(x: number, seed: number): number {
  // Combine multiple frequencies for organic feel
  const f1 = Math.sin(x * 0.01 + seed);
  const f2 = Math.sin(x * 0.023 + seed * 1.3) * 0.5;
  const f3 = Math.sin(x * 0.007 + seed * 0.7) * 0.8;
  const f4 = Math.sin(x * 0.031 + seed * 2.1) * 0.3;

  return (f1 + f2 + f3 + f4) / 2.6; // Normalize to roughly -1 to 1
}

/**
 * Generate the meandering bike path.
 *
 * The path is strictly monotonic in X (time always moves forward),
 * but meanders vertically to create visual interest.
 *
 * @param totalWidth - Total width of the path canvas in pixels
 * @param config - Optional configuration overrides
 */
export function usePathGenerator(
  totalWidth: number,
  config?: Partial<typeof BIKE_RIDE_CONFIG>
): GeneratedPath {
  const {
    pathAmplitude,
    pathSegments,
    pathCenterY,
  } = { ...BIKE_RIDE_CONFIG, ...config };

  return useMemo(() => {
    const points: PathPoint[] = [];
    const seed = 42; // Consistent seed for reproducible paths

    // Generate path points
    for (let i = 0; i <= pathSegments; i++) {
      const t = i / pathSegments;
      const x = t * totalWidth;

      // Generate Y using smooth noise
      // Add variation at different scales for natural meandering
      const noise = smoothNoise(x, seed);

      // Apply envelope: reduce amplitude at start and end for smooth entry/exit
      const envelope = Math.sin(t * Math.PI);
      const y = pathCenterY + noise * pathAmplitude * envelope;

      points.push({
        x,
        y,
        t,
        length: 0, // Will be calculated below
      });
    }

    // Calculate cumulative lengths
    let cumulativeLength = 0;
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        points[i].length = 0;
      } else {
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        cumulativeLength += Math.sqrt(dx * dx + dy * dy);
        points[i].length = cumulativeLength;
      }
    }

    const totalLength = cumulativeLength;

    // Generate SVG path string using quadratic bezier curves for smoothness
    let svgPath = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      if (i === 1) {
        // First segment: line to first point
        svgPath += ` L ${curr.x} ${curr.y}`;
      } else {
        // Use quadratic bezier for smooth curves
        const prevPrev = points[i - 2];

        // Control point is at the previous point
        // This creates a smooth curve through all points
        const cpX = prev.x;
        const cpY = prev.y;

        // End point is midway to current for smoothness (Catmull-Rom style)
        if (i < points.length - 1) {
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          svgPath += ` Q ${cpX} ${cpY} ${midX} ${midY}`;
        } else {
          // Last point: go directly to end
          svgPath += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
        }
      }
    }

    /**
     * Get the x,y coordinates for a given normalized time (0-1).
     * Uses linear interpolation between path points.
     */
    function getPointAtTime(t: number): { x: number; y: number } {
      const clampedT = Math.max(0, Math.min(1, t));

      // Find the two points that bracket this t value
      let lower = 0;
      let upper = points.length - 1;

      // Binary search for efficiency
      while (upper - lower > 1) {
        const mid = Math.floor((lower + upper) / 2);
        if (points[mid].t <= clampedT) {
          lower = mid;
        } else {
          upper = mid;
        }
      }

      const p1 = points[lower];
      const p2 = points[upper];

      // Handle edge cases
      if (p1.t === p2.t) {
        return { x: p1.x, y: p1.y };
      }

      // Linear interpolation
      const localT = (clampedT - p1.t) / (p2.t - p1.t);
      return {
        x: p1.x + (p2.x - p1.x) * localT,
        y: p1.y + (p2.y - p1.y) * localT,
      };
    }

    /**
     * Get the normalized time (0-1) for a given X position.
     * Useful for converting pixel positions back to time.
     */
    function getTimeAtX(x: number): number {
      // Since X is monotonically increasing and linear with t,
      // this is straightforward
      return Math.max(0, Math.min(1, x / totalWidth));
    }

    return {
      points,
      svgPath,
      totalLength,
      getPointAtTime,
      getTimeAtX,
    };
  }, [totalWidth, pathAmplitude, pathSegments, pathCenterY]);
}
