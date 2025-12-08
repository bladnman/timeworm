/**
 * useEventForm Hook
 *
 * Manages form state for event editing with auto-save.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import type { TimelineEventLink } from '../../../types/timeline';

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface FormState {
  title: string;
  date_start: string;
  date_end: string;
  date_display: string;
  description: string;
  type: string;
  innovator: string;
  innovation: string;
  group_ids: string[];
  image_urls: string[];
  metrics: Record<string, string>;
  links: TimelineEventLink[];
  errors?: Record<string, string>;
}

const createFormFromEvent = (event: {
  title: string;
  date_start: string;
  date_end?: string;
  date_display: string;
  description: string;
  type: string;
  innovator?: string;
  innovation: string;
  group_ids: string[];
  image_urls?: string[];
  metrics?: Record<string, string>;
  links?: TimelineEventLink[];
}): FormState => ({
  title: event.title,
  date_start: event.date_start,
  date_end: event.date_end ?? '',
  date_display: event.date_display,
  description: event.description,
  type: event.type,
  innovator: event.innovator ?? '',
  innovation: event.innovation,
  group_ids: event.group_ids,
  image_urls: event.image_urls ?? [],
  metrics: event.metrics ?? {},
  links: event.links ?? [],
  errors: {},
});

export const useEventForm = (eventId: string | null) => {
  const { data, updateEvent, deleteEvent, selectEvent } = useTimeline();

  const event = useMemo(
    () => (eventId ? data?.events.find((e) => e.id === eventId) : null),
    [eventId, data?.events]
  );

  // Derive initial form directly from event - this is computed on each render
  // but useState only uses the initial value on mount
  const initialForm = event ? createFormFromEvent(event) : null;

  // Use eventId as a key to reset state when switching events
  // This works because the parent component should remount this hook with a new key
  const [formState, setFormState] = useState<{ eventId: string | null; form: FormState | null }>({
    eventId,
    form: initialForm,
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If eventId changed, reset the form state synchronously during render
  // This is the React-recommended pattern for derived state
  const form =
    formState.eventId === eventId ? formState.form : event ? createFormFromEvent(event) : null;

  // Update internal tracking if eventId changed
  const setForm = useCallback(
    (updater: FormState | null | ((prev: FormState | null) => FormState | null)) => {
      setFormState((prev) => ({
        eventId,
        form: typeof updater === 'function' ? updater(prev.eventId === eventId ? prev.form : form) : updater,
      }));
    },
    [eventId, form]
  );

  // Debounced save
  const debouncedSave = useCallback(
    (updates: Partial<FormState>) => {
      if (!eventId) return;

      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus('pending');

      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('saving');

        // Prepare updates for the event (handle empty strings as undefined)
        const eventUpdates: Record<string, unknown> = {};
        Object.entries(updates).forEach(([key, value]) => {
          if (key === 'date_end' && value === '') {
            eventUpdates[key] = undefined;
          } else if (key === 'innovator' && value === '') {
            eventUpdates[key] = undefined;
          } else if (key !== 'errors') {
            eventUpdates[key] = value;
          }
        });

        updateEvent(eventId, eventUpdates);

        setSaveStatus('saved');

        // Reset to idle after delay
        if (statusTimeoutRef.current) {
          clearTimeout(statusTimeoutRef.current);
        }
        statusTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }, 500);
    },
    [eventId, updateEvent]
  );

  // Update a field
  const updateField = useCallback(
    (field: keyof FormState, value: string | string[]) => {
      setForm((prev) => {
        if (!prev) return prev;

        // Validate required fields
        const errors = { ...prev.errors };

        if (field === 'title' && typeof value === 'string' && !value.trim()) {
          errors.title = 'Title is required';
        } else if (field === 'title') {
          delete errors.title;
        }

        if (field === 'date_start' && typeof value === 'string' && !value.trim()) {
          errors.date_start = 'Start date is required';
        } else if (field === 'date_start') {
          delete errors.date_start;
        }

        const newForm = { ...prev, [field]: value, errors };

        // Only save if no errors
        if (Object.keys(errors).length === 0) {
          debouncedSave({ [field]: value });
        }

        return newForm;
      });
    },
    [debouncedSave]
  );

  // Toggle group selection
  const toggleGroup = useCallback(
    (groupId: string) => {
      setForm((prev) => {
        if (!prev) return prev;

        const newGroups = prev.group_ids.includes(groupId)
          ? prev.group_ids.filter((id) => id !== groupId)
          : [...prev.group_ids, groupId];

        debouncedSave({ group_ids: newGroups });

        return { ...prev, group_ids: newGroups };
      });
    },
    [debouncedSave]
  );

  // Image management
  const addImageUrl = useCallback(
    (url: string) => {
      setForm((prev) => {
        if (!prev) return prev;
        const newUrls = [...prev.image_urls, url];
        debouncedSave({ image_urls: newUrls });
        return { ...prev, image_urls: newUrls };
      });
    },
    [debouncedSave]
  );

  const removeImageUrl = useCallback(
    (index: number) => {
      setForm((prev) => {
        if (!prev) return prev;
        const newUrls = prev.image_urls.filter((_, i) => i !== index);
        debouncedSave({ image_urls: newUrls });
        return { ...prev, image_urls: newUrls };
      });
    },
    [debouncedSave]
  );

  // Metrics management
  const updateMetric = useCallback(
    (key: string, value: string, oldKey?: string) => {
      setForm((prev) => {
        if (!prev) return prev;
        const newMetrics = { ...prev.metrics };

        // If key changed, remove old key
        if (oldKey && oldKey !== key) {
          delete newMetrics[oldKey];
        }

        newMetrics[key] = value;
        debouncedSave({ metrics: newMetrics });
        return { ...prev, metrics: newMetrics };
      });
    },
    [debouncedSave]
  );

  const removeMetric = useCallback(
    (key: string) => {
      setForm((prev) => {
        if (!prev) return prev;
        const newMetrics = { ...prev.metrics };
        delete newMetrics[key];
        debouncedSave({ metrics: newMetrics });
        return { ...prev, metrics: newMetrics };
      });
    },
    [debouncedSave]
  );

  // Links management
  const addLink = useCallback(
    (link: TimelineEventLink) => {
      setForm((prev) => {
        if (!prev) return prev;
        const newLinks = [...prev.links, link];
        debouncedSave({ links: newLinks });
        return { ...prev, links: newLinks };
      });
    },
    [debouncedSave]
  );

  const updateLink = useCallback(
    (index: number, link: TimelineEventLink) => {
      setForm((prev) => {
        if (!prev) return prev;
        const newLinks = [...prev.links];
        newLinks[index] = link;
        debouncedSave({ links: newLinks });
        return { ...prev, links: newLinks };
      });
    },
    [debouncedSave]
  );

  const removeLink = useCallback(
    (index: number) => {
      setForm((prev) => {
        if (!prev) return prev;
        const newLinks = prev.links.filter((_, i) => i !== index);
        debouncedSave({ links: newLinks });
        return { ...prev, links: newLinks };
      });
    },
    [debouncedSave]
  );

  // Delete event
  const handleDelete = useCallback(() => {
    if (eventId) {
      deleteEvent(eventId);
      selectEvent(null);
    }
  }, [eventId, deleteEvent, selectEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  return {
    form,
    updateField,
    toggleGroup,
    addImageUrl,
    removeImageUrl,
    updateMetric,
    removeMetric,
    addLink,
    updateLink,
    removeLink,
    handleDelete,
    saveStatus,
  };
};
