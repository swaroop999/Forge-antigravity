# Project Rules & Stability Guardrails

- **Git Commits & Pushes**: Automatically add, commit, and push changes to git after completing any set of changes without asking for permission first, so the latest APK build gets triggered and released immediately.

- **Zero-Crash Native Dependency Rule (CRITICAL)**:
  - NEVER use raw `pnpm add <expo-package>` or `npm install <expo-package>` for any native or Expo module. Always use `npx expo install <package>` or explicitly pin the exact version matching the installed Expo SDK (e.g. SDK 54).
  - Raw package managers install `@latest`, which can be dozens of major versions ahead (e.g. `expo-image-picker@57` instead of `~17.0.11` on Expo SDK 54), causing fatal runtime JVM/JNI native crashes on startup (`ClassNotFoundException`, `NoClassDefFoundError`).

- **Prebuild & Manifest Integrity**:
  - Keep `android.permissions` in `app.config.ts` minimal (`["POST_NOTIFICATIONS"]`). Allow official Expo plugins to declare permissions to avoid deprecated permissions (`WRITE_EXTERNAL_STORAGE` / `READ_EXTERNAL_STORAGE`) breaking Android 13+ devices.
  - Before pushing any changes touching `app.config.ts`, `package.json`, or native libraries, run:
    1. `npx tsc --noEmit` (ensure zero TypeScript compilation errors)
    2. `npx expo-doctor` (ensure zero major version mismatches and all peer dependencies like `expo-asset` are satisfied)
    3. `npx expo prebuild --no-install` (dry-run prebuild to confirm Android manifest and Gradle merge cleanly)

- **Defensive Runtime Architecture**:
  - All native event listeners (e.g., `Keyboard.addListener`), permissions requests, camera/gallery calls, and batch storage operations (`AsyncStorage.multiGet`) MUST be enclosed in `try / catch` blocks and guarded against empty arrays.
  - Root layouts (`app/_layout.tsx` and `app/(tabs)/_layout.tsx`) must never throw uncaught exceptions during mount.
