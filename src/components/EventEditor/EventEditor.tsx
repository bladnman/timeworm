/**
 * Event Editor
 *
 * Form for editing event details.
 * Supports all event schema fields.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { useTimeline } from '../../hooks/useTimeline';
import { deleteVariants } from '../../theme/motion';
import styles from './EventEditor.module.css';

interface EventEditorProps {
  eventId: string;
}

export const EventEditor: React.FC<EventEditorProps> = ({ eventId }) => {
  const { data, updateEvent, deleteEvent, selectEvent } = useTimeline();

  // Find the event
  const event = data?.events.find((e) => e.id === eventId);
  const groups = data?.groups ?? [];

  // Local form state
  const [title, setTitle] = useState('');
  const [dateDisplay, setDateDisplay] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [innovator, setInnovator] = useState('');
  const [innovation, setInnovation] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDateDisplay(event.date_display);
      setDateStart(event.date_start);
      setDateEnd(event.date_end ?? '');
      setDescription(event.description);
      setType(event.type);
      setInnovator(event.innovator ?? '');
      setInnovation(event.innovation);
      setSelectedGroups(event.group_ids);
      setShowDeleteConfirm(false);
      setErrors({});
    }
  }, [event]);

  // Validate and save field
  const saveField = useCallback(
    (field: string, value: string | string[] | undefined) => {
      // Validate required fields
      if (field === 'title' && typeof value === 'string' && !value.trim()) {
        setErrors((prev) => ({ ...prev, title: 'Title is required' }));
        return;
      }

      if (field === 'date_start' && typeof value === 'string' && !value.trim()) {
        setErrors((prev) => ({ ...prev, date_start: 'Start date is required' }));
        return;
      }

      // Clear error for this field
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });

      // Update event - handle undefined for optional fields
      if (value === undefined) {
        updateEvent(eventId, { [field]: undefined });
      } else {
        updateEvent(eventId, { [field]: value });
      }
    },
    [eventId, updateEvent]
  );

  // Toggle group selection
  const toggleGroup = useCallback(
    (groupId: string) => {
      const newGroups = selectedGroups.includes(groupId)
        ? selectedGroups.filter((id) => id !== groupId)
        : [...selectedGroups, groupId];

      setSelectedGroups(newGroups);
      saveField('group_ids', newGroups);
    },
    [selectedGroups, saveField]
  );

  // Handle delete
  const handleDelete = useCallback(() => {
    deleteEvent(eventId);
    selectEvent(null);
  }, [eventId, deleteEvent, selectEvent]);

  if (!event) {
    return <div className={styles.container}>Event not found</div>;
  }

  return (
    <div className={styles.container}>
      {/* Title */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Title</label>
        <input
          type="text"
          className={classNames(styles.input, { [styles.inputError]: errors.title })}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => saveField('title', title)}
          placeholder="Event title"
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </div>

      {/* Dates */}
      <div className={styles.dateRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Start Date</label>
          <input
            type="text"
            className={classNames(styles.input, { [styles.inputError]: errors.date_start })}
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            onBlur={() => saveField('date_start', dateStart)}
            placeholder="YYYY-MM-DD"
          />
          {errors.date_start && <span className={styles.error}>{errors.date_start}</span>}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            End Date <span className={styles.labelOptional}>(optional)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            onBlur={() => saveField('date_end', dateEnd || undefined)}
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>

      {/* Display date */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Display Date</label>
        <input
          type="text"
          className={styles.input}
          value={dateDisplay}
          onChange={(e) => setDateDisplay(e.target.value)}
          onBlur={() => saveField('date_display', dateDisplay)}
          placeholder="e.g., June 12, 1817"
        />
      </div>

      {/* Description */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Description</label>
        <textarea
          className={classNames(styles.input, styles.textarea)}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => saveField('description', description)}
          placeholder="Event description..."
        />
      </div>

      {/* Type, Innovator, Innovation */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Details</h3>

        <div className={styles.formGroup}>
          <label className={styles.label}>Type</label>
          <input
            type="text"
            className={styles.input}
            value={type}
            onChange={(e) => setType(e.target.value)}
            onBlur={() => saveField('type', type)}
            placeholder="e.g., Invention, Event, Discovery"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Innovator <span className={styles.labelOptional}>(optional)</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={innovator}
            onChange={(e) => setInnovator(e.target.value)}
            onBlur={() => saveField('innovator', innovator || undefined)}
            placeholder="Person or organization"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Innovation</label>
          <input
            type="text"
            className={styles.input}
            value={innovation}
            onChange={(e) => setInnovation(e.target.value)}
            onBlur={() => saveField('innovation', innovation)}
            placeholder="What was created/discovered"
          />
        </div>
      </div>

      {/* Groups */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Groups</h3>

        <div className={styles.groupSelector}>
          {groups.map((group) => (
            <button
              key={group.id}
              className={classNames(styles.groupChip, {
                [styles.groupChipSelected]: selectedGroups.includes(group.id),
              })}
              onClick={() => toggleGroup(group.id)}
            >
              {selectedGroups.includes(group.id) ? (
                <svg
                  className={styles.groupChipIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  className={styles.groupChipIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              )}
              {group.title}
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <div className={styles.actions}>
        {showDeleteConfirm ? (
          <motion.div
            className={styles.deleteConfirm}
            variants={deleteVariants}
            initial="initial"
            animate="enter"
          >
            <p className={styles.deleteConfirmText}>
              Are you sure you want to delete this event? This cannot be undone.
            </p>
            <div className={styles.deleteConfirmButtons}>
              <button className={styles.confirmDeleteButton} onClick={handleDelete}>
                Delete
              </button>
              <button
                className={styles.cancelDeleteButton}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <button className={styles.deleteButton} onClick={() => setShowDeleteConfirm(true)}>
            <svg
              className={styles.deleteIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Event
          </button>
        )}
      </div>
    </div>
  );
};
