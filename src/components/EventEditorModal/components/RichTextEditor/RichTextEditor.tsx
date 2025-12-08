/**
 * Rich Text Editor
 *
 * Tiptap-based WYSIWYG editor with floating toolbar.
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { EditorToolbar } from './components/EditorToolbar/EditorToolbar';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start writing...',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: styles.link,
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: wrapPlainText(content),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
  });

  // Update content when prop changes (e.g., switching events)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(wrapPlainText(content));
    }
  }, [content, editor]);

  return (
    <div className={styles.container}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className={styles.editorWrapper} />
    </div>
  );
};

/**
 * Wrap plain text in paragraph tags if it's not already HTML
 */
function wrapPlainText(content: string): string {
  if (!content) return '';
  // If it looks like HTML, return as-is
  if (content.trim().startsWith('<')) {
    return content;
  }
  // Otherwise wrap paragraphs
  return content
    .split('\n\n')
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');
}
