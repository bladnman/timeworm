/**
 * Editor Footer
 *
 * Delete button and save status indicator.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SaveStatus } from '../../hooks/useEventForm';
import styles from './EditorFooter.module.css';

interface EditorFooterProps {
  onDelete: () => void;
  saveStatus: SaveStatus;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({ onDelete, saveStatus }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <AnimatePresence mode="wait">
          {showConfirm ? (
            <motion.div
              key="confirm"
              className={styles.confirmContainer}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <span className={styles.confirmText}>Delete this event?</span>
              <button className={styles.confirmDelete} onClick={onDelete}>
                Delete
              </button>
              <button
                className={styles.confirmCancel}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="delete"
              className={styles.deleteButton}
              onClick={() => setShowConfirm(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={styles.deleteIcon}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Event
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.right}>
        <SaveIndicator status={saveStatus} />
      </div>
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
