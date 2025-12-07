/**
 * Configuration constants for the Branching Tree view.
 *
 * The Branching Tree visualizes time as an organic tree structure:
 * - Trunk grows from bottom (earliest) to top (latest)
 * - Branches split off for different categories/groups
 * - Events appear as nodes/leaves along branches
 */

export const BRANCHING_TREE_CONFIG = {
  // Zoom settings (vertical pixels per year)
  defaultPixelsPerYear: 8,
  zoomMin: 1,
  zoomMax: 50,
  zoomStep: 1,

  // Tree geometry
  trunkWidth: 12,
  branchWidth: 6,
  branchSpacing: 180,           // Horizontal space between branches
  branchCurveOffset: 60,        // How far branches curve before going vertical
  minBranchLength: 100,         // Minimum vertical height for a branch

  // Node styling
  nodeRadius: 8,
  nodeRadiusHover: 12,
  nodeRadiusSelected: 14,

  // Layout
  canvasPadding: 80,
  trunkX: 120,                  // X position of main trunk
  labelWidth: 160,              // Width of event labels
  labelGap: 16,                 // Gap between node and label

  // Interaction
  collapsedBranchHeight: 40,    // Height when branch is collapsed

  // Colors (CSS variable names for reference)
  colors: {
    trunk: '--color-tree-trunk',
    branch: '--color-tree-branch',
    node: '--color-tree-node',
    nodeHover: '--color-tree-node-hover',
    nodeSelected: '--color-text-accent',
    label: '--color-text-primary',
    labelSecondary: '--color-text-secondary',
  },

  // Branch color palette (for different groups)
  branchPalette: [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#84cc16', // Lime
  ],
} as const;

export type BranchState = 'expanded' | 'collapsed';
