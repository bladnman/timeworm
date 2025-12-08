/**
 * useDisclosure Hook
 *
 * Manages disclosure/collapse state with localStorage persistence.
 */

import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'timeworm:disclosure:';

export const useDisclosure = (sectionId: string, defaultOpen = true) => {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${sectionId}`);
      return stored !== null ? JSON.parse(stored) : defaultOpen;
    } catch {
      return defaultOpen;
    }
  });

  const toggle = useCallback(() => {
    setIsOpen((prev: boolean) => {
      const next = !prev;
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${sectionId}`, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, [sectionId]);

  const open = useCallback(() => {
    setIsOpen(true);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${sectionId}`, 'true');
    } catch {
      // Ignore storage errors
    }
  }, [sectionId]);

  const close = useCallback(() => {
    setIsOpen(false);
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${sectionId}`, 'false');
    } catch {
      // Ignore storage errors
    }
  }, [sectionId]);

  return { isOpen, toggle, open, close };
};
