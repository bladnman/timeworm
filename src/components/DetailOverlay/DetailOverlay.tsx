/**
 * Detail Overlay
 *
 * Right-side panel showing event details when selected.
 * Now uses Framer Motion for animations.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTimeline } from '../../hooks/useTimeline';
import { panelRightVariants, itemVariants, itemContainerVariants } from '../../theme/motion';
import styles from './DetailOverlay.module.css';

export const DetailOverlay = () => {
  const { data, selectedEventId, selectEvent } = useTimeline();

  const event = data?.events.find((e) => e.id === selectedEventId);

  return (
    <AnimatePresence>
      {selectedEventId && event && (
        <motion.div
          className={styles.overlay}
          variants={panelRightVariants}
          initial="closed"
          animate="open"
          exit="exit"
        >
          <motion.div
            className={styles.header}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button className={styles.closeButton} onClick={() => selectEvent(null)}>
              Close
            </button>
          </motion.div>

          <motion.div
            className={styles.content}
            variants={itemContainerVariants}
            initial="initial"
            animate="enter"
          >
            <motion.div variants={itemVariants} className={styles.date}>
              {event.date_display}
            </motion.div>

            <motion.h2 variants={itemVariants} className={styles.title}>
              {event.title}
            </motion.h2>

            {event.image_urls.length > 0 && (
              <motion.img
                variants={itemVariants}
                src={event.image_urls[0]}
                alt={event.title}
                className={styles.image}
              />
            )}

            <motion.p variants={itemVariants} className={styles.description}>
              {event.description}
            </motion.p>

            <motion.div variants={itemVariants} className={styles.metaSection}>
              {Object.entries(event.metrics).map(([key, value]) => (
                <div key={key} className={styles.metaRow}>
                  <span className={styles.metaLabel}>{key}</span>
                  <span className={styles.metaValue}>{value}</span>
                </div>
              ))}
            </motion.div>

            {event.links?.map((link) => (
              <motion.a
                key={link.url}
                variants={itemVariants}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {link.title} →
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
