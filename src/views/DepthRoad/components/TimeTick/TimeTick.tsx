import classNames from 'classnames';
import styles from './TimeTick.module.css';
import type { RoadTick } from '../../hooks/useDepthRoad';

interface TimeTickProps {
  tick: RoadTick;
  roadWidthNear: number;
  roadWidthFar: number;
}

/**
 * Renders a time marker on the road surface.
 * Major ticks show labels, minor ticks are just markers.
 */
export const TimeTick = ({ tick, roadWidthNear, roadWidthFar }: TimeTickProps) => {
  // Calculate width of road at this depth
  const widthAtDepth = roadWidthNear -
    (roadWidthNear - roadWidthFar) * Math.pow(tick.normalizedDepth, 0.7);

  // Opacity fades with distance
  const opacity = Math.max(0.2, 1 - tick.normalizedDepth * 0.8);

  return (
    <div
      className={classNames(styles.tick, { [styles.major]: tick.major })}
      style={{
        top: `${tick.screenY}px`,
        width: `${widthAtDepth}px`,
        opacity,
        transform: `translateX(-50%) scale(${tick.scale})`,
      }}
    >
      {/* Tick line across road */}
      <div className={styles.tickLine} />

      {/* Label for major ticks */}
      {tick.major && (
        <div className={styles.label}>
          {tick.label}
        </div>
      )}
    </div>
  );
};
