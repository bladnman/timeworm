import { createContext } from 'react';

/**
 * App-level navigation context.
 * Manages screen routing, timeline selection, and edit mode state.
 */

export type AppScreen = 'home' | 'timeline';
export type TimelineMode = 'view' | 'edit';
export type TransitionDirection = 'forward' | 'backward' | null;

export interface AppContextType {
  // Current screen
  screen: AppScreen;

  // Timeline mode (view vs edit) - only relevant when screen === 'timeline'
  timelineMode: TimelineMode;

  // Currently selected timeline ID
  selectedTimelineId: string | null;

  // Transition state for animation coordination
  isTransitioning: boolean;
  transitionDirection: TransitionDirection;

  // Navigation actions
  navigateToTimeline: (timelineId: string) => void;
  navigateToHome: () => void;

  // Mode actions
  enterEditMode: () => void;
  exitEditMode: () => void;
  toggleEditMode: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
