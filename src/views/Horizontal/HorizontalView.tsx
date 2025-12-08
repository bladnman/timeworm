import { useHorizontalView } from './hooks/useHorizontalView';
import { EventCard } from './components/EventCard/EventCard';
import { EventCluster } from './components/EventCluster/EventCluster';
import { MiniMap } from './components/MiniMap/MiniMap';
import { EventSpotlight } from './components/EventSpotlight/EventSpotlight';
import type { LayoutEvent, LayoutCluster } from './hooks/useTrackLayout';
import styles from './HorizontalView.module.css';

/**
 * Horizontal Track View - The flagship timeline visualization.
 *
 * A clean horizontal track where time flows left to right, with events
 * emerging as landmarks along the journey. Dense periods cluster elegantly
 * and expand to reveal their contents.
 *
 * Embodies the TimeWorm ethos: experiencing time, not just displaying it.
 */
export const HorizontalView = () => {
  const {
    data,
    items,
    ticks,
    spotlightEvents,
    pixelsPerYear,
    totalWidth,
    trackContentHeight,
    viewportOffset,
    viewportWidth,
    minYear,
    maxYear,
    containerRef,
    handleZoomChange,
    handleZoomDelta,
    handleResizeZoom,
    handleEventClick,
    handleClusterClick,
    handleSpotlightClose,
    handleViewportChange,
    getYearPosition,
    config,
  } = useHorizontalView();

  if (!data) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Main scrollable track area */}
      <div
        ref={containerRef}
        className={styles.scrollContainer}
      >
        <div
          className={styles.timelineTrack}
          style={{
            width: `${totalWidth}px`,
            height: `${trackContentHeight}px`,
          }}
        >
          {/* Central axis line */}
          <div className={styles.axis} />

          {/* Tick marks and labels */}
          {ticks.map((t) => {
            const pos = getYearPosition(t.year);
            return (
              <div
                key={t.year}
                className={styles.tick}
                style={{ left: `${pos}px` }}
                data-major={t.major}
              >
                <div className={styles.tickLine} data-major={t.major} />
                {t.major && <div className={styles.tickLabel}>{t.label}</div>}
              </div>
            );
          })}

          {/* Events and Clusters */}
          {items.map((item) => {
            const isAbove = item.lane === 'above';
            const { connectorLength, cardHeight, stackOffset } = config;
            const stackOffsetPx = item.stackIndex * stackOffset;

            // Calculate y position
            const baseOffset = connectorLength + cardHeight;
            const yPos = isAbove
              ? -(baseOffset + stackOffsetPx)
              : baseOffset + stackOffsetPx - cardHeight;

            if (item.type === 'cluster') {
              const cluster = item as LayoutCluster;
              return (
                <div
                  key={cluster.id}
                  className={styles.itemWrapper}
                  style={{
                    left: `${cluster.xPos}px`,
                    top: `calc(50% + ${yPos}px)`,
                  }}
                  data-lane={item.lane}
                >
                  {/* Connector line from card to axis */}
                  <div
                    className={styles.connector}
                    style={isAbove ? {
                      // Above: card is above axis, connector goes from card bottom (100%) down to axis (-yPos from top)
                      // Height = distance from card bottom to axis = -yPos - cardHeight
                      // Since we don't know cardHeight, use: top: 100%, height: calc(-yPos - 100%)
                      top: '100%',
                      height: `calc(${-yPos}px - 100%)`,
                    } : {
                      // Below: from axis (above the card) down to top of card
                      top: `${-yPos}px`,
                      height: `${yPos}px`,
                    }}
                  />

                  {/* Anchor dot - positioned to sit on the axis */}
                  <div
                    className={styles.anchor}
                    style={{
                      top: `${-yPos}px`,
                      transform: 'translateX(-50%) translateY(-50%)',
                    }}
                  />

                  <EventCluster
                    events={cluster.events}
                    startYear={cluster.startYear}
                    endYear={cluster.endYear}
                    lane={cluster.lane}
                    onEventClick={handleEventClick}
                    onExpand={() => handleClusterClick(cluster.events)}
                  />
                </div>
              );
            }

            // Regular event
            const event = item as LayoutEvent;
            return (
              <div
                key={event.id}
                className={styles.itemWrapper}
                style={{
                  left: `${event.xPos}px`,
                  top: `calc(50% + ${yPos}px)`,
                  width: `${config.cardWidth}px`,
                }}
                data-lane={item.lane}
              >
                {/* Connector line from card to axis */}
                <div
                  className={styles.connector}
                  style={isAbove ? {
                    // Above: card is above axis, connector goes from card bottom (100%) down to axis
                    top: '100%',
                    height: `calc(${-yPos}px - 100%)`,
                  } : {
                    // Below: from axis (above the card) down to top of card
                    top: `${-yPos}px`,
                    height: `${yPos}px`,
                  }}
                />

                {/* Anchor dot - positioned to sit on the axis */}
                <div
                  className={styles.anchor}
                  style={{
                    top: `${-yPos}px`,
                    transform: 'translateX(-50%) translateY(-50%)',
                  }}
                />

                <EventCard
                  event={event.event}
                  onClick={() => handleEventClick(event.event.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* MiniMap navigation */}
      <MiniMap
        items={items}
        totalWidth={totalWidth}
        viewportWidth={viewportWidth}
        viewportOffset={viewportOffset}
        pixelsPerYear={pixelsPerYear}
        minYear={minYear}
        maxYear={maxYear}
        onViewportChange={handleViewportChange}
        onZoomChange={handleZoomDelta}
        onResizeZoom={handleResizeZoom}
      />

      {/* Event Spotlight modal */}
      {spotlightEvents && (
        <EventSpotlight
          events={spotlightEvents}
          onClose={handleSpotlightClose}
        />
      )}
    </div>
  );
};
