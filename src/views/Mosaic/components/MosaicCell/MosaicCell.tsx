import type { MosaicCell as MosaicCellType } from '../../hooks/useMosaicView';
import styles from './MosaicCell.module.css';

interface MosaicCellProps {
  cell: MosaicCellType;
  size: number;
  color: string;
  isSelected: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export const MosaicCell = ({
  cell,
  size,
  color,
  isSelected,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: MosaicCellProps) => {
  const hasEvents = cell.eventCount > 0;
  const showCount = cell.eventCount > 1 && size >= 40;

  return (
    <div
      className={`${styles.cell} ${hasEvents ? styles.hasEvents : ''} ${isSelected ? styles.selected : ''} ${isHovered ? styles.hovered : ''}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      role="gridcell"
      aria-label={`${cell.label}: ${cell.eventCount} event${cell.eventCount !== 1 ? 's' : ''}`}
      tabIndex={hasEvents ? 0 : -1}
    >
      {showCount && (
        <span className={styles.count}>{cell.eventCount}</span>
      )}
      {cell.eventCount === 1 && size >= 40 && (
        <span className={styles.dot} />
      )}
    </div>
  );
};
