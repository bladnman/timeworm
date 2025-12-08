/**
 * TimeWorm App
 *
 * Root component with navigation and providers.
 * Animation is the experience, not polish.
 */

import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './context/AppProvider';
import { TimelineProvider } from './context/TimelineProvider';
import { useApp } from './hooks/useApp';
import { Home } from './screens/Home/Home';
import { TimelineScreen } from './screens/Timeline/TimelineScreen';
import { DetailOverlay } from './components/DetailOverlay/DetailOverlay';
import { EventEditorModal } from './components/EventEditorModal/EventEditorModal';

/**
 * Screen router - renders the appropriate screen based on app state
 */
const ScreenRouter: React.FC = () => {
  const { screen, timelineMode } = useApp();

  return (
    <>
      <AnimatePresence mode="wait">
        {screen === 'home' ? (
          <Home key="home" />
        ) : (
          <TimelineScreen key="timeline" />
        )}
      </AnimatePresence>

      {/* DetailOverlay shows on timeline screen when not in edit mode */}
      {screen === 'timeline' && timelineMode === 'view' && <DetailOverlay />}

      {/* EventEditorModal shows when editing an event */}
      {screen === 'timeline' && <EventEditorModal />}
    </>
  );
};

/**
 * App wrapper with providers
 */
function App() {
  return (
    <AppProvider>
      <TimelineProvider>
        <ScreenRouter />
      </TimelineProvider>
    </AppProvider>
  );
}

export default App;
