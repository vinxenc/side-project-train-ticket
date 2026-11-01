# side-project-train-ticket

Train booking app: Expo SDK 58 + React Native, pnpm. Start with [docs/architecture.md](docs/architecture.md); the proposed layout and build order are in [docs/codebase-structure.md](docs/codebase-structure.md).

```bash
pnpm install
pnpm start   # dev server
pnpm check   # lint + typecheck + test + format check
```

The 3D scenes use `expo-gl`, so the app needs a native build, not Expo Go:

```bash
export LANG=en_US.UTF-8   # CocoaPods needs a UTF-8 locale
npx expo run:ios          # first build takes minutes; creates the gitignored ios/
```
