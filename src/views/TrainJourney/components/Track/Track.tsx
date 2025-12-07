import styles from './Track.module.css';
import type { TrackSegment } from '../../constants';

interface TrackProps {
  totalWidth: number;
  segments: TrackSegment[];
  trackY: number;
}

export const Track = ({ totalWidth, trackY }: TrackProps) => {
  return (
    <div
      className={styles.trackContainer}
      style={{
        width: `${totalWidth}px`,
        top: `${trackY}px`,
      }}
    >
      {/* Main rail */}
      <div className={styles.rail} />

      {/* Sleepers (cross ties) pattern */}
      <div className={styles.sleepers} />

      {/* Rail shine effect */}
      <div className={styles.railShine} />
    </div>
  );
};
