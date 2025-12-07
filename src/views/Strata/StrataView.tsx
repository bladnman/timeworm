import classNames from 'classnames';
import { useRef } from 'react';
import { useStrataView, type StrataLayer } from './hooks/useStrataView';
import styles from './StrataView.module.css';

/**
 * Strata View - Geological timeline visualization.
 *
 * Represents time as stacked horizontal layers (strata), like a cross-section
 * through geological sediment. Oldest periods at the bottom, newest at the top.
 * Layer thickness reflects the duration of each time period.
 */
export const StrataView = () => {
  const { layers, selectEvent, selectedEventId, getLayerSummary, isLoading } = useStrataView();
  const columnRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <div className={styles.loading}>Loading strata...</div>;
  }

  const scrollToLayer = (layerId: string) => {
    const element = document.getElementById(layerId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className={styles.container}>
      {/* Age Ruler - quick navigation strip */}
      <nav className={styles.ageRuler} aria-label="Time period navigation">
        {layers.map((layer) => (
          <button
            key={`ruler-${layer.id}`}
            className={styles.rulerTick}
            onClick={() => scrollToLayer(layer.id)}
            title={`Jump to ${layer.label}`}
          >
            {layer.label}
          </button>
        ))}
      </nav>

      {/* Main strata column - flex-direction: column-reverse puts oldest at bottom */}
      <div className={styles.strataColumn} ref={columnRef}>
        {layers.map((layer) => (
          <StrataLayerComponent
            key={layer.id}
            layer={layer}
            selectedEventId={selectedEventId}
            onSelectEvent={selectEvent}
            summary={getLayerSummary(layer)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual stratum (layer) component.
 */
interface StrataLayerProps {
  layer: StrataLayer;
  selectedEventId: string | null;
  onSelectEvent: (id: string | null) => void;
  summary: { eventCount: number; timeSpan: string; highlights: string[] };
}

const StrataLayerComponent = ({
  layer,
  selectedEventId,
  onSelectEvent,
  summary,
}: StrataLayerProps) => {
  const isEmpty = layer.events.length === 0;
  const colorClass = styles[`layerColor${layer.colorIndex}`];

  return (
    <div
      id={layer.id}
      className={classNames(styles.layer, colorClass, {
        [styles.layerEmpty]: isEmpty,
      })}
      style={{ minHeight: `${layer.heightPx}px` }}
    >
      {/* Time label band */}
      <div className={styles.layerLabel}>
        <span>{layer.label}</span>
      </div>

      {/* Events container */}
      <div className={styles.layerContent}>
        {isEmpty ? (
          <span className={styles.layerEmptyText}>No events</span>
        ) : (
          layer.events.map((event) => (
            <button
              key={event.id}
              className={classNames(styles.eventMarker, {
                [styles.eventMarkerSelected]: selectedEventId === event.id,
              })}
              onClick={(e) => {
                e.stopPropagation();
                onSelectEvent(event.id);
              }}
            >
              <span className={styles.eventDot} />
              <span className={styles.eventTitle}>{event.title}</span>
              <span className={styles.eventDate}>{event.date_display}</span>
            </button>
          ))
        )}
      </div>

      {/* Density badge for layers with multiple events */}
      {layer.events.length > 1 && (
        <span className={styles.densityBadge}>{layer.events.length}</span>
      )}

      {/* Tooltip on hover */}
      <div className={styles.layerTooltip}>
        <div className={styles.tooltipTitle}>{layer.label}</div>
        <div className={styles.tooltipStat}>
          {summary.eventCount} event{summary.eventCount !== 1 ? 's' : ''} &middot; {summary.timeSpan}
        </div>
        {summary.highlights.length > 0 && (
          <div className={styles.tooltipStat}>
            {summary.highlights.slice(0, 2).join(', ')}
            {summary.highlights.length > 2 && '...'}
          </div>
        )}
      </div>
    </div>
  );
};
