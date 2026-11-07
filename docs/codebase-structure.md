# Codebase structure

> **Proposed — not agreed.** Builds on [architecture.md](architecture.md) (the *what*). This is the *how*: layout, rules, build order. The Day 0 scaffold is in; the rest is proposed.
>
> **Status: code removed on purpose; the user will start again. This PR is docs-only.** The tree is the Day-0 scaffold. Before the removal (2026-11-01 to 2026-11-07) these were built: the journey detail page, 2D seat picker and hold flow (M1 `cd2fac1`, M2a `042f9b9`, simulator-tested, 28 suites / 117 tests), then an R3F-native 3D train (M3a simulator-tested, M3b B1–B3 unit-tested only) that was abandoned. Code lives in the local branches `backup/m1-m2a-code` (= `042f9b9`; its two commits are also in `origin/feat/my-journeys-page`) and `backup/r3f-native-3d` (`961fbdb`, the 3D work, the GL lab and the round logs).
>
> **What this file is for now:** the rules and the module layout for the restart, plus "Lessons from this attempt" at the bottom. The first-page plan is [journey-detail-plan.md](journey-detail-plan.md); the later 3D plan is [3d-train-checklist.md](3d-train-checklist.md).

## Layout

Single package, no monorepo. Folders are created on first use, not upfront.

```
docs/                       architecture.md, this file
src/
  app/                      Expo Router routes only; each re-exports a feature screen
  features/<name>/          journeys · booking · tickets · auth · seat-map-3d
    index.ts                the only import surface
    screens/ components/ hooks/ api/ store/ types.ts
  shared/                   ui · theme · api · realtime · storage · lib
assets/
```

## Rules

- Dependencies point one way: `app → features → shared`. `shared` never imports `features` or `app`.
- A feature imports another feature only through its `index.ts`.
- Enforced with `import/no-restricted-paths` zones, as in the doc. It is path-based, so it also catches relative imports. Confirmed (proposed note): `eslint-config-expo` ships `eslint-plugin-import`, and the zones fire for both `@/` aliases and relative paths.
- Only `shared/api` (and later `shared/realtime`) touch the network. Screens call feature hooks only.

## seat-map-3d (refines the doc, same module)

- **Controlled and API-agnostic.** Props: `layout`, `status`, `selectedSeat`, `pendingSeat`, `onSeatPress`. A future 3D map takes the same props type as the 2D grid.
- **booking owns the hold request** and drives the doc's `holding` step through props (pending → granted or rejected).
- **For the restart the module is 2D only:** `fallback-2d/SeatGrid2D`, `SeatMap` (renders the grid), `TrainHero` (a static image), `seatVisual`, `types`. The barrel exports `SeatMap`, `TrainHero` and the types. No scene, no lazy loading, no error boundary, no flag. The name `seat-map-3d` is kept for now (it is the architecture doc's module); rename it if 3D does not come back.
- **When 3D returns** (proposed: three.js in a WebView, see [3d-train-checklist.md](3d-train-checklist.md)), the barrel must still never pull the 3D code into the JS bundle statically; the lazy-loading rules of the removed R3F attempt (a guarded `require()`, not `import()`; a module that throws while loading is fatal under Metro) are in the 3D checklist's lessons, not here.
- **Superseded for the first page (proposed):** `architecture.md` mentions a Zustand store, `@react-spring/three`, pan/pinch and drei for this module. The first page uses none of them; `architecture.md` itself is left as it is (the user's import).
- The phase-0 spike is now the **WebView spike** of the 3D checklist: a throwaway page with a hard-coded scene, no backend, no `.glb`.

## Day 0, kept thin

- **Scaffolded:** Expo SDK 58, pnpm 9.7.0 (isolated installs), TypeScript strict, `@/*` → `src/*`, ESLint 9 + Prettier, jest-expo + RNTL, one GitHub Actions workflow running `pnpm check`. ESLint stays on 9.x because `eslint-plugin-react` (via `eslint-config-expo` 58.0.4) crashes on ESLint 10; revisit when `eslint-config-expo` supports 10.
- Native builds, not only Expo Go, from day 0: gate 1 is measured on a **release build on a physical Android phone**. This machine has `adb` but no Android SDK, so it is local SDK or EAS Build (Q1). SDK 58's release notes say new projects should use a development build, and the store Expo Go for 58 is still rolling out, so don't count on Expo Go on physical devices. Whether to add `expo-dev-client` is part of Q1. Bundle identifiers (`ios.bundleIdentifier`, `android.package`) are set to the placeholder `com.vinxenc.trainticket`; change them before the first store submission.
- Added when their phase needs them: TanStack Query, Zustand, RHF + Zod, i18next (`en` only) in phase 1; Socket.IO, MMKV, expo-secure-store in phase 2; Sentry at the first store build; Maestro once the booking flow exists; EAS Update at the first release; PostHog maybe never.
- NativeWind: chosen 2026-11-07 (see `journey-detail-plan.md` Decisions). Verify compatibility with the Expo and Reanimated versions in a spike before any screen uses it. Fallback is `StyleSheet` + `shared/theme` tokens.
- 3D stack: **none today.** `architecture.md` still lists R3F v9 / `expo-gl` / `three` for 3D; that row is superseded-pending and was left unedited (the user's import). The R3F-native attempt was dropped (see the 3D checklist); the proposed replacement is three.js in a `react-native-webview`, to be proven by a one-session spike first. There is no physical device yet, so 3D performance stays unmeasured (the iOS simulator uses software GL). An old gitignored `ios/` folder from the abandoned attempt may still link `expo-gl`: delete it or run `npx expo run:ios --clean` before the next native build.
- Agent skills, project scope in `.claude/skills/`, pinned by hash in `skills-lock.json` (`npx skills update` refreshes): `react-native-best-practices` (Callstack, for gate 1), `react-native-testing` (RNTL v14), `expo-router` (Expo). Add when their phase arrives: `expo-dev-client` after Q1, `expo-data-fetching` and `expo-design-system` in phase 1, `eas-app-stores`, `eas-update` and `expo-upgrade` in phase 4. This doc wins over any skill default. Every Expo skill ends with a "send feedback" step (`npx --yes @expo/agent-cli`): don't run it without asking.

## Build order

My reconstruction: the doc's roadmap diagram ("5 phases, 2 gates") did not export.

0. **Foundation + 3D spike** → *Gate 1*: 60 fps on the target Android phone, else cut model detail or go native. *(The R3F-native spike was run in this attempt and failed on the simulator; for the restart the 3D spike is the WebView spike in `3d-train-checklist.md`, and it no longer blocks the 2D work.)*
1. **2D booking** end to end: search → trips → 2D seats → hold → checkout → ticket. Hold logic includes a forced reject, so "seat reverts to grey" is testable.
2. **Realtime + offline tickets.** The realtime handler must `cancelQueries` for the seats key before `setQueryData`; otherwise an in-flight older response overwrites a newer patch. Keep the doc's version check on events.
3. **3D integration**: peel animation, GL-fail or low-FPS fallback to 2D → *Gate 2*.
4. **Push + deep links, vi/ja strings, store builds.**

First page plan (proposed): [journey-detail-plan.md](journey-detail-plan.md). For the restart it is 2D only (static hero, 2D seat picker); the 3D hero and the shell-peel are deferred to the 3D checklist's track, ahead of phase 3 only if the WebView spike passes. Gate 2's low-FPS auto-switch stays deferred, and simulator FPS does not count for gate 1.

## Open questions (default if unanswered)

1. Which mid-range Android phone? Local Android SDK or EAS Build? *(blocks gate 1)*
2. Placeholders for the first page: a static placeholder hero image; a placeholder train with the doc's mesh names only when 3D returns. Who makes the real `.glb` and the real hero art is still open.
3. Does a backend or OpenAPI spec exist, or is one coming? *(blocks phase 1)*
   - Default if not: skip orval. `shared/api` = typed functions over an in-memory fake (hold TTL + forced reject; realtime emitter in phase 2).
   - If yes: orval into `shared/api/generated/`. The structure above does not change.
   - Related: the doc has the API send 3D `pos` per seat. If we control the contract, I'd send row/col and derive `pos` per car model on the client. *(default: as in the doc)*
4. **Decided: pnpm**, pinned to the installed 9.7.0 in `packageManager`. Expo's docs support isolated installs since SDK 54, and Metro export passes under them here. Fallback if native autolinking breaks: `node-linker=hoisted` in `.npmrc` (pnpm 9).
5. Deep link `trainapp://trip/{id}` has no matching route: journey detail is `/journeys/[id]`, and `trip` is also the id in `booking/[tripId]`. Link to `trainapp://journeys/{id}`, or add a `trip/[id]` redirect route? *(default: link to `journeys/{id}`)*

Missing from the export: the layers diagram, the seat-hold flow ("2 decisions") and the roadmap. Paste them if you have them; the hold-flow decisions matter for phase 1.

## Lessons from this attempt

Process (the planner → coder → tester → reviewer loop, simulator only):

- **The loop found real device-only bugs that jest and `expo export` could not:** the `three` CJS shim crash (`process.emitWarning` missing in React Native; `expo export` and jest both passed), unscaled images (RN's `Image` applied the asset's intrinsic size), and a canvas that issued frames but **presented nothing** (no error, nothing to catch in JS). Each needed a tester on the simulator; a green `pnpm check` was never enough for anything native or graphical.
- **Simulator limits:** no `mobilecli` (so roles and ARIA labels are not testable on device; jest covers them), software GL (frame rates and CPU do not predict a phone), and **no physical device** (gate 1 stays unmeasured). Tap tables were first **computed** from the camera maths and only then **measured** from screenshots; the 2D grid matched exactly (zero drift), the 3D ones were never measured for B1–B3.
- **Measure before building on a guess:** a one-session lab (runtime-switchable variants, an observer script, a CPU gate) found the frame-driver facts in a day, after three rounds of guessing. Do the spike first (see the WebView spike).
- **Keep work committed:** the 3D work and M3b B1–B3 sat in an uncommitted working tree; commit WIP to a branch as you go.
- **Pure logic is cheap and survives:** reducers, projection maths, fakes and tap tables were mutation-tested and are reusable; the GL glue was the expensive, fragile part.
- **Scope:** a milestone whose gate needs a device nobody has (here: 3D) should be a separate track that cannot block the rest (M2a was built this way and shipped).
