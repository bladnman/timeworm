import { useMosaicView } from './hooks/useMosaicView';
import { MosaicCell } from './components/MosaicCell/MosaicCell';
import { ZOOM_PRESETS } from './hooks/constants';
import styles from './MosaicView.module.css';

export const MosaicView = () => {
  const {
    grid,
    isLoading,
    selectedCell,
    hoveredCell,
    cellSize,
    manualBucketType,
    handleCellClick,
    handleCellHover,
    handleEventClick,
    handleZoomChange,
    handleBucketChange,
    getCellColor,
    config,
  } = useMosaicView();

  if (isLoading || !grid) {
    return <div className={styles.loading}>Loading Mosaic...</div>;
  }

  const gridWidth = grid.bucketConfig.xCount * (cellSize + config.cellGap) + config.gridPadding * 2 + 80;
  const gridHeight = grid.rows.length * (cellSize + config.cellGap) + config.gridPadding * 2 + 60;

  return (
    <div className={styles.container}>
      {/* Controls Panel */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Cell Size</label>
          <input
            type="range"
            min={config.minCellSize}
            max={config.maxCellSize}
            value={cellSize}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.controlValue}>{cellSize}px</span>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.controlLabel}>Granularity</label>
          <div className={styles.presets}>
            <button
              className={`${styles.presetButton} ${manualBucketType === null ? styles.active : ''}`}
              onClick={() => handleBucketChange(null)}
            >
              Auto
            </button>
            {ZOOM_PRESETS.map((preset) => (
              <button
                key={preset.bucket}
                className={`${styles.presetButton} ${manualBucketType === preset.bucket ? styles.active : ''}`}
                onClick={() => handleBucketChange(preset.bucket)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.stats}>
          <span>{grid.totalEvents} events</span>
          <span className={styles.statsDivider}>|</span>
          <span>{grid.bucketConfig.type} buckets</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className={styles.gridWrapper}>
        <div
          className={styles.gridContainer}
          style={{ minWidth: `${gridWidth}px`, minHeight: `${gridHeight}px` }}
        >
          {/* X-Axis Labels (Top) */}
          <div className={styles.xAxisContainer} style={{ marginLeft: '80px' }}>
            <div className={styles.xAxisLabel}>{grid.xAxis.label}</div>
            <div className={styles.xAxisValues} style={{ gap: `${config.cellGap}px` }}>
              {grid.xAxis.values.map((label, i) => (
                <div
                  key={i}
                  className={styles.xAxisValue}
                  style={{ width: `${cellSize}px` }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Grid with Y-Axis */}
          <div className={styles.gridBody}>
            {/* Y-Axis Labels (Left) */}
            <div className={styles.yAxisContainer} style={{ gap: `${config.cellGap}px` }}>
              <div className={styles.yAxisLabel}>{grid.yAxis.label}</div>
              {grid.rows.map((row) => (
                <div
                  key={row.index}
                  className={styles.yAxisValue}
                  style={{ height: `${cellSize}px` }}
                >
                  {row.label}
                </div>
              ))}
            </div>

            {/* Grid Cells */}
            <div className={styles.grid} role="grid" aria-label="Timeline mosaic grid">
              {grid.rows.map((row) => (
                <div
                  key={row.index}
                  className={styles.row}
                  style={{ gap: `${config.cellGap}px` }}
                  role="row"
                >
                  {row.cells.map((cell) => (
                    <MosaicCell
                      key={`${cell.x}-${cell.y}`}
                      cell={cell}
                      size={cellSize}
                      color={getCellColor(cell.density, cell.eventCount > 0)}
                      isSelected={selectedCell?.x === cell.x && selectedCell?.y === cell.y}
                      isHovered={hoveredCell?.x === cell.x && hoveredCell?.y === cell.y}
                      onMouseEnter={() => handleCellHover(cell)}
                      onMouseLeave={() => handleCellHover(null)}
                      onClick={() => handleCellClick(cell)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && hoveredCell.eventCount > 0 && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipHeader}>
            <span className={styles.tooltipDate}>{hoveredCell.label}</span>
            <span className={styles.tooltipCount}>
              {hoveredCell.eventCount} event{hoveredCell.eventCount !== 1 ? 's' : ''}
            </span>
          </div>
          <ul className={styles.tooltipEvents}>
            {hoveredCell.events.slice(0, config.maxTooltipEvents).map((event) => (
              <li key={event.id} className={styles.tooltipEvent}>
                <span className={styles.tooltipEventDate}>{event.date_display}</span>
                <span className={styles.tooltipEventTitle}>{event.title}</span>
              </li>
            ))}
            {hoveredCell.eventCount > config.maxTooltipEvents && (
              <li className={styles.tooltipMore}>
                +{hoveredCell.eventCount - config.maxTooltipEvents} more...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Selected Cell Detail Panel */}
      {selectedCell && selectedCell.eventCount > 1 && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <h3 className={styles.detailTitle}>{selectedCell.label}</h3>
            <span className={styles.detailCount}>
              {selectedCell.eventCount} events
            </span>
            <button
              className={styles.detailClose}
              onClick={() => handleCellClick(selectedCell)}
              aria-label="Close detail panel"
            >
              &times;
            </button>
          </div>
          <ul className={styles.detailEvents}>
            {selectedCell.events.map((event) => (
              <li
                key={event.id}
                className={styles.detailEvent}
                onClick={() => handleEventClick(event)}
              >
                <span className={styles.detailEventDate}>{event.date_display}</span>
                <span className={styles.detailEventTitle}>{event.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Density:</span>
        <div className={styles.legendGradient} />
        <span className={styles.legendMin}>1</span>
        <span className={styles.legendMax}>{grid.maxEventCount}</span>
      </div>
    </div>
  );
};
