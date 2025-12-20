/**
 * Timeline Screen
 *
 * Container for timeline visualization with view/edit modes.
 * Manages loading timeline data and rendering the appropriate view.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { useApp } from '../../hooks/useApp';
import { useTimeline } from '../../hooks/useTimeline';
import { useTimelineLibrary } from '../../hooks/useTimelineLibrary';
import { screenForwardVariants } from '../../theme/motion';
import { TimelineHeader } from './components/TimelineHeader/TimelineHeader';
import { VisualizationCanvas } from './components/VisualizationCanvas/VisualizationCanvas';
import { EditDrawer } from '../../components/EditDrawer/EditDrawer';
import styles from './TimelineScreen.module.css';

export const TimelineScreen: React.FC = () => {
  const { selectedTimelineId, timelineMode, navigateToHome } = useApp();
  const { loadTimeline, loadingId, error } = useTimelineLibrary();
  const { setData, data, viewMode } = useTimeline();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load timeline data when screen mounts or timeline changes
  useEffect(() => {
    if (!selectedTimelineId) return;

    const load = async () => {
      try {
        const timelineData = await loadTimeline(selectedTimelineId);
        setData(timelineData);
        setIsInitialLoad(false);
      } catch {
        // Error is captured in useTimelineLibrary
        setIsInitialLoad(false);
      }
    };

    load();
  }, [selectedTimelineId, loadTimeline, setData]);

  const isLoading = loadingId === selectedTimelineId || (isInitialLoad && !data);
  const isEditMode = timelineMode === 'edit';

  // Show loading state
  if (isLoading) {
    return (
      <motion.div
        className={styles.container}
        variants={screenForwardVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Loading timeline...</span>
        </div>
      </motion.div>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <motion.div
        className={styles.container}
        variants={screenForwardVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <div className={styles.error}>
          <svg
            className={styles.errorIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h2 className={styles.errorTitle}>Failed to load timeline</h2>
          <p className={styles.errorMessage}>{error || 'Timeline data not found'}</p>
          <button className={styles.backButton} onClick={navigateToHome}>
            Back to Library
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      data-view={viewMode}
      variants={screenForwardVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      layoutId={selectedTimelineId ? `timeline-${selectedTimelineId}` : undefined}
    >
      {/* Navigation header */}
      <TimelineHeader title={data.meta.title} />

      {/* Visualization canvas */}
      <div
        className={classNames(styles.canvas, {
          [styles.canvasWithDrawer]: isEditMode,
        })}
      >
        <VisualizationCanvas />
      </div>

      {/* Edit drawer */}
      <EditDrawer />
    </motion.div>
  );
};
