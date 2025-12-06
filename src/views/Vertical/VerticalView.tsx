import { useTimeline } from '../../hooks/useTimeline';
import styles from './VerticalView.module.css';

export const VerticalView = () => {
  const { data, selectEvent } = useTimeline();

  if (!data) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      {data.events.map((event) => (
        <div key={event.id} className={styles.item} onClick={() => selectEvent(event.id)}>
          <div className={styles.dot} />
          <div className={styles.content}>
            <div className={styles.date}>{event.date_display}</div>
            <h3 className={styles.title}>{event.title}</h3>
            <div className={styles.summary}>{event.description.slice(0, 140)}...</div>
          </div>
        </div>
      ))}
    </div>
  );
};
