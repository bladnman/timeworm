import { useMemo, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { useTimeline } from '../../../hooks/useTimeline';
import { useTimeScale } from '../../../hooks/useTimeScale';
import { parseISOExtended } from '../../../utils/dateUtils';
import type { TimelineEvent, TimelineGroup } from '../../../types/timeline';
import { BRANCHING_TREE_CONFIG, type BranchState } from './constants';

/**
 * A node represents an event on a branch
 */
export interface TreeNode {
  event: TimelineEvent;
  x: number;
  y: number;
  branchId: string;
  branchIndex: number;
}

/**
 * A branch represents a group/category with its events
 */
export interface TreeBranch {
  group: TimelineGroup;
  index: number;
  color: string;
  state: BranchState;
  nodes: TreeNode[];
  // Branch geometry
  startY: number;           // Y position where branch starts (splits from trunk)
  endY: number;             // Y position of last event on branch
  x: number;                // X position after curve
  // Curve control points
  curveStartY: number;      // Where the curve begins
  curveControlX: number;    // Bezier control point X
  curveControlY: number;    // Bezier control point Y
}

/**
 * Year tick for trunk axis
 */
export interface TrunkTick {
  year: number;
  y: number;
  major: boolean;
  label: string;
}

const VIEWPORT_PADDING = 100;

const computeAutoFitZoom = (totalYears: number, viewportHeight: number): number => {
  const availableHeight = viewportHeight - VIEWPORT_PADDING * 2;
  return Math.max(
    BRANCHING_TREE_CONFIG.zoomMin,
    Math.min(BRANCHING_TREE_CONFIG.zoomMax, availableHeight / totalYears)
  );
};

export const useBranchingTree = () => {
  const { data, selectEvent, selectedEventId } = useTimeline();
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(BRANCHING_TREE_CONFIG.defaultPixelsPerYear);
  const [branchStates, setBranchStates] = useState<Record<string, BranchState>>({});
  const hasAutoFitRef = useRef(false);

  const { getPosition, minDate, totalYears, years } = useTimeScale(data, { pixelsPerYear });

  // Auto-fit zoom on initial load
  useLayoutEffect(() => {
    if (!hasAutoFitRef.current && data && totalYears > 0) {
      hasAutoFitRef.current = true;
      const viewportHeight = window.innerHeight;
      setPixelsPerYear(computeAutoFitZoom(totalYears, viewportHeight));
    }
  }, [data, totalYears]);

  // Total height based on time range
  const totalHeight = useMemo(() => {
    return totalYears * pixelsPerYear + BRANCHING_TREE_CONFIG.canvasPadding * 2;
  }, [totalYears, pixelsPerYear]);

  // Convert horizontal position to vertical (Y) position
  // In tree view, Y increases upward (later time = higher position)
  const getYPosition = useCallback((dateStr: string): number => {
    const xPos = getPosition(dateStr);
    // Flip so earlier dates are at bottom
    return totalHeight - xPos - BRANCHING_TREE_CONFIG.canvasPadding;
  }, [getPosition, totalHeight]);

  // Get Y position for a year number
  const getYearY = useCallback((year: number): number => {
    const yearsFromMin = year - minDate.year;
    const yFromTop = yearsFromMin * pixelsPerYear;
    return totalHeight - yFromTop - BRANCHING_TREE_CONFIG.canvasPadding;
  }, [minDate.year, pixelsPerYear, totalHeight]);

  // Build tree structure from data
  const { branches, trunkEvents, allNodes } = useMemo(() => {
    if (!data || data.events.length === 0) {
      return { branches: [], trunkEvents: [], allNodes: [] };
    }

    const groups = data.groups;
    const sortedEvents = [...data.events].sort((a, b) => {
      const dateA = parseISOExtended(a.date_start);
      const dateB = parseISOExtended(b.date_start);
      return dateA.decimalYear - dateB.decimalYear;
    });

    // Events without groups go on the trunk
    const trunkEvents: TreeNode[] = [];
    const groupEvents: Record<string, TimelineEvent[]> = {};

    // Initialize group events
    groups.forEach(g => {
      groupEvents[g.id] = [];
    });

    // Categorize events
    sortedEvents.forEach(event => {
      if (event.group_ids.length === 0) {
        trunkEvents.push({
          event,
          x: BRANCHING_TREE_CONFIG.trunkX,
          y: getYPosition(event.date_start),
          branchId: 'trunk',
          branchIndex: -1,
        });
      } else {
        // Add to first group (primary category)
        const primaryGroupId = event.group_ids[0];
        if (groupEvents[primaryGroupId]) {
          groupEvents[primaryGroupId].push(event);
        }
      }
    });

    // Calculate branch starting X position
    const branchStartX = BRANCHING_TREE_CONFIG.trunkX + BRANCHING_TREE_CONFIG.branchSpacing;

    // Build branches
    const branches: TreeBranch[] = groups.map((group, index) => {
      const events = groupEvents[group.id] || [];
      const color = BRANCHING_TREE_CONFIG.branchPalette[index % BRANCHING_TREE_CONFIG.branchPalette.length];
      const state = branchStates[group.id] || 'expanded';

      // Branch X position (alternating left/right of trunk, then progressively outward)
      const side = index % 2 === 0 ? 1 : -1;
      const tier = Math.floor(index / 2);
      const x = BRANCHING_TREE_CONFIG.trunkX + side * (branchStartX + tier * BRANCHING_TREE_CONFIG.branchSpacing - BRANCHING_TREE_CONFIG.trunkX);

      // Find first and last event Y positions
      let startY = totalHeight;
      let endY = 0;

      const nodes: TreeNode[] = events.map(event => {
        const y = getYPosition(event.date_start);
        if (y < startY) startY = y;
        if (y > endY) endY = y;

        return {
          event,
          x,
          y,
          branchId: group.id,
          branchIndex: index,
        };
      });

      // Ensure minimum branch length
      if (nodes.length > 0 && endY - startY < BRANCHING_TREE_CONFIG.minBranchLength) {
        endY = startY + BRANCHING_TREE_CONFIG.minBranchLength;
      }

      // If no events, use a default position based on group date range
      if (nodes.length === 0) {
        startY = totalHeight - BRANCHING_TREE_CONFIG.canvasPadding;
        endY = startY + BRANCHING_TREE_CONFIG.minBranchLength;
      }

      // Curve control points
      const curveStartY = startY + BRANCHING_TREE_CONFIG.branchCurveOffset;
      const curveControlX = (BRANCHING_TREE_CONFIG.trunkX + x) / 2;
      const curveControlY = startY + BRANCHING_TREE_CONFIG.branchCurveOffset / 2;

      return {
        group,
        index,
        color,
        state,
        nodes,
        startY,
        endY,
        x,
        curveStartY,
        curveControlX,
        curveControlY,
      };
    });

    // All nodes for quick lookup
    const allNodes = [...trunkEvents, ...branches.flatMap(b => b.nodes)];

    return { branches, trunkEvents, allNodes };
  }, [data, branchStates, getYPosition, totalHeight]);

  // Generate trunk ticks (year markers)
  const trunkTicks = useMemo((): TrunkTick[] => {
    if (years.length === 0) return [];

    // Show decades when zoomed out, years when zoomed in
    if (pixelsPerYear < 5) {
      return years
        .filter(y => y % 50 === 0)
        .map(y => ({
          year: y,
          y: getYearY(y),
          major: true,
          label: y.toString(),
        }));
    }

    if (pixelsPerYear < 10) {
      return years
        .filter(y => y % 10 === 0)
        .map(y => ({
          year: y,
          y: getYearY(y),
          major: true,
          label: y.toString(),
        }));
    }

    return years.map(y => ({
      year: y,
      y: getYearY(y),
      major: y % 10 === 0,
      label: y.toString(),
    }));
  }, [years, pixelsPerYear, getYearY]);

  // Calculate canvas dimensions
  const canvasWidth = useMemo(() => {
    if (branches.length === 0) {
      return BRANCHING_TREE_CONFIG.trunkX * 2 + BRANCHING_TREE_CONFIG.labelWidth * 2;
    }

    const maxX = Math.max(...branches.map(b => Math.abs(b.x)));
    return maxX + BRANCHING_TREE_CONFIG.labelWidth + BRANCHING_TREE_CONFIG.canvasPadding;
  }, [branches]);

  // Toggle branch collapse/expand
  const toggleBranch = useCallback((branchId: string) => {
    setBranchStates(prev => ({
      ...prev,
      [branchId]: prev[branchId] === 'collapsed' ? 'expanded' : 'collapsed',
    }));
  }, []);

  // Expand all branches
  const expandAll = useCallback(() => {
    const newStates: Record<string, BranchState> = {};
    branches.forEach(b => {
      newStates[b.group.id] = 'expanded';
    });
    setBranchStates(newStates);
  }, [branches]);

  // Collapse all branches
  const collapseAll = useCallback(() => {
    const newStates: Record<string, BranchState> = {};
    branches.forEach(b => {
      newStates[b.group.id] = 'collapsed';
    });
    setBranchStates(newStates);
  }, [branches]);

  // Zoom handlers
  const handleZoomChange = useCallback((value: number) => {
    setPixelsPerYear(value);
  }, []);

  const zoomIn = useCallback(() => {
    setPixelsPerYear(prev =>
      Math.min(BRANCHING_TREE_CONFIG.zoomMax, prev + BRANCHING_TREE_CONFIG.zoomStep * 2)
    );
  }, []);

  const zoomOut = useCallback(() => {
    setPixelsPerYear(prev =>
      Math.max(BRANCHING_TREE_CONFIG.zoomMin, prev - BRANCHING_TREE_CONFIG.zoomStep * 2)
    );
  }, []);

  return {
    // Data
    data,
    branches,
    trunkEvents,
    trunkTicks,
    allNodes,

    // Dimensions
    totalHeight,
    canvasWidth,
    pixelsPerYear,

    // State
    selectedEventId,

    // Handlers
    selectEvent,
    toggleBranch,
    expandAll,
    collapseAll,
    handleZoomChange,
    zoomIn,
    zoomOut,

    // Config
    config: BRANCHING_TREE_CONFIG,
  };
};
