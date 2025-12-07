import { useDepthRoad } from './hooks/useDepthRoad';
import { RoadSurface } from './components/RoadSurface/RoadSurface';
import { RoadEvent } from './components/RoadEvent/RoadEvent';
import { TimeTick } from './components/TimeTick/TimeTick';
import { DEPTH_ROAD_CONFIG } from './hooks/constants';
import styles from './DepthRoad.module.css';

/**
 * DepthRoad View
 *
 * A 3D perspective timeline visualization where time is represented
 * as a road receding into the distance toward a vanishing point.
 *
 * - Near (bottom) = Present/Recent
 * - Far (top) = Deep Past
 *
 * The perspective foreshortening emphasizes temporal distance while
 * maintaining chronological order.
 */
export const DepthRoad = () => {
  const {
    data,
    events,
    ticks,
    minYear,
    maxYear,
    perspective,
    cameraTilt,
    handlePerspectiveChange,
    handleTiltChange,
    selectEvent,
    roadGeometry,
  } = useDepthRoad();

  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading timeline...</div>
      </div>
    );
  }

  // Calculate scene transform based on camera controls
  const sceneTransform = `
    perspective(${perspective}px)
    rotateX(${cameraTilt}deg)
  `;

  return (
    <div className={styles.container}>
      {/* Camera Controls Panel */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Depth: {perspective}px
          </label>
          <input
            type="range"
            min={DEPTH_ROAD_CONFIG.minPerspective}
            max={DEPTH_ROAD_CONFIG.maxPerspective}
            step={50}
            value={perspective}
            onChange={(e) => handlePerspectiveChange(Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Tilt: {cameraTilt}°
          </label>
          <input
            type="range"
            min={DEPTH_ROAD_CONFIG.minTilt}
            max={DEPTH_ROAD_CONFIG.maxTilt}
            step={1}
            value={cameraTilt}
            onChange={(e) => handleTiltChange(Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        <div className={styles.timeRange}>
          <span className={styles.rangeLabel}>
            {minYear < 0 ? `${Math.abs(minYear)} BCE` : minYear}
          </span>
          <span className={styles.rangeSeparator}>to</span>
          <span className={styles.rangeLabel}>
            {maxYear < 0 ? `${Math.abs(maxYear)} BCE` : maxYear}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendArrow}>↑</div>
          <span>Past</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendArrow}>↓</div>
          <span>Present</span>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div
        className={styles.scene}
        style={{ transform: sceneTransform }}
      >
        {/* Road Surface */}
        <div className={styles.roadContainer}>
          <RoadSurface
            widthNear={roadGeometry.widthNear}
            widthFar={roadGeometry.widthFar}
            height={roadGeometry.height}
            vanishingY={roadGeometry.vanishingY}
          />

          {/* Time Ticks */}
          <div className={styles.ticksLayer}>
            {ticks.map((tick) => (
              <TimeTick
                key={tick.year}
                tick={tick}
                roadWidthNear={roadGeometry.widthNear}
                roadWidthFar={roadGeometry.widthFar}
              />
            ))}
          </div>

          {/* Events Layer */}
          <div className={styles.eventsLayer}>
            {events.map((event) => (
              <RoadEvent
                key={event.id}
                event={event}
                onSelect={selectEvent}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Vanishing point indicator */}
      <div className={styles.vanishingIndicator}>
        <div className={styles.vanishingDot} />
        <span className={styles.vanishingLabel}>Horizon</span>
      </div>
    </div>
  );
};
