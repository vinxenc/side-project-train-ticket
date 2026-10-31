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
- Enforced with `import/no-restricted-paths` zones, as in the doc. It is path-based, so it also catches relative imports. At scaffold time, confirm `eslint-config-expo` already ships `eslint-plugin-import`.
- Only `shared/api` (and later `shared/realtime`) touch the network. Screens call feature hooks only.

## seat-map-3d (refines the doc, same module)

- **Controlled and API-agnostic.** Props: `layout`, `status`, `selectedSeat`, `pendingSeat`, `onSeatPress`. The 3D and 2D maps take the same props type. Internals stay as in the doc (`scene/ models/ animation/ seats/ fallback-2d/`).
- **booking owns the hold request** and drives the doc's `holding` step through props (pending → granted or rejected). The module's own state machine covers camera and animation only: `idle → peeling → interior`.
- **The barrel must not statically import the R3F scene.** In RN, "lazy" means deferred module evaluation (one Hermes bundle, no chunk splitting), and Metro does not tree-shake barrels on native by default. `index.ts` exports `SeatMap` and `TrainHero` (journey header) as eager wrappers, plus the 2D map and the props type. `SeatMap` owns the 2D/3D choice (toggle, GL failure, low FPS). Only its 3D branch is `lazy()`, inside Suspense plus an error boundary that falls back to 2D, so the 2D path never waits on three.js. `TrainHero` does the same with a static image as its fallback.
- The phase-0 spike runs on a dev-only route with a hard-coded layout and placeholder boxes: no backend, no `.glb`.

## Day 0, kept thin

- **Scaffolded:** Expo SDK 58, pnpm 9.7.0 (isolated installs), TypeScript strict, `@/*` → `src/*`, ESLint 9 + Prettier, jest-expo + RNTL, one GitHub Actions workflow running `pnpm check`. ESLint stays on 9.x because `eslint-plugin-react` (via `eslint-config-expo` 58.0.4) crashes on ESLint 10; revisit when `eslint-config-expo` supports 10.
- Native builds, not only Expo Go, from day 0: gate 1 is measured on a **release build on a physical Android phone**. This machine has `adb` but no Android SDK, so it is local SDK or EAS Build (Q1). SDK 58's release notes say new projects should use a development build, and the store Expo Go for 58 is still rolling out, so don't count on Expo Go on physical devices. Whether to add `expo-dev-client` is part of Q1. Bundle identifiers (`ios.bundleIdentifier`, `android.package`) are set to the placeholder `com.vinxenc.trainticket`; change them before the first store submission.
- Added when their phase needs them: TanStack Query, Zustand, RHF + Zod, i18next (`en` only) in phase 1; Socket.IO, MMKV, expo-secure-store in phase 2; Sentry at the first store build; Maestro once the booking flow exists; EAS Update at the first release; PostHog maybe never.
- NativeWind: verify compatibility with the Expo and Reanimated versions at scaffold time. Fallback is `StyleSheet` + `shared/theme` tokens.
- 3D stack: R3F v9, imported from `@react-three/fiber/native`. The doc's `@react-three/native` (the v10 bindings) is not on npm yet (404 on the registry), and R3F's v10 migration guide says native apps stay on v9. The phase-0 spike validates the v9 setup with `expo-gl`.
- Agent skills, project scope in `.claude/skills/`, pinned by hash in `skills-lock.json` (`npx skills update` refreshes): `react-native-best-practices` (Callstack, for gate 1), `react-native-testing` (RNTL v14), `expo-router` (Expo). Add when their phase arrives: `expo-dev-client` after Q1, `expo-data-fetching` and `expo-design-system` in phase 1, `eas-app-stores`, `eas-update` and `expo-upgrade` in phase 4. This doc wins over any skill default. Every Expo skill ends with a "send feedback" step (`npx --yes @expo/agent-cli`): don't run it without asking.

## Build order

My reconstruction: the doc's roadmap diagram ("5 phases, 2 gates") did not export.

0. **Foundation + 3D spike** → *Gate 1*: 60 fps on the target Android phone, else cut model detail or go native.
1. **2D booking** end to end: search → trips → 2D seats → hold → checkout → ticket. Hold logic includes a forced reject, so "seat reverts to grey" is testable.
2. **Realtime + offline tickets.** The realtime handler must `cancelQueries` for the seats key before `setQueryData`; otherwise an in-flight older response overwrites a newer patch. Keep the doc's version check on events.
3. **3D integration**: peel animation, GL-fail or low-FPS fallback to 2D → *Gate 2*.
4. **Push + deep links, vi/ja strings, store builds.**

## Open questions (default if unanswered)

1. Which mid-range Android phone? Local Android SDK or EAS Build? *(blocks gate 1)*
2. Placeholder boxes for the spike, and who makes the real `.glb`? *(default: placeholders)*
3. Does a backend or OpenAPI spec exist, or is one coming? *(blocks phase 1)*
   - Default if not: skip orval. `shared/api` = typed functions over an in-memory fake (hold TTL + forced reject; realtime emitter in phase 2).
   - If yes: orval into `shared/api/generated/`. The structure above does not change.
   - Related: the doc has the API send 3D `pos` per seat. If we control the contract, I'd send row/col and derive `pos` per car model on the client. *(default: as in the doc)*
4. **Decided: pnpm**, pinned to the installed 9.7.0 in `packageManager`. Expo's docs support isolated installs since SDK 54, and Metro export passes under them here. Fallback if native autolinking breaks: `node-linker=hoisted` in `.npmrc` (pnpm 9).
5. Deep link `trainapp://trip/{id}` has no matching route: journey detail is `/journeys/[id]`, and `trip` is also the id in `booking/[tripId]`. Link to `trainapp://journeys/{id}`, or add a `trip/[id]` redirect route? *(default: link to `journeys/{id}`)*

Missing from the export: the layers diagram, the seat-hold flow ("2 decisions") and the roadmap. Paste them if you have them; the hold-flow decisions matter for phase 1.
