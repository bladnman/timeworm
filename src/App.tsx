import { useContext } from 'react';
import { DetailOverlay } from './components/DetailOverlay/DetailOverlay';
import { ViewSwitcher } from './components/ViewSwitcher/ViewSwitcher';
import { TimelineContext } from './context/TimelineContext';
import { TimelineProvider } from './context/TimelineProvider';
import { HorizontalView } from './views/Horizontal/HorizontalView';
import { VerticalView } from './views/Vertical/VerticalView';

const ViewManager = () => {
    const { viewMode, isLoading } = useContext(TimelineContext)!;

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading TimeWorm...</div>;

    return (
        <>
            {viewMode === 'vertical' ? <VerticalView /> : <HorizontalView />}
        </>
    );
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
