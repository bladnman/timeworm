/**
 * Disclosure Section
 *
 * Collapsible section with smooth animation.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useDisclosure } from '../../hooks/useDisclosure';
import styles from './DisclosureSection.module.css';

interface DisclosureSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const DisclosureSection: React.FC<DisclosureSectionProps> = ({
  title,
  defaultOpen = true,
  children,
}) => {
  const sectionId = `disclosure-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const { isOpen, toggle } = useDisclosure(sectionId, defaultOpen);

  return (
    <div className={styles.section}>
      <button
        className={styles.header}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={`${sectionId}-content`}
      >
        <span className={styles.title}>{title}</span>
        <motion.svg
          className={styles.chevron}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${sectionId}-content`}
            className={styles.content}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className={styles.inner}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
