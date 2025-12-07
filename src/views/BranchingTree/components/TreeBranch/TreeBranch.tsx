import type { TreeBranch as TreeBranchType } from '../../hooks/useBranchingTree';
import { BRANCHING_TREE_CONFIG } from '../../hooks/constants';
import styles from './TreeBranch.module.css';

interface TreeBranchProps {
  branch: TreeBranchType;
  onToggle: (branchId: string) => void;
  onNodeClick: (eventId: string) => void;
  selectedEventId: string | null;
}

/**
 * Renders a single branch of the tree, including:
 * - The curved path from trunk to branch position
 * - The vertical branch line
 * - Event nodes along the branch
 * - Branch label/header
 */
export const TreeBranch = ({
  branch,
  onToggle,
  onNodeClick,
  selectedEventId,
}: TreeBranchProps) => {
  const { config } = { config: BRANCHING_TREE_CONFIG };
  const isCollapsed = branch.state === 'collapsed';
  const trunkX = config.trunkX;

  // Generate SVG path for the branch curve
  const generateBranchPath = (): string => {
    const startX = trunkX;
    const startY = branch.startY;
    const endX = branch.x;
    const curveY = branch.curveStartY;

    // Quadratic bezier curve from trunk to branch position
    const controlX = branch.curveControlX;

    return `M ${startX} ${startY} Q ${controlX} ${startY} ${endX} ${curveY}`;
  };

  // Generate path for the vertical branch line
  const generateVerticalPath = (): string => {
    if (isCollapsed) {
      return `M ${branch.x} ${branch.curveStartY} L ${branch.x} ${branch.curveStartY + config.collapsedBranchHeight}`;
    }
    return `M ${branch.x} ${branch.curveStartY} L ${branch.x} ${branch.endY}`;
  };

  // Determine label position (left or right of branch)
  const isLeftBranch = branch.x < trunkX;

  return (
    <g className={styles.branch} data-state={branch.state}>
      {/* Branch curve from trunk */}
      <path
        d={generateBranchPath()}
        className={styles.branchCurve}
        style={{
          stroke: branch.color,
          strokeWidth: config.branchWidth,
        }}
      />

      {/* Vertical branch line */}
      <path
        d={generateVerticalPath()}
        className={styles.branchLine}
        style={{
          stroke: branch.color,
          strokeWidth: config.branchWidth,
        }}
      />

      {/* Branch header (group name) */}
      <g
        className={styles.branchHeader}
        transform={`translate(${branch.x}, ${branch.startY - 20})`}
        onClick={() => onToggle(branch.group.id)}
      >
        <rect
          x={isLeftBranch ? -config.labelWidth - config.labelGap : config.labelGap}
          y={-12}
          width={config.labelWidth}
          height={24}
          rx={4}
          className={styles.headerBackground}
          style={{ fill: branch.color }}
        />
        <text
          x={isLeftBranch ? -config.labelGap - config.labelWidth / 2 : config.labelGap + config.labelWidth / 2}
          y={4}
          className={styles.headerText}
          textAnchor="middle"
        >
          {branch.group.title.length > 20
            ? branch.group.title.substring(0, 20) + '...'
            : branch.group.title}
        </text>
        {/* Collapse/expand indicator */}
        <text
          x={isLeftBranch ? -config.labelGap - 8 : config.labelGap + config.labelWidth - 8}
          y={4}
          className={styles.collapseIndicator}
        >
          {isCollapsed ? '▶' : '▼'}
        </text>
      </g>

      {/* Event nodes */}
      {!isCollapsed && branch.nodes.map((node) => {
        const isSelected = selectedEventId === node.event.id;
        const nodeRadius = isSelected
          ? config.nodeRadiusSelected
          : config.nodeRadius;

        return (
          <g
            key={node.event.id}
            className={styles.nodeGroup}
            transform={`translate(${node.x}, ${node.y})`}
            onClick={() => onNodeClick(node.event.id)}
          >
            {/* Node circle */}
            <circle
              r={nodeRadius}
              className={styles.node}
              style={{
                fill: isSelected ? 'var(--color-text-accent)' : branch.color,
              }}
            />

            {/* Inner highlight */}
            <circle
              r={nodeRadius * 0.4}
              className={styles.nodeHighlight}
            />

            {/* Event label */}
            <foreignObject
              x={isLeftBranch ? -config.labelWidth - config.labelGap : config.labelGap}
              y={-20}
              width={config.labelWidth}
              height={40}
              className={styles.labelContainer}
            >
              <div className={styles.label}>
                <span className={styles.labelDate}>{node.event.date_display}</span>
                <span className={styles.labelTitle}>
                  {node.event.title.length > 30
                    ? node.event.title.substring(0, 30) + '...'
                    : node.event.title}
                </span>
              </div>
            </foreignObject>
          </g>
        );
      })}

      {/* Collapsed indicator - shows count */}
      {isCollapsed && branch.nodes.length > 0 && (
        <g
          className={styles.collapsedIndicator}
          transform={`translate(${branch.x}, ${branch.curveStartY + config.collapsedBranchHeight / 2})`}
        >
          <circle
            r={16}
            className={styles.countBubble}
            style={{ fill: branch.color }}
          />
          <text
            className={styles.countText}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {branch.nodes.length}
          </text>
        </g>
      )}
    </g>
  );
};
