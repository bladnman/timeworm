/**
 * Date Chips
 *
 * Inline date editors as pill-style chips.
 */

import { useState } from 'react';
import classNames from 'classnames';
import styles from './DateChips.module.css';

interface DateChipsProps {
  dateStart: string;
  dateEnd: string;
  dateDisplay: string;
  onDateStartChange: (value: string) => void;
  onDateEndChange: (value: string) => void;
  onDateDisplayChange: (value: string) => void;
  errors?: Record<string, string>;
}

export const DateChips: React.FC<DateChipsProps> = ({
  dateStart,
  dateEnd,
  dateDisplay,
  onDateStartChange,
  onDateEndChange,
  onDateDisplayChange,
  errors,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      {/* Display Date */}
      <div className={styles.chipGroup}>
        <label className={styles.chipLabel}>Display</label>
        {editingField === 'display' ? (
          <input
            type="text"
            className={styles.chipInput}
            value={dateDisplay}
            onChange={(e) => onDateDisplayChange(e.target.value)}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
            autoFocus
            placeholder="e.g., June 12, 1817"
          />
        ) : (
          <button
            className={styles.chip}
            onClick={() => setEditingField('display')}
          >
            {dateDisplay || 'Set display date'}
          </button>
        )}
      </div>

      {/* Start Date */}
      <div className={styles.chipGroup}>
        <label className={styles.chipLabel}>Start</label>
        {editingField === 'start' ? (
          <input
            type="text"
            className={classNames(styles.chipInput, {
              [styles.chipInputError]: errors?.date_start,
            })}
            value={dateStart}
            onChange={(e) => onDateStartChange(e.target.value)}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
            autoFocus
            placeholder="YYYY-MM-DD"
          />
        ) : (
          <button
            className={classNames(styles.chip, {
              [styles.chipError]: errors?.date_start,
            })}
            onClick={() => setEditingField('start')}
          >
            {dateStart || 'Set start date'}
          </button>
        )}
        {errors?.date_start && (
          <span className={styles.error}>{errors.date_start}</span>
        )}
      </div>

      {/* End Date */}
      <div className={styles.chipGroup}>
        <label className={styles.chipLabel}>End</label>
        {editingField === 'end' ? (
          <input
            type="text"
            className={styles.chipInput}
            value={dateEnd}
            onChange={(e) => onDateEndChange(e.target.value)}
            onBlur={() => setEditingField(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
            autoFocus
            placeholder="YYYY-MM-DD"
          />
        ) : (
          <button
            className={classNames(styles.chip, styles.chipOptional)}
            onClick={() => setEditingField('end')}
          >
            {dateEnd || 'Optional'}
          </button>
        )}
      </div>
    </div>
  );
};
