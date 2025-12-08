/**
 * Event Editor Modal
 *
 * Full-page modal for rich event editing.
 * Notion-style experience with WYSIWYG and progressive disclosure.
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useTimeline } from '../../hooks/useTimeline';
import {
  overlayBackdropVariants,
  overlayContentVariants,
  itemContainerVariants,
} from '../../theme/motion';
import { useEventForm } from './hooks/useEventForm';
import { EditorHeader } from './components/EditorHeader/EditorHeader';
import { TitleInput } from './components/TitleInput/TitleInput';
import { DateChips } from './components/DateChips/DateChips';
import { RichTextEditor } from './components/RichTextEditor/RichTextEditor';
import { GroupSelector } from './components/GroupSelector/GroupSelector';
import { DisclosureSection } from './components/DisclosureSection/DisclosureSection';
import { ImageGallery } from './components/ImageGallery/ImageGallery';
import { MetricsEditor } from './components/MetricsEditor/MetricsEditor';
import { LinksEditor } from './components/LinksEditor/LinksEditor';
import { EditorFooter } from './components/EditorFooter/EditorFooter';
import { DeleteZone } from './components/DeleteZone/DeleteZone';
import styles from './EventEditorModal.module.css';

export const EventEditorModal: React.FC = () => {
  const { selectedEventId, selectEvent, data } = useTimeline();
  const isOpen = selectedEventId !== null;

  const event = data?.events.find((e) => e.id === selectedEventId);
  const groups = data?.groups ?? [];

  const {
    form,
    updateField,
    toggleGroup,
    addImageUrl,
    removeImageUrl,
    reorderImageUrls,
    updateMetric,
    removeMetric,
    addLink,
    updateLink,
    removeLink,
    handleDelete,
    saveStatus,
  } = useEventForm(selectedEventId);

  // Close modal handler
  const handleClose = useCallback(() => {
    selectEvent(null);
  }, [selectEvent]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !event || !form) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            variants={overlayBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modalContainer}
            variants={overlayContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-editor-title"
            >
              <EditorHeader onClose={handleClose} />

              <div className={styles.scrollArea}>
                <motion.div
                  className={styles.content}
                  variants={itemContainerVariants}
                  initial="initial"
                  animate="enter"
                >
                  {/* Title */}
                  <TitleInput
                    value={form.title}
                    onChange={(value) => updateField('title', value)}
                    error={form.errors?.title}
                  />

                  {/* Date Chips */}
                  <DateChips
                    dateStart={form.date_start}
                    dateEnd={form.date_end}
                    dateDisplay={form.date_display}
                    onDateStartChange={(value) => updateField('date_start', value)}
                    onDateEndChange={(value) => updateField('date_end', value)}
                    onDateDisplayChange={(value) => updateField('date_display', value)}
                    errors={form.errors}
                  />

                  {/* Description */}
                  <RichTextEditor
                    content={form.description}
                    onChange={(value) => updateField('description', value)}
                    placeholder="Write your description..."
                  />

                  {/* Groups */}
                  <GroupSelector
                    groups={groups}
                    selectedIds={form.group_ids}
                    onToggle={toggleGroup}
                  />

                  {/* Links Section - promoted from Advanced */}
                  <DisclosureSection title="Links" defaultOpen={form.links.length > 0}>
                    <LinksEditor
                      links={form.links}
                      onAdd={addLink}
                      onUpdate={updateLink}
                      onRemove={removeLink}
                    />
                  </DisclosureSection>

                  {/* Images Section */}
                  <DisclosureSection title="Images" defaultOpen={form.image_urls.length > 0}>
                    <ImageGallery
                      urls={form.image_urls}
                      onAdd={addImageUrl}
                      onRemove={removeImageUrl}
                      onReorder={reorderImageUrls}
                    />
                  </DisclosureSection>

                  {/* Additional Fields - flexible key-value pairs */}
                  <DisclosureSection title="Additional Fields" defaultOpen={Object.keys(form.metrics).length > 0}>
                    <MetricsEditor
                      metrics={form.metrics}
                      onUpdate={updateMetric}
                      onRemove={removeMetric}
                    />
                  </DisclosureSection>

                  {/* Delete Zone - at the very bottom, scroll to find */}
                  <DeleteZone onDelete={handleDelete} />
                </motion.div>
              </div>

              <EditorFooter saveStatus={saveStatus} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
