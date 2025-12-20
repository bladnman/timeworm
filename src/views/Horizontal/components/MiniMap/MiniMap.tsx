import { memo, useCallback, useMemo, useRef, useState, type MouseEvent, type WheelEvent } from 'react';
import type { TrackLayoutItem } from '../../hooks/useTrackLayout';
import { useMiniMap } from './hooks/useMiniMap';
import { useAutoScroll } from './hooks/useAutoScroll';
import {
  minimapPercentToYear,
  yearToMinimapPercent,
  pixelDeltaToPercent,
  getPreviewCenterYear,
  yearToViewportOffset,
  getEventDensityDots,
  type FrozenCoordinateSnapshot,
} from './utils/minimapCalculations';
import styles from './MiniMap.module.css';

interface MiniMapProps {
  items: TrackLayoutItem[];
  totalWidth: number;
  viewportWidth: number;
  viewportOffset: number;
  pixelsPerYear: number;
  minYear: number;
  maxYear: number;
  onViewportChange: (offset: number) => void;
  onZoomChange?: (delta: number) => void;
  onResizeZoom?: (newPixelsPerYear: number, edge: 'left' | 'right', snapshotViewportOffset: number, snapshotPixelsPerYear: number) => void;
}

interface DragState {
  type: 'move' | 'resize-left' | 'resize-right' | 'pan-track' | 'pan-context';
  startX: number;
  startOffset: number;

  // Frozen coordinate snapshot - the stable coordinate system during drag
  snapshot: FrozenCoordinateSnapshot;

  // Preview position (what user is dragging TO) - in percentage
  previewLeftPercent: number;
  previewWidthPercent: number;

  // Ghost position (where drag STARTED) - in percentage
  ghostLeftPercent: number;
  ghostWidthPercent: number;
}

/**
 * Scrollable mini overview map with viewport indicator.
 *
 * Features:
 * - Minimap has its own zoom/scroll state (shows portion of timeline)
 * - Viewport indicator targets ~25% width
 * - Always-centered: minimap auto-pans to keep viewport centered
 * - Click to center viewport at position
 * - Drag viewport to pan main timeline
 * - Drag viewport edges to resize (zoom)
 * - Drag track to pan minimap view
 * - Vertical scroll on track to zoom minimap
 * - Position indicators show location in total timeline
 */
export const MiniMap = memo(function MiniMap({
  items,
  totalWidth,
  viewportWidth,
  viewportOffset,
  pixelsPerYear,
  minYear,
  maxYear,
  onViewportChange,
  onZoomChange: _onZoomChange,
  onResizeZoom,
}: MiniMapProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const contextBarRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [showMobileHandles, setShowMobileHandles] = useState(false);

  // Minimap state management
  const {
    minimapRangeStart,
    minimapRangeEnd,
    minimapYearsVisible,
    indicatorLeftPercent,
    indicatorWidthPercent,
    isAtFullRange,
    hasMoreLeft,
    hasMoreRight,
    panMinimap,
    zoomMinimapAtPercent,
    setIsDraggingMinimap,
    getCoordinateSnapshot,
  } = useMiniMap({
    totalMinYear: minYear,
    totalMaxYear: maxYear,
    viewportOffset,
    viewportWidth,
    pixelsPerYear,
  });

  // Auto-scroll during edge resize
  const { startAutoScroll, stopAutoScroll, checkEdgeProximity } = useAutoScroll({
    minimapYearsVisible,
    onScroll: panMinimap,
  });

  // Clamp main viewport offset to valid range
  const clampOffset = useCallback(
    (offset: number) => {
      return Math.max(0, Math.min(totalWidth - viewportWidth, offset));
    },
    [totalWidth, viewportWidth]
  );

  // Convert minimap percent position to main viewport offset
  const minimapPercentToViewportOffset = useCallback(
    (percent: number): number => {
      const targetYear = minimapPercentToYear(percent, minimapRangeStart, minimapRangeEnd);
      const mainViewportYears = viewportWidth / pixelsPerYear;
      const targetOffset = (targetYear - mainViewportYears / 2 - minYear) * pixelsPerYear;
      return clampOffset(targetOffset);
    },
    [minimapRangeStart, minimapRangeEnd, viewportWidth, pixelsPerYear, minYear, clampOffset]
  );

  // Get position percent for an item within the minimap's current range
  const getItemPositionPercent = useCallback(
    (xPos: number): number => {
      // xPos is in pixels from the start of the total timeline
      const itemYear = xPos / pixelsPerYear + minYear;
      return yearToMinimapPercent(itemYear, minimapRangeStart, minimapRangeEnd);
    },
    [pixelsPerYear, minYear, minimapRangeStart, minimapRangeEnd]
  );

  // Handle click to navigate (on track, not on viewport indicator)
  const handleTrackClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (dragState) return;
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickPercent = (clickX / rect.width) * 100;

      // Center main viewport on click position
      const newOffset = minimapPercentToViewportOffset(clickPercent);
      onViewportChange(newOffset);
    },
    [dragState, minimapPercentToViewportOffset, onViewportChange]
  );

  // Handle viewport indicator drag (move main viewport)
  // Uses frozen coordinate system to prevent jank during drag
  const handleViewportDrag = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      const track = trackRef.current;
      if (!track) return;

      const startX = e.clientX;
      const rect = track.getBoundingClientRect();

      // Capture frozen coordinate snapshot at drag start
      const snapshot = getCoordinateSnapshot(rect.width);

      setDragState({
        type: 'move',
        startX,
        startOffset: viewportOffset,
        snapshot,
        // Initialize preview and ghost at same position (frozen coordinates)
        previewLeftPercent: snapshot.indicatorLeftPercent,
        previewWidthPercent: snapshot.indicatorWidthPercent,
        ghostLeftPercent: snapshot.indicatorLeftPercent,
        ghostWidthPercent: snapshot.indicatorWidthPercent,
      });
      setIsDraggingMinimap(true);

      let hasMoved = false;

      const handleMove = (moveEvent: globalThis.MouseEvent) => {
        hasMoved = true;
        const deltaX = moveEvent.clientX - startX;

        // Convert pixel delta to percentage using FROZEN snapshot
        const deltaPercent = pixelDeltaToPercent(deltaX, snapshot);

        // Calculate new preview position (ghost stays fixed)
        const newLeftPercent = Math.max(
          0,
          Math.min(100 - snapshot.indicatorWidthPercent, snapshot.indicatorLeftPercent + deltaPercent)
        );

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                previewLeftPercent: newLeftPercent,
                // Ghost stays at original position
              }
            : null
        );
      };

      const handleUp = (_upEvent: globalThis.MouseEvent) => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // If it was just a click (no movement), toggle mobile handles
        if (!hasMoved) {
          setShowMobileHandles((prev) => !prev);
        }

        // Get final preview position from drag state
        setDragState((currentState) => {
          if (currentState && hasMoved) {
            // Convert preview position to year using FROZEN snapshot
            const centerYear = getPreviewCenterYear(
              currentState.previewLeftPercent,
              currentState.previewWidthPercent,
              currentState.snapshot
            );

            // Convert year to offset using CURRENT (live) coordinates
            const finalOffset = yearToViewportOffset(
              centerYear,
              viewportWidth,
              pixelsPerYear,
              minYear,
              totalWidth
            );

            // Commit the change
            setTimeout(() => {
              onViewportChange(finalOffset);
            }, 0);
          }
          return null;
        });

        setIsDraggingMinimap(false);
      };

      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [
      viewportOffset,
      viewportWidth,
      pixelsPerYear,
      minYear,
      totalWidth,
      onViewportChange,
      setIsDraggingMinimap,
      getCoordinateSnapshot,
    ]
  );

  // Handle edge resize with auto-scroll at boundaries
  // Uses frozen coordinate system for jank-free resizing
  const handleEdgeResize = useCallback(
    (edge: 'left' | 'right', e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      if (!onResizeZoom) return;

      const track = trackRef.current;
      if (!track) return;

      const startX = e.clientX;
      const rect = track.getBoundingClientRect();

      // Capture frozen coordinate snapshot at resize start
      const snapshot = getCoordinateSnapshot(rect.width);
      const startRightPercent = snapshot.indicatorLeftPercent + snapshot.indicatorWidthPercent;

      setDragState({
        type: edge === 'left' ? 'resize-left' : 'resize-right',
        startX,
        startOffset: viewportOffset,
        snapshot,
        previewLeftPercent: snapshot.indicatorLeftPercent,
        previewWidthPercent: snapshot.indicatorWidthPercent,
        ghostLeftPercent: snapshot.indicatorLeftPercent,
        ghostWidthPercent: snapshot.indicatorWidthPercent,
      });
      setIsDraggingMinimap(true);

      const handleMove = (moveEvent: globalThis.MouseEvent) => {
        const currentRect = track.getBoundingClientRect();
        const currentX = moveEvent.clientX;
        const positionPercent = ((currentX - currentRect.left) / currentRect.width) * 100;

        // Check for edge proximity and start auto-scroll
        const edgeProximity = checkEdgeProximity(positionPercent);
        if (edgeProximity) {
          startAutoScroll(edgeProximity);
        } else {
          stopAutoScroll();
        }

        // Calculate delta using FROZEN snapshot for consistency
        const deltaPercent = pixelDeltaToPercent(currentX - startX, snapshot);

        let newLeftPercent: number;
        let newWidthPercent: number;

        if (edge === 'left') {
          // Moving left edge: right edge stays fixed (in frozen coordinates)
          newLeftPercent = Math.max(0, Math.min(startRightPercent - 5, snapshot.indicatorLeftPercent + deltaPercent));
          newWidthPercent = startRightPercent - newLeftPercent;
        } else {
          // Moving right edge: left edge stays fixed (in frozen coordinates)
          newLeftPercent = snapshot.indicatorLeftPercent;
          newWidthPercent = Math.max(
            5,
            Math.min(100 - snapshot.indicatorLeftPercent, snapshot.indicatorWidthPercent + deltaPercent)
          );
        }

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                previewLeftPercent: newLeftPercent,
                previewWidthPercent: newWidthPercent,
                // Ghost stays at original position
              }
            : null
        );
      };

      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        stopAutoScroll();

        // Get final state and calculate new zoom
        setDragState((currentState) => {
          if (currentState && currentState.previewWidthPercent && currentState.snapshot) {
            const { snapshot } = currentState;

            // Calculate zoom ratio using FROZEN snapshot width
            const zoomRatio = snapshot.indicatorWidthPercent / currentState.previewWidthPercent;
            const newPPY = pixelsPerYear * zoomRatio;

            // Pass the frozen snapshot values directly - let handleResizeZoom do the calculation
            // This avoids coordinate system mismatches between minimap and main view
            // Note: Don't call recenterOnViewport here - it would use stale closure values.
            // The auto-center effect in useMiniMap will handle recentering after state updates.
            setTimeout(() => {
              onResizeZoom(newPPY, edge, snapshot.viewportOffset, snapshot.pixelsPerYear);
            }, 0);
          }
          return null;
        });

        setIsDraggingMinimap(false);
      };

      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [
      onResizeZoom,
      viewportOffset,
      pixelsPerYear,
      checkEdgeProximity,
      startAutoScroll,
      stopAutoScroll,
      setIsDraggingMinimap,
      getCoordinateSnapshot,
    ]
  );

  const handleLeftEdgeDrag = useCallback(
    (e: MouseEvent<HTMLDivElement>) => handleEdgeResize('left', e),
    [handleEdgeResize]
  );

  const handleRightEdgeDrag = useCallback(
    (e: MouseEvent<HTMLDivElement>) => handleEdgeResize('right', e),
    [handleEdgeResize]
  );

  // Handle scroll wheel on track
  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault();

      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorPercent = (cursorX / rect.width) * 100;

      // Horizontal scroll or shift+vertical = pan minimap
      if (e.deltaX !== 0 || e.shiftKey) {
        const panAmount = (e.deltaX || e.deltaY) * 0.5;
        const panYears = (panAmount / rect.width) * minimapYearsVisible * 10;
        panMinimap(panYears);
        return;
      }

      // Vertical scroll = zoom minimap (centered on cursor)
      if (e.deltaY !== 0) {
        const zoomFactor = e.deltaY > 0 ? 0.8 : 1.25; // Scroll down = zoom out, up = zoom in
        zoomMinimapAtPercent(cursorPercent, zoomFactor);
      }
    },
    [minimapYearsVisible, panMinimap, zoomMinimapAtPercent]
  );

  // Handle context bar drag (pans both minimap range AND main viewport)
  const handleContextBarDrag = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      const contextBar = contextBarRef.current;
      if (!contextBar) return;

      const startX = e.clientX;
      const rect = contextBar.getBoundingClientRect();
      const totalYears = maxYear - minYear;

      // Context bar indicator now shows VIEWPORT position (not minimap range)
      const startViewportYear = viewportOffset / pixelsPerYear + minYear;
      const viewportYearsSpan = viewportWidth / pixelsPerYear;
      const startContextLeftPercent = totalYears > 0 ? ((startViewportYear - minYear) / totalYears) * 100 : 0;
      const startContextWidthPercent = totalYears > 0 ? (viewportYearsSpan / totalYears) * 100 : 100;

      // We need a snapshot for the drag state interface, use track ref if available
      const trackRect = trackRef.current?.getBoundingClientRect();
      const snapshot = getCoordinateSnapshot(trackRect?.width ?? rect.width);

      setDragState({
        type: 'pan-context',
        startX,
        startOffset: viewportOffset,
        snapshot,
        previewLeftPercent: startContextLeftPercent,
        previewWidthPercent: startContextWidthPercent,
        ghostLeftPercent: startContextLeftPercent,
        ghostWidthPercent: startContextWidthPercent,
      });
      setIsDraggingMinimap(true);

      const handleMove = (moveEvent: globalThis.MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaPercent = (deltaX / rect.width) * 100;

        // Convert context bar delta to years
        const deltaYears = (deltaPercent / 100) * totalYears;

        // Calculate new viewport position (clamped)
        const newViewportStartYear = Math.max(minYear, Math.min(maxYear - viewportYearsSpan, startViewportYear + deltaYears));

        // Update preview position
        const newContextLeftPercent = totalYears > 0 ? ((newViewportStartYear - minYear) / totalYears) * 100 : 0;

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                previewLeftPercent: newContextLeftPercent,
              }
            : null
        );
      };

      const handleUp = (upEvent: globalThis.MouseEvent) => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Calculate final position and commit
        setDragState((currentState) => {
          if (currentState) {
            const deltaX = upEvent.clientX - startX;
            const deltaPercent = (deltaX / rect.width) * 100;
            const deltaYears = (deltaPercent / 100) * totalYears;

            // Calculate new viewport center year (clamped)
            const newViewportStartYear = Math.max(minYear, Math.min(maxYear - viewportYearsSpan, startViewportYear + deltaYears));
            const newViewportCenterYear = newViewportStartYear + viewportYearsSpan / 2;

            // Convert to viewport offset
            const newViewportOffset = yearToViewportOffset(
              newViewportCenterYear,
              viewportWidth,
              pixelsPerYear,
              minYear,
              totalWidth
            );

            // Update viewport directly (auto-follow will adjust minimap as needed)
            setTimeout(() => {
              onViewportChange(newViewportOffset);
              setIsDraggingMinimap(false);
            }, 0);
          } else {
            setIsDraggingMinimap(false);
          }
          return null;
        });
      };

      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [
      minYear,
      maxYear,
      viewportOffset,
      viewportWidth,
      pixelsPerYear,
      totalWidth,
      onViewportChange,
      setIsDraggingMinimap,
      getCoordinateSnapshot,
    ]
  );

  // Calculate event density dots for context bar
  const contextDensityDots = useMemo(
    () => getEventDensityDots(items, pixelsPerYear, minYear, maxYear),
    [items, pixelsPerYear, minYear, maxYear]
  );

  // Determine display state
  const isDragging = dragState !== null;
  const isResizing = dragState?.type === 'resize-left' || dragState?.type === 'resize-right';

  // Calculate display values for viewport indicator
  // During drag: use frozen snapshot positions for both ghost and preview
  // Not dragging: use live calculated position
  let displayLeftPercent = indicatorLeftPercent;
  let displayWidthPercent = indicatorWidthPercent;
  let ghostLeftPercent = indicatorLeftPercent;
  let ghostWidthPercent = indicatorWidthPercent;

  if (dragState) {
    // Preview shows current drag position (from frozen coordinates)
    displayLeftPercent = dragState.previewLeftPercent;
    displayWidthPercent = dragState.previewWidthPercent;
    // Ghost shows original position (from frozen coordinates)
    ghostLeftPercent = dragState.ghostLeftPercent;
    ghostWidthPercent = dragState.ghostWidthPercent;
  }

  // Calculate context bar position (shows where VIEWPORT is in total timeline)
  // This makes the dots align between the context bar and main minimap indicators
  const totalYears = maxYear - minYear;
  const isContextDragging = dragState?.type === 'pan-context';

  // Calculate viewport position in year-space
  const viewportStartYear = viewportOffset / pixelsPerYear + minYear;
  const viewportYears = viewportWidth / pixelsPerYear;

  // Use preview position during context bar drag, otherwise show viewport position
  const contextLeftPercent = isContextDragging
    ? dragState.previewLeftPercent
    : totalYears > 0
      ? ((viewportStartYear - minYear) / totalYears) * 100
      : 0;
  const contextWidthPercent = totalYears > 0 ? (viewportYears / totalYears) * 100 : 100;

  return (
    <div className={styles.container}>
      {/* Context bar - shows minimap position in total timeline */}
      {!isAtFullRange && (
        <div ref={contextBarRef} className={styles.contextBar}>
          {/* Track line */}
          <div className={styles.contextTrack} />

          {/* Event density dots */}
          {contextDensityDots.map((dot, i) => (
            <div
              key={i}
              className={styles.contextDot}
              style={{
                left: `${dot.percent}%`,
                opacity: 0.3 + dot.density * 0.7,
              }}
            />
          ))}

          {/* Draggable indicator */}
          <div
            className={`${styles.contextIndicator} ${isContextDragging ? styles.dragging : ''}`}
            style={{
              left: `${contextLeftPercent}%`,
              width: `${Math.max(2, contextWidthPercent)}%`,
            }}
            onMouseDown={handleContextBarDrag}
          />
        </div>
      )}

      {/* Year labels - show minimap range, not total range */}
      <div className={styles.yearLabels}>
        <span className={styles.yearLabel}>{Math.round(minimapRangeStart)}</span>
        <span className={styles.yearLabel}>{Math.round(minimapRangeEnd)}</span>
      </div>

      {/* Track */}
      <div ref={trackRef} className={styles.track} onClick={handleTrackClick} onWheel={handleWheel} data-testid="minimap-track" aria-label="Timeline minimap">
        {/* Edge fade - left */}
        {hasMoreLeft && (
          <div className={styles.edgeFade} data-edge="left">
            <span className={styles.edgeArrow}>{'<'}</span>
            <span className={styles.edgeYear}>{Math.round(minYear)}</span>
          </div>
        )}

        {/* Edge fade - right */}
        {hasMoreRight && (
          <div className={styles.edgeFade} data-edge="right">
            <span className={styles.edgeYear}>{Math.round(maxYear)}</span>
            <span className={styles.edgeArrow}>{'>'}</span>
          </div>
        )}

        {/* Event indicators - only show items within minimap range */}
        {items.map((item) => {
          const posPercent = getItemPositionPercent(item.xPos);
          // Only render if within visible range (with some buffer)
          if (posPercent < -5 || posPercent > 105) return null;

          return (
            <div
              key={item.id}
              className={styles.eventDot}
              style={{
                left: `${posPercent}%`,
                opacity: item.type === 'cluster' ? 1 : 0.7,
              }}
              data-cluster={item.type === 'cluster'}
            />
          );
        })}

        {/* Axis line */}
        <div className={styles.axisLine} />

        {/* Ghost viewport during drag/resize - shows original position */}
        {isDragging && (
          <div
            className={`${styles.viewport} ${styles.ghost}`}
            style={{
              left: `${ghostLeftPercent}%`,
              width: `${ghostWidthPercent}%`,
            }}
          />
        )}

        {/* Viewport indicator */}
        <div
          className={`${styles.viewport} ${isDragging ? styles.dragging : ''} ${isResizing ? styles.resizing : ''}`}
          style={{
            left: `${displayLeftPercent}%`,
            width: `${displayWidthPercent}%`,
          }}
          onMouseDown={handleViewportDrag}
          data-testid="minimap-viewport"
          role="slider"
          aria-label="Timeline viewport position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(displayLeftPercent + displayWidthPercent / 2)}
        >
          {/* Left resize handle */}
          {onResizeZoom && (
            <div
              className={`${styles.resizeHandle} ${showMobileHandles ? styles.visible : ''}`}
              data-edge="left"
              data-testid="minimap-resize-left"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize viewport left edge"
              onMouseDown={handleLeftEdgeDrag}
            />
          )}
          {/* Right resize handle */}
          {onResizeZoom && (
            <div
              className={`${styles.resizeHandle} ${showMobileHandles ? styles.visible : ''}`}
              data-edge="right"
              data-testid="minimap-resize-right"
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize viewport right edge"
              onMouseDown={handleRightEdgeDrag}
            />
          )}
        </div>
      </div>

      {/* Instructions hint */}
      <div className={styles.hint}>
        {isAtFullRange ? 'Click or drag to navigate' : 'Scroll to pan/zoom minimap'}
      </div>
    </div>
  );
});
