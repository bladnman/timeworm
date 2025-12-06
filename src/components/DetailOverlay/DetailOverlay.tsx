import classNames from 'classnames';
import { useTimeline } from '../../hooks/useTimeline';
import styles from './DetailOverlay.module.css';

export const DetailOverlay = () => {
  const { data, selectedEventId, selectEvent } = useTimeline();

  const event = data?.events.find((e) => e.id === selectedEventId);

  return (
    <div className={classNames(styles.overlay, { [styles.open]: !!selectedEventId })}>
      <div className={styles.header}>
        <button className={styles.closeButton} onClick={() => selectEvent(null)}>
          Close
        </button>
      </div>

      {event && (
        <div className={styles.content}>
          <div className={styles.date}>{event.date_display}</div>
          <h2 className={styles.title}>{event.title}</h2>
          
          {event.image_urls.length > 0 && (
            <img src={event.image_urls[0]} alt={event.title} className={styles.image} />
          )}

          <p className={styles.description}>{event.description}</p>

          <div className={styles.metaSection}>
            <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Type</span>
                <span className={styles.metaValue}>{event.type}</span>
            </div>
             <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Innovator</span>
                <span className={styles.metaValue}>{event.innovator}</span>
            </div>
             <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Innovation</span>
                <span className={styles.metaValue}>{event.innovation}</span>
            </div>
             {Object.entries(event.metrics).map(([key, value]) => (
                <div key={key} className={styles.metaRow}>
                    <span className={styles.metaLabel}>{key}</span>
                    <span className={styles.metaValue}>{value}</span>
                </div>
            ))}
          </div>

          {event.links.map(link => (
             <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {link.title} →
             </a>
          ))}
        </div>
      )}
    </div>
  );
};
