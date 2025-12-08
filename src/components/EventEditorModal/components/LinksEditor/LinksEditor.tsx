/**
 * Links Editor
 *
 * Manage array of title/URL pairs.
 */

import { useState } from 'react';
import type { TimelineEventLink } from '../../../../types/timeline';
import styles from './LinksEditor.module.css';

interface LinksEditorProps {
  links: TimelineEventLink[];
  onAdd: (link: TimelineEventLink) => void;
  onUpdate: (index: number, link: TimelineEventLink) => void;
  onRemove: (index: number) => void;
}

export const LinksEditor: React.FC<LinksEditorProps> = ({
  links,
  onAdd,
  onUpdate,
  onRemove,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (newTitle.trim() && newUrl.trim()) {
      onAdd({ title: newTitle.trim(), url: newUrl.trim() });
      setNewTitle('');
      setNewUrl('');
      setShowAdd(false);
    }
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Links</h4>

      {links.length > 0 && (
        <div className={styles.list}>
          {links.map((link, index) => (
            <div key={index} className={styles.row}>
              <input
                type="text"
                className={styles.titleInput}
                defaultValue={link.title}
                onBlur={(e) => onUpdate(index, { ...link, title: e.target.value })}
                placeholder="Title"
              />
              <input
                type="url"
                className={styles.urlInput}
                defaultValue={link.url}
                onBlur={(e) => onUpdate(index, { ...link, url: e.target.value })}
                placeholder="https://..."
              />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.openButton}
                title="Open link"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={styles.openIcon}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <button
                className={styles.removeButton}
                onClick={() => onRemove(index)}
                title="Remove link"
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
            className={styles.titleInput}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            autoFocus
          />
          <input
            type="url"
            className={styles.urlInput}
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="https://..."
          />
          <button className={styles.confirmButton} onClick={handleAdd}>
            Add
          </button>
          <button
            className={styles.cancelButton}
            onClick={() => {
              setNewTitle('');
              setNewUrl('');
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
          Add link
        </button>
      )}
    </div>
  );
};
