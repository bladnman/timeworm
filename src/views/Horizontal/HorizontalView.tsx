import { useHorizontalView } from './hooks/useHorizontalView';
import { ZoomControls } from '../../components/ZoomControls';
import { HORIZONTAL_VIEW_CONFIG } from './hooks/constants';
import styles from './HorizontalView.module.css';

export const HorizontalView = () => {
  const {
    data,
    events,
    ticks,
    pixelsPerYear,
    totalWidth,
    maxLane,
    handleZoomChange,
    selectEvent,
    getYearPosition,
    cardHeight,
    zoomMin,
    zoomMax,
  } = useHorizontalView();

  if (!data) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <ZoomControls
        zoomLevel={pixelsPerYear}
        minZoom={zoomMin}
        maxZoom={zoomMax}
        defaultZoom={HORIZONTAL_VIEW_CONFIG.defaultPixelsPerYear}
        zoomStep={1.2}
        onZoomChange={handleZoomChange}
        unit="px/yr"
        orientation="horizontal"
        className={styles.zoomControls}
      />

      <div
        className={styles.timelineTrack}
        style={{
          width: `${totalWidth}px`,
          height: `${(maxLane + 1) * cardHeight + 200}px`
        }}
      >
        <div className={styles.axis} />

        {ticks.map((t) => {
          const pos = getYearPosition(t.year);
          return (
            <div
              key={t.year}
              className={styles.tick}
              style={{
                left: `${pos}px`,
                height: t.major ? '40px' : '20px',
                background: t.major ? 'var(--color-text-primary)' : 'var(--color-border)'
              }}
            >
              {t.major && <div className={styles.tickLabel}>{t.label}</div>}
            </div>
          );
        })}

        {events.map((event) => {
          const isTop = event.lane % 2 === 0;
          const verticalIndex = Math.floor(event.lane / 2) + 1;
          const yOffset = isTop ? -verticalIndex * cardHeight : verticalIndex * cardHeight;

          return (
            <div
              key={event.id}
              className={styles.itemWrapper}
              style={{
                left: `${event.xPos}px`,
                top: `${yOffset}px`
              }}
              onClick={() => selectEvent(event.id)}
            >
              <div
                className={styles.connector}
                style={{
                  height: `${Math.abs(yOffset)}px`,
                  top: isTop ? '100%' : `-${Math.abs(yOffset)}px`
                }}
              />

              <div
                className={styles.anchor}
                style={{
                  top: isTop ? '100%' : `-${Math.abs(yOffset) + 4}px`,
                  marginTop: isTop ? `${Math.abs(yOffset) - 5}px` : '0px'
                }}
              />

              <div className={styles.card}>
                <div style={{ color: 'var(--color-text-accent)', fontSize: '0.75rem', marginBottom: '4px' }}>
                  {event.date_display}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {event.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
