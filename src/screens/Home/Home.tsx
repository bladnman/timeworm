/**
 * Home Screen
 *
 * The timeline library - where the journey begins.
 * Displays all available timelines as animated cards.
 */

import { motion } from 'framer-motion';
import { useTimelineLibrary } from '../../hooks/useTimelineLibrary';
import { screenVariants } from '../../theme/motion';
import { TimelineGrid } from './components/TimelineGrid/TimelineGrid';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const { manifest, isLoadingManifest } = useTimelineLibrary();

  return (
    <motion.div
      className={styles.container}
      variants={screenVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      <header className={styles.header}>
        <div className={styles.brand}>
          <motion.div
            className={styles.logo}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          >
            {/* Worm icon - SVG inline for simplicity */}
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 24C8 24 12 16 18 16C24 16 24 32 30 32C36 32 40 24 40 24"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                style={{ color: 'var(--color-text-accent)' }}
              />
              <circle cx="40" cy="24" r="3" fill="var(--color-text-accent)" />
            </svg>
          </motion.div>
          <h1 className={styles.title}>TimeWorm</h1>
        </div>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Experience time through beautifully crafted visualizations. Select a timeline to begin
          your journey.
        </motion.p>
      </header>

      <div className={styles.gridContainer}>
        {isLoadingManifest ? (
          <div className={styles.loading}>Loading timelines...</div>
        ) : (
          <TimelineGrid timelines={manifest} />
        )}
      </div>
    </motion.div>
  );
};
