/**
 * Image Gallery
 *
 * Display and manage image URLs.
 */

import { useState } from 'react';
import styles from './ImageGallery.module.css';

interface ImageGalleryProps {
  urls: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ urls, onAdd, onRemove }) => {
  const [newUrl, setNewUrl] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleAdd = () => {
    if (newUrl.trim()) {
      onAdd(newUrl.trim());
      setNewUrl('');
      setShowInput(false);
    }
  };

  return (
    <div className={styles.container}>
      {urls.length > 0 && (
        <div className={styles.grid}>
          {urls.map((url, index) => (
            <div key={index} className={styles.imageCard}>
              <img src={url} alt={`Image ${index + 1}`} className={styles.image} />
              <button
                className={styles.removeButton}
                onClick={() => onRemove(index)}
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
              {index === 0 && <span className={styles.featuredBadge}>Featured</span>}
            </div>
          ))}
        </div>
      )}

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
