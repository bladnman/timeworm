/**
 * Events List
 *
 * Scrollable, searchable list of events for edit mode.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { useTimeline } from '../../hooks/useTimeline';
import { itemVariants, itemContainerVariants } from '../../theme/motion';
import { parseISOExtended } from '../../utils/dateUtils';
import styles from './EventsList.module.css';

export const EventsList: React.FC = () => {
  const { data, selectedEventId, selectEvent, createEvent } = useTimeline();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    if (!data?.events) return [];

    const query = searchQuery.toLowerCase().trim();
    let events = [...data.events];

    // Filter by search query
    if (query) {
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.type.toLowerCase().includes(query) ||
          event.innovator?.toLowerCase().includes(query)
      );
    }

    // Sort by date
    events.sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.decimalYear - dateB.decimalYear;
    });

    return events;
  }, [data?.events, searchQuery]);

  const handleAddEvent = () => {
    // Create a new event with default values
    const newEventId = createEvent({
      title: 'New Event',
      date_display: new Date().getFullYear().toString(),
      date_start: `${new Date().getFullYear()}-01-01`,
      group_ids: [],
      type: 'Event',
      innovation: '',
      image_urls: [],
      description: '',
      metrics: {},
    });

    // Select the new event to open editor
    selectEvent(newEventId);
  };

  return (
    <div className={styles.container}>
      {/* Search */}
      <div className={styles.search}>
        <svg
          className={styles.searchIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Add button */}
      <button className={styles.addButton} onClick={handleAddEvent}>
        <svg
          className={styles.addIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
        Add Event
      </button>

      {/* Events count */}
      <span className={styles.count}>
        {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </span>

      {/* Events list */}
      {filteredEvents.length > 0 ? (
        <motion.div
          className={styles.list}
          variants={itemContainerVariants}
          initial="initial"
          animate="enter"
        >
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              className={classNames(styles.eventItem, {
                [styles.eventItemSelected]: event.id === selectedEventId,
              })}
              variants={itemVariants}
              onClick={() => selectEvent(event.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectEvent(event.id);
                }
              }}
            >
              <div className={styles.eventContent}>
                <h3 className={styles.eventTitle}>{event.title}</h3>
                <p className={styles.eventDate}>{event.date_display}</p>
              </div>
              {event.type && <span className={styles.eventType}>{event.type}</span>}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className={styles.empty}>
          {searchQuery ? `No events matching "${searchQuery}"` : 'No events yet'}
        </div>
      )}
    </div>
  );
};
