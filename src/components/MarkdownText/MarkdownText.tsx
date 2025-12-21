/**
 * MarkdownText Component
 *
 * Lightweight markdown renderer for basic formatting:
 * - **bold** text
 * - Paragraph breaks (double newlines)
 * - Bullet lists (lines starting with -)
 */

import styles from './MarkdownText.module.css';

interface MarkdownTextProps {
  content: string;
  className?: string;
}

/**
 * Parse inline markdown (bold only for now)
 */
const parseInline = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add the bold text
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

/**
 * Parse markdown content into React elements
 */
const parseMarkdown = (content: string): React.ReactNode[] => {
  // Split into paragraphs by double newlines
  const paragraphs = content.split(/\n\n+/);
  const elements: React.ReactNode[] = [];

  paragraphs.forEach((para, index) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    // Check if it's a list (lines starting with -)
    const lines = trimmed.split('\n');
    const isListParagraph = lines.every(line =>
      line.trim().startsWith('- ') || line.trim() === ''
    );

    if (isListParagraph) {
      const listItems = lines
        .filter(line => line.trim().startsWith('- '))
        .map((line, i) => (
          <li key={i}>{parseInline(line.trim().slice(2))}</li>
        ));
      elements.push(<ul key={index} className={styles.list}>{listItems}</ul>);
    } else {
      // Regular paragraph - preserve single newlines as line breaks
      const withBreaks = lines.map((line, i) => (
        <span key={i}>
          {parseInline(line)}
          {i < lines.length - 1 && <br />}
        </span>
      ));
      elements.push(<p key={index} className={styles.paragraph}>{withBreaks}</p>);
    }
  });

  return elements;
};

export const MarkdownText = ({ content, className }: MarkdownTextProps) => {
  return (
    <div className={`${styles.markdown} ${className || ''}`}>
      {parseMarkdown(content)}
    </div>
  );
};
