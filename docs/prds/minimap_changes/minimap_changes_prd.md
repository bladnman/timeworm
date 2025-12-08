# MiniMap Navigation Revamp – Product Requirements

## 1. Background & Context

The existing MiniMap is a navigational companion to the main timeline, answering “where am I?” and “how do I get somewhere else?” rather than acting as a full miniature timeline.

The current interaction model works but feels **janky** when the user drags or resizes the selection window, because the MiniMap is trying to react in real time to main-timeline changes (panning, zooming, auto-follow). The walkthrough notes and annotated mock describe a set of refinements to make the MiniMap feel smoother, clearer, and more directly under the user’s control.

This document describes *what* should change, not *how* it is implemented.

---

## 2. Goals

1. **Smooth, stable interaction**

   * Dragging or resizing the viewport feels solid and predictable, with no visible jitter or “double movement.”
2. **Clear mental model**

   * Users understand at a glance:

     * what portion of time is visible
     * how to move it
     * how to zoom it
3. **Preview before commit**

   * While dragging or resizing, the user can see the effect of their change without committing early.
4. **Richer navigational context**

   * Both tracks (overview and main MiniMap track) show useful cues like event density.
5. **Delightfully obvious affordances**

   * It is visually obvious where to grab, drag, and resize.

---

## 3. Experience Overview

At a high level, the MiniMap will:

* Still show the current visible window into the full timeline via a **viewport indicator**.
* Add a **fully slideable overview bar** above, representing the entire dataset (or a large, stable chunk of it).
* Support **scroll-based pan/zoom** directly on the MiniMap.
* Use **ghosted interaction states**: while the user is manipulating the viewport, the UI behaves as if the user’s intent is “locked in,” even if the underlying timeline is still catching up.

The end feeling: *“I grab the window, I move it, everything listens to me, nothing fights back.”*

---

## 4. Detailed Requirements

### 4.1 Ghosted Interaction & Jank-Free Dragging

**Problem today:** When the user drags or resizes the viewport, the main timeline and MiniMap both try to update their time scale and position, causing jitter and a sense that the control is “slipping” out from under the cursor.

**Requirements**

1. **Stable coordinate system during a drag**

   * From mouse/touch-down to mouse/touch-up, the viewport’s relationship to the MiniMap track remains visually stable.
   * The viewport does not suddenly resize or re-scale mid-drag because the underlying time range changed.

2. **Ghosted state for the viewport**

   * While the user is dragging or resizing:

     * The viewport appears in an “active” or “ghosted” state (visual treatment to be defined in design).
     * The user sees a continuous preview of where the visible window will end up.
   * If the underlying main timeline needs to adjust (for example due to zoom), it may update “underneath” this ghost, but the ghost itself is the source of truth for the user during the interaction.

3. **Auto-follow pause**

   * Any automatic MiniMap “follow” behavior is paused while the user is actively manipulating the viewport.
   * Auto-follow resumes only after the interaction completes.

4. **Commit on release**

   * When the user releases the drag:

     * The ghosted state resolves into the final committed viewport.
     * Any pending auto-follow or range adjustments are reconciled in a way that does not cause a noticeable jump.

**User feeling:** *“When I grab the window, it’s mine until I let go. Nothing else moves it for me.”*

---

### 4.2 Overview Bar (Top Track) Behavior

The top bar behaves as a **high-level overview** of the entire (or large) time range.

**Requirements**

1. **Slideable overview range**

   * The top bar’s visible region can be slid left/right to reposition which portion of the global timeline the MiniMap is focusing on.
   * Sliding the top bar updates the lower MiniMap track and the main timeline accordingly.

2. **Event density indicators**

   * The top bar shows **dots or clusters** indicating where events exist in the full range.
   * The density/cluster representation may be coarser than on the main MiniMap track, but should give a clear “where the action is” signal.

3. **Consistent with existing context concept**

   * The existing idea of showing where the MiniMap sits within total time remains, but now the top bar is actively interactive instead of purely representational.

---

### 4.3 Main MiniMap Track & Scroll Interactions

The main MiniMap track (the one with the draggable viewport) remains the primary **precision navigation** surface.

**Requirements**

1. **Scroll-to-move**

   * Scrolling **left/right** (or equivalent gesture) over the MiniMap track pans the visible window along time.
   * The viewport visibly glides along the track in the direction of the scroll.

2. **Scroll-to-zoom**

   * Scrolling **up/down** over the MiniMap track zooms the time scale in or out, centered on the cursor (or current viewport center).
   * The viewport size adjusts smoothly to reflect the new zoom level.

3. **Event dots on the track**

   * The main MiniMap track continues to show event markers or clusters that align with the time range currently represented.
   * These dots help users anchor themselves before they zoom or jump.

4. **No double-scaling**

   * During an active zoom gesture, the mapping between scroll input and zoom level remains intuitive and does not get compounded by other automatic rescaling behaviors.

---

### 4.4 Grab Points & Affordances

The edges of the viewport should be unmistakably draggable.

**Requirements**

1. **Always-discoverable handles**

   * When the cursor is anywhere over the viewport:

     * The left and right edges show visible grab bars or handles.
   * The resize affordance should not rely solely on tiny hit areas or subtle hover changes.

2. **Pointer feedback**

   * Hovering near an edge changes the cursor/indicator to a resize-appropriate state.
   * This applies consistently for both left and right edges.

3. **Touch friendliness**

   * On touch devices, tapping the viewport can temporarily emphasize the handles or enlarge their effective hit area (consistent with the existing mobile considerations).

**User feeling:** *“It is obvious where I can pinch or stretch this window, and it’s easy to hit.”*

---

### 4.5 Animation, Responsiveness & Performance

**Requirements**

1. **No visible jank**

   * Dragging, resizing, and scrolling should feel smooth on typical hardware.
   * Animations must never cause the viewport to lag behind the user’s finger/mouse.

2. **Subtle, supportive motion**

   * Any animations (e.g., easing when releasing a drag, minor snaps) should support clarity and not draw attention away from the content.

3. **Graceful degradation**

   * If the system is under load, the priority is **input responsiveness**: user gestures are reflected immediately, even if some secondary animations are skipped or simplified.

---

## 5. Out of Scope (For This Update)

* Adding new data types or filters to the MiniMap.
* Changing the visual theme or brand styling beyond what is necessary for new affordances.
* Reworking the main timeline’s detailed event display; this work is focused on navigation and feel, not content rendering.

---

## 6. Success Criteria

We consider this revamp successful if:

1. Users can drag and resize the viewport without experiencing jitter or unexpected jumps.
2. Users intuitively discover:

   * that the top bar is draggable
   * that scroll gestures pan and zoom
3. In user feedback, phrases like “laggy,” “janky,” or “it keeps fighting me” disappear and are replaced by “smooth,” “easy to control,” or similar.
4. Power users routinely navigate via the MiniMap rather than avoiding it.

If we hit those, the MiniMap graduates from “necessary control” to “feels great every time you touch it,” which is exactly what this component deserves.
