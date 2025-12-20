import { memo, useState } from 'react';
import styles from './YouTubeEmbed.module.css';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
}

/**
 * YouTube video embed with thumbnail preview.
 *
 * Shows thumbnail with play button initially, loads iframe on click.
 * This provides better performance and respects user privacy.
 */
export const YouTubeEmbed = memo(function YouTubeEmbed({
  videoId,
  title,
  thumbnailUrl,
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Use provided thumbnail or default YouTube thumbnail
  const thumbnail = thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  if (isPlaying) {
    return (
      <div className={styles.container}>
        <iframe
          className={styles.iframe}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.thumbnailButton}
        onClick={handlePlay}
        aria-label={`Play ${title}`}
      >
        <img
          src={thumbnail}
          alt={title}
          className={styles.thumbnail}
          loading="lazy"
        />
        <div className={styles.playButtonOverlay}>
          <div className={styles.playButton}>
            <svg viewBox="0 0 68 48" className={styles.playButtonSvg}>
              {/* YouTube play button shape */}
              <path
                className={styles.playButtonBg}
                d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
              />
              <path className={styles.playButtonIcon} d="M 45,24 27,14 27,34" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
});
