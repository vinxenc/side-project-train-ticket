# Codebase structure

> **Proposed — not agreed.** Builds on [architecture.md](architecture.md) (the *what*). This is the *how*: layout, rules, build order. The Day 0 scaffold is in; the rest is proposed.

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

- **Controlled and API-agnostic.** Props: `layout`, `status`, `selectedSeat`, `pendingSeat`, `onSeatPress`. The 3D and 2D maps take the same props type. Internals stay as in the doc (`scene/ models/ animation/ seats/ fallback-2d/`).
- **booking owns the hold request** and drives the doc's `holding` step through props (pending → granted or rejected). The module's own state machine covers camera and animation only: `idle → peeling → interior`.
- **The barrel must not statically import the R3F scene.** In RN, "lazy" means deferred module evaluation (one Hermes bundle, no chunk splitting), and Metro does not tree-shake barrels on native by default. `index.ts` exports `SeatMap` and `TrainHero` (journey header) as eager wrappers, plus the 2D map and the props type. `SeatMap` owns the 2D/3D choice (toggle, GL failure, low FPS). Only its 3D branch is `lazy()`, inside Suspense plus an error boundary that falls back to 2D, so the 2D path never waits on three.js. `TrainHero` does the same with a static image as its fallback.
- **Lazy loading is a guarded `require()` (proposed).** `lazy(async …)` calls `require('./scene/…')` and throws a real error when the result is `undefined`; `import()` is not used because jest cannot run it here (babel-preset-expo leaves it for Metro). A module that throws while it loads is fatal under Metro (a red box in dev) and cannot fall back, so loading must not throw; render and async-load errors are what the boundary handles.
- **Superseded for the first page (proposed):** `architecture.md` mentions a Zustand store, `@react-spring/three`, pan/pinch and drei for this module. The first page replaces them with a pure reducer, interpolation in `useFrame`, a fixed camera and no drei (see [journey-detail-plan.md](journey-detail-plan.md)); `architecture.md` itself is left as it is.
- **The hero ships static; the 3D hero is built but disabled (proposed):** `HERO_3D_ENABLED = false` in `seat-map-3d/config.ts` makes `TrainHero` render only the static image (no Canvas, no GL context, no `three` evaluation). No 3D pixels were drawn on the iOS 26.5 simulator in two builds (a transparent canvas, then an opaque `scene.background`). The only build that drew was a diagnostic one that also had a raw `expo-gl` `GLView`, an explicit `gl.setClearColor`, a `gl.render` wrapper calling `gl.getError()`, a red cube and extra logging; the next 3D attempt re-adds those pieces one at a time, raw `GLView` first. The 3D acceptance (the hero sways) moves to a physical-device gate. An open bug must be fixed before re-enabling: the app stayed at about 100% CPU after the detail screen was opened, including on the `Live` segment and after going back. Step 10 (3D seats and the shell peel) is blocked on 3D drawing at all; steps 8, 9 and 11 are not.
- The phase-0 spike runs on a dev-only route with a hard-coded layout and placeholder boxes: no backend, no `.glb`.

## Day 0, kept thin

- **Scaffolded:** Expo SDK 58, pnpm 9.7.0 (isolated installs), TypeScript strict, `@/*` → `src/*`, ESLint 9 + Prettier, jest-expo + RNTL, one GitHub Actions workflow running `pnpm check`. ESLint stays on 9.x because `eslint-plugin-react` (via `eslint-config-expo` 58.0.4) crashes on ESLint 10; revisit when `eslint-config-expo` supports 10.
- Native builds, not only Expo Go, from day 0: gate 1 is measured on a **release build on a physical Android phone**. This machine has `adb` but no Android SDK, so it is local SDK or EAS Build (Q1). SDK 58's release notes say new projects should use a development build, and the store Expo Go for 58 is still rolling out, so don't count on Expo Go on physical devices. Whether to add `expo-dev-client` is part of Q1. Bundle identifiers (`ios.bundleIdentifier`, `android.package`) are set to the placeholder `com.vinxenc.trainticket`; change them before the first store submission.
- Added when their phase needs them: TanStack Query, Zustand, RHF + Zod, i18next (`en` only) in phase 1; Socket.IO, MMKV, expo-secure-store in phase 2; Sentry at the first store build; Maestro once the booking flow exists; EAS Update at the first release; PostHog maybe never.
- NativeWind: verify compatibility with the Expo and Reanimated versions at scaffold time. Fallback is `StyleSheet` + `shared/theme` tokens.
- 3D stack: R3F v9, imported from `@react-three/fiber/native`. The doc's `@react-three/native` (the v10 bindings) is not on npm yet (404 on the registry), and R3F's v10 migration guide says native apps stay on v9. The phase-0 spike validates the v9 setup with `expo-gl`. Proposed notes: `three` 0.186+ needs a `metro.config.js` that resolves `three` as an ES module (its `build/three.cjs` is a Node-only shim that calls `process.emitWarning`, which React Native lacks); `expo-gl` means the app needs a native build (`npx expo run:ios`), not Expo Go; and there is no physical device yet, so gate 1 and 3D performance stay unmeasured (the iOS simulator uses software GL).
- Agent skills, project scope in `.claude/skills/`, pinned by hash in `skills-lock.json` (`npx skills update` refreshes): `react-native-best-practices` (Callstack, for gate 1), `react-native-testing` (RNTL v14), `expo-router` (Expo). Add when their phase arrives: `expo-dev-client` after Q1, `expo-data-fetching` and `expo-design-system` in phase 1, `eas-app-stores`, `eas-update` and `expo-upgrade` in phase 4. This doc wins over any skill default. Every Expo skill ends with a "send feedback" step (`npx --yes @expo/agent-cli`): don't run it without asking.

## Build order

My reconstruction: the doc's roadmap diagram ("5 phases, 2 gates") did not export.

0. **Foundation + 3D spike** → *Gate 1*: 60 fps on the target Android phone, else cut model detail or go native.
1. **2D booking** end to end: search → trips → 2D seats → hold → checkout → ticket. Hold logic includes a forced reject, so "seat reverts to grey" is testable.
2. **Realtime + offline tickets.** The realtime handler must `cancelQueries` for the seats key before `setQueryData`; otherwise an in-flight older response overwrites a newer patch. Keep the doc's version check on events.
3. **3D integration**: peel animation, GL-fail or low-FPS fallback to 2D → *Gate 2*.
4. **Push + deep links, vi/ja strings, store builds.**

First page plan (proposed): [journey-detail-plan.md](journey-detail-plan.md). It pulls the 3D hero and the shell-peel seat picker (placeholder train with the doc's mesh names, fake layout, fake hold with a forced reject, 2D grid fallback) ahead of phase 3. (Proposed update, Round 3: the hero ships as the static image with the 3D hero built but disabled, and the 3D seat picker is blocked until 3D draws.) Gate 2's low-FPS auto-switch stays deferred, and simulator FPS does not count for gate 1.

## Open questions (default if unanswered)

1. Which mid-range Android phone? Local Android SDK or EAS Build? *(blocks gate 1)*
2. **Decided: placeholders** (a placeholder train with the doc's mesh names). Who makes the real `.glb` is still open.
3. Does a backend or OpenAPI spec exist, or is one coming? *(blocks phase 1)*
   - Default if not: skip orval. `shared/api` = typed functions over an in-memory fake (hold TTL + forced reject; realtime emitter in phase 2).
   - If yes: orval into `shared/api/generated/`. The structure above does not change.
   - Related: the doc has the API send 3D `pos` per seat. If we control the contract, I'd send row/col and derive `pos` per car model on the client. *(default: as in the doc)*
4. **Decided: pnpm**, pinned to the installed 9.7.0 in `packageManager`. Expo's docs support isolated installs since SDK 54, and Metro export passes under them here. Fallback if native autolinking breaks: `node-linker=hoisted` in `.npmrc` (pnpm 9).
5. Deep link `trainapp://trip/{id}` has no matching route: journey detail is `/journeys/[id]`, and `trip` is also the id in `booking/[tripId]`. Link to `trainapp://journeys/{id}`, or add a `trip/[id]` redirect route? *(default: link to `journeys/{id}`)*

Missing from the export: the layers diagram, the seat-hold flow ("2 decisions") and the roadmap. Paste them if you have them; the hold-flow decisions matter for phase 1.
