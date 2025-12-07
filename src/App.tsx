import { useContext } from 'react';
import { DetailOverlay } from './components/DetailOverlay/DetailOverlay';
import { ViewSwitcher } from './components/ViewSwitcher/ViewSwitcher';
import { TimelineContext } from './context/TimelineContext';
import { TimelineProvider } from './context/TimelineProvider';
import { BikeRideView } from './views/BikeRide/BikeRideView';
import { BranchingTree } from './views/BranchingTree/BranchingTree';
import { ComicView } from './views/Comic/ComicView';
import { DepthRoad } from './views/DepthRoad/DepthRoad';
import { ExhibitWalk } from './views/ExhibitWalk/ExhibitWalk';
import { HorizontalView } from './views/Horizontal/HorizontalView';
import { LibraryShelfView } from './views/LibraryShelf/LibraryShelfView';
import { MosaicView } from './views/Mosaic/MosaicView';
import { OrbitalRings } from './views/OrbitalRings/OrbitalRings';
import { RiverPathView } from './views/RiverPath/RiverPathView';
import { StrataView } from './views/Strata/StrataView';
import { TrailProfileView } from './views/TrailProfile/TrailProfileView';
import { TrainJourney } from './views/TrainJourney/TrainJourney';
import { VerticalView } from './views/Vertical/VerticalView';

const ViewManager = () => {
    const { viewMode, isLoading } = useContext(TimelineContext)!;

    if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading TimeWorm...</div>;

    if (viewMode === 'comic') return <ComicView />;
    if (viewMode === 'exhibit') return <ExhibitWalk />;
    if (viewMode === 'vertical') return <VerticalView />;
    if (viewMode === 'river') return <RiverPathView />;
    if (viewMode === 'depthroad') return <DepthRoad />;
    if (viewMode === 'mosaic') return <MosaicView />;
    if (viewMode === 'orbital') return <OrbitalRings />;
    if (viewMode === 'strata') return <StrataView />;
    if (viewMode === 'tree') return <BranchingTree />;
    if (viewMode === 'bikeride') return <BikeRideView />;
    if (viewMode === 'train') return <TrainJourney />;
    if (viewMode === 'trail') return <TrailProfileView />;
    if (viewMode === 'libraryShelf') return <LibraryShelfView />;
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
