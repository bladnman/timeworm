import classNames from 'classnames';
import type { ExhibitBay } from '../../hooks/useExhibitWalk';
import styles from './CorridorNav.module.css';

interface CorridorNavProps {
  bays: ExhibitBay[];
  activeBayId: string | null;
  onNavigate: (bayId: string) => void;
}

/**
 * Mini-navigation bar showing all exhibit bays as thumbnails.
 * Allows quick jumps to any period in the timeline.
 */
export const CorridorNav = ({
  bays,
  activeBayId,
  onNavigate,
}: CorridorNavProps) => {
  if (bays.length === 0) return null;

  // Calculate normalized widths for proportional display
  const totalEvents = bays.reduce((sum, bay) => sum + bay.events.length, 0);

  return (
    <nav className={styles.nav} aria-label="Timeline navigation">
      <div className={styles.track}>
        {bays.map((bay, index) => {
          const isActive = bay.id === activeBayId;
          // Width based on event density (min 24px, max 80px)
          const proportionalWidth = Math.max(
            24,
            Math.min(80, (bay.events.length / totalEvents) * 400)
          );

          return (
            <button
              key={bay.id}
              className={classNames(styles.thumbnail, {
                [styles.active]: isActive,
              })}
              style={{ width: `${proportionalWidth}px` }}
              onClick={() => onNavigate(bay.id)}
              aria-label={`Navigate to ${bay.label}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <div className={styles.thumbnailContent}>
                {/* Density indicator - dots representing events */}
                <div className={styles.densityIndicator}>
                  {bay.events.slice(0, 5).map((_, i) => (
                    <div key={i} className={styles.densityDot} />
                  ))}
                  {bay.events.length > 5 && (
                    <span className={styles.moreIndicator}>
                      +{bay.events.length - 5}
                    </span>
                  )}
                </div>
              </div>

              {/* Tooltip on hover */}
              <div className={styles.tooltip}>
                <span className={styles.tooltipLabel}>{bay.label}</span>
                <span className={styles.tooltipCount}>
                  {bay.events.length} {bay.events.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Progress marker */}
              {index === 0 && <div className={styles.startMarker}>Start</div>}
              {index === bays.length - 1 && (
                <div className={styles.endMarker}>Now</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline axis label */}
      <div className={styles.axisLabels}>
        <span className={styles.axisStart}>
          {bays[0]?.startDate.year < 0
            ? `${Math.abs(bays[0].startDate.year)} BCE`
            : bays[0]?.startDate.year}
        </span>
        <span className={styles.axisEnd}>
          {bays[bays.length - 1]?.endDate.year}
        </span>
      </div>
    </nav>
  );
};
