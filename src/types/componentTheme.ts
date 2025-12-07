/**
 * Shared Component Theming System
 *
 * This module provides a standardized way for views to customize shared components
 * while maintaining consistent behavior and glass UI defaults.
 */

/**
 * Core accent color configuration.
 * Views can provide these to customize shared components.
 */
export interface AccentColors {
  /** Primary accent color (default: --color-text-accent / sky-400) */
  primary: string;
  /** Secondary accent for gradients or highlights (optional) */
  secondary?: string;
  /** Muted variant for inactive states */
  muted?: string;
}

/**
 * Glass UI styling configuration.
 * Enables semi-transparent, outline-based UI patterns.
 */
export interface GlassStyle {
  /** Background opacity (0-1), default 0.15 */
  backgroundOpacity?: number;
  /** Border opacity (0-1), default 1 */
  borderOpacity?: number;
  /** Blur amount in pixels (0 = no blur) */
  blur?: number;
  /** Whether to use outline-only style (no fill) */
  outlineOnly?: boolean;
}

/**
 * Component theme configuration.
 * Views pass this to shared components for consistent theming.
 */
export interface ComponentTheme {
  /** Accent colors for interactive elements */
  accent: AccentColors;
  /** Glass UI styling options */
  glass?: GlassStyle;
  /** Whether to show labels/text (some views may want minimal UI) */
  showLabels?: boolean;
  /** Component size variant */
  size?: 'compact' | 'default' | 'large';
}

/**
 * Default theme using glass UI with sky-400 accent.
 */
export const DEFAULT_COMPONENT_THEME: ComponentTheme = {
  accent: {
    primary: 'var(--color-text-accent)',
    secondary: 'var(--color-accent-secondary)',
    muted: 'var(--color-text-secondary)',
  },
  glass: {
    backgroundOpacity: 0.15,
    borderOpacity: 1,
    blur: 0,
    outlineOnly: false,
  },
  showLabels: true,
  size: 'default',
};

/**
 * Utility to create a theme with custom accent colors.
 */
export function createTheme(
  primaryAccent: string,
  options?: Partial<Omit<ComponentTheme, 'accent'>> & {
    secondaryAccent?: string;
    mutedAccent?: string;
  }
): ComponentTheme {
  return {
    ...DEFAULT_COMPONENT_THEME,
    accent: {
      primary: primaryAccent,
      secondary: options?.secondaryAccent ?? DEFAULT_COMPONENT_THEME.accent.secondary,
      muted: options?.mutedAccent ?? DEFAULT_COMPONENT_THEME.accent.muted,
    },
    glass: { ...DEFAULT_COMPONENT_THEME.glass, ...options?.glass },
    showLabels: options?.showLabels ?? DEFAULT_COMPONENT_THEME.showLabels,
    size: options?.size ?? DEFAULT_COMPONENT_THEME.size,
  };
}

/**
 * Common preset themes for different visualization styles.
 */
export const THEME_PRESETS = {
  /** Default sky-blue glass UI */
  default: DEFAULT_COMPONENT_THEME,

  /** Warm amber/orange theme */
  warm: createTheme('#f59e0b', { secondaryAccent: '#ef4444' }),

  /** Green nature theme */
  nature: createTheme('#22c55e', { secondaryAccent: '#10b981' }),

  /** Purple/violet theme */
  cosmic: createTheme('#8b5cf6', { secondaryAccent: '#ec4899' }),

  /** Minimal outline-only style */
  minimal: createTheme('var(--color-text-accent)', {
    glass: { outlineOnly: true, backgroundOpacity: 0 },
    showLabels: false,
    size: 'compact',
  }),
} as const;

/**
 * CSS custom property names for component theming.
 * Components use these as CSS variables that can be overridden.
 */
export const THEME_CSS_VARS = {
  accentPrimary: '--tw-component-accent',
  accentSecondary: '--tw-component-accent-secondary',
  accentMuted: '--tw-component-accent-muted',
  glassBackground: '--tw-component-glass-bg',
  glassBorder: '--tw-component-glass-border',
} as const;

/**
 * Generate CSS custom properties from a theme configuration.
 * Use this to apply theme as inline styles on a component wrapper.
 */
export function themeToCSS(theme: ComponentTheme): React.CSSProperties {
  const opacity = theme.glass?.backgroundOpacity ?? 0.15;

  return {
    [THEME_CSS_VARS.accentPrimary]: theme.accent.primary,
    [THEME_CSS_VARS.accentSecondary]: theme.accent.secondary ?? theme.accent.primary,
    [THEME_CSS_VARS.accentMuted]: theme.accent.muted ?? 'var(--color-text-secondary)',
    [THEME_CSS_VARS.glassBackground]: `rgba(56, 189, 248, ${opacity})`,
    [THEME_CSS_VARS.glassBorder]: theme.accent.primary,
  } as React.CSSProperties;
}
