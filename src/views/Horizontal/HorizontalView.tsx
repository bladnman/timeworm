import { useHorizontalView } from './hooks/useHorizontalView';
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
    getPosition,
    cardHeight,
    zoomMin,
    zoomMax,
    zoomStep,
  } = useHorizontalView();

  if (!data) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <label>Zoom Level: {pixelsPerYear}px/yr</label>
        <input
          type="range"
          min={zoomMin}
          max={zoomMax}
          step={zoomStep}
          value={pixelsPerYear}
          onChange={(e) => handleZoomChange(Number(e.target.value))}
        />
      </div>

      <div
        className={styles.timelineTrack}
        style={{
          width: `${totalWidth}px`,
          height: `${(maxLane + 1) * cardHeight + 200}px`
        }}
      >
        <div className={styles.axis} />

        {ticks.map((t) => {
          const pos = getPosition(t.date.toISOString());
          return (
            <div
              key={t.date.toString()}
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
