/**
 * Metrics Editor
 *
 * Dynamic key-value pair editor for event metrics.
 */

import { useState } from 'react';
import styles from './MetricsEditor.module.css';

interface MetricsEditorProps {
  metrics: Record<string, string>;
  onUpdate: (key: string, value: string, oldKey?: string) => void;
  onRemove: (key: string) => void;
}

export const MetricsEditor: React.FC<MetricsEditorProps> = ({
  metrics,
  onUpdate,
  onRemove,
}) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const entries = Object.entries(metrics);

  const handleAdd = () => {
    if (newKey.trim() && newValue.trim()) {
      onUpdate(newKey.trim(), newValue.trim());
      setNewKey('');
      setNewValue('');
      setShowAdd(false);
    }
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Metrics</h4>

      {entries.length > 0 && (
        <div className={styles.list}>
          {entries.map(([key, value]) => (
            <div key={key} className={styles.row}>
              <input
                type="text"
                className={styles.keyInput}
                defaultValue={key}
                onBlur={(e) => {
                  if (e.target.value !== key) {
                    onUpdate(e.target.value, value, key);
                  }
                }}
                placeholder="Key"
              />
              <input
                type="text"
                className={styles.valueInput}
                defaultValue={value}
                onBlur={(e) => onUpdate(key, e.target.value)}
                placeholder="Value"
              />
              <button
                className={styles.removeButton}
                onClick={() => onRemove(key)}
                title="Remove metric"
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
            </div>
          ))}
        </div>
      )}

      {showAdd ? (
        <div className={styles.addRow}>
          <input
            type="text"
            className={styles.keyInput}
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key"
            autoFocus
          />
          <input
            type="text"
            className={styles.valueInput}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Value"
          />
          <button className={styles.confirmButton} onClick={handleAdd}>
            Add
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => {
              setNewKey('');
              setNewValue('');
              setShowAdd(false);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button className={styles.addButton} onClick={() => setShowAdd(true)}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.addIcon}
          >
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          Add metric
        </button>
      )}
    </div>
  );
};
