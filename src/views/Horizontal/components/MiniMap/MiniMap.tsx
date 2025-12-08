import { memo, useCallback, useRef, useState, type MouseEvent, type WheelEvent } from 'react';
import type { TrackLayoutItem } from '../../hooks/useTrackLayout';
import { useMiniMap } from './hooks/useMiniMap';
import { useAutoScroll } from './hooks/useAutoScroll';
import { minimapPercentToYear, yearToMinimapPercent } from './utils/minimapCalculations';
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
  onResizeZoom?: (newPixelsPerYear: number, anchorPercent: number) => void;
}

interface DragState {
  type: 'move' | 'resize-left' | 'resize-right' | 'pan-track';
  startX: number;
  startOffset: number;
  // For resize: the preview width as percentage (0-100)
  previewWidthPercent?: number;
  // For resize: the preview left position as percentage
  previewLeftPercent?: number;
  // For resize: the starting width percent (to calculate ratio)
  startWidthPercent?: number;
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
    recenterOnViewport,
    setIsDraggingMinimap,
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
  const handleViewportDrag = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      // Toggle mobile handles on click (not drag)
      const startX = e.clientX;
      const startOffset = viewportOffset;

      setDragState({
        type: 'move',
        startX,
        startOffset,
      });
      setIsDraggingMinimap(true);

      const track = trackRef.current;
      if (!track) return;

      let hasMoved = false;

      const handleMove = (moveEvent: globalThis.MouseEvent) => {
        hasMoved = true;
        const rect = track.getBoundingClientRect();
        const deltaX = moveEvent.clientX - startX;
        const deltaPercent = (deltaX / rect.width) * 100;

        // Convert delta percent to years, then to pixels
        const deltaYears = (deltaPercent / 100) * minimapYearsVisible;
        const deltaPixels = deltaYears * pixelsPerYear;

        const newOffset = clampOffset(startOffset + deltaPixels);

        setDragState({
          type: 'move',
          startX,
          startOffset: newOffset,
        });
      };

      const handleUp = (upEvent: globalThis.MouseEvent) => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // If it was just a click (no movement), toggle mobile handles
        if (!hasMoved) {
          setShowMobileHandles((prev) => !prev);
        }

        const rect = track.getBoundingClientRect();
        const deltaX = upEvent.clientX - startX;
        const deltaPercent = (deltaX / rect.width) * 100;
        const deltaYears = (deltaPercent / 100) * minimapYearsVisible;
        const deltaPixels = deltaYears * pixelsPerYear;

        const finalOffset = clampOffset(startOffset + deltaPixels);

        setDragState(null);
        setIsDraggingMinimap(false);
        onViewportChange(finalOffset);
      };

      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    },
    [viewportOffset, minimapYearsVisible, pixelsPerYear, clampOffset, onViewportChange, setIsDraggingMinimap]
  );

  // Handle edge resize with auto-scroll at boundaries
  const handleEdgeResize = useCallback(
    (edge: 'left' | 'right', e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();

      if (!onResizeZoom) return;

      const track = trackRef.current;
      if (!track) return;

      const startX = e.clientX;
      const rect = track.getBoundingClientRect();
      const startLeftPercent = indicatorLeftPercent;
      const startWidthPercent = indicatorWidthPercent;
      const startRightPercent = startLeftPercent + startWidthPercent;

      setDragState({
        type: edge === 'left' ? 'resize-left' : 'resize-right',
        startX,
        startOffset: viewportOffset,
        previewLeftPercent: startLeftPercent,
        previewWidthPercent: startWidthPercent,
        startWidthPercent: startWidthPercent,
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

        const deltaX = currentX - startX;
        const deltaPercent = (deltaX / rect.width) * 100;

        let newLeftPercent: number;
        let newWidthPercent: number;

        if (edge === 'left') {
          // Moving left edge: right edge stays fixed
          newLeftPercent = Math.max(0, Math.min(startRightPercent - 5, startLeftPercent + deltaPercent));
          newWidthPercent = startRightPercent - newLeftPercent;
        } else {
          // Moving right edge: left edge stays fixed
          newLeftPercent = startLeftPercent;
          newWidthPercent = Math.max(5, Math.min(100 - startLeftPercent, startWidthPercent + deltaPercent));
        }

        setDragState({
          type: edge === 'left' ? 'resize-left' : 'resize-right',
          startX,
          startOffset: viewportOffset,
          previewLeftPercent: newLeftPercent,
          previewWidthPercent: newWidthPercent,
          startWidthPercent: startWidthPercent,
        });
      };

      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        stopAutoScroll();

        // Get final state and calculate new zoom
        setDragState((currentState) => {
          if (currentState && currentState.previewWidthPercent && currentState.startWidthPercent) {
            // Calculate zoom ratio: smaller preview = higher zoom
            const zoomRatio = currentState.startWidthPercent / currentState.previewWidthPercent;
            const newPPY = pixelsPerYear * zoomRatio;

            // Anchor the opposite edge
            const anchorPercent = edge === 'left' ? 1 : 0;
            setTimeout(() => {
              onResizeZoom(newPPY, anchorPercent);
              // Recenter minimap after resize
              setTimeout(recenterOnViewport, 50);
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
      indicatorLeftPercent,
      indicatorWidthPercent,
      viewportOffset,
      pixelsPerYear,
      checkEdgeProximity,
      startAutoScroll,
      stopAutoScroll,
      recenterOnViewport,
      setIsDraggingMinimap,
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

  // Determine display state
  const isDragging = dragState !== null;
  const isResizing = dragState?.type === 'resize-left' || dragState?.type === 'resize-right';

  // Calculate display values for viewport indicator
  let displayLeftPercent = indicatorLeftPercent;
  let displayWidthPercent = indicatorWidthPercent;

  if (dragState && (dragState.type === 'resize-left' || dragState.type === 'resize-right')) {
    displayLeftPercent = dragState.previewLeftPercent ?? indicatorLeftPercent;
    displayWidthPercent = dragState.previewWidthPercent ?? indicatorWidthPercent;
  }

  // Calculate context bar position (shows where minimap view is in total timeline)
  const totalYears = maxYear - minYear;
  const contextLeftPercent = totalYears > 0 ? ((minimapRangeStart - minYear) / totalYears) * 100 : 0;
  const contextWidthPercent = totalYears > 0 ? (minimapYearsVisible / totalYears) * 100 : 100;

  return (
    <div className={styles.container}>
      {/* Context bar - shows minimap position in total timeline */}
      {!isAtFullRange && (
        <div className={styles.contextBar}>
          <div
            className={styles.contextIndicator}
            style={{
              left: `${contextLeftPercent}%`,
              width: `${Math.max(2, contextWidthPercent)}%`,
            }}
          />
        </div>
      )}

      {/* Year labels - show minimap range, not total range */}
      <div className={styles.yearLabels}>
        <span className={styles.yearLabel}>{Math.round(minimapRangeStart)}</span>
        <span className={styles.yearLabel}>{Math.round(minimapRangeEnd)}</span>
      </div>

      {/* Track */}
      <div ref={trackRef} className={styles.track} onClick={handleTrackClick} onWheel={handleWheel}>
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

        {/* Ghost viewport during drag - shows original position */}
        {isDragging && !isResizing && (
          <div
            className={`${styles.viewport} ${styles.ghost}`}
            style={{
              left: `${indicatorLeftPercent}%`,
              width: `${indicatorWidthPercent}%`,
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
        >
          {/* Left resize handle */}
          {onResizeZoom && (
            <div
              className={`${styles.resizeHandle} ${showMobileHandles ? styles.visible : ''}`}
              data-edge="left"
              onMouseDown={handleLeftEdgeDrag}
            />
          )}
          {/* Right resize handle */}
          {onResizeZoom && (
            <div
              className={`${styles.resizeHandle} ${showMobileHandles ? styles.visible : ''}`}
              data-edge="right"
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
