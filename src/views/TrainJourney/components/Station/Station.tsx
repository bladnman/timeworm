import styles from './Station.module.css';
import type { Station as StationType } from '../../constants';
import classNames from 'classnames';

interface StationProps {
  station: StationType;
  trackY: number;
  onHover?: (stationId: string | null) => void;
}

export const Station = ({ station, trackY, onHover }: StationProps) => {
  const { label, type, xPos } = station;

  return (
    <div
      className={classNames(styles.station, styles[type])}
      style={{
        left: `${xPos}px`,
        top: `${trackY}px`,
      }}
      onMouseEnter={() => onHover?.(station.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Platform */}
      <div className={styles.platform}>
        <div className={styles.platformEdge} />
      </div>

      {/* Station building (for major/terminus) */}
      {type !== 'minor' && (
        <div className={styles.building}>
          {type === 'terminus' && <div className={styles.roof} />}
          <div className={styles.structure} />
        </div>
      )}

      {/* Station marker post */}
      <div className={styles.marker}>
        <div className={styles.post} />
        <div className={styles.light} />
      </div>

      {/* Label */}
      <div className={styles.label}>{label}</div>
    </div>
  );
};
