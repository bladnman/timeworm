import { useMemo, useCallback } from 'react';
import type { TreeBranch, TreeNode } from '../../hooks/useBranchingTree';
import { BRANCHING_TREE_CONFIG } from '../../hooks/constants';
import styles from './TreeMinimap.module.css';

interface TreeMinimapProps {
  branches: TreeBranch[];
  trunkEvents: TreeNode[];
  totalHeight: number;
  canvasWidth: number;
  viewportTop: number;
  viewportHeight: number;
  onNavigate: (yPosition: number) => void;
}

const MINIMAP_WIDTH = 80;
const MINIMAP_MAX_HEIGHT = 200;

/**
 * A miniature overview of the tree structure for navigation.
 * Shows the entire tree with a viewport indicator.
 */
export const TreeMinimap = ({
  branches,
  trunkEvents,
  totalHeight,
  canvasWidth,
  viewportTop,
  viewportHeight,
  onNavigate,
}: TreeMinimapProps) => {
  const config = BRANCHING_TREE_CONFIG;

  // Calculate scale to fit tree in minimap
  const { scale, minimapHeight, scaledTrunkX } = useMemo(() => {
    const heightScale = MINIMAP_MAX_HEIGHT / totalHeight;
    const widthScale = MINIMAP_WIDTH / canvasWidth;
    const scale = Math.min(heightScale, widthScale);

    return {
      scale,
      minimapHeight: Math.min(MINIMAP_MAX_HEIGHT, totalHeight * scale),
      scaledTrunkX: config.trunkX * scale,
    };
  }, [totalHeight, canvasWidth, config.trunkX]);

  // Viewport indicator dimensions
  const viewportIndicator = useMemo(() => {
    const y = viewportTop * scale;
    const height = Math.max(10, viewportHeight * scale);

    return { y, height };
  }, [viewportTop, viewportHeight, scale]);

  // Handle click to navigate
  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const targetY = clickY / scale - viewportHeight / 2;
    onNavigate(Math.max(0, Math.min(totalHeight - viewportHeight, targetY)));
  }, [scale, viewportHeight, onNavigate, totalHeight]);

  return (
    <div className={styles.container}>
      <svg
        width={MINIMAP_WIDTH}
        height={minimapHeight}
        className={styles.minimap}
        onClick={handleClick}
      >
        {/* Background */}
        <rect
          x={0}
          y={0}
          width={MINIMAP_WIDTH}
          height={minimapHeight}
          className={styles.background}
        />

        {/* Trunk line */}
        <line
          x1={scaledTrunkX}
          y1={0}
          x2={scaledTrunkX}
          y2={minimapHeight}
          className={styles.trunk}
        />

        {/* Branches (simplified) */}
        {branches.map((branch) => {
          const startY = branch.startY * scale;
          const endY = branch.endY * scale;
          const branchX = branch.x * scale;

          return (
            <g key={branch.group.id}>
              {/* Branch line */}
              <line
                x1={scaledTrunkX}
                y1={startY}
                x2={branchX}
                y2={startY}
                stroke={branch.color}
                strokeWidth={1}
                opacity={0.6}
              />
              <line
                x1={branchX}
                y1={startY}
                x2={branchX}
                y2={endY}
                stroke={branch.color}
                strokeWidth={1}
                opacity={0.6}
              />

              {/* Event dots */}
              {branch.nodes.map((node) => (
                <circle
                  key={node.event.id}
                  cx={branchX}
                  cy={node.y * scale}
                  r={2}
                  fill={branch.color}
                />
              ))}
            </g>
          );
        })}

        {/* Trunk events */}
        {trunkEvents.map((node) => (
          <circle
            key={node.event.id}
            cx={scaledTrunkX}
            cy={node.y * scale}
            r={2}
            fill="var(--color-text-accent)"
          />
        ))}

        {/* Viewport indicator */}
        <rect
          x={0}
          y={viewportIndicator.y}
          width={MINIMAP_WIDTH}
          height={viewportIndicator.height}
          className={styles.viewport}
        />
      </svg>

      <div className={styles.label}>Minimap</div>
    </div>
  );
};
