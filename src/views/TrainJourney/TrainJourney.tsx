import { useTrainJourney } from './hooks/useTrainJourney';
import { Track } from './components/Track/Track';
import { Station } from './components/Station/Station';
import { TrackEvent } from './components/TrackEvent/TrackEvent';
import { EventCluster } from './components/EventCluster/EventCluster';
import styles from './TrainJourney.module.css';

export const TrainJourney = () => {
  const {
    data,
    stations,
    trackSegments,
    positionedEvents,
    clusters,
    totalWidth,
    trackY,
    eventCardHeight,
    eventConnectorLength,
    pixelsPerYear,
    zoomMin,
    zoomMax,
    zoomStep,
    handleZoomChange,
    handleAutoFit,
    selectEvent,
  } = useTrainJourney();

  if (!data) return <div className={styles.loading}>Loading Train Journey...</div>;

  // Calculate container height based on content
  const containerHeight = trackY * 2 + 100;

  return (
    <div className={styles.container}>
      {/* Zoom controls */}
      <div className={styles.controls}>
        <label className={styles.zoomLabel}>
          Zoom: {pixelsPerYear.toFixed(0)}px/yr
        </label>
        <input
          type="range"
          min={zoomMin}
          max={zoomMax}
          step={zoomStep}
          value={pixelsPerYear}
          onChange={(e) => handleZoomChange(Number(e.target.value))}
          className={styles.zoomSlider}
        />
        <button onClick={handleAutoFit} className={styles.autoFitButton}>
          Fit to View
        </button>
      </div>

      {/* Scrollable track area */}
      <div className={styles.scrollContainer}>
        <div
          className={styles.trackArea}
          style={{
            width: `${totalWidth + 200}px`,
            height: `${containerHeight}px`,
          }}
        >
          {/* Track */}
          <Track
            totalWidth={totalWidth}
            segments={trackSegments}
            trackY={trackY}
          />

          {/* Stations */}
          {stations.map((station) => (
            <Station
              key={station.id}
              station={station}
              trackY={trackY}
            />
          ))}

          {/* Individual events */}
          {positionedEvents.map((event) => (
            <TrackEvent
              key={event.id}
              event={event}
              trackY={trackY}
              cardHeight={eventCardHeight}
              connectorLength={eventConnectorLength}
              onClick={selectEvent}
            />
          ))}

          {/* Event clusters */}
          {clusters.map((cluster) => (
            <EventCluster
              key={cluster.id}
              cluster={cluster}
              trackY={trackY}
              connectorLength={eventConnectorLength}
              onEventClick={selectEvent}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Station Types</div>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} data-type="terminus" />
            <span>Terminus</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} data-type="major" />
            <span>Major</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} data-type="minor" />
            <span>Minor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
