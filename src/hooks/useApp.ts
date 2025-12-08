import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

/**
 * Hook to access app-level navigation and mode state.
 * Must be used within an AppProvider.
 */
export const useApp = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
};
