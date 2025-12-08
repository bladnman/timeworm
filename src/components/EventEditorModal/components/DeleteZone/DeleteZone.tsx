/**
 * Delete Zone
 *
 * Destructive action placed at the bottom of the editor.
 * User must scroll to find it - intentionally de-emphasized.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DeleteZone.module.css';

interface DeleteZoneProps {
  onDelete: () => void;
}

export const DeleteZone: React.FC<DeleteZoneProps> = ({ onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className={styles.deleteZone}>
      <AnimatePresence mode="wait">
        {showConfirm ? (
          <motion.div
            key="confirm"
            className={styles.confirmContainer}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
          >
            <span className={styles.confirmText}>Delete this event?</span>
            <div className={styles.confirmActions}>
              <button className={styles.confirmDelete} onClick={onDelete}>
                Delete
              </button>
              <button
                className={styles.confirmCancel}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
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
  );
};
