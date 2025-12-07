import { useRef, useState, useCallback, useEffect } from 'react';
import { useBranchingTree } from './hooks/useBranchingTree';
import { TreeBranch } from './components/TreeBranch/TreeBranch';
import { TreeNode } from './components/TreeNode/TreeNode';
import { TreeMinimap } from './components/TreeMinimap/TreeMinimap';
import styles from './BranchingTree.module.css';

/**
 * Branching Tree View
 *
 * Represents time as a tree that grows from trunk into branches.
 * - Trunk is the earliest period, growing upward
 * - Branches represent categories/groups splitting off at different times
 * - Events are nodes/leaves positioned along branches by timestamp
 * - Time flows from bottom (early) to top (late)
 */
export const BranchingTree = () => {
  const {
    data,
    branches,
    trunkEvents,
    trunkTicks,
    totalHeight,
    canvasWidth,
    pixelsPerYear,
    selectedEventId,
    selectEvent,
    toggleBranch,
    expandAll,
    collapseAll,
    handleZoomChange,
    zoomIn,
    zoomOut,
    config,
  } = useBranchingTree();

  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportTop, setViewportTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Track scroll position for minimap
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setViewportTop(containerRef.current.scrollTop);
    }
  }, []);

  // Update viewport height on resize
  useEffect(() => {
    const updateViewportHeight = () => {
      if (containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight);
      }
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  // Navigate from minimap click
  const handleMinimapNavigate = useCallback((yPosition: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: yPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  // Scroll to bottom (earliest events) on load
  useEffect(() => {
    if (containerRef.current && totalHeight > 0) {
      containerRef.current.scrollTop = totalHeight;
    }
  }, [totalHeight]);

  if (!data) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <span>Growing the tree...</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Zoom</span>
          <button
            className={styles.controlButton}
            onClick={zoomOut}
            title="Zoom out"
          >
            −
          </button>
          <input
            type="range"
            min={config.zoomMin}
            max={config.zoomMax}
            step={config.zoomStep}
            value={pixelsPerYear}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className={styles.slider}
          />
          <button
            className={styles.controlButton}
            onClick={zoomIn}
            title="Zoom in"
          >
            +
          </button>
          <span className={styles.zoomValue}>{pixelsPerYear}px/yr</span>
        </div>

        <div className={styles.controlGroup}>
          <button
            className={styles.controlButton}
            onClick={expandAll}
            title="Expand all branches"
          >
            Expand All
          </button>
          <button
            className={styles.controlButton}
            onClick={collapseAll}
            title="Collapse all branches"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Main scrollable area */}
      <div
        ref={containerRef}
        className={styles.container}
        onScroll={handleScroll}
      >
        <svg
          className={styles.canvas}
          width={canvasWidth}
          height={totalHeight}
          viewBox={`0 0 ${canvasWidth} ${totalHeight}`}
        >
          {/* Tree root/base decoration */}
          <defs>
            <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-text-secondary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-text-secondary)" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trunk line */}
          <line
            x1={config.trunkX}
            y1={config.canvasPadding}
            x2={config.trunkX}
            y2={totalHeight - config.canvasPadding}
            stroke="url(#trunkGradient)"
            strokeWidth={config.trunkWidth}
            strokeLinecap="round"
          />

          {/* Year ticks along trunk */}
          {trunkTicks.map((tick) => (
            <g key={tick.year}>
              <line
                x1={config.trunkX - (tick.major ? 20 : 10)}
                y1={tick.y}
                x2={config.trunkX - 4}
                y2={tick.y}
                className={tick.major ? styles.tickMajor : styles.tickMinor}
              />
              {tick.major && (
                <text
                  x={config.trunkX - 24}
                  y={tick.y + 4}
                  className={styles.tickLabel}
                  textAnchor="end"
                >
                  {tick.label}
                </text>
              )}
            </g>
          ))}

          {/* Branches */}
          {branches.map((branch) => (
            <TreeBranch
              key={branch.group.id}
              branch={branch}
              onToggle={toggleBranch}
              onNodeClick={selectEvent}
              selectedEventId={selectedEventId}
            />
          ))}

          {/* Trunk events (events without groups) */}
          {trunkEvents.map((node) => (
            <TreeNode
              key={node.event.id}
              node={node}
              onNodeClick={selectEvent}
              isSelected={selectedEventId === node.event.id}
            />
          ))}

          {/* Root decoration */}
          <g transform={`translate(${config.trunkX}, ${totalHeight - config.canvasPadding + 20})`}>
            <ellipse
              cx={0}
              cy={0}
              rx={30}
              ry={12}
              fill="var(--color-text-secondary)"
              opacity={0.3}
            />
            <text
              y={30}
              className={styles.rootLabel}
              textAnchor="middle"
            >
              ← Earlier
            </text>
          </g>

          {/* Top decoration */}
          <g transform={`translate(${config.trunkX}, ${config.canvasPadding - 20})`}>
            <polygon
              points="0,-15 10,5 -10,5"
              fill="var(--color-text-secondary)"
              opacity={0.5}
            />
            <text
              y={-25}
              className={styles.topLabel}
              textAnchor="middle"
            >
              Later →
            </text>
          </g>
        </svg>
      </div>

      {/* Minimap */}
      <TreeMinimap
        branches={branches}
        trunkEvents={trunkEvents}
        totalHeight={totalHeight}
        canvasWidth={canvasWidth}
        viewportTop={viewportTop}
        viewportHeight={viewportHeight}
        onNavigate={handleMinimapNavigate}
      />

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Branches</div>
        {branches.map((branch) => (
          <div
            key={branch.group.id}
            className={styles.legendItem}
            onClick={() => toggleBranch(branch.group.id)}
          >
            <span
              className={styles.legendColor}
              style={{ backgroundColor: branch.color }}
            />
            <span className={styles.legendLabel}>
              {branch.group.title.length > 25
                ? branch.group.title.substring(0, 25) + '...'
                : branch.group.title}
            </span>
            <span className={styles.legendCount}>
              {branch.nodes.length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
