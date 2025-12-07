/**
 * Path utilities for the River Path timeline view.
 *
 * Provides Bezier curve generation, arc-length parameterization,
 * and position calculations for placing events along the river.
 */

export interface Point {
  x: number;
  y: number;
}

export interface PathSegment {
  start: Point;
  cp1: Point;     // First control point
  cp2: Point;     // Second control point
  end: Point;
}

export interface RiverWaypoint {
  point: Point;
  arcLength: number;    // Cumulative arc length from start
  tangentAngle: number; // Angle of tangent at this point (radians)
  width: number;        // River width at this point
}

/**
 * Generate waypoints for a winding river path.
 *
 * The river flows left-to-right with gentle vertical undulations.
 * Each bend creates a visual "era" while maintaining monotonic X progress.
 */
export const generateRiverWaypoints = (
  width: number,
  height: number,
  bendCount: number,
  amplitude: number,
  marginX: number,
  marginY: number
): Point[] => {
  const points: Point[] = [];
  const usableWidth = width - 2 * marginX;
  const centerY = height / 2;

  // Seeded pseudo-random for consistent curves
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let i = 0; i <= bendCount; i++) {
    const t = i / bendCount;
    const x = marginX + t * usableWidth;

    // Create gentle sine-like wave with slight randomness
    const wavePhase = t * Math.PI * 2.5;
    const baseY = Math.sin(wavePhase) * amplitude;

    // Add subtle variation
    const variation = (seededRandom(i * 7) - 0.5) * amplitude * 0.3;

    // Clamp Y to stay within margins
    const y = Math.max(
      marginY,
      Math.min(height - marginY, centerY + baseY + variation)
    );

    points.push({ x, y });
  }

  return points;
};

/**
 * Convert waypoints to smooth cubic Bezier segments.
 *
 * Uses Catmull-Rom to cubic Bezier conversion for smooth curves
 * that pass through all waypoints.
 */
export const waypointsToBezierSegments = (waypoints: Point[]): PathSegment[] => {
  if (waypoints.length < 2) return [];

  const segments: PathSegment[] = [];
  const tension = 0.3; // Lower = smoother curves

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[Math.max(0, i - 1)];
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[Math.min(waypoints.length - 1, i + 2)];

    // Calculate control points using Catmull-Rom to Bezier conversion
    const cp1: Point = {
      x: p1.x + (p2.x - p0.x) * tension,
      y: p1.y + (p2.y - p0.y) * tension,
    };

    const cp2: Point = {
      x: p2.x - (p3.x - p1.x) * tension,
      y: p2.y - (p3.y - p1.y) * tension,
    };

    segments.push({ start: p1, cp1, cp2, end: p2 });
  }

  return segments;
};

/**
 * Evaluate a point on a cubic Bezier curve at parameter t (0-1).
 */
export const bezierPoint = (segment: PathSegment, t: number): Point => {
  const { start, cp1, cp2, end } = segment;
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    x: mt3 * start.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * end.x,
    y: mt3 * start.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * end.y,
  };
};

/**
 * Calculate the derivative (tangent) of a cubic Bezier at parameter t.
 */
export const bezierDerivative = (segment: PathSegment, t: number): Point => {
  const { start, cp1, cp2, end } = segment;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x: 3 * mt2 * (cp1.x - start.x) + 6 * mt * t * (cp2.x - cp1.x) + 3 * t2 * (end.x - cp2.x),
    y: 3 * mt2 * (cp1.y - start.y) + 6 * mt * t * (cp2.y - cp1.y) + 3 * t2 * (end.y - cp2.y),
  };
};

/**
 * Calculate approximate arc length of a Bezier segment using subdivision.
 */
export const bezierArcLength = (segment: PathSegment, steps: number = 20): number => {
  let length = 0;
  let prevPoint = segment.start;

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const point = bezierPoint(segment, t);
    const dx = point.x - prevPoint.x;
    const dy = point.y - prevPoint.y;
    length += Math.sqrt(dx * dx + dy * dy);
    prevPoint = point;
  }

  return length;
};

/**
 * Build a lookup table for arc-length parameterization.
 *
 * This allows us to find a point at a specific distance along the river,
 * which is essential for accurate time-to-position mapping.
 */
export interface ArcLengthLookup {
  totalLength: number;
  samples: Array<{
    arcLength: number;
    segmentIndex: number;
    t: number;
    point: Point;
    tangentAngle: number;
  }>;
}

export const buildArcLengthLookup = (
  segments: PathSegment[],
  samplesPerSegment: number = 50
): ArcLengthLookup => {
  const samples: ArcLengthLookup['samples'] = [];
  let cumulativeLength = 0;

  for (let segIdx = 0; segIdx < segments.length; segIdx++) {
    const segment = segments[segIdx];

    for (let i = 0; i <= samplesPerSegment; i++) {
      // Skip first point of subsequent segments (it's the same as prev end)
      if (segIdx > 0 && i === 0) continue;

      const t = i / samplesPerSegment;
      const point = bezierPoint(segment, t);
      const derivative = bezierDerivative(segment, t);
      const tangentAngle = Math.atan2(derivative.y, derivative.x);

      // Calculate distance from previous sample
      if (samples.length > 0) {
        const prev = samples[samples.length - 1];
        const dx = point.x - prev.point.x;
        const dy = point.y - prev.point.y;
        cumulativeLength += Math.sqrt(dx * dx + dy * dy);
      }

      samples.push({
        arcLength: cumulativeLength,
        segmentIndex: segIdx,
        t,
        point,
        tangentAngle,
      });
    }
  }

  return { totalLength: cumulativeLength, samples };
};

/**
 * Find position and tangent at a specific arc length along the river.
 *
 * Uses binary search for efficiency.
 */
export const getPositionAtArcLength = (
  lookup: ArcLengthLookup,
  targetLength: number
): { point: Point; tangentAngle: number } => {
  const { samples, totalLength } = lookup;

  // Clamp to valid range
  const clampedLength = Math.max(0, Math.min(totalLength, targetLength));

  // Binary search
  let low = 0;
  let high = samples.length - 1;

  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    if (samples[mid].arcLength < clampedLength) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Interpolate between low and high samples
  const s1 = samples[low];
  const s2 = samples[high];

  if (s2.arcLength === s1.arcLength) {
    return { point: s1.point, tangentAngle: s1.tangentAngle };
  }

  const ratio = (clampedLength - s1.arcLength) / (s2.arcLength - s1.arcLength);

  return {
    point: {
      x: s1.point.x + (s2.point.x - s1.point.x) * ratio,
      y: s1.point.y + (s2.point.y - s1.point.y) * ratio,
    },
    tangentAngle: s1.tangentAngle + (s2.tangentAngle - s1.tangentAngle) * ratio,
  };
};

/**
 * Generate SVG path data from Bezier segments.
 */
export const segmentsToSVGPath = (segments: PathSegment[]): string => {
  if (segments.length === 0) return '';

  let d = `M ${segments[0].start.x} ${segments[0].start.y}`;

  for (const seg of segments) {
    d += ` C ${seg.cp1.x} ${seg.cp1.y}, ${seg.cp2.x} ${seg.cp2.y}, ${seg.end.x} ${seg.end.y}`;
  }

  return d;
};

/**
 * Calculate event density over time for river width variation.
 *
 * Returns an array of density values normalized to [0, 1].
 */
export const calculateDensityProfile = (
  eventTimes: number[],      // Normalized times [0, 1]
  samples: number = 100,
  windowSize: number = 0.05  // Fraction of total time span
): number[] => {
  const densities: number[] = [];

  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const windowStart = t - windowSize / 2;
    const windowEnd = t + windowSize / 2;

    const count = eventTimes.filter(
      (et) => et >= windowStart && et <= windowEnd
    ).length;

    densities.push(count);
  }

  // Normalize to [0, 1]
  const maxDensity = Math.max(...densities, 1);
  return densities.map((d) => d / maxDensity);
};

/**
 * Interpolate river width at a normalized position based on density.
 */
export const getWidthAtPosition = (
  normalizedPos: number,
  densityProfile: number[],
  minWidth: number,
  maxWidth: number
): number => {
  const index = Math.floor(normalizedPos * (densityProfile.length - 1));
  const clampedIndex = Math.max(0, Math.min(densityProfile.length - 1, index));
  const density = densityProfile[clampedIndex];

  return minWidth + density * (maxWidth - minWidth);
};

/**
 * Offset a point perpendicular to the tangent (for placing markers on river bank).
 */
export const offsetFromPath = (
  point: Point,
  tangentAngle: number,
  offset: number,
  side: 'left' | 'right'
): Point => {
  // Perpendicular angle (90 degrees)
  const perpAngle = tangentAngle + (side === 'left' ? -Math.PI / 2 : Math.PI / 2);

  return {
    x: point.x + Math.cos(perpAngle) * offset,
    y: point.y + Math.sin(perpAngle) * offset,
  };
};
