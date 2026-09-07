# Travel Guardian — Design Brainstorm

## Three Directions

### Theme Name: Civic Calm
**Very Brief Intro:** A warm, editorial travel interface that treats safety as a calm layer of context rather than a warning siren. The visual language borrows from premium city guides, public-service maps, and quiet confidence.
**Probability:** 0.07

### Theme Name: Trail Signal
**Very Brief Intro:** A rugged, field-notes-inspired system with tactile map marks, utility labels, and high-contrast action states for travelers moving through unfamiliar places. It feels capable without becoming tactical or militarized.
**Probability:** 0.03

### Theme Name: Night Atlas
**Very Brief Intro:** A restrained dark-mode navigation experience where luminous route traces and soft amber signals make essential actions feel visible after dark. It is cinematic, focused, and intentionally sparse.
**Probability:** 0.08

## Chosen Direction: Civic Calm

### Design Movement
Contemporary editorial cartography: a blend of Swiss information design, premium travel publishing, and public-service wayfinding. The interface should feel like a beautifully considered city guide that happens to understand risk signals.

### Core Principles
1. **Context before alarm:** Safety is present, explainable, and actionable without claiming certainty.
2. **Editorial hierarchy:** Large, confident type, narrow labels, and asymmetric content rails make information easy to scan.
3. **Warm utility:** A pale mineral canvas, ink typography, and a single signal color make the product feel human, premium, and dependable.
4. **One-tap readiness:** The emergency path is visually distinct, always available, and never dependent on AI or decorative interaction.

### Color Philosophy
The base is a mineral paper tone rather than stark white, giving the interface the feel of a well-made field guide. Deep ink provides outdoor-readable contrast. Sea-glass teal marks discovery and verified product structure without implying that any location is guaranteed safe. A vivid ember red is reserved for SOS and urgent states so it remains meaningful. A sunlit ochre highlights “right now” moments and time-sensitive recommendations without turning the whole interface into a warning system.

### Layout Paradigm
Use an **editorial rail** rather than a centered dashboard. A compact destination rail, an asymmetric hero card, horizontal category strips, and a stacked “signal / place / action” rhythm create a clear scroll path on mobile. On desktop, the main content opens into a 7/5 split between discovery and the safety-aware itinerary rail.

### Signature Elements
- **Compass notch:** Small angled corner cuts and compass ticks on key cards, used sparingly as a brand signature.
- **Signal lines:** Fine teal or ochre rules that connect place intelligence to its explanation.
- **Stamped labels:** Compact uppercase labels such as “POPULAR / MUST VISIT”, “DEMO DATA”, and “LOWER-RISK SIGNAL” establish provenance and confidence.

### Interaction Philosophy
Every action should answer one practical question: “What can I do next?” Buttons use direct verbs, chips are touch-friendly, and safety explanations open inline rather than hiding behind mystery. Discovery cards can be saved or added to a plan without leaving the current context. SOS is deterministic and separated from recommendation flows.

### Animation
Use short, physical transitions under 240ms: cards lift 2px on hover, chips slide their active underline into place, and the bottom navigation uses a small signal dot rather than a bouncing icon. Reserve richer motion for the assistant panel and itinerary regeneration, where content can crossfade and translate 8px. Respect reduced-motion preferences and never animate urgent actions.

### Typography System
Use **Fraunces** for display headlines and destination names, with **Manrope** for interface text, metadata, and controls. Headlines should be slightly tight and sentence case; interface labels use Manrope 11–12px with generous tracking. Use tabular numerals for scores, dates, and distances.

### Brand Essence
**Travel Guardian is a context-aware companion for curious travelers who want better days and a clearer safety path when plans change.**

Personality adjectives: **observant, reassuring, resourceful**.

### Brand Voice
Headlines are vivid but grounded. CTAs use plain verbs. Microcopy explains provenance and uncertainty directly, never promising safety.

Example lines:
- “A smarter day starts with what is good right now.”
- “Lower-risk based on available signals — not a guarantee.”

### Wordmark & Logo
The mark is a compact compass-eye symbol: a four-point compass whose center is an open eye-shaped negative space. It should work as a bold standalone symbol in a rounded square, with a custom wordmark set in a high-contrast serif beside it.

### Signature Brand Color
**Guardian Teal — #0C7C74.** It is calm, ownable, and legible against mineral paper while feeling more human than institutional blue.

## Style Decisions
- Use a light mineral canvas with deep ink text, Guardian Teal for discovery, ochre for “right now”, and ember red only for emergency actions.
- Use Fraunces + Manrope, not a default sans-only stack.
- Prefer editorial rails, split layouts, and horizontal scroll shelves over centered dashboard grids.
- Keep safety copy explainable and qualified; never present demo signals as official or guaranteed.
- Keep SOS visible globally without letting it visually dominate routine discovery.

## Accepted Review Amendments

- Every major section will carry a visible cartographic cue such as a compass notch, signal rule, tick mark, or provenance stamp.
- Discovery will read as editorial guidance first: one lead recommendation, then supporting places and signal notes instead of four equal marketplace cards.
- The compass-eye mark and high-contrast serif wordmark will be treated as a stronger brand lockup in the header.
- Safety surfaces will distinguish discovery signals, demo provenance, and urgent SOS language through structured labels rather than only color.
