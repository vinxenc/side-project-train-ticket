# Journey detail page and 3D seat picker — implementation plan

> **Proposed — not agreed.** Plan for the page in the mockup (Shinkansen, "Nozomi 32", Tokyo → Kyoto), a **3D hero**, and the **shell-peel seat picker** it opens. Builds on [architecture.md](architecture.md) and [codebase-structure.md](codebase-structure.md). Nothing is built yet.

## Decided

- The shell-peel is in this work, not deferred to phase 3.
- The train is a placeholder built from three.js shapes. The real `.glb` comes later.
- Development runs on the iOS simulator. The Android route for gate 1 is still open (Q3).
- **The hero ships as the static image (Round 3, proposed; the user pre-approved the waiver).** The 3D hero is built but switched off behind `HERO_3D_ENABLED = false` in `seat-map-3d/config.ts`, because no 3D pixels were drawn on the iOS 26.5 simulator in two builds (a transparent canvas, then an opaque `scene.background`) and there is no physical device to test on. The 3D acceptance (the train sways) moves to a physical-device gate.

## Which screen is the mockup?

The title says "My Journeys", but the page has a back chevron, Overview / Live / Tickets segments and a train hero. In `architecture.md` that is **Journey detail**, `/(tabs)/journeys/[id]`, not the Journeys list.

**Default:** build the detail screen and treat the title as mockup copy. The list screen is a one-link stub for now (Q1).

## What is on screen (top to bottom)

| # | Element | Home | Notes |
| --- | --- | --- | --- |
| 1 | Header: back chevron, "My Journeys", ⋮ button | screen | Round translucent buttons. ⋮ is a no-op for now. |
| 2 | Segmented control: Overview · Live · Tickets | `shared/ui/SegmentedControl` | Active segment is a white pill. |
| 3 | Hero: Shinkansen, Mt. Fuji, sakura, torii | `seat-map-3d/TrainHero` | Static image (placeholder art, Q5). The 3D train is built but switched off, see 3D hero. |
| 4 | Journey card: train name, line · model, seat chip `7-E`, times, duration line, platforms, status | `journeys/components/JourneyCard` | "2h 12m" is derived from 09:00 → 11:12. The seat chip opens the seat picker (Q2). |
| 5 | Card actions: dark pill **Show ticket** (QR icon) + round map button | `shared/ui/Button`, `IconButton` | Both no-ops for now (Q7). |
| 6 | Journey details card: "Boarding opens in 12 min", "Car 7 · front of the train", "Window seat · Mt. Fuji side" | `journeys/components/JourneyDetails` | Rows are icon + title + subtitle. Row 3 is cut off in the mockup, so its subtitle is unknown. |
| 7 | Floating tab bar: Journeys · Tickets · Explore · Profile | `shared/ui/TabBar` | Rounded pill, active tab highlighted. Solid white with a shadow (a translucent fill plus a shadow makes iOS log a shadow warning), no blur (Q8). |

Layout notes:

- Content scrolls. The tab bar floats over it, so the `ScrollView` needs bottom padding of tab-bar height + safe area.
- Status "On time" is green, platforms are grey, the card is white with a large radius and a soft shadow, and the page background is a pale blue-grey. Exact values get measured from the image when the tokens are written.

## Decisions, kept minimal

- **Styling:** `StyleSheet` + `shared/theme` tokens. NativeWind is still unverified, and `codebase-structure.md` already names this as the fallback.
- **Images:** RN `Image`. `expo-image` is not installed, so add it in phase 1 with the lists.
- **Icons:** none are installed. `@expo/vector-icons` is not in `pnpm-lock.yaml`, so under isolated installs it must be added explicitly (Q4).
- **Segments:** local `useState`. Live and Tickets show a placeholder line. No nested routes.
- **Data:** typed in-memory fakes (the Q3 default in `codebase-structure.md`). `useJourney(id)` is a plain synchronous hook so the screen never knows where the data comes from. TanStack Query waits for phase 1 (Q6).
- **Status and countdown:** "On time" and "12 min" are static fake values. They become realtime in phase 2.
- **Gradient and blur:** none. No `expo-linear-gradient`, no `expo-blur`.
- **No Zustand, no `@react-spring/three`, no gesture handler.** The peel machine is a pure reducer, animation is interpolation in `useFrame`, and the camera is fixed (see the seat picker).

## 3D hero

- **Home:** `features/seat-map-3d/`, as in `codebase-structure.md`. `index.ts` exports `TrainHero`, an eager wrapper. The R3F scene is `lazy()` inside Suspense plus an error boundary, so the static image shows while loading and when the scene throws while rendering or its load rejects (see Failure mode below for load-time errors). The barrel never imports three statically. `journeys` imports `TrainHero` only through the barrel.
- **Look (when the flag is on):** a 3D placeholder train on a `Canvas`, swaying about ±12° around the vertical axis so it stays side-on like the mockup (no 360° spin, no touch interaction). The canvas is opaque (`scene.background` is `colors.heroSky`) and there is no scenery layer. **Status (Round 3, proposed): switched off.** A transparent canvas (Round 2) and an opaque `scene.background` (Round 3) both drew nothing on the iOS 26.5 simulator, although the Canvas mounts (THREE and EXGL log lines, no errors). The only build that ever drew was a diagnostic build that also had: a raw `expo-gl` `GLView` (a second GL context) in the hero, an explicit `gl.setClearColor('#00ff00', 1)` in `onCreated`, a `gl.render` wrapper calling `gl.getError()` (a GL sync), an unlit red cube and extra logging, with the scenery hidden. Which difference mattered is unknown. The next 3D attempt re-adds those pieces **one at a time, the raw `GLView` first**. Open bug to fix before re-enabling: after the detail screen was opened the app stayed at about 100% CPU, on `Live` too (the loop was not paused) and on the list after Back. The static image (full flat art, a placeholder) is what ships and is also the 3D path's loading and error fallback.
- **Model:** the placeholder train below, shell closed.
- **Frames (when the flag is on):** render continuously while the screen is focused and Overview is the active segment, and pause otherwise. If reduce-motion is on, show a fixed pose.
- **Failure mode (when the flag is on):** if the scene throws while rendering, or its deferred load rejects, the page still ships with the static image. A module that throws while it is being loaded is reported by Metro as fatal (a red box in dev, probably a crash in a release build) and cannot fall back, so loading must not throw: `metro.config.js` resolves `three` as ESM, because `three` 0.186+ ships a Node-only `build/three.cjs` shim.

## 3D seat picker with shell-peel

The hero card is far too small to pick seats in, so the peel gets the full-screen route the architecture doc already defines: `/booking/[tripId]/seats`.

**Split, from `codebase-structure.md`:**

- `seat-map-3d` is **controlled and API-agnostic.** Props: `layout`, `status`, `selectedSeat`, `pendingSeat`, `onSeatPress`. The 3D and 2D maps take the same props type.
- Its own machine covers camera and animation only: `idle → peeling → interior`. A pure reducer with two actions (peel, peel done), unit-tested.
- **booking owns the hold.** `useSeatHold` drives the doc's `holding` step through props: pending → granted or rejected.
- `SeatMap` is an eager wrapper that owns the 2D/3D choice (toggle, GL failure). Only its 3D branch is `lazy()`.

**Placeholder train.** Built from three's shapes with the doc's mesh names, so the peel code does not change when the real `.glb` arrives: `Shell_Roof`, `Shell_Left`, `Shell_Right`, `Nose`, `Interior`, `Seat`. One car, 5 seat columns (3 + 2). The hero reuses the same model with the shell closed.

**Peel.** Tap the train: the roof lifts, the side walls slide out and fade, the nose fades, and the camera moves to a fixed top-down view over the car. Interpolation in `useFrame` with three's own damping. Frame loop: continuous while idle (sway) and peeling, `demand` in `interior`.

**Seats.** One `InstancedMesh`, coloured with `setColorAt`: grey = booked or held by someone else, white = free, accent = your selection. A tap gives an `instanceId`, mapped to a `seatCode` through an array built from the layout, and ignored unless the seat is white.

**Hold flow, all fake.**

- `getSeatLayout(tripId, car)`: car 7, rows 1–8, columns A–E, with `pos` computed, a few booked seats and one held. Window seats are columns A and E.
- `holdSeat(tripId, car, seat)`: resolves after about 600 ms with an `expiresAt`, rejects for one forced-reject seat (for example `5-B`), so "seat reverts to grey" is testable.
- Choosing another seat replaces the previous hold.
- A rejected hold shows an inline message (no toast library) and the seat goes back to white.

**2D grid.** A minimal `SeatGrid2D` of pressables, taking the same props as the 3D map. It is the error-boundary fallback, the screen-reader path, and the only renderable seat map under jest. It is how the hold flow gets tested.

**Seat card.** When a hold is granted, show the seat code and window or aisle. **Continue** is a no-op (checkout is not built). The "Mt. Fuji side" note is not modelled.

**Entry point.** The seat chip on the journey card opens `/booking/<tripId>/seats`. This is temporary until the search flow exists (Q2). The `Journey` fake gets a `tripId`.

**Riskiest unverified piece: touch picking.** Tap → `instanceId` on an `InstancedMesh` under R3F native and `expo-gl`. Step 10 starts with this on the simulator, before any animation. If it fails, selection still works through the 2D grid.

## 3D dependencies and build

- **Dependencies:** `npx expo install expo-gl expo-asset expo-file-system`, then `three`, `@react-three/fiber@^9` and `@types/three`. `expo-asset` and `expo-file-system` are R3F peers, so they must be explicit under isolated installs. R3F 9 needs React `>=19 <19.4` and the project has 19.3.0, so a React bump would break it. Import from `@react-three/fiber/native`. Registry check: `expo-gl` 58.0.4, R3F 9.8.2. Drei and the `glb` asset extension are added when the real model arrives.
- **Build:** a native dev build is required, not Expo Go. `npx expo run:ios` works on this machine (Xcode and a booted iPhone 17 Pro simulator exist), and `/ios` and `/android` are gitignored. **Simulator FPS does not count for gate 1.** There is no physical device yet, so gate 1 and 3D performance stay unmeasured; the simulator uses software GL (a Round 3 run with diagnostic logging measured the JS loop at about 2 fps). Gate 1 is a release build on a physical Android phone, still blocked on Q3 (there is no `ANDROID_HOME`).
- **Metro:** `three` 0.186+ resolves `require('three')` to `build/three.cjs`, a Node-only shim that calls `process.emitWarning` (missing in React Native), and R3F native's CJS build does `require('three')`. `metro.config.js` resolves `three` with `isESMImport: true`, so Metro takes `build/three.module.js`. Check without a device: `npx expo export --platform ios --no-bytecode` and count `THREE_CJS_DEPRECATED` in the bundle (expect 0).
- **Jest:** the real `three` cannot load under jest (`three.cjs` itself `require`s an ES module), and `import()` cannot run under jest here (babel-preset-expo leaves it for Metro). So any test that renders `TrainHero` or `SeatMap`, the screen tests included, would fail on the lazy load. Two answers: the scene is loaded with a deferred `require` (not `import()`), and one global mock of the scene modules in `jest.setup.ts` (which also mocks `expo-font`, because icon fonts cannot load under jest). Tests: a scene that throws at render or at load shows the static image (hero) or the 2D grid (picker); jest cannot reproduce Metro's fatal guard for load-time errors, so that path is covered only on a device.
- **Not verified yet:** how R3F's native loader behaves with the real `.glb` (embedded textures are a commonly reported snag on RN). It does not matter until the model exists.

### Fake data shapes

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
    index.ts                        Exports TrainHero, SeatMap, SeatGrid2D, types. No static three import.
    types.ts                        SeatMapProps, SeatStatus, SeatLayout
    config.ts                       HERO_3D_ENABLED (false: the hero is the static image; not exported from the barrel)
    TrainHero.tsx                   Eager: lazy(HeroScene) in Suspense + error boundary, static fallback
    SeatMap.tsx                     Eager: 2D/3D toggle, lazy(SeatScene) + error boundary → SeatGrid2D
    scene/HeroScene.tsx  SeatScene.tsx
    models/PlaceholderTrain.tsx     Primitives with the doc's mesh names
    animation/peelMachine.ts        Pure reducer: idle → peeling → interior
    seats/Seats.tsx  layoutToInstances.ts
    fallback-2d/SeatGrid2D.tsx
  shared/
    theme/                          colors, spacing, radius, typography, shadows
    ui/                             Card, Button, IconButton, SegmentedControl, Divider, TabBar
    lib/format.ts                   formatDuration(from, to) → "2h 12m"
assets/images/hero-static.png       Full-hero fallback (placeholder, Q5)
jest.setup.ts                       Mocks expo-font and the scene modules
metro.config.js                     Resolves three as ESM (three >= 0.186 ships a Node-only three.cjs)
```

Route trap: without the nested `journeys/_layout.tsx` Stack, `[id]` shows up as its own tab or hides the tab bar. Check the layout against `.claude/skills/expo-router/references/route-structure.md`. The skill prefers `NativeTabs`, but the mockup's floating pill needs JS `Tabs` with a custom `tabBar`. `booking/` sits outside `(tabs)`, so the seat picker covers the tab bar.

`src/app/index.tsx` stops being the placeholder, so `src/__tests__/home.test.tsx` must be replaced (step 2).

## Build order

Each step ends green on `pnpm check`. Steps 1–7 build the whole page with a static hero. Steps 8–9 build the hold flow with no 3D. 3D never blocks the rest.

0. **Install.** `node_modules` is missing in this worktree, so run `pnpm install` before anything else.
1. **Foundation.** `shared/theme` tokens, `Card`, `Button`, `IconButton`, `SegmentedControl`, `formatDuration`. Add `@expo/vector-icons`. Tests: `SegmentedControl` switches value, `formatDuration` gives `2h 12m`.
2. **Route skeleton + TabBar.** All tab routes above, with stub screens. Replace the home test by rendering `JourneyDetailScreen` directly. A navigation test (list link opens detail, tab bar stays) needs Expo Router's in-memory test helper, which no project skill documents, so check it after install. Confirm on the simulator that the bar floats and `[id]` is not a tab.
3. **Journeys data.** `types.ts`, `api/fake.ts`, `useJourney`. Unknown id returns `undefined`, and the screen shows a short "not found" line.
4. **Components.** `JourneyCard`, `JourneyDetails`, and `TrainHero` as a static-image wrapper (no three yet). Test: `JourneyCard` shows `Nozomi 32`, `7-E`, `09:00`, `11:12`, `2h 12m`, `On time`.
5. **Screen.** Header, segments, scroll area with bottom padding, composition. Live and Tickets placeholders.
6. **3D hero.** Add the 3D dependencies, then `HeroScene` and `PlaceholderTrain`. Make `TrainHero` lazy-load the scene with Suspense and an error boundary. Add focus, segment and reduce-motion handling, the jest mock and the fallback test. Run `npx expo run:ios` and watch the train sway. **Built, shipped disabled (Round 3):** `HERO_3D_ENABLED = false`, so the hero is the static image; the sway check moves to a physical device.
7. **Compare the page with the mockup.** Run next to the image, fix spacing and colour drift.
8. **Seat logic, pure TypeScript.** `types.ts`, `peelMachine`, `layoutToInstances`, the fake layout and `holdSeat`. Unit tests: the peel reducer, instance → seat code mapping, and the forced reject.
9. **Seat picker with the 2D grid.** `SeatGrid2D`, `SeatMap` (2D only for now), `useSeatHold`, `SeatPickerScreen`, the route, and the seat chip link. RNTL tests: tap a free seat → pending → selected, and the forced-reject seat goes back to white with a message.
10. **3D seats and peel.** First a tap-picking spike on the simulator: tap → `instanceId` on a plain `InstancedMesh`. Then `Seats`, the placeholder parts, the peel animation and camera move, and the seat colours. Wire `SeatMap`'s lazy 3D branch, the toggle and the error-boundary fallback. **Blocked (Round 3, proposed):** nothing 3D has drawn on the simulator yet, so the tap-picking spike cannot run until 3D draws at all (a physical device, or the one-at-a-time diagnostic route above).
11. **Seat card.** Granted hold shows the card with a no-op **Continue**. Final `pnpm check` and a pass on the simulator.

## Out of scope

- Where **Show ticket** goes (`/ticket/[ticketId]`), the map button, the ⋮ menu.
- Live and Tickets segment content.
- Real hero art and the real `.glb`.
- Pan, pinch and zoom, other cars, LOD.
- Checkout, the hold countdown, realtime seat events and version checks.
- Low-FPS auto-switch to 2D (gate 2).
- Measuring gate 1 on a physical Android phone.
- Blur on the tab bar, API, TanStack Query.

## Done when

- Screen matches the mockup at 390 pt wide (items 1–7 above).
- Tab bar stays visible on `/journeys/<id>`; back chevron returns to the list.
- The hero is the static image (the 3D hero is built but switched off behind `HERO_3D_ENABLED`), filling its 402×174 slot, clipped, with the app idle at about 0% CPU. The sway, and the static fallback on a scene error, are verified on a physical device when one exists (gate); not on the simulator.
- The seat chip opens the picker; (the 3D parts of this bullet are blocked on 3D drawing at all, see step 10); tapping the train peels the shell and moves the camera over the seats; tapping a white seat holds it; the forced-reject seat goes back to white with a message.
- With the 3D scene mocked or failing, the 2D grid shows the same seats and passes the same hold tests.
- Tests listed in steps 1–11 pass, plus `pnpm check`.

## Open questions (default if unanswered)

1. **Which screen** is the mockup? *(default: Journey detail at `/journeys/[id]`; list is a stub)*
2. **Entry to the seat picker:** the seat chip, tapping the hero, or a temporary button? *(default: the seat chip; temporary until the search flow exists in phase 1)*
3. **Android route for gate 1:** local Android SDK or EAS Build? *(default: decided before gate 1; it is `codebase-structure.md` Q1)*
4. **Icons:** `@expo/vector-icons`, or `react-native-svg` with hand-drawn icons? *(default: `@expo/vector-icons`, Ionicons: train, ticket, map, person, qr-code, walk)*
5. **Hero art:** who supplies the scenery and static images? The illustration in the mockup is someone else's design, so don't ship it. *(default: flat placeholders, swap later)*
6. **TanStack Query now,** or wait for phase 1? *(default: wait)*
7. **Show ticket / map button:** no-op, or link to a `/ticket/[ticketId]` stub? *(default: no-op)*
8. **Tab bar blur:** add `expo-blur`, or a solid fill? *(default: solid white; translucent was dropped because a translucent fill plus a shadow logs a shadow warning on iOS)*
