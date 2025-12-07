import { useState, useEffect, useCallback, useMemo } from 'react';
import { useExhibitWalk } from './hooks/useExhibitWalk';
import { ExhibitBay } from './components/ExhibitBay/ExhibitBay';
import { CorridorNav } from './components/CorridorNav/CorridorNav';
import { EXHIBIT_WALK_CONFIG } from './hooks/constants';
import styles from './ExhibitWalk.module.css';

/**
 * Exhibit Walk View
 *
 * Presents the timeline as a museum corridor experience.
 * Users scroll horizontally through exhibit bays, each containing
 * events from a specific time segment, arranged chronologically.
 */
export const ExhibitWalk = () => {
  const {
    bays,
    totalWidth,
    expandedBayId,
    hoveredBayId,
    selectEvent,
    expandBay,
    setHoveredBay,
    scrollToBay,
    containerRef,
    isLoading,
  } = useExhibitWalk();

  // Initialize active bay to the first bay
  const initialBayId = useMemo(() => bays[0]?.id ?? null, [bays]);

  // Track which bay is currently in view for nav highlighting
  const [activeBayId, setActiveBayId] = useState<string | null>(null);

  // Derive effective active bay (use initial if none set)
  const effectiveActiveBayId = activeBayId ?? initialBayId;

  // Update active bay based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current || bays.length === 0) return;

    const container = containerRef.current;
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;

    // Find the bay closest to center
    let closestBay = bays[0];
    let closestDistance = Infinity;

    for (const bay of bays) {
      const bayCenter = bay.xPosition + bay.width / 2;
      const distance = Math.abs(scrollCenter - bayCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestBay = bay;
      }
    }

    setActiveBayId(closestBay.id);
  }, [bays, containerRef]);

  // Set up scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, containerRef]);

  // Navigate to bay from nav
  const handleNavigate = useCallback(
    (bayId: string) => {
      scrollToBay(bayId);
      setActiveBayId(bayId);
    },
    [scrollToBay]
  );

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Preparing the exhibit...</div>
      </div>
    );
  }

  if (bays.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyText}>No exhibits to display</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Navigation bar */}
      <CorridorNav
        bays={bays}
        activeBayId={effectiveActiveBayId}
        onNavigate={handleNavigate}
      />

      {/* Corridor - horizontally scrollable */}
      <div
        ref={containerRef}
        className={styles.corridor}
        style={{
          height: `${EXHIBIT_WALK_CONFIG.corridorHeight}px`,
        }}
      >
        {/* Corridor floor/path */}
        <div className={styles.corridorPath} style={{ width: `${totalWidth}px` }}>
          {/* Time axis line */}
          <div className={styles.timeAxis} />

          {/* Exhibit bays */}
          {bays.map((bay) => (
            <ExhibitBay
              key={bay.id}
              bay={bay}
              isExpanded={expandedBayId === bay.id}
              isHovered={hoveredBayId === bay.id}
              onExpand={expandBay}
              onHover={setHoveredBay}
              onSelectEvent={selectEvent}
            />
          ))}
        </div>
      </div>

      {/* Scroll hints */}
      <div className={styles.scrollHints}>
        <div className={styles.scrollHintLeft}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Earlier</span>
        </div>
        <div className={styles.scrollInstruction}>
          Scroll to walk through time
        </div>
        <div className={styles.scrollHintRight}>
          <span>Later</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
};
