# System Architecture & Development Guidelines

## 1. Architecture: Host + Strategies

**Pattern:** Monolith with Modular Internals

- **Host (Core App):** Manages global state (Data, Selection, Range), injects into active View
- **Strategies (Views):** Encapsulated subsystems handling their own rendering, math, and local state

## 2. Directory Structure

**Fractal Architecture:** Every component follows the same pattern—a directory containing its own hooks, utils, and sub-components.

**Naming Rule:** Avoid `index.tsx`. Main file matches directory name (`MyComponent/MyComponent.tsx`).

```
src/
├── config/          # Global constants & env vars
├── theme/           # Design tokens & styling
├── components/      # Shared UI primitives
├── hooks/           # Global hooks
├── utils/           # Global pure functions
└── views/           # Visualization Strategies
    └── FeatureName/
        ├── FeatureName.tsx
        ├── hooks/
        ├── utils/
        └── components/
            └── SubFeature/
                ├── SubFeature.tsx
                └── hooks/
```

## 3. View Implementation Rules

- **Standardized Input:** Views accept generic DTOs. Host doesn't pass view-specific config.
- **Internal Derivation:** View-specific transformations happen inside the view via adapters.
- **LOD Ownership:** Views manage their own Level of Detail logic based on internal zoom state.

## 4. Code Standards

### Humble Views
- TSX files contain markup and binding only
- Extract all logic to custom hooks: `const { data, handlers } = useComponentLogic()`

### No Magic Numbers
- Constants go in `src/config/` or local `constants.ts`
- Use theme tokens, not raw hex codes or pixel values

### Co-location
- Component-specific hooks/utils live inside that component's directory
- If SubComponent is only used by Parent, it lives in `Parent/components/SubComponent/`

### Quality
- Lint-clean code
- Unit tests for critical logic (adjacent to source files)

## 5. Open Agent System

**CRITICAL: Read `open-agents/INSTRUCTIONS.md` immediately when processing data or working with the inbox.**

This project includes an Open Agent System for automating data workflows:

| Agent | Command | Description |
|-------|---------|-------------|
| Ingest | `/agents:ingest` | Transform inbox files into timeline data |

See `open-agents/README.md` for full documentation.