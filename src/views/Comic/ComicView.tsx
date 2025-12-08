import classNames from 'classnames';
import { useComicView, type ComicPanel } from './hooks/useComicView';
import styles from './ComicView.module.css';

const formatGap = (years: number): string => {
  if (years >= 100) {
    const centuries = Math.floor(years / 100);
    return `${centuries} ${centuries === 1 ? 'century' : 'centuries'} later...`;
  }
  if (years >= 10) {
    const decades = Math.floor(years / 10);
    return `${decades * 10} years later...`;
  }
  return `${years} years later...`;
};

const Panel = ({
  panel,
  onSelect,
}: {
  panel: ComicPanel;
  onSelect: (id: string) => void;
}) => {
  const { event, size, hasImage } = panel;

  return (
    <div
      className={classNames(styles.panel, styles[size], { [styles.hasImage]: hasImage })}
      onClick={() => onSelect(event.id)}
    >
      {hasImage ? (
        <div className={styles.imageContainer}>
          <img
            src={event.image_urls[0]}
            alt={event.title}
            className={styles.image}
            loading="lazy"
          />
        </div>
      ) : (
        <div className={styles.noImage}>
          <span className={styles.noImageIcon}>?</span>
        </div>
      )}
      <div className={styles.caption}>
        <div className={styles.date}>{event.date_display}</div>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.description}>{event.description}</p>
      </div>
    </div>
  );
};

export const ComicView = () => {
  const { rows, selectEvent, isLoading } = useComicView();

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.page}>
        {rows.map((row, rowIndex) => {
          const firstPanel = row.panels[0];
          const showChapterBreak = firstPanel?.showChapterBreak && firstPanel.gapYears;

          return (
            <div key={rowIndex}>
              {showChapterBreak && (
                <div className={styles.chapterBreak}>
                  <div className={styles.chapterLabel}>
                    {formatGap(firstPanel.gapYears!)}
                  </div>
                </div>
              )}
              <div className={styles.row}>
                {row.panels.map((panel) => (
                  <Panel
                    key={panel.event.id}
                    panel={panel}
                    onSelect={selectEvent}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
