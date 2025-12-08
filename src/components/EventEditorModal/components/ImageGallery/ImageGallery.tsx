/**
 * Image Gallery
 *
 * Unified image management with hero display.
 * First image displays large, others as thumbnails.
 * Click thumbnail to make it featured.
 */

import { useState } from 'react';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  urls: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
  onReorder: (urls: string[]) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ urls, onAdd, onRemove, onReorder }) => {
  const [newUrl, setNewUrl] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAdd = () => {
    if (newUrl.trim()) {
      onAdd(newUrl.trim());
      setNewUrl('');
      setShowInput(false);
    }
  };

  const handleMakeFeatured = (index: number) => {
    if (index === 0) return;
    const newUrls = [...urls];
    const [selected] = newUrls.splice(index, 1);
    newUrls.unshift(selected);
    onReorder(newUrls);
  };

  const featuredUrl = urls[0];
  const thumbnailUrls = urls.slice(1);

  return (
    <div className={styles.container}>
      {/* Hero Image */}
      {featuredUrl && (
        <div className={styles.heroSection}>
          <div className={styles.heroCard}>
            <img src={featuredUrl} alt="Featured" className={styles.heroImage} />
            <button
              className={styles.removeButton}
              onClick={() => onRemove(0)}
              title="Remove image"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={styles.removeIcon}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className={styles.featuredBadge}>Featured</span>
          </div>
        </div>
      )}

      {/* Thumbnails */}
      {thumbnailUrls.length > 0 && (
        <div className={styles.thumbnailGrid}>
          {thumbnailUrls.map((url, index) => (
            <button
              key={index + 1}
              className={styles.thumbnailCard}
              onClick={() => handleMakeFeatured(index + 1)}
              title="Click to make featured"
            >
              <img src={url} alt={`Image ${index + 2}`} className={styles.thumbnailImage} />
              <button
                className={styles.thumbnailRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index + 1);
                }}
                title="Remove image"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={styles.removeIcon}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Add Image */}
      {showInput ? (
        <div className={styles.inputRow}>
          <input
            type="url"
            className={styles.urlInput}
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="https://example.com/image.jpg"
            autoFocus
          />
          <button className={styles.addButton} onClick={handleAdd}>
            Add
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => {
              setNewUrl('');
              setShowInput(false);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button className={styles.addImageButton} onClick={() => setShowInput(true)}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.addIcon}
          >
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Add image URL
        </button>
      )}
    </div>
  );
};
