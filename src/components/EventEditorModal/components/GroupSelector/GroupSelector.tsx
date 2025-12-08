/**
 * Group Selector
 *
 * Tag-style multi-select for group assignment.
 */

import classNames from 'classnames';
import type { TimelineGroup } from '../../../../types/timeline';
import styles from './GroupSelector.module.css';

interface GroupSelectorProps {
  groups: TimelineGroup[];
  selectedIds: string[];
  onToggle: (groupId: string) => void;
}

export const GroupSelector: React.FC<GroupSelectorProps> = ({
  groups,
  selectedIds,
  onToggle,
}) => {
  if (groups.length === 0) {
    return (
      <div className={styles.container}>
        <label className={styles.label}>Groups</label>
        <p className={styles.empty}>No groups defined</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>Groups</label>
      <div className={styles.chips}>
        {groups.map((group) => {
          const isSelected = selectedIds.includes(group.id);
          return (
            <button
              key={group.id}
              className={classNames(styles.chip, {
                [styles.chipSelected]: isSelected,
              })}
              onClick={() => onToggle(group.id)}
              title={group.description}
            >
              {isSelected ? (
                <svg
                  className={styles.chipIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  className={styles.chipIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              )}
              {group.title}
            </button>
          );
        })}
      </div>
    </div>
  );
};
