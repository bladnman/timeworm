import { useContext } from 'react';
import { DetailOverlay } from './components/DetailOverlay/DetailOverlay';
import { ViewSwitcher } from './components/ViewSwitcher/ViewSwitcher';
import { TimelineContext } from './context/TimelineContext';
import { TimelineProvider } from './context/TimelineProvider';
import { ComicView } from './views/Comic/ComicView';
import { HorizontalView } from './views/Horizontal/HorizontalView';
import { RiverPathView } from './views/RiverPath/RiverPathView';
import { VerticalView } from './views/Vertical/VerticalView';

const ViewManager = () => {
    const { viewMode, isLoading } = useContext(TimelineContext)!;

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading TimeWorm...</div>;

    if (viewMode === 'comic') return <ComicView />;
    if (viewMode === 'vertical') return <VerticalView />;
    if (viewMode === 'river') return <RiverPathView />;
    return <HorizontalView />;
};

function App() {
  return (
    <TimelineProvider>
      <ViewManager />
      <ViewSwitcher />
      <DetailOverlay />
    </TimelineProvider>
  );
}

export default App;
