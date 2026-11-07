# 3D train, hero and seat picker: REMOVED, to be redone later

> **Status: REMOVED, not built; nothing here is started. This PR is docs-only.** All code was removed on purpose (2026-11-07) and the user will start again from the Day-0 scaffold. This file is the **later plan for 3D**: why the first attempt was dropped, the lessons, the design worth reusing, and the proposed new approach (everything under "Proposed" is not agreed).
>
> **What was built and verified before removal** (R3F native + `expo-gl` + `three`, 2026-11-02 to 2026-11-07):
> - GL lab (dev-only, `/dev/gl`) with runtime-switchable variants: found the frame-driver facts (simulator-tested, 4 lab parts).
> - M3a: pure keyframe runner, 8-carriage train, ground, mountain, hero as one still frame, lighting (simulator-tested over 4 rounds: draws correctly; ~1% CPU residue accepted; 202 tests green).
> - M3b B1–B3: per-car fakes, car chips, pure peel reducer and camera maths, side-on 5-car overview scene with hit boxes (unit-tested and mutation-tested, 49 suites / 307 tests; **never run on the simulator**).
> - Not built: the peel (B4), instanced seats and picking (B5), final pass (B6).
>
> **Where the code is** (local branches, never pushed): `backup/r3f-native-3d` (`961fbdb`: everything above plus the M1/M2a app) and `backup/m1-m2a-code` (`042f9b9`: the 2D app only). The previous 860-line version of this file (decisions 1-21, steps A1-B6, coder/tester/reviewer rounds) is `git show backup/r3f-native-3d:docs/3d-train-checklist.md`; the GL lab logs are also still in [journey-detail-checklist.md](journey-detail-checklist.md).
>
> **What this file is for now:** read "Lessons" and "Design to reuse" before any 3D work; do the "Step 0 spike" first; copy pure code (maths, reducer, fakes) from the backup branch, not the R3F glue. Related: [journey-detail-plan.md](journey-detail-plan.md) (the 2D restart plan) and [codebase-structure.md](codebase-structure.md) ("Lessons from this attempt" for the process).

## Why it was removed

On the iOS 26.5 simulator (software GL; there is **no physical device**):

- Continuous frames (`frameloop="always"`, or a throttled `invalidate()` timer at 10 or 30 fps) **presented nothing** and burned about 100% CPU, which could take 40 s or never to drain after leaving the screen.
- Only **one `invalidate()` per state change** (`frameloop="demand"`) presented reliably, so there was no smooth animation: the peel would have been a slideshow of 5 keyframes 1 s apart.
- A bare `GLView` leaves **about 1% CPU idle** after its first use (hypothesis: expo-gl's display link; fixing it means patching a native module).
- Nothing could be judged for real performance (gate 1 needs a physical Android phone).

The user decided to drop the R3F-native stack and redo 3D later, probably with **three.js inside a WebView**.

## Lessons (what worked, what did not)

| Topic | Worked | Did not work |
| --- | --- | --- |
| Frame driver | `frameloop="demand"` + ONE `invalidate()` per state change; discrete keyframes from a pure runner (`show/play/stop`, `onDone`) | `frameloop="always"`; throttled `invalidate()` timer; calling `invalidate()` from `useFrame` (a self-sustaining loop) |
| Canvas look | Opaque `scene.background`; `flat` (no tone mapping) so token colours are exact; Lambert maths `albedo*(ambient+dotNL*directional)/PI` for lighting | Default ACES tone mapping (white became grey); a transparent canvas (no pixels in two builds); one huge ground quad (drew a 1 px line; a 40x40 tessellated double-sided plane worked) |
| Taps | `Raycaster` hits `<mesh><meshBasicMaterial visible={false}/></mesh>` hit boxes; 40-instance `InstancedMesh` picks exactly (`instanceId` row-major); R3F `onClick` needs the finger to move < 20 px | The Canvas overlay claims every gesture: it must sit outside a `ScrollView`, and the hero needs `pointerEvents="none"`; a 180 pt lab slot made the hit area only ~33 pt tall |
| Several canvases | Two canvases coexisted and could be remounted; unmount stopped everything | Each `GLView` leaves ~1% idle CPU; a second canvas does not add much but nothing removes the first |
| Testing | Pure maths (`project`, `groundHit`) to pin camera framing and tap tables; reducers mutation-tested; scene mocked by a marker view; guarded lazy `require` (not `import()`) | `three` cannot load under jest; `three` 0.186+ needs a Metro resolver (`isESMImport`) because its `three.cjs` calls `process.emitWarning`; R3F 9 needs React < 19.4 |
| Process | A GL lab with runtime-switchable variants and an observer script found the frame-driver facts in a day | Reading simulator CPU/frames without a device; guessing before measuring |

## Design to reuse (all numbers come from the removed code; ASSUMED proportions, the mockup is gone)

- **Train:** 8 carriages along z, head at +z. Car length 10, width 3.6, height 3.2 (floor y -1.6), gap 0.5, pitch 10.5, car `i` (0-based) centre `z = (3.5 - i) * 10.5`; cars 1 and 8 have a nose. Built from primitives with the architecture doc's mesh names (`Shell_Roof`, `Shell_Left`, `Shell_Right`, `Nose`, `Interior`); 9 window panes per side, 2 bogies, a blue stripe (`colors.accent`).
- **Hero camera (three-quarter, from ahead of the nose):** position `(18, 6, 50)`, target `(0, -0.8, 34)`, fov 39, slot 402 x 174 pt; side-on fits only about 2 cars. One still frame, no sway. Light: ambient 1.4, directional 3.13 from `(6, 8, 4)` (a +x wall then shows its token colour exactly). Mount Fuji (low cone with a snow cap), grass, ballast, sleepers, two rails.
- **Picker overview (side-on, its own camera):** position `(62, 5, zWin)`, target `(0, 0.3, zWin)`, up `+y`, fov 35, canvas 402 x 300 pt, where `zWin = carCenterZ(windowCenter(focus) - 1)`. **5-car window** `windowCenter(focus) = clamp(focus, 3, 6)`, visible cars `c-2 ... c+2`; plus **car chips** (`Car 7 · 31 free`, name `Car 7, 31 free seats` / `Car 5, full`, disabled when full). Tap table (window centre 4 = cars 2-6): car centres x 40, 121, 201, 281, 362 at y 152; the 10 x 7 x 3.6 hit box of car 4 spans x 161-241, y 126-181 (about 80 x 55 pt, at least 44 pt tall).
- **Interior (top-down):** position `(0, 6.9, zCar)`, target `(0, -1.2, zCar)`, **`camera.up = (-1, 0, 0)`** so seat rows run left to right (row 1 at the head end, left) and columns A (top) to E. Seat tap table (car at z 0): `1-A (54,63)`, `5-B (222,99)`, `7-E (306,237)`, `8-E (348,237)`.
- **Data:** per-car fakes: `getTrain(tripId)` returns 8 cars `{car, total, free}`; `getSeatLayout(tripId, car)` varies by car (car 7 keeps the current pattern, car 5 is full, others rotate the booked list); forced-reject seat `5-B` rejects on every car; seat `pos` z = `(4.5 - row) * 0.7` (row 1 at +z). Changing car clears the selection, the pending hold and the error (switching 7 -> 3 -> 7 must not bring the old selection back).
- **Peel:** a time-based animation, not a frame loop: roof lifts (`y += 3.2`), walls slide (`x` by 3.0), neighbours sink, camera lerps `pos/target/up`; phases `idle -> peeling -> interior -> closing` driven by the runner's `onDone`; a pure reducer with no clock; handlers only in `idle`; Reduce Motion jumps to the interior; `Back to train`.
- **Seats:** one `InstancedMesh` (box 0.5 x 0.45 x 0.5), **unlit** (`meshBasicMaterial`) with exact token colours (floor `(91,102,115)`, free `(255,255,255)`, reserved `(184,190,198)` with an X `(74,85,96)`, selected `(46,102,149)`); `computeBoundingSphere()` after writing matrices; one render per colour change; the 2D grid stays as the toggle and the fallback, and the screen-reader path.
- **Colour tokens (ASSUMED, not measured):** `trainWindow #3A5068`, `trainBogie #3A4450`, `trainFloor #5B6673`, `ground #CBD5C8`, `track #6E7782`, `ballast #B7B1A7`, `sleeper #8C8479`, `mountain #A9B8C9`, `snow #F4F7FA`, `seatPending #8FB0CC` (the measured ones, `trainBody`, `accent`, `heroSky`, stay in `shared/theme/colors.ts`).
- **Failure and a11y:** a failed 3D view falls back to the 2D map with a message; the canvas slot is `aria-hidden`, the chips are the accessible way to pick a car; the 2D toggle is always visible (a blank canvas cannot be detected from JS).

## Proposed new approach: three.js in a WebView (nothing started)

Idea: a `react-native-webview` page that contains three.js, bundled to **one inline HTML string** (no network), with a `postMessage` bridge: RN sends state (`{type: 'setPose'|'setCar'|'setSeats', ...}`), the page sends events (`{type: 'carTap', car}`, `{type: 'seatTap', code}`, `{type: 'stats', fps}`). WebGL runs in WKWebView (a separate process, real `requestAnimationFrame`), so the expo-gl frame-presentation limits should not apply. The pure code from the backup (maths, reducer, fakes, tap tables) is reusable as is.

### Step 0: one-session spike (do this first; no product code)

Build a throwaway page with the 8-car placeholder at the hero camera, an optional rAF loop, a raycast tap on car 4, and the bridge. Run it on the iOS 26.5 simulator. Measure and record in the log:

| # | What to measure | How | Pass | Fail means |
| --- | --- | --- | --- | --- |
| 1 | WebGL works in the simulator's WKWebView | page does `getContext('webgl2')` and draws; screenshot the region and compare pixels | context is non-null and the train pixels are visible | stop; the approach is dead on the simulator (a device might still work, unmeasurable) |
| 2 | Page-reported fps with a continuous rAF loop for 10 s | the page counts frames and posts `{fps}` once a second | median >= 30 fps | use render-on-demand (one render per state change) inside the WebView, and re-measure |
| 3 | CPU of the app process AND the WebContent process while looping | `top -pid <pid> -l 3` for both | recorded (no pass line; it sizes the cost) | n/a |
| 4 | CPU after pausing the loop, and after unmount | same, 3 repeats of mount/unmount | paused <= 2%, after unmount <= 1% and no growth over 3 repeats | the WebView leaks work; use on-demand rendering or avoid keeping it mounted |
| 5 | Tap round trip | page stamps `performance.now()` at touch, RN logs receipt time; raycast hit on car 4 | median <= 150 ms; the tap table cells hit | taps are unusable; keep RN chips only |
| 6 | Memory | app + WebContent footprint at idle with 1 and 2 WebViews | recorded | n/a (decides hero + picker co-existing) |
| 7 | Scroll conflict | hero WebView inside the journey page `ScrollView`; vertical drag starting on it | page scrolls (set `scrollEnabled={false}` / `pointerEvents` as needed) | render the hero as an image until the picker opens |
| 8 | Load time | tap to first frame, cold and warm | warm <= 500 ms | show the static image meanwhile (already planned) |

Rule: the spike **passes** only if rows 1, 4 and 5 pass; rows 2 and 7 failing means a degraded mode (on-demand rendering, image hero) rather than a stop. Write the numbers and screenshots in a new round log in this file; then the user decides to go on.

### Costs and risks

- New native module (`react-native-webview`): needs a rebuild (`npx expo run:ios --clean`), not Expo Go; one new dependency, to be approved by the user.
- A build step to bundle three.js plus the page into one HTML string (for example a small esbuild script writing a `.ts` constant); the bundle is large (~700 KB) and parsed by the WebView each time.
- Scrolling and gesture conflicts when a WebView sits inside the journey page; the WebView swallows touches unless disabled.
- Accessibility: VoiceOver cannot see inside the canvas; the chips and the 2D grid remain the accessible path.
- Memory per WebView (a separate WebContent process); two WebViews (hero + picker) may be too many, so the picker could replace the hero view while open.
- The bridge is asynchronous: no per-frame JS state; messages must stay small.
- Still no physical device: real performance stays unmeasured.
- The simulator may still not show WebGL (row 1 is the gate).

### Order (each step ends green on `pnpm check`, then a tester round)

1. **Spike** (above). 2. **Hero:** (after the restart has a static-image hero, plan step 4) replace the image with the WebView scene (static pose; the image stays as the loading and error fallback). 3. **Seat picker overview:** side-on 5-car window + chips + tap a carriage. 4. **Peel:** time-based animation and the interior camera. 5. **Seats:** instanced unlit seats, picking, the hold flow, 2D toggle and fallback. Reuse the reducer, maths, fakes and tap tables from the backup branch (copy files, do not merge the branch).

## Removal

What was removed (the final state, 2026-11-07): **all code**, not only 3D. The user decided to start again, so the branch `feat/3d-train-peel` goes back to the Day-0 scaffold (`2145f26`) with only `docs/` changed, and the PR is docs-only.

- **3D code, removed first** (from the `042f9b9` state): `scene/HeroScene.tsx`, `models/PlaceholderTrain.tsx`, `ErrorBoundary.tsx`, `useReduceMotion.ts`, `config.ts` (`HERO_3D_ENABLED`), `metro.config.js` (it held only the `three` resolver), their tests, and the dependencies `three`, `@react-three/fiber`, `@types/three`, `expo-gl`, `expo-asset`, `expo-file-system` (`expo` itself still depends on the last two). Tests went from 28 suites / 117 tests to 20 / 99; that intermediate state is not saved on its own branch (it was never committed).
- **Then everything else:** the journey detail page, 2D seat picker, tests and theme (`backup/m1-m2a-code`), and the M3a/M3b 3D work and lab (`backup/r3f-native-3d`).
- **Native:** `ios/` is gitignored and may still link `expo-gl` and the other removed modules until the next prebuild. Before the next native build delete `ios/` or run `npx expo run:ios --clean`.
- **Docs:** this file rewritten as the later plan; `journey-detail-plan.md` and `codebase-structure.md` rewritten as the restart plan; a banner on `journey-detail-checklist.md` (the logs are kept as evidence); `architecture.md` untouched (its 3D stack row is superseded-pending).
