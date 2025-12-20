/**
 * Timeline Settings
 *
 * Panel for editing timeline metadata, selecting visualization,
 * and managing groups.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { useTimeline } from '../../hooks/useTimeline';
import type { ViewMode, TimelineGroup, TimelineMeta } from '../../types/timeline';
import { overlayBackdropVariants, overlayContentVariants } from '../../theme/motion';
import styles from './TimelineSettings.module.css';

/**
 * Visualization options with display info
 */
const vizOptions: { mode: ViewMode; label: string }[] = [
  { mode: 'vertical', label: 'List' },
  { mode: 'horizontal', label: 'Track' },
  { mode: 'comic', label: 'Comic' },
  { mode: 'river', label: 'River' },
  { mode: 'depthroad', label: 'Depth' },
  { mode: 'mosaic', label: 'Mosaic' },
  { mode: 'orbital', label: 'Orbital' },
  { mode: 'strata', label: 'Strata' },
  { mode: 'tree', label: 'Tree' },
  { mode: 'bikeride', label: 'Bike Ride' },
  { mode: 'train', label: 'Train' },
  { mode: 'exhibit', label: 'Exhibit' },
  { mode: 'trail', label: 'Trail' },
  { mode: 'libraryShelf', label: 'Library' },
  { mode: 'youtube', label: 'YouTube' },
];

export const TimelineSettings: React.FC = () => {
  const { data, viewMode, setViewMode, updateMeta, updateGroup, createGroup, deleteGroup } =
    useTimeline();

  // Local state for metadata editing
  const [title, setTitle] = useState(data?.meta.title ?? '');
  const [overview, setOverview] = useState(data?.meta.overview ?? '');

  // Group editing modal
  const [editingGroup, setEditingGroup] = useState<TimelineGroup | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Update metadata
  const handleMetaBlur = useCallback(
    (field: 'title' | 'overview', value: string) => {
      updateMeta({ [field]: value });
    },
    [updateMeta]
  );

  // Handle group actions
  const handleEditGroup = useCallback((group: TimelineGroup) => {
    setEditingGroup(group);
  }, []);

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      deleteGroup(groupId);
    },
    [deleteGroup]
  );

  const handleCreateGroup = useCallback(() => {
    setIsCreatingGroup(true);
    setEditingGroup({
      id: '',
      title: '',
      date_range: '',
      description: '',
    });
  }, []);

  const handleSaveGroup = useCallback(
    (group: Omit<TimelineGroup, 'id'>) => {
      if (isCreatingGroup) {
        createGroup(group);
      } else if (editingGroup) {
        updateGroup(editingGroup.id, group);
      }
      setEditingGroup(null);
      setIsCreatingGroup(false);
    },
    [isCreatingGroup, editingGroup, createGroup, updateGroup]
  );

  if (!data) return null;

  return (
    <div className={styles.container}>
      {/* Visualization picker */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Visualization</h3>
        <div className={styles.vizGrid}>
          {vizOptions.map((option) => (
            <button
              key={option.mode}
              className={classNames(styles.vizOption, {
                [styles.vizOptionSelected]: viewMode === option.mode,
              })}
              onClick={() => {
                setViewMode(option.mode);
                updateMeta({ defaultView: option.mode } as Partial<TimelineMeta>);
              }}
            >
              <svg
                className={styles.vizIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
              <span className={styles.vizLabel}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline metadata */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Timeline Info</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleMetaBlur('title', title)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Overview</label>
          <textarea
            className={classNames(styles.input, styles.textarea)}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            onBlur={() => handleMetaBlur('overview', overview)}
          />
        </div>
      </div>

      {/* Groups management */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Groups</h3>

        <div className={styles.groupsList}>
          {data.groups.map((group) => (
            <div key={group.id} className={styles.groupItem}>
              <div className={styles.groupInfo}>
                <h4 className={styles.groupTitle}>{group.title}</h4>
                <p className={styles.groupRange}>{group.date_range}</p>
              </div>
              <div className={styles.groupActions}>
                <button
                  className={styles.groupActionButton}
                  onClick={() => handleEditGroup(group)}
                  aria-label="Edit group"
                >
                  <svg
                    className={styles.groupActionIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  className={classNames(styles.groupActionButton, styles.groupActionButtonDelete)}
                  onClick={() => handleDeleteGroup(group.id)}
                  aria-label="Delete group"
                >
                  <svg
                    className={styles.groupActionIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <button className={styles.addGroupButton} onClick={handleCreateGroup}>
            <svg
              className={styles.addIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
            Add Group
          </button>
        </div>
      </div>

      {/* Group edit modal */}
      <AnimatePresence>
        {editingGroup && (
          <GroupEditModal
            group={editingGroup}
            isNew={isCreatingGroup}
            onSave={handleSaveGroup}
            onClose={() => {
              setEditingGroup(null);
              setIsCreatingGroup(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Modal for editing group details
 */
interface GroupEditModalProps {
  group: TimelineGroup;
  isNew: boolean;
  onSave: (group: Omit<TimelineGroup, 'id'>) => void;
  onClose: () => void;
}

const GroupEditModal: React.FC<GroupEditModalProps> = ({ group, isNew, onSave, onClose }) => {
  const [title, setTitle] = useState(group.title);
  const [dateRange, setDateRange] = useState(group.date_range);
  const [description, setDescription] = useState(group.description);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      date_range: dateRange,
      description,
    });
  };

  return (
    <div className={styles.groupEditModal}>
      <motion.div
        className={styles.groupEditBackdrop}
        variants={overlayBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onClose}
      />
      <motion.div
        className={styles.groupEditContent}
        variants={overlayContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h2 className={styles.groupEditTitle}>{isNew ? 'New Group' : 'Edit Group'}</h2>

        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Group title"
            autoFocus
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Date Range</label>
          <input
            type="text"
            className={styles.input}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            placeholder="e.g., 1900 - 1950"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            className={classNames(styles.input, styles.textarea)}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group description..."
          />
        </div>

        <div className={styles.groupEditActions}>
          <button className={styles.saveButton} onClick={handleSave}>
            {isNew ? 'Create' : 'Save'}
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
