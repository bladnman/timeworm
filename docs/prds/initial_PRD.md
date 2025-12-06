# TimeWorm – Timeline Viewer
**Product Requirements Document (PRD)**

## 1. Product Summary

**Working name:** TimeWorm  
**Concept:** A viewer-first web experience for exploring timeline data, where the user lands directly in a rich, immersive timeline and can switch between different visualizations of the same underlying data.

The emphasis is on:

- The **experience of the data**, not the scaffolding around it.
- The ability to **hot-swap visualization modes** without changing the data.
- A **comfortable, visually high-fidelity** reading and browsing experience on both desktop and mobile browsers.

---

## 2. Objectives

### 2.1 Primary objectives

1. **Viewer-first entry point**  
   Users arrive directly in a timeline view, with the timeline occupying the majority of the screen, similar to a video player in playback mode.

2. **Multiple visualization modes for the same timeline**  
   The system supports at least two distinct visualization modes ("views") for a single timeline dataset and allows the user to switch between them.

3. **Clean separation between data and visualization**  
   All visualization modes use the same canonical timeline data. Visualizations are interchangeable; swapping views does not require altering the data.

4. **High-quality visual and reading experience**  
   Timeline content is easy to read, visually appealing, and comfortable to use on both desktop and mobile. Time relationships are communicated clearly where relevant.

5. **Future extensibility**  
   The architecture is prepared for:
   - Additional visualization modes
   - Additional timeline datasets
   - Future persistence / cloud data sources  
   …without breaking the core viewer experience.

### 2.2 Non-goals (for this version)

- User authentication and accounts
- Collaborative editing or multi-user features
- In-app editing of timeline data
- Complex analytics, filtering, or search
- Advanced or experimental visualization types (3D, physics, etc.)

---

## 3. Users & Use Cases

### 3.1 Primary user

A technically minded user (e.g., maker, researcher, or enthusiast) who wants to **explore a curated timeline** visually, not author it. They may later want to load other timelines, but for this version a single curated dataset is sufficient.

### 3.2 Core use cases

1. **Explore a single curated timeline**
   - User opens the app and immediately sees a timeline.
   - User scrolls or pans through events.
   - User taps/clicks on an event to see richer details.

2. **Switch between different visualizations of the same timeline**
   - User starts in a default view.
   - User opens a small, unobtrusive control and switches to another visualization mode.
   - The same timeline data is shown differently; key context (e.g., which event is selected) is preserved where reasonable.

---

## 4. Experience Overview

### 4.1 Entry and layout

- On first load, the system:
  - Loads a default timeline dataset.
  - Displays a default visualization mode "full-bleed" or nearly full-screen.
- Minimal persistent chrome:
  - A small area for app identity (name/logo).
  - A subtle control to access:
    - View switching (between visualization modes).
    - Basic information about the current timeline (title, description).

### 4.2 Main interaction patterns

- **Scrolling / panning**
  - Users can move along the timeline (vertically or horizontally, depending on the active view) using familiar scroll/drag gestures.
- **Event selection**
  - Selecting an event (click/tap) reveals more detail in a dedicated area (overlay, side panel, or similar), owned by the host experience, not the visualization itself.
- **View switching**
  - Users can switch visualization modes using a simple control.
  - Switching views does **not** reload the timeline dataset.
  - If an event is currently selected, the new view should reflect that selection where possible.

### 4.3 Detail view

- A consistent, host-owned detail area shows:
  - Event title
  - Relevant dates
  - Group or category (if applicable)
  - Short and/or long descriptions
  - Optional media references (images, links, etc.), when present
- The detail area:
  - Has a clear way to close it.
  - Feels visually coherent across all visualization modes.

---

## 5. Functional Requirements

### 5.1 Timeline data & datasets

1. **Single canonical timeline data model**
   - The system maintains one internal representation of the timeline data that all visualization modes use.
   - Events must at minimum include an identifier, a title, and a date or date range.
   - Optional concepts such as grouping, summaries, long descriptions, and media references must be supported.

2. **Initial data source**
   - For this version, the system reads from **one fixed dataset** configured at deploy time (e.g., a single static source).
   - It must be possible to later substitute this single source with a different mechanism (e.g., database, API) without changing visualization behavior.

3. **Data validation & error handling**
   - If the dataset fails to load, the system shows a clear error message and an option to retry.
   - If some data fields are missing (but minimum required fields are present), the system still renders the timeline gracefully, omitting unavailable information.

### 5.2 Timeline visualization modes

The system must support at least **two** visualization modes in the first version:

1. **Visualization A: Vertical reading view**
   - Events are presented in chronological order in a vertical layout.
   - Each event shows:
     - At least a date (or key date) and title.
     - Optional summary if available.
   - Events are visually separated but not overly framed or boxed.
   - Selecting an event triggers the shared detail view.

2. **Visualization B: Horizontal time track**
   - Events are arranged along a horizontal axis that represents time.
   - The user can scroll horizontally to explore earlier and later events.
   - The relative spacing between events along the main axis should convey **relative time differences** in a recognizable way.
   - Basic temporal markers (e.g., years or major periods) help orient the user.
   - Selecting an event triggers the shared detail view.

General visualization requirements:

- All visualization modes:
  - Use the same underlying dataset.
  - React appropriately when the user changes the selected event.
  - Do not attempt to own or override the shared detail experience.

### 5.3 View management & mode switching

1. **Default mode**
   - The system defines a default visualization mode that is used on first load.

2. **Mode switching UI**
   - The system provides a simple control (e.g., menu or toggle) allowing the user to switch between modes.
   - The available modes must be clearly labeled (e.g., "Vertical List," "Horizontal Track").

3. **State continuity**
   - When switching modes:
     - The currently loaded dataset remains the same.
     - Any selection state (if reasonable) is preserved: if an event is selected and the new mode can represent it, it should appear selected there as well.

4. **Extensibility**
   - It must be possible to add new visualization modes in the future without changing the behavior of existing modes or the data representation.

### 5.4 Responsive behavior

1. **Desktop**
   - The timeline view uses the available width and height to prioritize the visualization canvas and keep controls secondary.
   - The detail view can appear as an overlay, side panel, or similar without obscuring the entire visualization unless necessary.

2. **Mobile**
   - All interactions must be usable via touch:
     - Comfortable tap targets.
     - Usable scroll/pan gestures.
   - The detail view may take over most or all of the screen on small devices but must provide a clear way back to the visualization.

### 5.5 Loading, empty, and error states

- **Loading state**
  - Before data is ready, show a simple, unobtrusive loading indicator.
- **Empty state**
  - If the dataset is empty or unusable, show a clear message describing the situation.
- **Error state**
  - Show an understandable error message and provide a retry action if data loading fails.

---

## 6. Visual & UX Requirements

1. **Time representation**
   - In any mode that visually encodes time as spatial distance, the spacing must be broadly proportional to actual time intervals, or there must be a clear indication if it is not.
   - Users should be able to infer rough temporal relationships (e.g., "these events are close together in time," "this gap was long").

2. **Typography and readability**
   - Body text must be comfortably readable on both desktop and mobile.
   - Detail views must not feel cramped; use sufficient line spacing and margins.

3. **Contrast and clarity**
   - Text and key interactive elements must be clearly distinguishable from the background.
   - Avoid low-contrast color combinations for primary text and controls.

4. **Visual hierarchy**
   - Event titles, dates, and key information should be easily scannable.
   - Chrome (menus, labels, controls) should be clearly present but secondary to the timeline content.

5. **Motion**
   - Any animations (scrolling, transitions between modes, detail view opening) should be smooth, subtle, and not distracting.
   - Avoid overly "flashy" effects that compete with the content.

---

## 7. Non-Functional Requirements

1. **Performance**
   - The system should comfortably handle timelines of at least a few hundred events without significant lag on modern desktop and mid-range mobile devices.
   - Scrolling and basic interactions should feel smooth.

2. **Reliability**
   - The system should continue to operate if some optional fields are missing from events.
   - Failure to load the dataset must be communicated clearly, with a way to attempt a reload.

3. **Extensibility**
   - Adding:
     - Additional visualization modes, and
     - Additional timeline datasets (in a future iteration)  
     should not require a fundamental rewrite of the existing viewer experience.

4. **Technology constraints (high level)**
   - The system will be delivered as a web application usable in modern browsers.
   - Implementation details (frameworks, internal component structure, data formats) are not specified in this document and are left to planning and design.

---

## 8. Out of Scope (Explicit)

- Authorization, user accounts, and personalized user profiles
- Uploading or editing timeline data through the UI
- Synchronization between multiple users or devices
- Sharing, embedding, or exporting timelines
- Full analytics dashboards or advanced filters

---

## 9. Future Directions (Context Only)

These are not part of the current scope but should inform decisions where multiple options are equivalent:

- Support for multiple timelines and a library/selector experience.
- User-selectable themes or appearance preferences.
- Editing and authoring tools for building timelines.
- More advanced visualization families (clustered views, multi-axis views, comparative timelines, etc.).

---

## 10. Multi-Modal Visualization Architecture

### 10.1 Overview

The system must be architected to support **Interchangeable Visualization Strategies**. The core application must be capable of managing a centralized data set while allowing the user to seamlessly switch between completely distinct visual representations (e.g., Linear Timeline, Spiral Graph, Galaxy Cluster) without reloading data or losing application state.

### 10.2 Core Functional Mandates

#### 10.2.1 Decoupled Presentation Layer

* **Requirement:** The application's data management layer (loading, parsing, selection state) must be strictly decoupled from the visualization layer.
* **Behavior:** The core system shall provide a standardized data payload (The Contract) to the active view. It is the responsibility of the *View* to interpret, scale, and render that data. The Core System must not contain logic specific to the geometry or rendering rules of any single view.

#### 10.2.2 View-Specific Intelligence (Encapsulation)

* **Requirement:** Each Visualization Strategy must be self-contained and responsible for its own internal logic.
* **Scope of Responsibility:**
  * **Coordinate Systems:** The view defines whether it is Cartesian, Polar, or Abstract.
  * **Level of Detail (LOD) & Semantic Zoom:** The view determines how data is aggregated or revealed at different zoom levels (e.g., a "Year" view opening up into "Months").
  * **Input Handling:** The view manages its own pan, zoom, and interaction physics.

#### 10.2.3 Polymorphic Interchangeability

* **Requirement:** All visualizations must act as "Pluggable Strategies."
* **Behavior:** The system must allow for the addition of new visualization types (e.g., adding a "Vertical Stack" view) without requiring refactoring of the Core Application logic or existing views. All views must subscribe to the same input contract.

#### 10.2.4 Shared Application State

* **Requirement:** While views are distinct, they share a common "Truth."
* **Behavior:**
  * **Selection Sync:** Selecting an item in the active view must update the global selection state.
  * **Time Range Sync:** If applicable, changing the time range in the global controller must propagate to the active view.

### 10.3 User Experience Goals

* **Seamless Transition:** Switching from View A to View B should feel like changing a lens, not changing applications.
* **Contextual Fidelity:** A "Spiral" view should behave mathematically like a spiral (angles, radii) while a "Linear" view behaves linearly. The user should not feel like one view is "faking" the behavior of the other.

