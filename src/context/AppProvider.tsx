import React, { useState, useCallback, type ReactNode } from 'react';
import {
  AppContext,
  type AppScreen,
  type TimelineMode,
  type TransitionDirection,
} from './AppContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Screen state
  const [screen, setScreen] = useState<AppScreen>('home');
  const [timelineMode, setTimelineMode] = useState<TimelineMode>('view');
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>(null);

  // Navigation: Home → Timeline
  const navigateToTimeline = useCallback((timelineId: string) => {
    setTransitionDirection('forward');
    setIsTransitioning(true);
    setSelectedTimelineId(timelineId);
    setTimelineMode('view'); // Always start in view mode
    setScreen('timeline');

    // Reset transition state after animation completes
    // AnimatePresence handles the actual timing
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, 500);
  }, []);

  // Navigation: Timeline → Home
  const navigateToHome = useCallback(() => {
    setTransitionDirection('backward');
    setIsTransitioning(true);
    setTimelineMode('view'); // Exit edit mode when going home
    setScreen('home');

    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDirection(null);
      // Don't clear selectedTimelineId - preserve for potential re-entry
    }, 500);
  }, []);

  // Mode: Enter edit mode
  const enterEditMode = useCallback(() => {
    if (screen !== 'timeline') return;
    setTimelineMode('edit');
  }, [screen]);

  // Mode: Exit edit mode
  const exitEditMode = useCallback(() => {
    setTimelineMode('view');
  }, []);

  // Mode: Toggle edit mode
  const toggleEditMode = useCallback(() => {
    if (screen !== 'timeline') return;
    setTimelineMode((prev) => (prev === 'view' ? 'edit' : 'view'));
  }, [screen]);

  const value = {
    screen,
    timelineMode,
    selectedTimelineId,
    isTransitioning,
    transitionDirection,
    navigateToTimeline,
    navigateToHome,
    enterEditMode,
    exitEditMode,
    toggleEditMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
