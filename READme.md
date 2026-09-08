# Travel Guardian — Prototype Delivery Summary

## Product status

Travel Guardian (Disha) is implemented as a polished, mobile-first and desktop-responsive interactive web application for the Jaipur / Amber Fort context. It follows the product principle: **“Explore intelligently. Plan only what you need. Keep safety one tap away.”**

The UI strictly uses the **Civic Calm** design system: mineral paper canvas (`#f6f3ed`), deep ink typography (`#1a1d1e`), Guardian Teal (`#0C7C74`) for discovery structure, ochre for “right now” signals, ember red for emergency states, Fraunces for editorial display headlines, and Manrope for interface text.

## Implemented capabilities

| Capability | Prototype behavior |
|---|---|
| Landing Page (`/`) | Editorial Hero section, 3D tilt floating app preview card, dual-pillar value proposition, SIH tech stack spotlight, and smooth navigation header |
| Auth Modal & Judge Demo | Reusable `AuthModal` with Sign In / Sign Up tabs (React Hook Form + Zod) & 1-Tap **⚡ SIH Judge Quick Access / Demo Account** button |
| Cursor Animations & Tilt | Desktop translucent Guardian Teal ring follower (`CustomCursor.tsx`) & mouse-driven 3D card tilt via `framer-motion` |
| Route Structure | `/` for Landing Page, `/app` & `/explore` for main App view, `/map` for Safety Map, `/guides` for Local Guides, `/disaster` for Disaster Network |
| Discovery classifications | Popular / Must Visit, Hidden Gem, Local Favorite, Alternative, plus a Trending category in the filter rail |
| Discovery Score | Deterministic formula: Quality + Local Relevance + Uniqueness + Accessibility − Tourist Crowding |
| Score explanation | Interactive “Why this score?” sheet with every factor and an explicit crowding deduction |
| Best-time intelligence | Context-driven “Good right now,” golden-hour, rain, peak-crowd, and late-night recommendations |
| AI day planner | Hours slider, chronological itinerary, and automatic recalculation when demo context changes |
| Safety Center | Emergency directory, nearby help cards, sharing toggle, check-in toggle, incident trigger, route language, and translator phrase |
| SOS | Global press-and-hold control with deterministic client-side activation and local-storage demo persistence |
| AI Assistant | Demo responses with explicit provider-connection labeling and English / Hindi support cue |
| Profile | Privacy, location permission, Trusted Circle, Safe After Dark, and language preference surfaces |
| SIH demo bar | Time, crowd, location, and simulated alert controls available from the top of the experience |

> Safety language is intentionally qualified. The prototype does not claim that any place or route is completely safe, and all emergency directory, route, assistance, and incident signals are marked as demo or sample data where appropriate.

## File structure

- `client/src/pages/LandingPage.tsx`: High-converting landing page with 3D tilt hero mockup card and feature pillars.
- `client/src/components/AuthModal.tsx`: Authentication modal supporting Sign In, Sign Up, and 1-Tap SIH Judge Demo Access.
- `client/src/components/CustomCursor.tsx`: Desktop custom cursor ring follower.
- `client/src/contexts/AuthContext.tsx`: User session state management with local storage persistence.
- `client/src/pages/Home.tsx`: Main composed app experience (`/app`).
- `client/src/lib/travelData.ts`: Typed demo data, scoring formulas, and itinerary generation logic.
- `client/src/index.css`: Global design tokens and Civic Calm styling.

## Verification

TypeScript verification passes with `pnpm run check`. The production build passes with `pnpm run build`.

## Suggested SIH presentation walkthrough

1. Begin at `/` (Landing Page). Demonstrate the editorial hero, 3D card tilt effect, and the translucent custom cursor follower.
2. Click **"Launch SIH Judge Demo (1-Tap Instant Login)"** or **"⚡ SIH Judge Quick Access / Demo Account"** in the header / modal. Note the instant evaluator session notification and automatic transition to `/app`.
3. On Explore (`/app`), show the “Good right now” signal plus the lead Amber Fort recommendation. Open a place and select “Why this score?” to demonstrate the factor breakdown.
4. Use the top SIH Demo Bar to switch between Morning, Sunset, Late Night, and Rain.
5. Move to Plan, adjust the hours slider, and observe the live itinerary generation.
6. Move to Safety Center and demonstrate location sharing, check-in toggles, and hold the global SOS button to show the offline-ready deterministic emergency trigger.
