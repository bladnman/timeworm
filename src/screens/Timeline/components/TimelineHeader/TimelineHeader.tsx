/**
 * Timeline Header
 *
 * Navigation bar for the timeline screen.
 * Contains back button, title, and edit mode toggle.
 */

import { motion } from 'framer-motion';
import classNames from 'classnames';
import { useApp } from '../../../../hooks/useApp';
import { useTimeline } from '../../../../hooks/useTimeline';
import { buttonVariants } from '../../../../theme/motion';
import styles from './TimelineHeader.module.css';

interface TimelineHeaderProps {
  title: string;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ title }) => {
  const { navigateToHome, timelineMode, toggleEditMode } = useApp();
  const { isDirty } = useTimeline();

  const isEditMode = timelineMode === 'edit';

  return (
    <motion.header
      className={styles.header}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <div className={styles.left}>
        {/* Back button */}
        <motion.button
          className={styles.backButton}
          onClick={navigateToHome}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Back to library"
        >
          <svg
            className={styles.backIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </motion.button>

        {/* Title */}
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        {/* Dirty indicator */}
        {isDirty && (
          <motion.div
            className={styles.dirtyIndicator}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className={styles.dirtyDot} />
            <span>Unsaved</span>
          </motion.div>
        )}

        {/* Edit mode toggle */}
        <motion.button
          className={classNames(styles.modeToggle, {
            [styles.modeToggleActive]: isEditMode,
          })}
          onClick={toggleEditMode}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
          aria-pressed={isEditMode}
        >
          {isEditMode ? (
            <>
              <svg
                className={styles.modeIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>View</span>
            </>
          ) : (
            <>
              <svg
                className={styles.modeIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
              <span>Edit</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
};
