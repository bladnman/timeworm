/**
 * Editor Toolbar
 *
 * Formatting toolbar for the rich text editor.
 */

import type { Editor } from '@tiptap/react';
import classNames from 'classnames';
import styles from './EditorToolbar.module.css';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <button
          type="button"
          className={classNames(styles.button, {
            [styles.active]: editor.isActive('bold'),
          })}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path
              fill="currentColor"
              d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"
            />
          </svg>
        </button>
        <button
          type="button"
          className={classNames(styles.button, {
            [styles.active]: editor.isActive('italic'),
          })}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
          </svg>
        </button>
        <button
          type="button"
          className={classNames(styles.button, {
            [styles.active]: editor.isActive('strike'),
          })}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path
              fill="currentColor"
              d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"
            />
          </svg>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <button
          type="button"
          className={classNames(styles.button, {
            [styles.active]: editor.isActive('heading', { level: 2 }),
          })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <span className={styles.textButton}>H2</span>
        </button>
        <button
          type="button"
          className={classNames(styles.button, {
            [styles.active]: editor.isActive('heading', { level: 3 }),
          })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <span className={styles.textButton}>H3</span>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <button
          type="button"
          className={classNames(styles.button, {
            [styles.active]: editor.isActive('bulletList'),
          })}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path
              fill="currentColor"
              d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
            />
          </svg>
        </button>
        <button
          type="button"
          className={classNames(styles.button, {
            [styles.active]: editor.isActive('orderedList'),
          })}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path
              fill="currentColor"
              d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"
            />
          </svg>
        </button>
        <button
          type="button"
          className={classNames(styles.button, {
            [styles.active]: editor.isActive('blockquote'),
          })}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path
              fill="currentColor"
              d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"
            />
          </svg>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <button
          type="button"
          className={classNames(styles.button, {
            [styles.active]: editor.isActive('link'),
          })}
          onClick={setLink}
          title="Add Link"
        >
          <svg viewBox="0 0 24 24" className={styles.icon}>
            <path
              fill="currentColor"
              d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
