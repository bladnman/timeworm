/**
 * Edit Drawer
 *
 * Sliding panel for timeline settings and event list.
 * Event editing is now handled by EventEditorModal.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { useApp } from '../../hooks/useApp';
import { useTimeline } from '../../hooks/useTimeline';
import { useAutoSave, type SaveStatus } from '../../hooks/useAutoSave';
import { panelRightVariants } from '../../theme/motion';
import { EventsList } from '../EventsList/EventsList';
import { TimelineSettings } from '../TimelineSettings/TimelineSettings';
import styles from './EditDrawer.module.css';

type DrawerTab = 'events' | 'settings';

export const EditDrawer: React.FC = () => {
  const { timelineMode, exitEditMode, selectedTimelineId } = useApp();
  const { data, isDirty, markClean } = useTimeline();
  const [activeTab, setActiveTab] = useState<DrawerTab>('events');

  // Auto-save
  const { status: saveStatus } = useAutoSave({
    timelineId: selectedTimelineId,
    data,
    isDirty,
    onSaved: markClean,
  });

  const isOpen = timelineMode === 'edit';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          className={styles.drawer}
          variants={panelRightVariants}
          initial="closed"
          animate="open"
          exit="exit"
        >
          {/* Header */}
          <header className={styles.header}>
            <div>
              <h2 className={styles.headerTitle}>Edit Timeline</h2>
            </div>
            <button
              className={styles.closeButton}
              onClick={exitEditMode}
              aria-label="Exit edit mode"
            >
              <svg
                className={styles.closeIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={classNames(styles.tab, {
                [styles.tabActive]: activeTab === 'events',
              })}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
            <button
              className={classNames(styles.tab, {
                [styles.tabActive]: activeTab === 'settings',
              })}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {activeTab === 'events' ? <EventsList /> : <TimelineSettings />}
          </div>

          {/* Save indicator */}
          <SaveIndicator status={saveStatus} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

/**
 * Save status indicator
 */
const SaveIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
  if (status === 'idle') return null;

  return (
    <div
      className={classNames(styles.saveIndicator, {
        [styles.saveIndicatorPending]: status === 'pending' || status === 'saving',
        [styles.saveIndicatorError]: status === 'error',
      })}
    >
      {status === 'pending' && (
        <>
          <svg className={styles.saveIcon} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fillOpacity="0.3" />
          </svg>
          <span>Saving...</span>
        </>
      )}
      {status === 'saving' && (
        <>
          <svg className={styles.saveIcon} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fillOpacity="0.3" />
          </svg>
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <svg
            className={styles.saveIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <svg
            className={styles.saveIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Save failed</span>
        </>
      )}
    </div>
  );
};
