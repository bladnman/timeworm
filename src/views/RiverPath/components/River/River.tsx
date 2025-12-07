/**
 * River component - renders the winding river path as an SVG.
 *
 * The river is drawn as a filled shape with variable width based on
 * event density. The path gradient flows from upstream (light) to
 * downstream (rich).
 */

import { useMemo } from 'react';
import type { RiverPathData } from '../../hooks/useRiverPath';
import { offsetFromPath, type Point } from '../../utils/pathUtils';
import styles from './River.module.css';

interface RiverProps {
  riverPath: RiverPathData;
  canvasWidth: number;
  canvasHeight: number;
}

export const River = ({ riverPath, canvasWidth, canvasHeight }: RiverProps) => {
  // Generate the river body as a closed polygon with variable width
  const riverBodyPath = useMemo(() => {
    const { widthSamples } = riverPath;
    if (widthSamples.length < 2) return '';

    // Build upper and lower edges
    const upperEdge: Point[] = [];
    const lowerEdge: Point[] = [];

    for (const sample of widthSamples) {
      const halfWidth = sample.width / 2;
      const upper = offsetFromPath(sample.point, sample.angle, halfWidth, 'left');
      const lower = offsetFromPath(sample.point, sample.angle, halfWidth, 'right');
      upperEdge.push(upper);
      lowerEdge.push(lower);
    }

    // Create closed path: upper edge forward, then lower edge backward
    let d = `M ${upperEdge[0].x} ${upperEdge[0].y}`;

    // Upper edge (smooth curve through points)
    for (let i = 1; i < upperEdge.length; i++) {
      const prev = upperEdge[i - 1];
      const curr = upperEdge[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y}, ${midX} ${midY}`;
    }
    // Final segment to last point
    const lastUpper = upperEdge[upperEdge.length - 1];
    d += ` L ${lastUpper.x} ${lastUpper.y}`;

    // Lower edge (reverse order, smooth curve)
    const lastLower = lowerEdge[lowerEdge.length - 1];
    d += ` L ${lastLower.x} ${lastLower.y}`;

    for (let i = lowerEdge.length - 2; i >= 0; i--) {
      const prev = lowerEdge[i + 1];
      const curr = lowerEdge[i];
      const midX = (prev.x + curr.x) / 2;
      const midY = (prev.y + curr.y) / 2;
      d += ` Q ${prev.x} ${prev.y}, ${midX} ${midY}`;
    }

    d += ' Z'; // Close path
    return d;
  }, [riverPath]);

  // Generate subtle flow lines along the river
  const flowLines = useMemo(() => {
    const { widthSamples } = riverPath;
    const lines: string[] = [];

    // Create 3 flow lines at different positions across the width
    const offsets = [-0.3, 0, 0.3];

    for (const offsetRatio of offsets) {
      let line = '';
      for (let i = 0; i < widthSamples.length; i++) {
        const sample = widthSamples[i];
        const offset = sample.width * offsetRatio * 0.4;
        const point = offsetFromPath(
          sample.point,
          sample.angle,
          offset,
          offsetRatio < 0 ? 'left' : 'right'
        );

        if (i === 0) {
          line = `M ${point.x} ${point.y}`;
        } else {
          const prevSample = widthSamples[i - 1];
          const prevOffset = prevSample.width * offsetRatio * 0.4;
          const prevPoint = offsetFromPath(
            prevSample.point,
            prevSample.angle,
            prevOffset,
            offsetRatio < 0 ? 'left' : 'right'
          );
          const midX = (prevPoint.x + point.x) / 2;
          const midY = (prevPoint.y + point.y) / 2;
          line += ` Q ${prevPoint.x} ${prevPoint.y}, ${midX} ${midY}`;
        }
      }
      lines.push(line);
    }

    return lines;
  }, [riverPath]);

  return (
    <svg
      className={styles.riverSvg}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      preserveAspectRatio="none"
    >
      <defs>
        {/* Main river gradient - upstream to downstream */}
        <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.15)" />
          <stop offset="50%" stopColor="rgba(56, 189, 248, 0.3)" />
          <stop offset="100%" stopColor="rgba(56, 189, 248, 0.45)" />
        </linearGradient>

        {/* Subtle shimmer effect */}
        <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>

        {/* Flow line gradient */}
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="30%" stopColor="rgba(255, 255, 255, 0.08)" />
          <stop offset="70%" stopColor="rgba(255, 255, 255, 0.08)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>

        {/* Glow filter for the river */}
        <filter id="riverGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feComposite in="blur" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>

      {/* River body with glow */}
      <g className={styles.riverBody}>
        {/* Outer glow */}
        <path
          d={riverBodyPath}
          fill="url(#riverGradient)"
          filter="url(#riverGlow)"
          className={styles.riverGlow}
        />

        {/* Main river fill */}
        <path
          d={riverBodyPath}
          fill="url(#riverGradient)"
          className={styles.riverFill}
        />

        {/* Subtle shimmer overlay */}
        <path
          d={riverBodyPath}
          fill="url(#shimmerGradient)"
          className={styles.riverShimmer}
        />
      </g>

      {/* Flow lines */}
      <g className={styles.flowLines}>
        {flowLines.map((line, index) => (
          <path
            key={index}
            d={line}
            fill="none"
            stroke="url(#flowGradient)"
            strokeWidth="1"
            className={styles.flowLine}
          />
        ))}
      </g>

      {/* River edges (subtle border) */}
      <path
        d={riverBodyPath}
        fill="none"
        stroke="rgba(56, 189, 248, 0.4)"
        strokeWidth="1"
        className={styles.riverEdge}
      />
    </svg>
  );
};
