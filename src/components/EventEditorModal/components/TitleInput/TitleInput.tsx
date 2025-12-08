/**
 * Title Input
 *
 * Large, prominent title input with auto-expanding behavior.
 */

import { useEffect, useRef } from 'react';
import styles from './TitleInput.module.css';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const TitleInput: React.FC<TitleInputProps> = ({ value, onChange, error }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      inputRef.current.selectionStart = inputRef.current.value.length;
    }
  }, []);

  // Auto-resize
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className={styles.container}>
      <textarea
        ref={inputRef}
        id="event-editor-title"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Event title"
        rows={1}
        aria-invalid={!!error}
        aria-describedby={error ? 'title-error' : undefined}
      />
      {error && (
        <span id="title-error" className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
};
