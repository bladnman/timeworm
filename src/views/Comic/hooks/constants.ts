export const COMIC_VIEW_CONFIG = {
  panelGap: 8,
  borderWidth: 3,
  maxPanelsPerRow: 3,
  minPanelHeight: 200,
  maxPanelHeight: 400,
  captionHeight: 80,
  gapThresholdYears: 20,
} as const;

export type PanelSize = 'small' | 'medium' | 'large' | 'wide' | 'tall';

export const PANEL_LAYOUTS: PanelSize[][] = [
  ['large', 'medium', 'small'],
  ['wide', 'medium'],
  ['tall', 'small', 'small'],
  ['medium', 'medium', 'medium'],
  ['small', 'large', 'small'],
  ['medium', 'wide'],
  ['small', 'small', 'tall'],
];
