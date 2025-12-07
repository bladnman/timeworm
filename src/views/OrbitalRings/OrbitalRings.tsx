import { useOrbitalRingsView } from './hooks/useOrbitalRingsView';
import styles from './OrbitalRings.module.css';

export const OrbitalRings = () => {
  const {
    data,
    rings,
    orbitalEvents,
    chronologicalPath,
    center,
    yearsPerRing,
    focusedRingIndex,
    hoveredEvent,
    handleRingFocus,
    handleEventHover,
    handleEventClick,
    handleZoomChange,
    config,
  } = useOrbitalRingsView();

  if (!data) return <div className={styles.loading}>Loading...</div>;

  const viewBoxSize = center.size;

  return (
    <div className={styles.container}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Ring Duration: {yearsPerRing} year{yearsPerRing > 1 ? 's' : ''}
          </label>
          <input
            type="range"
            min={config.minYearsPerRing}
            max={config.maxYearsPerRing}
            step={yearsPerRing < 10 ? 1 : 10}
            value={yearsPerRing}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className={styles.slider}
          />
        </div>
        {focusedRingIndex !== null && (
          <button
            className={styles.resetButton}
            onClick={() => handleRingFocus(null)}
          >
            Show All Rings
          </button>
        )}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Reading Order</div>
        <div className={styles.legendItem}>
          <span className={styles.legendArrow}>Outer</span>
          <span className={styles.legendText}>(oldest)</span>
          <span className={styles.legendArrowIcon}>→</span>
          <span className={styles.legendArrow}>Inner</span>
          <span className={styles.legendText}>(newest)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendText}>Clockwise within each ring</span>
        </div>
      </div>

      {/* Main SVG Visualization */}
      <svg
        className={styles.orbital}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Gradient for chronological path */}
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-text-accent)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-text-accent)" stopOpacity="0.1" />
          </linearGradient>

          {/* Glow filter for hovered nodes */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center "star" */}
        <circle
          cx={center.x}
          cy={center.y}
          r={config.centerRadius}
          className={styles.centerStar}
        />
        <circle
          cx={center.x}
          cy={center.y}
          r={config.centerRadius / 2}
          className={styles.centerCore}
        />

        {/* Ring lines */}
        {rings.map((ring) => {
          const isFocused = focusedRingIndex === null || focusedRingIndex === ring.index;
          const opacity = isFocused ? config.ringOpacityFocused : config.ringOpacity * 0.3;

          return (
            <g key={ring.index}>
              <circle
                cx={center.x}
                cy={center.y}
                r={ring.radius}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={config.ringStrokeWidth}
                opacity={opacity}
                className={styles.ring}
                onClick={() => handleRingFocus(ring.index === focusedRingIndex ? null : ring.index)}
              />

              {/* Ring label at top */}
              <text
                x={center.x}
                y={center.y - ring.radius - config.labelOffset}
                className={styles.ringLabel}
                textAnchor="middle"
                opacity={isFocused ? 1 : 0.3}
              >
                {ring.label}
              </text>
            </g>
          );
        })}

        {/* Chronological path (subtle connecting lines) */}
        {chronologicalPath.map((segment, index) => (
          <line
            key={index}
            x1={segment.fromX}
            y1={segment.fromY}
            x2={segment.toX}
            y2={segment.toY}
            className={styles.pathSegment}
            strokeDasharray={segment.ringTransition ? '4,4' : 'none'}
          />
        ))}

        {/* Event nodes */}
        {orbitalEvents.map((orbitalEvent) => {
          const isFocused = focusedRingIndex === null || focusedRingIndex === orbitalEvent.ringIndex;
          const isHovered = hoveredEvent?.event.id === orbitalEvent.event.id;
          const radius = isHovered ? config.nodeRadiusHover : config.nodeRadius;

          return (
            <g
              key={orbitalEvent.event.id}
              className={styles.eventNode}
              style={{ opacity: isFocused ? 1 : 0.2 }}
              onMouseEnter={() => handleEventHover(orbitalEvent.event.id)}
              onMouseLeave={() => handleEventHover(null)}
              onClick={() => handleEventClick(orbitalEvent.event.id)}
            >
              <circle
                cx={orbitalEvent.x}
                cy={orbitalEvent.y}
                r={radius}
                fill={orbitalEvent.color}
                filter={isHovered ? 'url(#glow)' : 'none'}
                className={styles.node}
              />
              {/* Inner dot for visual interest */}
              <circle
                cx={orbitalEvent.x}
                cy={orbitalEvent.y}
                r={radius * 0.3}
                fill="var(--color-bg-canvas)"
                className={styles.nodeCore}
              />
            </g>
          );
        })}

        {/* Start indicator (arrow at outermost ring, top) */}
        {rings.length > 0 && (
          <g className={styles.startIndicator}>
            <polygon
              points={`
                ${center.x},${center.y - rings[0].radius - 25}
                ${center.x - 6},${center.y - rings[0].radius - 35}
                ${center.x + 6},${center.y - rings[0].radius - 35}
              `}
              fill="var(--color-text-accent)"
              opacity="0.6"
            />
            <text
              x={center.x}
              y={center.y - rings[0].radius - 42}
              className={styles.startLabel}
              textAnchor="middle"
            >
              START
            </text>
          </g>
        )}
      </svg>

      {/* Hover tooltip */}
      {hoveredEvent && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipDate}>{hoveredEvent.event.date_display}</div>
          <div className={styles.tooltipTitle}>{hoveredEvent.event.title}</div>
          <div className={styles.tooltipType}>{hoveredEvent.event.type}</div>
          <div className={styles.tooltipHint}>Click for details</div>
        </div>
      )}

      {/* Event count indicator */}
      <div className={styles.eventCount}>
        {orbitalEvents.length} events across {rings.length} ring{rings.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
