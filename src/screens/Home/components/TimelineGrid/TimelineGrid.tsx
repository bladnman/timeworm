/**
 * Timeline Grid
 *
 * Animated grid layout for timeline cards.
 * Staggered entrance animation.
 */

import { motion } from 'framer-motion';
import type { TimelineManifestEntry } from '../../../../hooks/useTimelineLibrary';
import { cardContainerVariants } from '../../../../theme/motion';
import { TimelineCard } from '../TimelineCard/TimelineCard';
import styles from './TimelineGrid.module.css';

interface TimelineGridProps {
  timelines: TimelineManifestEntry[];
}

export const TimelineGrid: React.FC<TimelineGridProps> = ({ timelines }) => {
  return (
    <motion.div
      className={styles.grid}
      variants={cardContainerVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {timelines.map((timeline) => (
        <TimelineCard key={timeline.id} timeline={timeline} />
      ))}
    </motion.div>
  );
};
