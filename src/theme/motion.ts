/**
 * TimeWorm Motion System
 *
 * Unified Framer Motion variants and configurations.
 * Animation is the experience, not polish.
 *
 * Variant families:
 * - screen: Home ↔ Timeline transitions
 * - panel: Edit drawer slide in/out
 * - card: Timeline card interactions
 * - visualization: View scaling transitions
 * - item: List item stagger animations
 * - overlay: Modal/overlay appearances
 */

import type { Variants, Transition } from 'framer-motion';

// ============================================================================
// Spring Configurations
// ============================================================================

/**
 * Default spring - matches existing --ease-spring feel
 * Slightly bouncy, responsive, not sluggish
 */
export const springDefault: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

/**
 * Gentle spring - for larger movements (screen transitions)
 * More follow-through, less snap
 */
export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
  mass: 1,
};

/**
 * Snappy spring - for micro-interactions (hover, tap)
 * Quick response, minimal overshoot
 */
export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 0.5,
};

/**
 * Slow spring - for dramatic reveals
 */
export const springSlow: Transition = {
  type: 'spring',
  stiffness: 150,
  damping: 25,
  mass: 1.2,
};

// ============================================================================
// Duration Constants (for non-spring animations)
// ============================================================================

export const DURATION_FAST = 0.2;    // 200ms - matches --duration-fast
export const DURATION_NORMAL = 0.4;  // 400ms - matches --duration-normal
export const DURATION_SLOW = 0.6;

// ============================================================================
// Screen Transition Variants
// Home ↔ Timeline - "stepping into/out of a world"
// ============================================================================

export const screenVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      ...springGentle,
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: DURATION_FAST,
    },
  },
};

/**
 * Screen variants for forward navigation (Home → Timeline)
 * Feels like zooming in, stepping forward
 */
export const screenForwardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 1.05,
    y: 20,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springGentle,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: DURATION_FAST,
    },
  },
};

/**
 * Screen variants for backward navigation (Timeline → Home)
 * Feels like stepping back, receding
 */
export const screenBackwardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: -10,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springGentle,
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    y: 10,
    transition: {
      duration: DURATION_FAST,
    },
  },
};

// ============================================================================
// Panel Variants
// Edit drawer, overlays - slide in from edges
// ============================================================================

export const panelRightVariants: Variants = {
  closed: {
    x: '100%',
    opacity: 0,
  },
  open: {
    x: 0,
    opacity: 1,
    transition: springDefault,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      ...springSnappy,
      opacity: { duration: DURATION_FAST },
    },
  },
};

export const panelLeftVariants: Variants = {
  closed: {
    x: '-100%',
    opacity: 0,
  },
  open: {
    x: 0,
    opacity: 1,
    transition: springDefault,
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      ...springSnappy,
      opacity: { duration: DURATION_FAST },
    },
  },
};

export const panelBottomVariants: Variants = {
  closed: {
    y: '100%',
    opacity: 0,
  },
  open: {
    y: 0,
    opacity: 1,
    transition: springDefault,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      ...springSnappy,
      opacity: { duration: DURATION_FAST },
    },
  },
};

// ============================================================================
// Card Variants
// Timeline cards - hover, tap, stagger entrance
// ============================================================================

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springDefault,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: DURATION_FAST,
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: springSnappy,
  },
  tap: {
    scale: 0.98,
    transition: springSnappy,
  },
};

/**
 * Card container for staggered children
 */
export const cardContainerVariants: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// ============================================================================
// Visualization Variants
// Canvas scaling, view transitions
// ============================================================================

export const visualizationVariants: Variants = {
  thumbnail: {
    scale: 0.3,
    borderRadius: 12,
    opacity: 0.9,
  },
  fullscreen: {
    scale: 1,
    borderRadius: 0,
    opacity: 1,
    transition: springSlow,
  },
};

/**
 * For switching between visualization views
 * Cross-fade with subtle scale
 */
export const viewTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: { duration: DURATION_NORMAL },
      scale: springDefault,
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    transition: {
      duration: DURATION_FAST,
    },
  },
};

// ============================================================================
// Item Variants
// List items, staggered entrance/exit
// ============================================================================

export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  enter: {
    opacity: 1,
    x: 0,
    transition: springSnappy,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: {
      duration: DURATION_FAST,
    },
  },
};

export const itemContainerVariants: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

// ============================================================================
// Overlay Variants
// Modals, dialogs, backdrop
// ============================================================================

export const overlayBackdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION_NORMAL,
    },
  },
};

export const overlayContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springDefault,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 10,
    transition: {
      duration: DURATION_FAST,
    },
  },
};

// ============================================================================
// Mode Toggle Variants
// View ↔ Edit mode - "zooming in/out of work"
// ============================================================================

export const editModeVariants: Variants = {
  view: {
    scale: 1,
    transition: springGentle,
  },
  edit: {
    scale: 0.95,
    transition: springGentle,
  },
};

// ============================================================================
// Micro-interaction Variants
// Buttons, icons, small elements
// ============================================================================

export const buttonVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: springSnappy,
  },
  tap: {
    scale: 0.95,
    transition: springSnappy,
  },
};

export const iconRotateVariants: Variants = {
  initial: {
    rotate: 0,
  },
  rotated: {
    rotate: 180,
    transition: springDefault,
  },
};

// ============================================================================
// Selection Variants
// Event selection on canvas
// ============================================================================

export const selectionVariants: Variants = {
  unselected: {
    scale: 1,
    boxShadow: '0 0 0 0px rgba(56, 189, 248, 0)',
  },
  selected: {
    scale: 1.05,
    boxShadow: '0 0 0 3px rgba(56, 189, 248, 0.5)',
    transition: springDefault,
  },
};

// ============================================================================
// Save Indicator Variants
// Subtle auto-save feedback
// ============================================================================

export const saveIndicatorVariants: Variants = {
  idle: {
    opacity: 0,
    scale: 0.8,
  },
  saving: {
    opacity: 0.7,
    scale: 1,
    transition: {
      duration: DURATION_FAST,
    },
  },
  saved: {
    opacity: 1,
    scale: 1,
    transition: springSnappy,
  },
  fadeOut: {
    opacity: 0,
    transition: {
      delay: 1.5,
      duration: DURATION_NORMAL,
    },
  },
};

// ============================================================================
// Delete/Destructive Variants
// Graceful departure, not violent removal
// ============================================================================

export const deleteVariants: Variants = {
  initial: {
    opacity: 1,
    scale: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    x: -20,
    transition: {
      ...springDefault,
      opacity: { duration: DURATION_NORMAL },
    },
  },
};

// ============================================================================
// Create/Add Variants
// Graceful arrival, materialization
// ============================================================================

export const createVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springSlow,
  },
};
