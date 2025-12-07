# TimeWorm PRD: Navigation & Editor Architecture

## Document Purpose

This PRD defines the **capabilities, user flows, and experiential qualities** required to complete TimeWorm's navigation and editing system. It is not a design specification—visual design, layout decisions, and specific UI patterns should emerge from the build process within these requirements.

---

## First-Order Requirement: Animation as Core Experience

**This is not polish. This is not "nice to have." Animation is fundamental to what TimeWorm is.**

TimeWorm is an application about experiencing time. The way users move through the application must reflect that. Every transition—between screens, between modes, between selected items—is an opportunity to reinforce that the user is moving through a continuous, crafted experience, not clicking between disconnected states.

### Animation Philosophy

**Blending, not switching.** Users should feel like they're flowing from one experience to the next. Hard cuts, instant appearances, and abrupt changes break the spell. The application should breathe.

**Coherent animation families.** Related actions should share animation DNA:
- Mode transitions (entering/exiting edit mode) should feel like zooming in and out of the work
- Selection transitions (moving between events) should flow as continuous movement through the timeline
- Navigation transitions (Home ↔ Timeline) should feel like stepping into and out of a timeline's world
- Destructive actions (delete) should have their own considered treatment—perhaps a graceful dissolve or recession

**Intentional timing.** Animations should have presence without causing delay. They orient and communicate; they don't make users wait.

**Theme consistency.** If edit mode uses a "zoom in" metaphor, that metaphor should be consistent. If panels emerge with a particular easing curve, that curve should be part of the application's motion vocabulary. The animation system should feel authored, not assembled.

### Animation Requirements by Context

| Context | Animation Intent | Feel |
|---------|------------------|------|
| **Home → Timeline** | Stepping into a world | Expansion, immersion, the timeline comes forward to meet you |
| **Timeline → Home** | Stepping back to see the library | Recession, the timeline recedes as the library emerges |
| **View → Edit mode** | Zooming in to work | The canvas adjusts, controls emerge from or around the visualization—continuous, not jarring |
| **Edit → View mode** | Stepping back to see the whole | Controls recede, canvas expands—like exhaling |
| **Selecting an event** | Focus shifts | The selected event gains presence; the previous selection gracefully releases; the detail editor arrives with intention |
| **Moving between events** | Continuous navigation | Should feel like moving along the timeline, not teleporting between disconnected forms |
| **Changing visualization** | Transformation | The canvas morphs, cross-fades, or otherwise transitions—never a hard swap |
| **Creating an event** | Arrival | New events should materialize with presence |
| **Deleting an event** | Graceful departure | Deleted items should recede, dissolve, or otherwise exit with dignity |
| **Auto-save indication** | Quiet confirmation | Subtle, non-disruptive acknowledgment that work is preserved |

### Investment Expectation

Building this animation system is not a final phase—it should be considered throughout implementation. Interactions built without animation consideration will need to be rebuilt. The motion design is as important as the information architecture.

---

## Design Philosophy

Beyond animation, TimeWorm should embody these qualities:

**High fidelity, not functional-minimum.** Every detail should feel considered.

**The visualization is the centerpiece.** All UI exists in service of the timeline experience. Controls should feel like they emerge from and recede into the visualization, not compete with it.

**Subtle over obvious.** Affordances should be discoverable but not shouty. Edit mode should feel like zooming into the work, not switching applications.

---

## Core Screens & Modes

### Home (Timeline Library)

**Purpose:** Browse and select from available timelines.

**User can:**
- See all available timelines represented as selectable items
- Understand at a glance what each timeline contains (name, scope, preview)
- Select a timeline to enter it in view mode

**Behavior:**
- Selecting a timeline navigates to that timeline in view mode
- No editing actions occur from Home—editing is entered from within a timeline
- Navigation to a timeline should feel like stepping into that world

---

### Timeline Screen

A single screen with two modes. The visualization remains present in both—modes differ in what controls and capabilities are available around it.

#### View Mode (Default)

**Purpose:** Immersive, distraction-free experience of the timeline.

**User can:**
- Experience the visualization at full fidelity
- Interact with the visualization as the chosen view allows
- Access a way to enter edit mode
- Return to Home

**Characteristics:**
- The visualization owns the space
- Controls are minimal or hidden until needed
- This is "present mode"—what you'd show someone else

#### Edit Mode

**Purpose:** Modify the timeline's content and presentation while maintaining visual context.

**User can:**
- Browse and select events from a list (independent of visualization state)
- Edit any event's details (all schema fields)
- Create new events
- Delete events
- Manage groups (create, rename, delete)
- Assign events to groups
- Select which visualization to use for this timeline
- Return to view mode
- Return to Home

**Characteristics:**
- Visualization remains visible and interactive, but shares space with editing controls
- Selecting an event (from list OR from visualization) opens its detail editor
- Changes auto-save
- Canvas and controls stay in sync
- Transition into/out of edit mode should feel like zooming in and out of the work

---

## User Flows

### Viewing a Timeline
```
Home → Select timeline → View mode (full visualization experience)
```

### Editing a Timeline
```
Home → Select timeline → View mode → Enter edit mode → Make changes → Exit to view mode
```

### Editing a Specific Event
```
(In edit mode) → Select event from list OR click event on canvas → Event detail editor appears → Edit fields → Auto-saves → Select another event or close editor
```

### Changing Visualization
```
(In edit mode) → Browse available visualizations → Select one → Canvas transforms to new visualization → Selection persists
```

---

## Conceptual Screen Representations

> **Important:** The following ASCII diagrams are **conceptual only**. They exist to communicate information architecture, relative magnitudes, and spatial relationships—not visual design, specific layouts, or implementation details. The actual UI should emerge from the build process and animation system. These are thinking tools, not blueprints.

---

### Home Screen (Conceptual)

*Communicates: multiple timeline items, selectable, library feel*

```
┌─────────────────────────────────────────────────────────────────┐
│ [Brand/Navigation area]                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     ┌───────────┐    ┌───────────┐    ┌───────────┐            │
│     │           │    │           │    │           │            │
│     │ Timeline  │    │ Timeline  │    │ Timeline  │            │
│     │ Preview   │    │ Preview   │    │ Preview   │            │
│     │           │    │           │    │           │            │
│     │  Name     │    │  Name     │    │  Name     │            │
│     │  n events │    │  n events │    │  n events │            │
│     └───────────┘    └───────────┘    └───────────┘            │
│                                                                 │
│     ┌───────────┐    ┌───────────┐    ┌───────────┐            │
│     │    ...    │    │    ...    │    │    ...    │            │
│     └───────────┘    └───────────┘    └───────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

*Intent: User sees their collection, selects one to enter it*

---

### Timeline Screen - View Mode (Conceptual)

*Communicates: visualization dominates, minimal chrome*

```
┌─────────────────────────────────────────────────────────────────┐
│ [Minimal navigation - way to go home, way to enter edit]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                                                                 │
│                    VISUALIZATION                                │
│                    (owns the space)                             │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

*Intent: Clean, immersive, presentation-ready*

---

### Timeline Screen - Edit Mode (Conceptual)

*Communicates: visualization still present, editing controls available alongside*

```
┌─────────────────────────────────────────────────────────────────┐
│ [Navigation - home, indication of edit mode, way to exit edit]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐                                               │
│   │ EDITING     │      VISUALIZATION                            │
│   │ CONTROLS    │      (still visible, still interactive,       │
│   │             │       shares space with controls)             │
│   │ - Events    │                                               │
│   │ - Groups    │                                               │
│   │ - Views     │                                               │
│   │             │                                               │
│   └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

*Intent: User can edit while seeing what they're editing. Controls and canvas are partners, not competitors.*

---

### Event Detail Editor (Conceptual)

*Communicates: focused editing of one event, all fields accessible*

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   [Way to close/go back]                                        │
│                                                                 │
│   Event Title                                                   │
│   ─────────────────────────────                                 │
│                                                                 │
│   Dates (start, optional end)                                   │
│   ─────────────────────────────                                 │
│                                                                 │
│   Description                                                   │
│   ─────────────────────────────                                 │
│                                                                 │
│   Groups (multi-select from available)                          │
│   ─────────────────────────────                                 │
│                                                                 │
│   Additional fields (type, innovator, innovation)               │
│   ─────────────────────────────                                 │
│                                                                 │
│   [Destructive action - delete]                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

*Intent: All event data editable in one place. How this presents (panel, overlay, inline expansion) should emerge from what feels right with the animation system.*

---

## Event Data Model

Events conform to this schema:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `title` | string | yes | Event name |
| `date_start` | string | yes | Start date |
| `date_end` | string | no | End date (for spans) |
| `group_ids` | string[] | yes | Associated groups |
| `description` | string | no | Short description |
| `type` | string | no | Event type/category |
| `innovator` | string | no | Person associated |
| `innovation` | string | no | What was created/discovered |

The editor must support viewing and modifying all fields.

---

## Groups

Groups are tags that can be assigned to events. They're defined at the timeline level.

**Capabilities needed:**
- View all groups for a timeline
- Create new groups
- Rename existing groups
- Delete groups
- Assign/unassign groups to events (multi-select)

---

## Visualization Selection

In edit mode, users can browse and select which visualization to use. Selection updates the canvas immediately (with appropriate transition animation) and persists for that timeline.

---

## Canvas-Editor Synchronization

When in edit mode:

**Selection sync:**
- Selecting an event in the list highlights/focuses it on the canvas
- Selecting an event on the canvas highlights it in the list and opens its editor
- Transitions between selections should flow, not jump

**Data sync:**
- Editing an event's data updates the canvas representation
- Creating/deleting events updates the canvas

---

## Persistence (v1)

- Edits persist to local storage
- Changes auto-save
- Visual indication that changes are saved (subtle, non-disruptive)
- Original baked-in data remains available

---

## Responsive Considerations

The application must function on mobile devices. Core flows remain the same; presentation adapts. Touch interactions should feel as considered as desktop interactions.

---

## Technical Boundaries

### What must work without authentication (v1)
- Viewing any timeline via direct link
- All viewing interactions

### What's out of scope for this PRD
- Creating new timelines from scratch
- Uploading/importing data
- AI transformation of uploaded data
- Sharing/permissions
- User accounts and authentication flow

---

## Success Criteria

The implementation succeeds when:

1. **Navigation flows smoothly** — Users move between Home, View, and Edit modes with clear orientation
2. **Editing is contextual** — Users can modify timeline data while seeing the visualization
3. **Animation is cohesive** — Transitions feel authored, not default. Motion has a consistent vocabulary.
4. **The experience feels premium** — High fidelity, elegant, considered in every interaction
5. **Changes persist seamlessly** — Auto-save works invisibly; users never lose work
6. **It works everywhere** — Desktop and mobile experiences are both first-class

---

## Summary

TimeWorm's navigation and editing system should feel like a natural extension of what TimeWorm already is: a way to *experience* timeline data. The editing capabilities wrap around the visualization rather than replacing it. And critically, the way users move through the application—the animations, the transitions, the motion language—is not decoration. It's the experience itself.