import { memo } from 'react';
import { BIKE_RIDE_CONFIG } from '../../hooks/constants';
import styles from './BikeIcon.module.css';

interface BikeIconProps {
  x: number;
  y: number;
  isMoving: boolean;
}

/**
 * The bike playhead that moves along the path.
 *
 * Shows a simple, abstract bike icon that:
 * - Follows the path curvature
 * - Has a subtle animation when moving
 * - Emits a glow effect at the current position
 */
export const BikeIcon = memo(function BikeIcon({
  x,
  y,
  isMoving,
}: BikeIconProps) {
  const { bikeWidth, bikeHeight } = BIKE_RIDE_CONFIG;

  // Calculate offset to center the bike on the path point
  const offsetX = x - bikeWidth / 2;
  const offsetY = y - bikeHeight / 2;

  return (
    <g
      className={`${styles.bikeGroup} ${isMoving ? styles.moving : ''}`}
      transform={`translate(${offsetX}, ${offsetY})`}
    >
      {/* Glow effect */}
      <ellipse
        cx={bikeWidth / 2}
        cy={bikeHeight / 2 + 4}
        rx={bikeWidth * 0.6}
        ry={bikeHeight * 0.4}
        className={styles.glow}
      />

      {/* Motion trail when moving */}
      {isMoving && (
        <g className={styles.trail}>
          <circle cx={bikeWidth * 0.15} cy={bikeHeight / 2} r={3} />
          <circle cx={bikeWidth * 0.05} cy={bikeHeight / 2} r={2} />
          <circle cx={bikeWidth * -0.05} cy={bikeHeight / 2} r={1} />
        </g>
      )}

      {/* Simple abstract bike shape */}
      <g className={styles.bike}>
        {/* Back wheel */}
        <circle
          cx={bikeWidth * 0.25}
          cy={bikeHeight * 0.65}
          r={bikeHeight * 0.3}
          className={styles.wheel}
        />
        <circle
          cx={bikeWidth * 0.25}
          cy={bikeHeight * 0.65}
          r={bikeHeight * 0.15}
          className={styles.wheelHub}
        />

        {/* Front wheel */}
        <circle
          cx={bikeWidth * 0.75}
          cy={bikeHeight * 0.65}
          r={bikeHeight * 0.3}
          className={styles.wheel}
        />
        <circle
          cx={bikeWidth * 0.75}
          cy={bikeHeight * 0.65}
          r={bikeHeight * 0.15}
          className={styles.wheelHub}
        />

        {/* Frame */}
        <path
          d={`
            M ${bikeWidth * 0.25} ${bikeHeight * 0.65}
            L ${bikeWidth * 0.5} ${bikeHeight * 0.35}
            L ${bikeWidth * 0.75} ${bikeHeight * 0.65}
            M ${bikeWidth * 0.5} ${bikeHeight * 0.35}
            L ${bikeWidth * 0.35} ${bikeHeight * 0.65}
            M ${bikeWidth * 0.5} ${bikeHeight * 0.35}
            L ${bikeWidth * 0.55} ${bikeHeight * 0.2}
            M ${bikeWidth * 0.5} ${bikeHeight * 0.35}
            L ${bikeWidth * 0.7} ${bikeHeight * 0.35}
            L ${bikeWidth * 0.75} ${bikeHeight * 0.2}
          `}
          className={styles.frame}
        />

        {/* Seat */}
        <ellipse
          cx={bikeWidth * 0.55}
          cy={bikeHeight * 0.18}
          rx={bikeWidth * 0.08}
          ry={bikeHeight * 0.06}
          className={styles.seat}
        />

        {/* Handlebars */}
        <path
          d={`
            M ${bikeWidth * 0.72} ${bikeHeight * 0.15}
            Q ${bikeWidth * 0.78} ${bikeHeight * 0.15} ${bikeWidth * 0.8} ${bikeHeight * 0.2}
          `}
          className={styles.handlebar}
        />
      </g>

      {/* Wheel spokes animation */}
      {isMoving && (
        <g className={styles.spokes}>
          {/* Back wheel spokes */}
          <line
            x1={bikeWidth * 0.25}
            y1={bikeHeight * 0.35}
            x2={bikeWidth * 0.25}
            y2={bikeHeight * 0.95}
            className={styles.spoke}
          />
          <line
            x1={bikeWidth * 0.1}
            y1={bikeHeight * 0.65}
            x2={bikeWidth * 0.4}
            y2={bikeHeight * 0.65}
            className={styles.spoke}
          />
          {/* Front wheel spokes */}
          <line
            x1={bikeWidth * 0.75}
            y1={bikeHeight * 0.35}
            x2={bikeWidth * 0.75}
            y2={bikeHeight * 0.95}
            className={styles.spoke}
          />
          <line
            x1={bikeWidth * 0.6}
            y1={bikeHeight * 0.65}
            x2={bikeWidth * 0.9}
            y2={bikeHeight * 0.65}
            className={styles.spoke}
          />
        </g>
      )}
    </g>
  );
});
