import { useState, useCallback, useRef, type MouseEvent } from 'react';
import classNames from 'classnames';
import { useTrailProfile } from './hooks/useTrailProfile';
import styles from './TrailProfileView.module.css';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: {
    title?: string;
    date?: string;
    elevation?: string;
    year?: number;
  };
}

export const TrailProfileView = () => {
  const {
    data,
    eventMarkers,
    trailPath,
    areaPath,
    ticks,
    pixelsPerYear,
    totalWidth,
    hoveredEventId,
    cursorX,
    handleZoomChange,
    selectEvent,
    setHoveredEventId,
    setCursorX,
    getYearPosition,
    getCursorInfo,
    trailHeight,
    trailPadding,
    axisHeight,
    markerRadius,
    markerRadiusHover,
    zoomMin,
    zoomMax,
    zoomStep,
    metricLabels,
    metricType,
  } = useTrailProfile();

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: {},
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const svgHeight = trailHeight + trailPadding * 2 + axisHeight;

  // Handle mouse move on SVG for cursor tracking
  const handleMouseMove = useCallback((e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current?.scrollLeft || 0;
    const x = e.clientX - rect.left + scrollLeft;

    setCursorX(x);

    const info = getCursorInfo(x);
    if (info) {
      setTooltip({
        visible: true,
        x: e.clientX + 16,
        y: e.clientY - 20,
        content: {
          year: info.year,
          elevation: `${Math.round(info.value * 100)}%`,
        },
      });
    }
  }, [setCursorX, getCursorInfo]);

  const handleMouseLeave = useCallback(() => {
    setCursorX(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  }, [setCursorX]);

  // Handle marker hover
  const handleMarkerEnter = useCallback((marker: typeof eventMarkers[0], e: MouseEvent) => {
    setHoveredEventId(marker.event.id);
    setTooltip({
      visible: true,
      x: e.clientX + 16,
      y: e.clientY - 20,
      content: {
        title: marker.event.title,
        date: marker.event.date_display,
        elevation: `${Math.round(marker.value * 100)}% activity`,
      },
    });
  }, [setHoveredEventId]);

  const handleMarkerLeave = useCallback(() => {
    setHoveredEventId(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  }, [setHoveredEventId]);

  const handleMarkerClick = useCallback((marker: typeof eventMarkers[0]) => {
    selectEvent(marker.event.id);
  }, [selectEvent]);

  if (!data) {
    return <div className={styles.loading}>Loading Trail Profile...</div>;
  }

  const cursorInfo = cursorX !== null ? getCursorInfo(cursorX) : null;

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Y-Axis Label */}
      <div className={styles.yAxisLabel}>
        <div className={styles.yAxisArrow}>
          <span>{metricLabels[metricType].uphill}</span>
          <span>|</span>
          <span>{metricLabels[metricType].name}</span>
          <span>|</span>
          <span>{metricLabels[metricType].downhill}</span>
        </div>
      </div>

      {/* Controls Panel */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>
            Zoom: <span className={styles.controlValue}>{pixelsPerYear}px/yr</span>
          </label>
          <input
            type="range"
            className={styles.controlInput}
            min={zoomMin}
            max={zoomMax}
            step={zoomStep}
            value={pixelsPerYear}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Trail Canvas */}
      <div
        className={styles.trailCanvas}
        style={{ width: `${totalWidth}px` }}
      >
        {/* SVG Trail */}
        <div className={styles.svgContainer}>
          <svg
            ref={svgRef}
            className={styles.trailSvg}
            width={totalWidth}
            height={svgHeight}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Gradient definition */}
            <defs>
              <linearGradient id="trailGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0.05)" />
              </linearGradient>

              {/* Glow filter for trail line */}
              <filter id="trailGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base line (ground level) */}
            <line
              x1={0}
              y1={trailHeight + trailPadding}
              x2={totalWidth}
              y2={trailHeight + trailPadding}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.5}
            />

            {/* Filled area under trail */}
            {areaPath && (
              <path
                className={styles.trailArea}
                d={areaPath}
                fill="url(#trailGradient)"
              />
            )}

            {/* Trail line */}
            {trailPath && (
              <path
                className={styles.trailLine}
                d={trailPath}
                filter="url(#trailGlow)"
              />
            )}

            {/* Cursor line */}
            {cursorX !== null && cursorInfo && (
              <>
                <line
                  className={styles.cursorLine}
                  x1={cursorX}
                  y1={trailPadding}
                  x2={cursorX}
                  y2={trailHeight + trailPadding}
                />
                <circle
                  className={styles.cursorDot}
                  cx={cursorX}
                  cy={cursorInfo.y}
                  r={5}
                />
              </>
            )}

            {/* Event markers */}
            {eventMarkers.map((marker) => {
              const isHovered = hoveredEventId === marker.event.id;
              const radius = isHovered ? markerRadiusHover : markerRadius;

              return (
                <g key={marker.event.id}>
                  {/* Halo effect when hovered */}
                  {isHovered && (
                    <circle
                      className={styles.markerHalo}
                      cx={marker.x}
                      cy={marker.y}
                      r={radius + 6}
                    />
                  )}

                  {/* Main marker */}
                  <circle
                    className={styles.marker}
                    cx={marker.x}
                    cy={marker.y}
                    r={radius}
                    fill="var(--color-bg-surface)"
                    stroke="var(--color-text-accent)"
                    strokeWidth={2}
                    onMouseEnter={(e) => handleMarkerEnter(marker, e)}
                    onMouseLeave={handleMarkerLeave}
                    onClick={() => handleMarkerClick(marker)}
                  />

                  {/* Inner dot */}
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={radius * 0.4}
                    fill="var(--color-text-accent)"
                    pointerEvents="none"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Time Axis */}
        <div className={styles.axisContainer}>
          <div className={styles.axisLine} />
          {ticks.map((tick) => {
            const pos = getYearPosition(tick.year);
            return (
              <div
                key={tick.year}
                className={styles.tick}
                style={{
                  left: `${pos}px`,
                  height: tick.major ? '12px' : '6px',
                  background: tick.major ? 'var(--color-text-primary)' : 'var(--color-border)',
                }}
              >
                {tick.major && (
                  <div className={classNames(styles.tickLabel, styles.tickLabelMajor)}>
                    {tick.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} />
          <span>Event</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendLine} />
          <span>Activity Trail</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendArea} />
          <span>Density</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className={styles.tooltip}
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.content.title && (
            <div className={styles.tooltipTitle}>{tooltip.content.title}</div>
          )}
          {tooltip.content.date && (
            <div className={styles.tooltipDate}>{tooltip.content.date}</div>
          )}
          {tooltip.content.year && !tooltip.content.title && (
            <div className={styles.tooltipMeta}>Year: {tooltip.content.year}</div>
          )}
          {tooltip.content.elevation && (
            <div className={styles.tooltipMeta}>Elevation: {tooltip.content.elevation}</div>
          )}
        </div>
      )}
    </div>
  );
};
