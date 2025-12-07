import { useContext } from 'react';
import { DetailOverlay } from './components/DetailOverlay/DetailOverlay';
import { ViewSwitcher } from './components/ViewSwitcher/ViewSwitcher';
import { TimelineContext } from './context/TimelineContext';
import { TimelineProvider } from './context/TimelineProvider';
import { ComicView } from './views/Comic/ComicView';
import { DepthRoad } from './views/DepthRoad/DepthRoad';
import { HorizontalView } from './views/Horizontal/HorizontalView';
import { MosaicView } from './views/Mosaic/MosaicView';
import { OrbitalRings } from './views/OrbitalRings/OrbitalRings';
import { RiverPathView } from './views/RiverPath/RiverPathView';
import { StrataView } from './views/Strata/StrataView';
import { VerticalView } from './views/Vertical/VerticalView';

const ViewManager = () => {
    const { viewMode, isLoading } = useContext(TimelineContext)!;

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading TimeWorm...</div>;

    if (viewMode === 'comic') return <ComicView />;
    if (viewMode === 'vertical') return <VerticalView />;
    if (viewMode === 'river') return <RiverPathView />;
    if (viewMode === 'depthroad') return <DepthRoad />;
    if (viewMode === 'mosaic') return <MosaicView />;
    if (viewMode === 'orbital') return <OrbitalRings />;
    if (viewMode === 'strata') return <StrataView />;
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
