/**
 * Visualization Canvas
 *
 * Container that renders the appropriate visualization based on viewMode.
 * Moved from App.tsx ViewManager for better organization.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTimeline } from '../../../../hooks/useTimeline';
import { viewTransitionVariants } from '../../../../theme/motion';

// Import all visualization views
import { BikeRideView } from '../../../../views/BikeRide/BikeRideView';
import { BranchingTree } from '../../../../views/BranchingTree/BranchingTree';
import { ComicView } from '../../../../views/Comic/ComicView';
import { DepthRoad } from '../../../../views/DepthRoad/DepthRoad';
import { ExhibitWalk } from '../../../../views/ExhibitWalk/ExhibitWalk';
import { HorizontalView } from '../../../../views/Horizontal/HorizontalView';
import { LibraryShelfView } from '../../../../views/LibraryShelf/LibraryShelfView';
import { MosaicView } from '../../../../views/Mosaic/MosaicView';
import { OrbitalRings } from '../../../../views/OrbitalRings/OrbitalRings';
import { RiverPathView } from '../../../../views/RiverPath/RiverPathView';
import { StrataView } from '../../../../views/Strata/StrataView';
import { TrailProfileView } from '../../../../views/TrailProfile/TrailProfileView';
import { TrainJourney } from '../../../../views/TrainJourney/TrainJourney';
import { VerticalView } from '../../../../views/Vertical/VerticalView';
import { YouTubeView } from '../../../../views/YouTube/YouTubeView';

import styles from './VisualizationCanvas.module.css';

/**
 * Map viewMode to component
 */
const viewComponents = {
  vertical: VerticalView,
  horizontal: HorizontalView,
  comic: ComicView,
  river: RiverPathView,
  depthroad: DepthRoad,
  mosaic: MosaicView,
  orbital: OrbitalRings,
  strata: StrataView,
  tree: BranchingTree,
  bikeride: BikeRideView,
  train: TrainJourney,
  exhibit: ExhibitWalk,
  trail: TrailProfileView,
  libraryShelf: LibraryShelfView,
  youtube: YouTubeView,
} as const;

export const VisualizationCanvas: React.FC = () => {
  const { viewMode, data } = useTimeline();

  if (!data) {
    return null;
  }

  const ViewComponent = viewComponents[viewMode] || HorizontalView;

  return (
    <div className={styles.canvas}>
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          className={styles.visualizationWrapper}
          variants={viewTransitionVariants}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <ViewComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
