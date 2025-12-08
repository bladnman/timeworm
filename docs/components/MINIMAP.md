# MiniMap Component Specification

## Purpose

The MiniMap provides **navigational context** for the main timeline. It answers the questions: *Where am I?* and *How do I get somewhere else?*

It is not a miniature replica of the timeline—it's a **navigation control** that shows position, enables movement, and maintains orientation within potentially vast time ranges.

## Core Behaviors

### The Viewport Indicator

The viewport indicator represents the main timeline's visible window within the minimap. Its position and size communicate:

- **Position**: Where in the timeline you're currently looking
- **Width**: How much of the timeline is currently visible (zoom level)

The indicator should remain **comfortably sized** (~25% of the minimap width) regardless of the main timeline's zoom level. When the main view zooms in deeply, the minimap adjusts its own range rather than shrinking the indicator to an unusable sliver.

### Always Following

The minimap **follows the main timeline**. As the user scrolls, pans, or navigates the main view, the minimap automatically adjusts to keep the viewport indicator visible and roughly centered.

This creates a sense of the minimap "watching" where you are, providing continuous context without requiring manual adjustment.

**Exception**: When the user directly manipulates the minimap (dragging, scrolling), the auto-follow pauses until the interaction ends.

### Independent Zoom

The minimap has its own zoom state, separate from the main timeline. It shows a **window into the total time range**, not necessarily the entire range.

- When the main view is zoomed far in, the minimap zooms to show a relevant portion (keeping the viewport indicator at ~25%)
- When the main view is zoomed out, the minimap may show the full range
- The minimap can be manually zoomed via scroll wheel to show more or less temporal context

## Interactions

### Click on Track
Clicking anywhere on the minimap track (outside the viewport indicator) **centers the main timeline** at that position. This is the primary "jump to" navigation.

### Drag Viewport Indicator
Dragging the indicator **pans the main timeline** in real-time. The minimap shows a ghost of the original position during drag.

### Drag Viewport Edges
Dragging the left or right edge of the indicator **zooms the main timeline**. Shrinking the indicator zooms in; expanding it zooms out.

When dragging an edge to the boundary of the minimap, **auto-scroll** kicks in—the minimap pans to reveal more timeline, allowing continuous zoom adjustment beyond the initially visible range.

### Scroll on Track
- **Vertical scroll**: Zooms the minimap in/out (centered on cursor position)
- **Horizontal scroll** (or Shift+vertical): Pans the minimap left/right

## Visual Indicators

### Year Labels
Display the minimap's current range boundaries (e.g., "1920" to "2010"), not the total timeline range. These update as the minimap pans or zooms.

### Context Bar
A thin indicator above the main track showing where the minimap's current view sits within the **total** timeline. This provides meta-context: "The minimap is showing the middle third of all time."

Only visible when the minimap is not showing the full range.

### Edge Indicators
When the minimap is zoomed in and more timeline exists beyond its boundaries:
- **Left edge**: Shows the earliest year (e.g., "< 1743") with an arrow
- **Right edge**: Shows the latest year (e.g., "2045 >") with an arrow

These communicate that scrolling/panning will reveal more content.

### Event Markers
Small dots on the track indicate where events exist within the visible range. Clusters may appear slightly larger or more prominent. These provide a "density preview" without attempting to show actual event content.

## Boundaries & Constraints

### Minimum Viewport Size
The viewport indicator has a minimum width (prevents it from becoming too small to interact with). When the main view zooms beyond this threshold, the minimap responds by adjusting its own range.

### Range Limits
The minimap cannot pan or zoom beyond the total timeline boundaries. At the edges, it stops rather than showing empty space.

### Zoom Limits
The minimap has minimum and maximum zoom levels:
- **Minimum**: Cannot zoom in beyond meaningful data granularity
- **Maximum**: Full timeline range (showing everything)

## Mobile Considerations

On touch devices, the resize handles at viewport edges are not easily discoverable. **Tapping** the viewport indicator toggles visible handle affordances, making resize operations accessible without hover states.

## What This Component Does NOT Do

- **Display event content**: The minimap shows position, not data. Event cards, details, and labels belong to the main timeline.
- **Filter or select**: It's purely navigational. Selection state is managed elsewhere.
- **Replace the timeline**: It's a complement, not a substitute. Users should be able to hide it if screen space is limited.

## Success Criteria

The minimap succeeds when users:
1. Always know where they are in the timeline
2. Can quickly jump to any temporal region
3. Can smoothly adjust zoom via edge dragging
4. Never lose their viewport indicator (it stays visible and usable)
5. Understand when more content exists beyond the visible range
