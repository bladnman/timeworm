import { useState, useCallback } from 'react';
import { useYouTubeView } from './hooks/useYouTubeView';
import { VideoCard } from './components/VideoCard/VideoCard';
import { VideoCluster } from './components/VideoCluster/VideoCluster';
import { YouTubeDetailOverlay } from './components/YouTubeDetailOverlay/YouTubeDetailOverlay';
import { MiniMap } from '../Horizontal/components/MiniMap/MiniMap';
import type { LayoutEvent, LayoutCluster } from './hooks/useTrackLayout';
import styles from './YouTubeView.module.css';

/**
 * YouTube View - Timeline visualization for YouTube videos.
 *
 * Based on HorizontalView with YouTube-specific styling:
 * - Play icon markers instead of dots
 * - YouTube red and charcoal color scheme
 * - Embedded video player in detail overlay
 */
export const YouTubeView = () => {
  const {
    data,
    items,
    ticks,
    detailEvent,
    pixelsPerYear,
    totalWidth,
    trackContentHeight,
    viewportOffset,
    viewportWidth,
    minYear,
    maxYear,
    containerRef,
    handleZoomDelta,
    handleResizeZoom,
    handleVideoClick,
    handleDetailClose,
    handleViewportChange,
    getYearPosition,
    getShareUrl,
    config,
  } = useYouTubeView();

  // Share button state
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const handleShare = useCallback(async () => {
    const url = getShareUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      // Fallback: select text for manual copy
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  }, [getShareUrl]);

  if (!data) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Loading videos...</div>
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

          {/* Videos and Clusters */}
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
              // Check if any event in cluster has videoId
              const hasVideo = cluster.events.some(e => e.metrics?.videoId);
              return (
                <div
                  key={cluster.id}
                  data-item-id={cluster.id}
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
                      top: '100%',
                      height: `calc(${-yPos}px - 100%)`,
                    } : {
                      top: `${-yPos}px`,
                      height: `${yPos}px`,
                    }}
                  />

                  {/* Anchor: play triangle for videos, circle dot for non-videos */}
                  <div
                    className={hasVideo ? styles.anchorPlay : styles.anchorDot}
                    style={{
                      top: `${-yPos}px`,
                      transform: 'translateX(-50%) translateY(-50%)',
                    }}
                  />

                  <VideoCluster
                    events={cluster.events}
                    startYear={cluster.startYear}
                    endYear={cluster.endYear}
                    lane={cluster.lane}
                    onEventClick={handleVideoClick}
                  />
                </div>
              );
            }

            // Regular video event
            const event = item as LayoutEvent;
            const hasVideo = !!event.event.metrics?.videoId;
            return (
              <div
                key={event.id}
                data-item-id={event.id}
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
                    top: '100%',
                    height: `calc(${-yPos}px - 100%)`,
                  } : {
                    top: `${-yPos}px`,
                    height: `${yPos}px`,
                  }}
                />

                {/* Anchor: play triangle for videos, circle dot for non-videos */}
                <div
                  className={hasVideo ? styles.anchorPlay : styles.anchorDot}
                  style={{
                    top: `${-yPos}px`,
                    transform: 'translateX(-50%) translateY(-50%)',
                  }}
                />

                <VideoCard
                  event={event.event}
                  onClick={() => handleVideoClick(event.event.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation controls */}
      <div className={styles.navigationControls}>
        {/* Share button */}
        <button
          className={styles.shareButton}
          onClick={handleShare}
          aria-label="Share current view"
          title="Copy link to current view"
        >
          {shareStatus === 'copied' ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </>
          )}
        </button>

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
      </div>

      {/* YouTube Detail Overlay */}
      <YouTubeDetailOverlay
        event={detailEvent}
        onClose={handleDetailClose}
      />
    </div>
  );
};
