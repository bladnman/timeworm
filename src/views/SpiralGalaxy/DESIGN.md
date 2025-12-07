# Spiral Galaxy Timeline View — Design Specification

## Overview

The Spiral Galaxy view represents time as a logarithmic spiral winding inward toward a central "now" point. Older events occupy the outer arms; newer events cluster near the galactic core. This creates a cosmic metaphor where the user stands at the center of time, looking outward at history.

---

## 1. Spiral Geometry & Time Mapping

### 1.1 The Spiral Path

The timeline uses an **Archimedean spiral** with logarithmic time scaling:

```
r(θ) = r_min + (r_max - r_min) × normalizedTime(θ)
```

Where:
- `r_min` = inner radius (newest event position)
- `r_max` = outer radius (oldest event position)
- `θ` (theta) = angular position along the spiral (increases with age)
- `normalizedTime` maps chronological time to [0, 1] range

### 1.2 Time-to-Angle Mapping

Events are positioned by converting their timestamp to an angle:

```typescript
interface SpiralMapping {
  // Maps a date to (x, y) coordinates on the spiral
  getPosition(dateStr: string): { x: number; y: number; angle: number; radius: number };

  // Returns the angle for a given date
  getAngle(dateStr: string): number;

  // Returns the radius for a given date
  getRadius(dateStr: string): number;
}
```

**Time Scaling Options:**

| Scale Type | Use Case | Formula |
|------------|----------|---------|
| Linear | Short spans (< 100 years) | `t_norm = (date - minDate) / (maxDate - minDate)` |
| Logarithmic | Long spans (millennia) | `t_norm = log(1 + date - minDate) / log(1 + maxDate - minDate)` |
| Adaptive | Auto-select based on range | Logarithmic if span > 500 years, else linear |

**Angular Distribution:**

The spiral completes multiple revolutions. The number of "windings" should scale with the time range:

```typescript
const WINDINGS_CONFIG = {
  minWindings: 2,        // Minimum spiral revolutions
  maxWindings: 8,        // Maximum before it gets too tight
  yearsPerWinding: 100,  // Base ratio for calculating windings
};

function calculateWindings(totalYears: number): number {
  const rawWindings = Math.ceil(totalYears / WINDINGS_CONFIG.yearsPerWinding);
  return clamp(rawWindings, WINDINGS_CONFIG.minWindings, WINDINGS_CONFIG.maxWindings);
}
```

### 1.3 Spiral Direction

The spiral winds **clockwise inward**, matching the intuitive "drilling into the present" metaphor:
- Starting angle: 12 o'clock position (0° / top of canvas)
- Rotation: Clockwise (positive θ goes right, then down)
- Innermost point: Center of the canvas (newest event)

---

## 2. Visual Structure

### 2.1 Layout Components

```
┌─────────────────────────────────────────────────────┐
│                    Canvas Area                       │
│                                                      │
│              ╭──── Orbit Rings ────╮                │
│            ╱                        ╲               │
│          ╱    ● ← Event Node          ╲             │
│        ╱        ╲                       ╲           │
│       │          ╲  ●                    │          │
│       │           ╲   ╲                  │          │
│       │            ●    ╲                │          │
│       │             ╲    ╲               │          │
│       │              ╲    ●              │          │
│       │               ╲   ╲              │          │
│       │                ╲   NOW ⦿         │          │
│       │                 ╲                │          │
│        ╲                  ╱              ╱          │
│          ╲              ╱              ╱            │
│            ╲__________╱──────────────╱              │
│                                                      │
│   [Era Labels along orbit rings]                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 2.2 Component Hierarchy

```
SpiralGalaxyView
├── SpiralCanvas (SVG container)
│   ├── OrbitRings (background reference circles)
│   ├── SpiralPath (the main spiral line/trail)
│   ├── TimeMarkers (era/date labels along the spiral)
│   ├── EventNodes (positioned event dots)
│   └── CenterMarker ("Now" indicator at the core)
├── EventTooltip (hover detail panel)
├── TimelineScrubber (optional playhead control)
└── ZoomControls (zoom in/out buttons)
```

### 2.3 Visual Elements

#### Orbit Rings
Faint concentric circles providing temporal reference:
- Positioned at consistent time intervals (e.g., every century for long spans)
- Labeled with era markers ("1900", "1800", "1700"...)
- Opacity: 0.15–0.25 (subtle, not distracting)
- Style: Dashed or dotted lines

```typescript
interface OrbitRing {
  radius: number;
  label: string;       // "1900", "500 BCE", etc.
  year: number;        // Numeric year for sorting
  opacity: number;     // Decreasing toward outer rings
}
```

#### Spiral Path
The main visual timeline connecting events:
- Rendered as an SVG `<path>` using quadratic/cubic Bezier curves
- Gradient color: Outer (older) is more faded, inner (newer) is brighter
- Width: Thin (1-2px) to avoid visual clutter
- Optional: Subtle glow effect on the path

#### Event Nodes
Interactive points representing timeline events:
- Base size: 8–16px diameter
- Size encoding: Can scale by "importance" if data provides a weight
- Color encoding: Category/group mapping
- Hover state: Glow + size increase
- Selected state: Pulsing animation + connector line to tooltip

```typescript
interface EventNodeStyle {
  radius: number;           // Base 6, scaled by importance
  fill: string;             // Category color from theme
  stroke: string;           // Border color
  strokeWidth: number;      // 1-2px
  opacity: number;          // 0.8 base, 1.0 on hover
  glowRadius?: number;      // Optional glow spread
}
```

#### Center Marker
The "now" point at the spiral's core:
- Fixed at canvas center
- Pulsing animation (gentle radial glow)
- Label: "Now" or the most recent date
- Acts as visual anchor

---

## 3. Level of Detail (LOD) System

### 3.1 Zoom Levels

| Level | Zoom Range | Behavior |
|-------|------------|----------|
| Overview | < 0.5x | Aggregate clusters, hide labels |
| Standard | 0.5x – 2x | Show all nodes, abbreviated labels |
| Detail | > 2x | Full labels, expanded node sizes |

### 3.2 Density Management

When events cluster too tightly:

```typescript
interface ClusterConfig {
  minDistance: number;        // Minimum pixels between nodes (20px)
  clusterThreshold: number;   // Max events before clustering (5)
  clusterRadius: number;      // Visual size of cluster indicator
}
```

**Clustering Algorithm:**
1. Calculate pixel distance between adjacent events on spiral
2. If distance < `minDistance`, group into cluster
3. Render cluster as single node with count badge
4. On click/hover, expand cluster into mini-arc

### 3.3 Label Visibility

```typescript
type LabelVisibility = 'hidden' | 'abbreviated' | 'full';

function getLabelVisibility(zoom: number, density: number): LabelVisibility {
  if (zoom < 0.5 || density > 10) return 'hidden';
  if (zoom < 1.5 || density > 5) return 'abbreviated';
  return 'full';
}
```

---

## 4. Interaction Design

### 4.1 Pan & Zoom

**Zoom Behavior:**
- Mouse wheel / pinch gesture zooms around cursor position
- Zoom range: 0.25x – 4x
- Animation: Smooth spring easing (300ms)

**Pan Behavior:**
- Click + drag moves the viewport
- Inertial scrolling for natural feel
- Boundary constraints prevent over-panning

```typescript
interface ViewportState {
  centerX: number;        // Canvas center X offset
  centerY: number;        // Canvas center Y offset
  zoom: number;           // 1.0 = default view
}
```

### 4.2 Event Interaction

**Hover:**
1. Node scales up 1.25x
2. Subtle glow appears
3. Tooltip fades in near the node (positioned to avoid overlap)
4. Spiral path segment highlights from event to center

**Click/Tap:**
1. Node enters selected state (pulsing)
2. Detail panel opens (uses existing DetailOverlay component)
3. Other nodes dim slightly (focus effect)

**Deselect:**
- Click on empty canvas area
- Press Escape key
- Click another event

### 4.3 Time Scrubber (Optional)

A linear control that maps to spiral position:

```
┌────────────────────────────────────────────────────┐
│ ○───────────────────●────────────────────────────○ │
│ 150 BCE           NOW                          2025│
└────────────────────────────────────────────────────┘
```

- Dragging the playhead animates a highlight along the spiral
- Events illuminate as the playhead passes them
- Optional auto-play mode for chronological animation

---

## 5. Color & Styling

### 5.1 Theme Integration

Uses existing theme tokens from `src/theme/tokens.css`:

```css
.spiralGalaxy {
  --spiral-bg: var(--color-bg-canvas);
  --spiral-path: var(--color-text-secondary);
  --spiral-path-glow: var(--color-text-accent);
  --orbit-ring: var(--color-border);
  --node-default: var(--color-text-accent);
  --node-hover: var(--color-text-primary);
  --label-color: var(--color-text-secondary);
}
```

### 5.2 Category Color Mapping

Events are colored by their `group_ids` or `type`:

```typescript
const CATEGORY_COLORS: Record<string, string> = {
  default: 'var(--color-text-accent)',      // Sky blue
  hardware: '#f59e0b',                       // Amber
  software: '#10b981',                       // Emerald
  theory: '#8b5cf6',                         // Violet
  milestone: '#ef4444',                      // Red
};

function getEventColor(event: TimelineEvent): string {
  return CATEGORY_COLORS[event.type] ?? CATEGORY_COLORS.default;
}
```

### 5.3 Visual Hierarchy

| Element | Opacity | Z-Index | Notes |
|---------|---------|---------|-------|
| Canvas Background | 1.0 | 0 | Solid dark base |
| Orbit Rings | 0.15 | 1 | Subtle reference |
| Spiral Path | 0.4–0.8 | 2 | Gradient fade |
| Event Nodes | 0.8–1.0 | 3 | Primary focus |
| Hovered Node | 1.0 | 4 | Elevated |
| Labels | 0.7 | 3 | Secondary |
| Tooltip | 1.0 | 10 | Above all |

---

## 6. Mathematical Utilities

### 6.1 Core Functions

```typescript
// hooks/useSpiralGeometry.ts

interface SpiralConfig {
  centerX: number;
  centerY: number;
  innerRadius: number;      // Radius at newest point (e.g., 50px)
  outerRadius: number;      // Radius at oldest point (e.g., 400px)
  windings: number;         // Number of spiral revolutions
  startAngle: number;       // Starting angle in radians (0 = 12 o'clock)
  clockwise: boolean;       // Direction of winding
}

interface SpiralPoint {
  x: number;
  y: number;
  angle: number;            // Radians from center
  radius: number;           // Distance from center
  normalizedTime: number;   // 0 = oldest, 1 = newest
}

function useSpiralGeometry(
  events: TimelineEvent[],
  config: SpiralConfig
): {
  getEventPosition: (event: TimelineEvent) => SpiralPoint;
  getSpiralPath: () => string;  // SVG path data
  getTimeAtAngle: (angle: number) => ParsedDate;
  getAngleAtTime: (date: ParsedDate) => number;
}
```

### 6.2 Spiral Path Generation

Generate smooth SVG path for the spiral:

```typescript
function generateSpiralPath(config: SpiralConfig, segments: number = 360): string {
  const points: string[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;  // 0 to 1
    const angle = config.startAngle + (t * config.windings * 2 * Math.PI);
    const radius = config.outerRadius - t * (config.outerRadius - config.innerRadius);

    const x = config.centerX + radius * Math.sin(angle);
    const y = config.centerY - radius * Math.cos(angle);

    points.push(i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }

  return points.join(' ');
}
```

### 6.3 Time-to-Position Mapping

```typescript
function mapTimeToSpiral(
  date: ParsedDate,
  minDate: ParsedDate,
  maxDate: ParsedDate,
  config: SpiralConfig,
  scale: 'linear' | 'logarithmic' = 'adaptive'
): SpiralPoint {
  // Normalize time to 0-1 (0 = oldest, 1 = newest)
  const timeSpan = maxDate.decimalYear - minDate.decimalYear;
  let normalizedTime: number;

  if (scale === 'logarithmic' || (scale === 'adaptive' && timeSpan > 500)) {
    // Logarithmic: compress ancient history, expand recent
    const logBase = Math.log(1 + timeSpan);
    const eventAge = date.decimalYear - minDate.decimalYear;
    normalizedTime = Math.log(1 + eventAge) / logBase;
  } else {
    // Linear: even distribution
    normalizedTime = (date.decimalYear - minDate.decimalYear) / timeSpan;
  }

  // Map to spiral (inverted: 0 = outer, 1 = inner)
  const spiralT = 1 - normalizedTime;  // Oldest at outer edge
  const angle = config.startAngle + spiralT * config.windings * 2 * Math.PI;
  const radius = config.innerRadius + spiralT * (config.outerRadius - config.innerRadius);

  const direction = config.clockwise ? 1 : -1;
  const x = config.centerX + radius * Math.sin(angle * direction);
  const y = config.centerY - radius * Math.cos(angle * direction);

  return { x, y, angle, radius, normalizedTime };
}
```

---

## 7. Responsive Behavior

### 7.1 Canvas Sizing

```typescript
interface CanvasDimensions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  maxRadius: number;  // Minimum of (width, height) / 2 - padding
}

function useCanvasDimensions(containerRef: RefObject<HTMLElement>): CanvasDimensions {
  // Observe container size, recalculate on resize
  // Center point is always container midpoint
  // maxRadius ensures spiral fits with padding
}
```

### 7.2 Breakpoint Adjustments

| Viewport | Spiral Adjustments |
|----------|-------------------|
| Mobile (< 640px) | Fewer windings, larger nodes, hide labels by default |
| Tablet (640–1024px) | Standard windings, medium nodes |
| Desktop (> 1024px) | Full windings, smallest nodes, all labels visible |

---

## 8. Accessibility

### 8.1 Keyboard Navigation

- **Tab**: Move focus between event nodes (chronological order)
- **Enter/Space**: Select focused node
- **Escape**: Deselect / close detail panel
- **Arrow Keys**: Pan the viewport
- **+/-**: Zoom in/out

### 8.2 Screen Reader Support

- Each event node has `role="button"` and `aria-label` with event title and date
- Spiral path has `aria-hidden="true"` (decorative)
- Selected event announced: "Selected: [Event Title], [Date]"
- Cluster nodes announce: "[N] events from [start] to [end]"

### 8.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .spiralGalaxy {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
  }

  .centerMarker {
    animation: none;
  }
}
```

---

## 9. Data Contract

### 9.1 Input Props

```typescript
interface SpiralGalaxyViewProps {
  // Inherited from context via useTimeline()
  // No explicit props needed - follows host pattern
}

// View accesses data via:
const { data, selectedEventId, selectEvent } = useTimeline();
```

### 9.2 Internal State

```typescript
interface SpiralViewState {
  viewport: ViewportState;           // Pan/zoom position
  hoveredEventId: string | null;     // Currently hovered event
  expandedClusterId: string | null;  // Expanded cluster (if any)
  playheadPosition: number;          // 0-1 for time scrubber
  isPlaying: boolean;                // Auto-play animation state
}
```

---

## 10. File Structure

```
src/views/SpiralGalaxy/
├── SpiralGalaxyView.tsx          # Main view component
├── SpiralGalaxyView.module.css   # Scoped styles
├── hooks/
│   ├── useSpiralView.ts          # Main view logic hook
│   ├── useSpiralGeometry.ts      # Spiral math utilities
│   ├── useSpiralClusters.ts      # Density clustering logic
│   ├── useSpiralInteraction.ts   # Pan/zoom/selection handlers
│   └── constants.ts              # View configuration
├── utils/
│   └── spiralMath.ts             # Pure geometry functions
└── components/
    ├── SpiralCanvas/
    │   ├── SpiralCanvas.tsx
    │   └── SpiralCanvas.module.css
    ├── OrbitRings/
    │   └── OrbitRings.tsx
    ├── EventNode/
    │   ├── EventNode.tsx
    │   └── EventNode.module.css
    ├── EventCluster/
    │   ├── EventCluster.tsx
    │   └── EventCluster.module.css
    ├── CenterMarker/
    │   └── CenterMarker.tsx
    ├── TimeScrubber/
    │   ├── TimeScrubber.tsx
    │   └── TimeScrubber.module.css
    └── SpiralTooltip/
        ├── SpiralTooltip.tsx
        └── SpiralTooltip.module.css
```

---

## 11. Implementation Priorities

### Phase 1: Core Spiral (MVP)
1. Basic spiral path rendering
2. Event node positioning with linear time mapping
3. Hover tooltips
4. Click-to-select integration with DetailOverlay

### Phase 2: Enhanced Visualization
1. Logarithmic time scaling option
2. Orbit ring reference lines with labels
3. Category color coding
4. Center marker with animation

### Phase 3: Interactivity
1. Pan & zoom with gestures
2. Smooth animations and transitions
3. Keyboard navigation
4. Density clustering for tight regions

### Phase 4: Polish
1. Time scrubber playhead
2. Auto-play animation mode
3. Responsive breakpoint adjustments
4. Performance optimization for large datasets

---

## 12. Performance Considerations

### 12.1 Rendering Optimization

- Use CSS transforms for pan/zoom (GPU-accelerated)
- Virtualize off-screen event nodes at extreme zoom levels
- Debounce viewport state updates during drag
- Memoize spiral path calculation (only recompute on resize/data change)

### 12.2 Large Dataset Handling

For datasets > 500 events:
- Pre-compute spatial clusters on data load
- Use quadtree for fast nearest-neighbor queries
- Progressive rendering: prioritize visible viewport

---

## Appendix: Visual Reference

### Desired Aesthetic

The spiral should evoke:
- A calm, contemplative view of history
- Starfield/cosmic atmosphere without literal stars
- Clean, minimal UI that doesn't compete with content
- Smooth, organic curves (not angular or mechanical)

### Anti-Patterns to Avoid

- Garish colors or excessive contrast
- Literal galaxy artwork (stars, nebulae, planets)
- Dense labeling that obscures the spiral
- Abrupt visual transitions or jarring animations
- Misleading equal spacing for unequal time intervals
