/**
 * YouTube Detail Overlay
 *
 * Modal overlay showing video details with embedded YouTube player.
 * Uses YouTube's red and charcoal color scheme.
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineEvent } from '../../../../types/timeline';
import { YouTubeEmbed } from '../YouTubeEmbed/YouTubeEmbed';
import { MarkdownText } from '../../../../components/MarkdownText/MarkdownText';
import styles from './YouTubeDetailOverlay.module.css';

interface YouTubeDetailOverlayProps {
  event: TimelineEvent | null;
  onClose: () => void;
}

const overlayVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  closed: { opacity: 0, y: 20, scale: 0.95 },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 25,
      stiffness: 300,
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 }
  },
};

export const YouTubeDetailOverlay = ({ event, onClose }: YouTubeDetailOverlayProps) => {
  // Get video_id from metrics
  const videoId = event?.metrics?.video_id;
  const thumbnailUrl = event?.image_urls?.[0];

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className={styles.overlay}
          variants={overlayVariants}
          initial="closed"
          animate="open"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className={styles.panel}
            variants={panelVariants}
            initial="closed"
            animate="open"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button className={styles.closeButton} onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Video embed or thumbnail */}
            <div className={styles.videoSection}>
              {videoId ? (
                <YouTubeEmbed
                  videoId={videoId}
                  title={event.title}
                  thumbnailUrl={thumbnailUrl}
                />
              ) : thumbnailUrl ? (
                <div className={styles.thumbnailContainer}>
                  <img
                    src={thumbnailUrl}
                    alt={event.title}
                    className={styles.thumbnail}
                  />
                </div>
              ) : null}
            </div>

            {/* Content */}
            <div className={styles.content}>
              <div className={styles.date}>{event.date_display}</div>

              <h2 className={styles.title}>{event.title}</h2>

              {event.description && (
                <p className={styles.description}>{event.description}</p>
              )}

              {/* Metrics */}
              {Object.keys(event.metrics).length > 0 && (
                <div className={styles.metaSection}>
                  {Object.entries(event.metrics)
                    .filter(([key]) => key !== 'video_id') // Don't show video_id in metrics
                    .map(([key, value]) => (
                      <div key={key} className={styles.metaRow}>
                        <span className={styles.metaLabel}>{key}</span>
                        <span className={styles.metaValue}>{value}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Extended Details */}
              {event.extended_details && (
                <div className={styles.extendedDetails}>
                  {event.extended_details.landscape && (
                    <section className={styles.detailSection}>
                      <h3 className={styles.sectionTitle}>The Landscape</h3>
                      <MarkdownText
                        content={event.extended_details.landscape}
                        className={styles.sectionContent}
                      />
                    </section>
                  )}

                  {event.extended_details.historical_context && (
                    <section className={styles.detailSection}>
                      <h3 className={styles.sectionTitle}>Historical Context</h3>
                      <MarkdownText
                        content={event.extended_details.historical_context}
                        className={styles.sectionContent}
                      />
                    </section>
                  )}

                  {event.extended_details.public_sentiment && (
                    <section className={styles.detailSection}>
                      <h3 className={styles.sectionTitle}>Public Sentiment</h3>
                      <MarkdownText
                        content={event.extended_details.public_sentiment}
                        className={styles.sectionContent}
                      />
                    </section>
                  )}

                  {event.extended_details.story_being_told && (
                    <section className={styles.detailSection}>
                      <h3 className={styles.sectionTitle}>The Story Being Told</h3>
                      <MarkdownText
                        content={event.extended_details.story_being_told}
                        className={styles.sectionContent}
                      />
                    </section>
                  )}

                  {event.extended_details.notable_references && event.extended_details.notable_references.length > 0 && (
                    <section className={styles.detailSection}>
                      <h3 className={styles.sectionTitle}>Notable References</h3>
                      <ul className={styles.referencesList}>
                        {event.extended_details.notable_references.map((ref, index) => (
                          <li key={index} className={styles.referenceItem}>{ref}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}

              {/* Links */}
              {event.links?.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {link.title} <span className={styles.linkArrow}>↗</span>
                </a>
              ))}

              {/* Watch on YouTube link (if videoId exists) */}
              {videoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.youtubeLink}
                >
                  <svg className={styles.youtubeLinkIcon} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Watch on YouTube
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
