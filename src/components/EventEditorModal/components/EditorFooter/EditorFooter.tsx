/**
 * Editor Footer
 *
 * Save status indicator only.
 * Delete action moved to DeleteZone at bottom of scroll area.
 */

import type { SaveStatus } from '../../hooks/useEventForm';
import styles from './EditorFooter.module.css';

interface EditorFooterProps {
  saveStatus: SaveStatus;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({ saveStatus }) => {
  return (
    <footer className={styles.footer}>
      <SaveIndicator status={saveStatus} />
    </footer>
  );
};

const SaveIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
  if (status === 'idle') return null;

  return (
    <div className={styles.saveIndicator}>
      {(status === 'pending' || status === 'saving') && (
        <>
          <svg className={styles.savingIcon} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" fillOpacity="0.3" />
          </svg>
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <svg
            className={styles.savedIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <svg
            className={styles.errorIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Save failed</span>
        </>
      )}
    </div>
  );
};
