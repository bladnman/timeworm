# Timeline View Brief

## Core Concept

A timeline visualizer renders temporal data in a way that communicates **the passage and relationship of time**. Each view receives a dataset with temporal boundaries (`startDate`, `endDate`) and items positioned within that range.

The goal is not merely to plot points—it's to make time **legible**. Users should perceive:
- How much time has passed between events
- Where gaps or clusters exist
- The rhythm and density of activity over time

## Key Principles

### Time as the Primary Dimension
Time differences matter. A gap of 3 years should feel different than a gap of 3 days. Consider using:
- Logarithmic scaling to compress long stretches while preserving recent detail
- Visual separators or markers to indicate temporal jumps
- Subtle cues (fading, spacing, connectors) to show continuity or discontinuity

### Level of Detail (LOD)
Views must handle zoom. When the viewport spans a wide time range:
- Don't render every item—aggregate, summarize, or sample
- Use indicators to show "N items here" rather than visual noise
- Reveal detail progressively as the user zooms in

When zoomed in tightly:
- Show individual items with full fidelity
- Enable interaction with specific data points

### Axis & Reference Labeling
Provide temporal context appropriate to the view's design. This might be:
- Traditional axis labels (years, months, days)
- Contextual markers ("2 years ago", "last week")
- Reference lines or regions

The approach should fit the view's visual language—there's no single correct way.

### Navigating Density
When many items occupy the same visual space:
- Design interaction patterns for drilling into clusters
- Consider stacking, expanding, or sequential reveal
- Avoid forcing the user to parse overlapping elements

## Implementation Context

### Location
Views live in `src/views/`. Name directories descriptively based on the visualization type (e.g., `StreamView`, `RadialTimeline`, `DensityMap`).

### Structure
Each view is self-contained:
```
src/views/YourView/
├── YourView.tsx      # Main component
├── hooks/            # View-specific logic
├── utils/            # View-specific helpers
└── components/       # Internal subcomponents
```

### Data Contract
Views receive temporal data as props—they do not fetch data. The host provides:
- `startDate` / `endDate` — the visible time range
- `items` — the dataset to visualize
- Selection and interaction callbacks

Views own their internal transformations. Convert the generic input into whatever internal representation serves the visualization.

### Freedom of Expression
Each view can look radically different. There are no requirements for:
- Specific chart types (lines, dots, bars)
- Fixed layouts or orientations
- Particular interaction patterns

The only mandate is **making time understandable** for the data at hand.
