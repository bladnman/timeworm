import { useVerticalView, formatGap } from './hooks/useVerticalView';
import styles from './VerticalView.module.css';

export const VerticalView = () => {
  const { items, selectEvent, isLoading } = useVerticalView();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      {items.map(({ event, gapYears, showGapIndicator }) => (
        <div key={event.id}>
          {showGapIndicator && gapYears !== null && (
            <div className={styles.gapIndicator}>
              <div className={styles.gapLine} />
              <div className={styles.gapLabel}>{formatGap(gapYears)}</div>
              <div className={styles.gapLine} />
            </div>
          )}
          <div className={styles.item} onClick={() => selectEvent(event.id)}>
            <div className={styles.dot} />
            <div className={styles.content}>
              <div className={styles.date}>{event.date_display}</div>
              <h3 className={styles.title}>{event.title}</h3>
              <div className={styles.summary}>{event.description.slice(0, 140)}...</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
