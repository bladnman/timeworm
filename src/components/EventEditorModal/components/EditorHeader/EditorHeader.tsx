/**
 * Editor Header
 *
 * Minimal header with close button.
 */

import styles from './EditorHeader.module.css';

interface EditorHeaderProps {
  onClose: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ onClose }) => {
  return (
    <header className={styles.header}>
      <div className={styles.spacer} />
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close editor"
      >
        <svg
          className={styles.closeIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>
  );
};
