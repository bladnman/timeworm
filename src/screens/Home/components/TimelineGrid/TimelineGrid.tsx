/**
 * Timeline Grid
 *
 * Animated grid layout for timeline cards.
 * Staggered entrance animation.
 */

import { motion } from 'framer-motion';
import type { TimelineManifestEntry } from '../../../../../data/manifest';
import { cardContainerVariants } from '../../../../theme/motion';
import { TimelineCard } from '../TimelineCard/TimelineCard';
import styles from './TimelineGrid.module.css';

interface TimelineGridProps {
  timelines: TimelineManifestEntry[];
  hasLocalEdits: (id: string) => boolean;
}

export const TimelineGrid: React.FC<TimelineGridProps> = ({ timelines, hasLocalEdits }) => {
  return (
    <motion.div
      className={styles.grid}
      variants={cardContainerVariants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {timelines.map((timeline) => (
        <TimelineCard
          key={timeline.id}
          timeline={timeline}
          hasEdits={hasLocalEdits(timeline.id)}
        />
      ))}
    </motion.div>
  );
};
