import { useCallback, useState } from 'react';
import classNames from 'classnames';
import styles from './RoadEvent.module.css';
import type { DepthRoadEvent } from '../../hooks/useDepthRoad';

interface RoadEventProps {
  event: DepthRoadEvent;
  onSelect: (id: string) => void;
}

/**
 * Renders an event card positioned on the depth road.
 * Scales and fades based on depth for perspective effect.
 */
export const RoadEvent = ({ event, onSelect }: RoadEventProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onSelect(event.id);
  }, [event.id, onSelect]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Calculate opacity based on depth (farther = more transparent)
  const baseOpacity = 1 - event.normalizedDepth * 0.6;
  const opacity = isHovered ? 1 : baseOpacity;

  // Hover effect: bring card forward
  const hoverScale = isHovered ? event.scale * 1.3 : event.scale;
  const hoverZ = isHovered ? 100 : 0;

  return (
    <div
      className={classNames(styles.eventWrapper, { [styles.hovered]: isHovered })}
      style={{
        transform: `translate(-50%, -100%) translate(${event.screenX}px, 0) scale(${hoverScale})`,
        top: `${event.screenY}px`,
        left: '50%',
        zIndex: isHovered ? 9999 : event.zIndex,
        opacity,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Connector line to road surface */}
      <div
        className={styles.connector}
        style={{
          borderColor: event.categoryColor,
          opacity: Math.max(0.3, 1 - event.normalizedDepth * 0.8),
        }}
      />

      {/* Anchor point on road */}
      <div
        className={styles.anchor}
        style={{
          backgroundColor: event.categoryColor,
          boxShadow: `0 0 ${8 * event.scale}px ${event.categoryColor}`,
        }}
      />

      {/* Event card */}
      <div
        className={styles.card}
        style={{
          borderColor: isHovered ? event.categoryColor : 'var(--color-border)',
          transform: `translateZ(${hoverZ}px)`,
        }}
      >
        {/* Date badge */}
        <div className={styles.date} style={{ color: event.categoryColor }}>
          {event.date_display}
        </div>

        {/* Title */}
        <div className={styles.title}>{event.title}</div>

      </div>
    </div>
  );
};
