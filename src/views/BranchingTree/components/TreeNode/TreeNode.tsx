import type { TreeNode as TreeNodeType } from '../../hooks/useBranchingTree';
import { BRANCHING_TREE_CONFIG } from '../../hooks/constants';
import styles from './TreeNode.module.css';

interface TreeNodeProps {
  node: TreeNodeType;
  onNodeClick: (eventId: string) => void;
  isSelected: boolean;
  color?: string;
}

/**
 * Renders a single event node on the trunk or as a standalone element.
 * Used for events that don't belong to any branch.
 */
export const TreeNode = ({
  node,
  onNodeClick,
  isSelected,
  color = 'var(--color-text-accent)',
}: TreeNodeProps) => {
  const config = BRANCHING_TREE_CONFIG;
  const nodeRadius = isSelected ? config.nodeRadiusSelected : config.nodeRadius;

  return (
    <g
      className={styles.nodeGroup}
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => onNodeClick(node.event.id)}
    >
      {/* Outer glow for selected state */}
      {isSelected && (
        <circle
          r={nodeRadius + 6}
          className={styles.selectedGlow}
        />
      )}

      {/* Node circle */}
      <circle
        r={nodeRadius}
        className={styles.node}
        style={{
          fill: isSelected ? 'var(--color-text-accent)' : color,
        }}
      />

      {/* Inner highlight */}
      <circle
        r={nodeRadius * 0.35}
        className={styles.nodeHighlight}
      />

      {/* Label - positioned to the right of trunk nodes */}
      <foreignObject
        x={config.labelGap}
        y={-20}
        width={config.labelWidth}
        height={40}
        className={styles.labelContainer}
      >
        <div className={styles.label}>
          <span className={styles.labelDate}>{node.event.date_display}</span>
          <span className={styles.labelTitle}>
            {node.event.title.length > 28
              ? node.event.title.substring(0, 28) + '...'
              : node.event.title}
          </span>
        </div>
      </foreignObject>
    </g>
  );
};
