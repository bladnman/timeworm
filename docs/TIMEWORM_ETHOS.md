# TimeWorm: Project Ethos

## What This Document Is

This is the soul of TimeWorm. Before building anything, before making any design decision, before writing any code—return here. This document describes not what TimeWorm does, but what TimeWorm *is*. Every feature, every animation, every pixel should be in service of this vision.

---

## The Core Truth

**TimeWorm is about experiencing time.**

Not displaying it. Not organizing it. *Experiencing* it.

When someone uses TimeWorm, they should feel like they're moving through time itself—watching history unfold, seeing connections emerge, feeling the weight of moments and the space between them. The data is just the skeleton. The experience is the life.

---

## Guiding Principles

### 1. Time Is the Story

Everything in TimeWorm serves the story of time being told. The interface, the controls, the transitions—none of these are the point. They exist only to help the user fall into the timeline and stay there.

Ask of every element: *Does this serve the story, or does it interrupt it?*

### 2. Movement Is Meaning

In an application about time, how things move matters as much as what they are. Animation isn't decoration—it's communication. It's how we tell the user where they are in the journey.

When a user enters a timeline, they should feel like they're stepping into it. When they select an event, they should feel like time has paused there for them. When they leave, they should feel like they're stepping back out into the world.

Motion creates the fourth dimension in our interface. Use it with intention.

### 3. Blending, Not Switching

Hard cuts break immersion. Users should never feel like they've been teleported somewhere new—they should feel like they've *traveled* there.

Every transition is a journey:
- Entering a timeline is stepping into a world
- Leaving is stepping back out
- Zooming into edit mode is leaning in closer to the work
- Zooming out is stepping back to see the whole
- Moving between events is walking along the timeline
- Changing visualizations is seeing the same story through new eyes

The application breathes. It flows. It never jolts.

### 4. Integration Over Interruption

Controls, buttons, panels, editors—these are necessary tools, but they should never feel like interruptions to the experience. They should feel like natural extensions of it.

A disclosure should not pop. It should *arrive*—as if it was always there, just now visible. A panel should not slide in like a drawer opening. It should emerge, as if the space was always ready to hold it.

Nothing hides. Nothing shouts. Everything belongs.

### 5. Subtle Confidence

TimeWorm should feel quietly assured. It doesn't need to announce its features or beg for interaction. It presents itself with the confidence of something well-made.

Affordances are discoverable but not desperate. Edit mode is available but not advertised. The interface trusts the user to find what they need, and rewards that exploration with elegance.

### 6. The Visualization Is Sacred

The timeline visualization is the heart of the experience. Everything else—navigation, editing, controls—exists in service of it. The visualization is never an afterthought, never squeezed into leftover space, never competing with chrome.

When the user is viewing, the visualization owns the space completely. When the user is editing, the visualization shares space gracefully but remains the anchor. The user is always looking at their timeline, even while working on it.

### 7. Fidelity Is Not Optional

"Good enough" is not good enough. Every interaction should feel crafted. Every animation should feel authored. Every transition should feel considered.

This is not about perfectionism—it's about respect. Respect for the user's time, for their content, for their experience. A thoughtful animation takes milliseconds but communicates care. A janky transition takes the same time but communicates indifference.

Choose care. Every time.

---

## The Animation Contract

Animation in TimeWorm is a first-order concern, not a final polish phase. The motion system should be considered from the beginning and built alongside every feature.

### Animation Families

Related actions share animation DNA. This creates a coherent motion vocabulary that users internalize without thinking about it.

**Navigation animations** (moving between screens):
- Share a sense of traveling through space
- Entering feels like arrival; leaving feels like departure
- The origin and destination should feel spatially related

**Mode animations** (view ↔ edit):
- Share a sense of zooming in and out
- Edit mode is "closer to the work"
- View mode is "stepped back to see the whole"

**Selection animations** (choosing events, opening details):
- Share a sense of focus shifting
- The selected item gains presence
- The previous selection gracefully releases
- Detail views arrive with intention, not intrusion

**Data animations** (creating, deleting, saving):
- Creation is arrival, materialization
- Deletion is graceful departure, not violent removal
- Saving is quiet confirmation, almost invisible

### Animation Qualities

All TimeWorm animations should share these qualities:

**Purposeful**: Every animation communicates something. If it doesn't have a message, it doesn't need to exist.

**Fluid**: Easing curves should feel organic, not mechanical. Movement should accelerate and decelerate like physical objects.

**Brief but present**: Animations should be fast enough to not cause waiting, but slow enough to be perceived. The user should feel the transition, not watch it.

**Consistent**: The same action should always animate the same way. Users learn the motion language and come to expect it.

---

## The Feeling We're After

When someone uses TimeWorm, they should feel like they're using something *made*. Not assembled from components. Not following a template. Made, with intention, by people who cared.

They should feel like their timeline data has been given a home worthy of it—that their history, their project milestones, their story has been treated with the gravity it deserves.

They should lose track of the interface and fall into the content. The highest compliment is when someone forgets they're using an application at all and simply *experiences* their timeline.

---

## Questions to Ask

When building anything in TimeWorm, ask:

1. **Does this serve the story of time, or interrupt it?**
2. **How does this move? What does that movement communicate?**
3. **Does this feel integrated, or does it feel bolted on?**
4. **Would this feel at home in a museum installation about time?**
5. **Is this subtle and confident, or loud and desperate?**
6. **Does this respect the visualization as sacred space?**
7. **Is this crafted, or just functional?**

If the answer to any of these is wrong, reconsider.

---

## What TimeWorm Is Not

**TimeWorm is not a data management tool.** It's not about organizing information efficiently. It's about experiencing that information meaningfully.

**TimeWorm is not a utility.** It's not trying to be the fastest way to see timeline data. It's trying to be the most evocative way.

**TimeWorm is not neutral.** It has opinions about how timelines should feel. It's not a blank canvas—it's a crafted experience that treats every timeline as worthy of beauty.

---

## The Promise

To everyone who puts their timeline data into TimeWorm:

*We will treat your story with care. We will give it motion and space and presence. We will let it breathe and unfold and reveal itself. We will never reduce it to rows in a table or points on a chart. We will make it feel like what it is: a journey through time.*

This is what we're building.