import { memo } from 'react';
import type { GeneratedPath } from '../../hooks/usePathGenerator';
import { BIKE_RIDE_CONFIG } from '../../hooks/constants';
import styles from './RidePath.module.css';

interface RidePathProps {
  path: GeneratedPath;
  currentTime: number;
}

/**
 * Renders the bike trail path as an SVG.
 *
 * The path consists of:
 * 1. A background "traveled" section (from start to current position)
 * 2. A foreground "ahead" section (from current position to end)
 * 3. Decorative edge lines for depth
 */
export const RidePath = memo(function RidePath({
  path,
  currentTime,
}: RidePathProps) {
  const { svgPath, totalLength } = path;

  // Calculate the dash offset to show progress
  // The "traveled" path is fully visible, the "ahead" path is muted
  const traveledLength = totalLength * currentTime;

  return (
    <g className={styles.pathGroup}>
      {/* Path shadow for depth */}
      <path
        d={svgPath}
        className={styles.pathShadow}
        strokeWidth={BIKE_RIDE_CONFIG.pathStrokeWidth + 4}
      />

      {/* Main path background (untraveled portion) */}
      <path
        d={svgPath}
        className={styles.pathBackground}
        strokeWidth={BIKE_RIDE_CONFIG.pathStrokeWidth}
      />

      {/* Path edge lines for sidewalk effect */}
      <path
        d={svgPath}
        className={styles.pathEdge}
        strokeWidth={BIKE_RIDE_CONFIG.pathStrokeWidth + 2}
      />

      {/* Traveled portion overlay */}
      <path
        d={svgPath}
        className={styles.pathTraveled}
        strokeWidth={BIKE_RIDE_CONFIG.pathStrokeWidth}
        strokeDasharray={`${traveledLength} ${totalLength}`}
        strokeDashoffset={0}
      />

      {/* Center line markings (like a bike lane) */}
      <path
        d={svgPath}
        className={styles.pathCenterLine}
        strokeWidth={2}
        strokeDasharray="20 30"
      />
    </g>
  );
});
