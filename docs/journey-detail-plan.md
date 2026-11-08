# Journey detail page and seat picker — plan for the restart

> **Status: code removed on purpose; the user will start again. This PR is docs-only.** The tree is the Day-0 scaffold (`src/app/_layout.tsx`, `src/app/index.tsx`, `src/__tests__/home.test.tsx`). This file is now **the plan for the restart**: the decisions and the build order below stay valid; the steps were all built once and removed, except the 3D ones, which were never finished.
>
> **What was built and verified before removal**
> - **M1, steps 0–7** (commit `cd2fac1`, 2026-11-01): journey detail page, floating tab bar, theme tokens, static hero (a 3D hero sat behind a flag that was OFF; it never drew on the simulator). Simulator-tested over 3 rounds; PASS only under the user's waiver for the 3D hero.
> - **M2a, steps 8, 9, 11** (commit `042f9b9`, 2026-11-01): seat logic, 2D grid, hold flow with a forced reject, seat card. Reviewer PASS, simulator pass, `pnpm check` green (28 suites, 117 tests).
> - **3D attempt** (R3F native + `expo-gl`, 2026-11-02 to 2026-11-07): GL lab, keyframe runner, 8-carriage train, still-frame hero (simulator-tested), then M3b B1–B3 (per-car fakes, car chips, overview scene; unit-tested only, 49 suites / 307 tests, never run on the simulator). Abandoned: see [3d-train-checklist.md](3d-train-checklist.md).
>
> **Where the code is** (local branches; the first two commits are also in the pushed branch `origin/feat/my-journeys-page`):
> - `backup/m1-m2a-code` (= `042f9b9`): the whole M1 + M2a app and tests. Browse with `git show backup/m1-m2a-code:<path>` or `git ls-tree -r backup/m1-m2a-code --name-only`.
> - `backup/r3f-native-3d` (`961fbdb`): everything above plus the removed 3D work, the GL lab and all round logs.
>
> **What this file is for now:** the page design (what is on screen, decisions, fake data, hold flow, file layout, build order, open questions) for a fresh implementation. It builds on [architecture.md](architecture.md) and [codebase-structure.md](codebase-structure.md). The 3D parts moved to [3d-train-checklist.md](3d-train-checklist.md). Process lessons: [codebase-structure.md](codebase-structure.md), "Lessons from this attempt".

## Decided

- **3D is out of the restart's first pass.** The hero is a static image and the seat picker is the 2D grid. The shell-peel (originally "in this work, not deferred to phase 3") is deferred until a 3D approach is proven; see [3d-train-checklist.md](3d-train-checklist.md) (proposed: three.js in a WebView, after a one-session spike).
- Development runs on the iOS simulator. The Android route for gate 1 is still open (Q3).
- **Why 3D left:** on the iOS 26.5 simulator, R3F native + `expo-gl` presented nothing for continuous frames (and burned about 100% CPU); only one `invalidate()` per state change presented, and a bare `GLView` leaves about 1% CPU idle; there is no physical device. Evidence: the GL lab logs in [journey-detail-checklist.md](journey-detail-checklist.md).
- **Restart default:** rebuild step by step in the order below, with `backup/m1-m2a-code` as the reference (read it, copy from it, or diff against it; the user decides per step, Q9). Do not bring back `HERO_3D_ENABLED`, the lazy loader, `ErrorBoundary`, `metro.config.js` or the 3D dependencies.

## Which screen is the mockup?

The title says "My Journeys", but the page has a back chevron, Overview / Live / Tickets segments and a train hero. In `architecture.md` that is **Journey detail**, `/(tabs)/journeys/[id]`, not the Journeys list.

**Default:** build the detail screen and treat the title as mockup copy. The list screen is a one-link stub for now (Q1).

## What is on screen (top to bottom)

| # | Element | Home | Notes |
| --- | --- | --- | --- |
| 1 | Header: back chevron, "My Journeys", ⋮ button | screen | Round translucent buttons. ⋮ is a no-op for now. |
| 2 | Segmented control: Overview · Live · Tickets | `shared/ui/SegmentedControl` | Active segment is a white pill. |
| 3 | Hero: Shinkansen, Mt. Fuji, sakura, torii | `seat-map-3d/TrainHero` | A static placeholder image (flat drawings, Q5). A later 3D hero (see the 3D checklist) would replace the image. |
| 4 | Journey card: train name, line · model, seat chip `7-E`, times, duration line, platforms, status | `journeys/components/JourneyCard` | "2h 12m" is derived from 09:00 → 11:12. The seat chip opens the seat picker (Q2). |
| 5 | Card actions: dark pill **Show ticket** (QR icon) + round map button | `shared/ui/Button`, `IconButton` | Both no-ops for now (Q7). |
| 6 | Journey details card: "Boarding opens in 12 min", "Car 7 · front of the train", "Window seat · Mt. Fuji side" | `journeys/components/JourneyDetails` | Rows are icon + title + subtitle. Row 3 is cut off in the mockup, so its subtitle is unknown. |
| 7 | Floating tab bar: Journeys · Tickets · Explore · Profile | `shared/ui/TabBar` | Rounded pill, active tab highlighted. Solid white with a shadow (a translucent fill plus a shadow makes iOS log a shadow warning), no blur (Q8). |

Layout notes:

- Content scrolls. The tab bar floats over it, so the `ScrollView` needs bottom padding of tab-bar height + safe area.
- Status "On time" is green, platforms are grey, the card is white with a large radius and a soft shadow, and the page background is a pale blue-grey. Exact values get measured from the image when the tokens are written.

## Decisions, kept minimal

- **Styling:** NativeWind, as in `architecture.md` (decided 2026-11-07, user's call). Target `nativewind@4.2.7`, the stable line; v5 is RC only. No source confirms it on Expo 58 / RN 0.88 / React 19.3, so install it in a spike first: if it does not build and render on the simulator, fall back to `StyleSheet` + `shared/theme` tokens (the `codebase-structure.md` fallback). Hex colours still live only in the theme: Tailwind config reads the tokens.
  - **Spike result (2026-11-07):** `nativewind@4.2.7` + `tailwindcss@3.4.19` + `react-native-reanimated@4.7.1` + `react-native-worklets@0.13.0` install on Expo 58 / RN 0.88 / React 19.3. `pnpm check` passes and `expo export --platform ios` bundles; the bundle contains the compiled styles (`bg-slate-100` → `#f1f5f9`). **Renders on the iOS simulator (iPhone 17 Pro, iOS 26.5, debug build, 2026-11-07):** grey `bg-slate-100` background and a black rounded pill. Not tried on a physical device or release build. Gotchas: `pod install` needs `LANG=en_US.UTF-8` (without it CocoaPods crashes), and Metro must already be running when the app launches (otherwise "No script URL"). Two pnpm gotchas: add `react-native-css-interop@0.2.7` as a direct dependency (the Babel `jsxImportSource` cannot resolve it under isolated installs), and add `declare module '*.css'` to `nativewind-env.d.ts` (TS 6 rejects the side-effect import otherwise). Reanimated is installed because v4 expects it, even though no screen animates yet.
- **Images:** RN `Image`. `expo-image` is not installed, so add it in phase 1 with the lists.
- **Icons (superseded 2026-11-08, see Decided):** none are installed. `@expo/vector-icons` is not in `pnpm-lock.yaml`, so under isolated installs it must be added explicitly (Q4); it needs `expo-font`, and icon fonts cannot load under jest, so `jest.setup.ts` mocks `expo-font`.
- **Segments:** local `useState`. Live and Tickets show a placeholder line. No nested routes.
- **Data (superseded 2026-11-08, see Decided):** typed in-memory fakes (the Q3 default in `codebase-structure.md`). `useJourney(id)` is a plain synchronous hook so the screen never knows where the data comes from. TanStack Query waits for phase 1 (Q6).
- **Status and countdown:** "On time" and "12 min" are static fake values. They become realtime in phase 2.
- **Gradient and blur:** none. No `expo-linear-gradient`, no `expo-blur`.
- **No Zustand and no gesture handler for the first page.** 3D (and with it the peel machine, animation and camera) is deferred; see [3d-train-checklist.md](3d-train-checklist.md).

## Seat picker (2D now, 3D deferred)

The hero card is far too small to pick seats in, so the picker gets the full-screen route the architecture doc already defines: `/booking/[tripId]/seats`.

**Split, from `codebase-structure.md`:**

- `seat-map-3d` is **controlled and API-agnostic.** Props: `layout`, `status`, `selectedSeat`, `pendingSeat`, `onSeatPress`. A future 3D map takes the same props type.
- **booking owns the hold.** `useSeatHold` drives the doc's `holding` step through props: pending → granted or rejected; a result from an older request is dropped (latest request wins).
- `SeatMap` is a thin wrapper that renders the 2D grid. (The 2D/3D toggle and the GL-failure fallback belong to the 3D work.)

**Hold flow, all fake.**

- `getSeatLayout(tripId, car)`: car 7, rows 1–8, columns A–E, with `pos` computed (kept for a future 3D map), a few booked seats and one held. Window seats are columns A and E. (A later 3D work wants per-car layouts, `getTrain(tripId)` and row 1 at the head end; see the 3D checklist.)
- `holdSeat(tripId, car, seat)`: resolves after about 600 ms with an `expiresAt`, rejects for one forced-reject seat (`5-B`), so "seat reverts to free" is testable.
- Choosing another seat replaces the previous hold.
- A rejected hold shows an inline message (`role="alert"`, no toast library) and the seat goes back to free; the previous selection stays.

**2D grid.** A minimal `SeatGrid2D` of pressables (48 pt cells, an aisle after column C), taking the same props as a future 3D map. State is never colour alone: taken seats carry a cross, the selected seat a check, the pending seat a spinner, plus ARIA state. It is the screen-reader path and the only seat map that can render under jest.

**Seat card.** When a hold is granted, show the seat code and window, aisle or middle. **Continue** is a no-op (checkout is not built). The "Mt. Fuji side" note is not modelled.

**Entry point.** The seat chip on the journey card opens `/booking/<tripId>/seats`. This is temporary until the search flow exists (Q2). The `Journey` fake gets a `tripId`.

## 3D (deferred, removed from this plan)

The hero 3D train, the shell-peel and the 3D seats were designed here first, then built with R3F native and removed. Their design, numbers and lessons are in [3d-train-checklist.md](3d-train-checklist.md); the old text of this plan about them is in the git history (`git show backup/m1-m2a-code:docs/journey-detail-plan.md`).

## Fake data shapes

```ts
interface Journey {
  id: string;
  tripId: string;           // for /booking/[tripId]/seats
  trainName: string;        // 'Nozomi 32'
  line: string;             // 'Tokaido Shinkansen'
  model: string;            // 'N700S'
  car: number;              // 7
  seat: string;             // '7-E'
  seatNote: string;         // 'Window seat · Mt. Fuji side'
  from: Stop;               // Tokyo
  to: Stop;                 // Kyoto
  status: 'on-time' | 'delayed';
  boardingOpensInMin: number;
}
interface Stop { city: string; time: string; platform: string }
```

The seat types (`SeatStatus`, `SeatLayout`) are the ones in `architecture.md`. They live in `seat-map-3d/types.ts`, and `booking` imports them through the barrel.

## Files

Planned layout. Everything here except the 3D folders was built once; the code is in `backup/m1-m2a-code`. The tree today is the Day-0 scaffold only.

```
src/
  app/
    index.tsx                       Redirect → /journeys (otherwise "/" is unmatched)
    (tabs)/_layout.tsx              <Tabs tabBar={TabBar} />, headerShown false
    (tabs)/journeys/_layout.tsx     <Stack>, headerShown false. Keeps the tab bar on [id].
    (tabs)/journeys/index.tsx       Stub list: one link to /journeys/<id>
    (tabs)/journeys/[id].tsx        Re-exports JourneyDetailScreen
    (tabs)/tickets|explore|profile/index.tsx   One-line stubs, so the 4 tabs exist
    booking/[tripId]/seats.tsx      Re-exports SeatPickerScreen
  features/journeys/
    index.ts                        Exports JourneyDetailScreen only
    types.ts
    api/fake.ts                     getJourney(id)
    hooks/useJourney.ts
    screens/JourneyDetailScreen.tsx
    components/ JourneyCard.tsx  JourneyDetails.tsx
  features/booking/
    index.ts                        Exports SeatPickerScreen only
    api/fake.ts                     getSeatLayout, holdSeat (forced reject)
    hooks/useSeatHold.ts
    screens/SeatPickerScreen.tsx
  features/seat-map-3d/
    index.ts                        Exports TrainHero (static image), SeatMap (2D only), types
    types.ts                        SeatMapProps, SeatStatus, SeatLayout
    seatVisual.ts                   free | taken | pending | selected from status + props
    TrainHero.tsx                   The static hero image in a labelled, clipped slot
    SeatMap.tsx                     2D only: renders SeatGrid2D (3D would branch here later)
    fallback-2d/SeatGrid2D.tsx
  shared/
    theme/                          colors, spacing, radius, typography, shadows
    ui/                             Card, Button, IconButton, SegmentedControl, Divider, TabBar
    lib/format.ts                   formatDuration(from, to) → "2h 12m"
assets/images/hero-static.png       The hero image (placeholder art, Q5)
jest.setup.ts                       Mocks expo-font (icon fonts cannot load under jest)
```

Not in the plan any more (3D deferred): `scene/`, `models/`, `animation/`, `seats/`, `config.ts` (`HERO_3D_ENABLED`), `metro.config.js`, the 3D dependencies and the scene mocks in `jest.setup.ts`.

Route trap: without the nested `journeys/_layout.tsx` Stack, `[id]` shows up as its own tab or hides the tab bar. Check the layout against `.claude/skills/expo-router/references/route-structure.md`. The skill prefers `NativeTabs`, but the mockup's floating pill needs JS `Tabs` with a custom `tabBar`. `booking/` sits outside `(tabs)`, so the seat picker covers the tab bar.

`src/app/index.tsx` stops being the placeholder, so `src/__tests__/home.test.tsx` must be replaced (step 2). That is the current state: both exist in the Day-0 scaffold.

## Build order

Each step ends green on `pnpm check`, then gets a simulator pass. Status is as of the removal: **built then removed (see `backup/m1-m2a-code`)** or **not built**. For the restart, do steps 0–5 and 7–9, 11 in order; 3D (6, 10) is a separate track.

0. **Install** *(built then removed)*. `pnpm install`; add `@expo/vector-icons` with step 1. No 3D dependency.
1. **Foundation** *(built then removed)*. `shared/theme` tokens, `Card`, `Button`, `IconButton`, `SegmentedControl`, `formatDuration`. Add `@expo/vector-icons`. Tests: `SegmentedControl` switches value, `formatDuration` gives `2h 12m`.
2. **Route skeleton + TabBar** *(built then removed)*. All tab routes above, with stub screens. Replace the home test by rendering `JourneyDetailScreen` directly. A navigation test (list link opens detail, tab bar stays) uses Expo Router's in-memory test helper (`renderRouter` from `expo-router/testing-library`). Confirm on the simulator that the bar floats and `[id]` is not a tab.
3. **Journeys data** *(built then removed)*. `types.ts`, `api/fake.ts`, `useJourney`. Unknown id returns `undefined`, and the screen shows a short "not found" line.
4. **Components** *(built then removed)*. `JourneyCard`, `JourneyDetails`, and `TrainHero` as a static-image wrapper (label `Shinkansen in front of Mt. Fuji`, clipped, sized to its slot). Test: `JourneyCard` shows `Nozomi 32`, `7-E`, `09:00`, `11:12`, `2h 12m`, `On time`.
5. **Screen** *(built then removed)*. Header, segments, scroll area with bottom padding, composition. Live and Tickets placeholders.
6. **3D hero** *(built with R3F native, then removed; NOT part of the restart)*. The hero stays the static image. A WebView hero is step 2 of the proposed 3D order in [3d-train-checklist.md](3d-train-checklist.md).
7. **Compare the page with the mockup** *(done once)*. Run next to the image, fix spacing and colour drift. The mockup image is gone: re-attach it if the look must match again.
8. **Seat logic, pure TypeScript** *(built then removed)*. `types.ts`, the fake layout and `holdSeat`, `seatVisual`. Unit tests: the forced reject, the visual states.
9. **Seat picker with the 2D grid** *(built then removed)*. `SeatGrid2D`, `SeatMap` (2D only), `useSeatHold`, `SeatPickerScreen`, the route, and the seat chip link. RNTL tests: tap a free seat → pending → selected, and the forced-reject seat goes back to free with a message.
10. **3D seats and peel** *(not built to the end; deferred)*. A tap-picking spike worked in the GL lab and a side-on overview scene was built (B1–B3), but the R3F-native approach was dropped. See the 3D checklist.
11. **Seat card** *(built then removed)*. Granted hold shows the card with a no-op **Continue**. Final `pnpm check` and a pass on the simulator.

### Restart notes

- **Reuse from the backups** (copy as reference, do not merge a branch): the theme tokens (measured colours and sizes, also recorded in "Theme tokens" of [journey-detail-checklist.md](journey-detail-checklist.md)), the hold-race logic in `useSeatHold`, the tap table of the 2D grid (measured, zero drift), the test patterns (`renderRouter`, `within`, v14 awaited calls).
- **Change given the lessons:** start with data and 2D, add no 3D scaffolding (no flag, no lazy loader, no Metro resolver); run `npx expo export --platform ios --no-bytecode` and a simulator pass after every step, not only `pnpm check`; keep layout numbers (tap tables) computed AND measured; keep the work-in-progress committed on a branch so nothing is only in the working tree.
- **Rename the feature folder** `seat-map-3d` only if 3D never returns (the architecture doc names the module; default: keep, Q10).

## Out of scope

- Where **Show ticket** goes (`/ticket/[ticketId]`), the map button, the ⋮ menu.
- Live and Tickets segment content.
- Real hero art and the real `.glb`.
- Pan, pinch and zoom, other cars, LOD.
- Checkout, the hold countdown, realtime seat events and version checks.
- Low-FPS auto-switch to 2D (gate 2).
- Measuring gate 1 on a physical Android phone.
- Blur on the tab bar, a real backend (the fake api and TanStack Query are in; see "Decided 2026-11-08").

## Done when

- Screen matches the mockup at 390 pt wide (items 1–7 above).
- Tab bar stays visible on `/journeys/<id>`; back chevron returns to the list.
- The hero is the static placeholder image, filling its 402×174 slot, clipped and labelled `Shinkansen in front of Mt. Fuji`.
- **M2a:** the seat chip opens the picker; tapping a free seat holds it (a spinner, then a ✓ and the seat card); the forced-reject seat goes back to free with a message and the previous seat stays selected.
- **M2b (deferred, not part of the restart):** tapping the train peels the shell and moves the camera over the seats; tapping a seat in 3D holds it; with the 3D scene failing, the 2D grid shows the same seats and passes the same hold tests. Redo only after the WebView spike in [3d-train-checklist.md](3d-train-checklist.md).
- Tests listed in steps 1–11 pass, plus `pnpm check`.

## Decided 2026-11-08 (first page build)

These override the older defaults in "Decisions, kept minimal" and the open questions below.

- **Icons (Q4):** `lucide-react-native` + `react-native-svg` (Expo's docs say `@expo/vector-icons` "will be deprecated"). No font loading, so `expo-font` and its jest mock are not needed. Icons take `color` as a prop (`className` does not set it). Jest maps `lucide-react-native` to its CJS build in `package.json`. Names used: ChevronLeft, EllipsisVertical, TrainFront, Footprints, Mountain, QrCode, Map, FileText, Armchair, Ticket, Compass, CircleUserRound.
- **Hero (Q5):** an original flat SVG illustration, `src/components/HeroIllustration.tsx` (Shinkansen, Mt. Fuji, sakura branch, torii; colours are `hero*`, `sakura`, `torii`, `branch` tokens in `colors.ts`). It is not the mockup's artwork. It replaces the first placeholder block; real art can replace it later.
- **Data layer (Q6):** Promise-based, fake first, in ONE file: `src/api/journeys.ts` holds the `Journey` type, `ApiError`, the fake data and `getJourney(id)` (300 ms fake latency, `ApiError(404)` for an unknown id). To use a real backend, rewrite the body of `getJourney` (same signature). `src/api/queryClient.ts` is the shared `QueryClient` (it does not retry 4xx). The screen calls `useQuery` directly with key `['journey', id]`. TanStack Query is in now, not phase 1.
- **Tab bar (Q8):** plain translucent bar (`colors.tabBar`, rgba), no `expo-blur`, no shadow (translucent fill plus shadow logs an iOS warning).
- **Restart (Q9):** rebuilt from scratch, not copied from `backup/m1-m2a-code`.
- **Journey type:** added `carPosition` ("front of the train") so the details row is data, not a string in the component.
- **Flat layout (user's call, 2026-11-08):** there is no `src/features/` folder yet. Routes in `src/app/`, screen code inside the route file (`(tabs)/journeys/[id].tsx`), UI pieces in `src/components/`, api in `src/api/`, theme tokens still in `src/shared/theme/`. Re-introduce `features/<name>/` (as `codebase-structure.md` describes) when a second feature makes the flat folders crowded.
- **Verified on the iOS simulator (iPhone 17 Pro, iOS 26.5, 2026-11-08):** `/` redirects to the list, the link opens the detail page, segments switch, the floating bar sits inset with labels. Fixes found there: `Tabs` pads the bar with the safe-area inset (set `paddingBottom: 0`), `left`/`right` on `tabBarStyle` are ignored (use `marginHorizontal`), and the built-in item squeezes its label and has a square active background, so `(tabs)/_layout.tsx` draws each tab button itself (`tabBarButton`): icon + label inside one rounded pill, filled when the route matches (the button is not told it is selected, so focus comes from `usePathname`). The Journeys icon is a custom solid bullet-train silhouette, `src/components/TrainSideIcon.tsx` (Lucide only has front-view trains). Gotcha: Metro here did not notice edits made after it started; restart it with `--clear` if the app shows old code. Not checked: a physical device, release build, Android.

## Open questions (default if unanswered)

1. **Which screen** is the mockup? *(default: Journey detail at `/journeys/[id]`; list is a stub)*
2. **Entry to the seat picker:** the seat chip, tapping the hero, or a temporary button? *(default: the seat chip; temporary until the search flow exists in phase 1)*
3. **Android route for gate 1:** local Android SDK or EAS Build? *(default: decided before gate 1; it is `codebase-structure.md` Q1)*
4. **Icons:** `@expo/vector-icons`, or `react-native-svg` with hand-drawn icons? *(default: `@expo/vector-icons`, Ionicons: train, ticket, map, person, qr-code, walk)*
5. **Hero art:** who supplies the static hero art? The illustration in the mockup is someone else's design, so don't ship it. *(default: flat placeholders, swap later)*
6. **TanStack Query now,** or wait for phase 1? *(default: wait)*
7. **Show ticket / map button:** no-op, or link to a `/ticket/[ticketId]` stub? *(default: no-op)*
8. **Tab bar blur:** add `expo-blur`, or a solid fill? *(default: solid white; translucent was dropped because a translucent fill plus a shadow logs a shadow warning on iOS)*
9. **Restart method:** rebuild from the plan with `backup/m1-m2a-code` as reference, or copy files from it step by step? *(default: rebuild step by step, copying a file only when the user says so; the backup is the checklist's answer key)*
10. **Folder name:** keep `features/seat-map-3d` (the architecture doc's module) or rename to `seat-map` while it has no 3D? *(default: keep, rename if 3D never comes back)*
