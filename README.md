# Trenord Infotainment

A highly polished, reliable, and premium onboard infotainment application for Trenord trains. Built with offline resilience, multi-language support (English/Italian), and a beautiful UI.

## 🚀 Tech Stack

- **Framework:** React Native (0.83) with Expo (SDK 55)
- **Routing:** Expo Router
- **State Management:** Zustand
- **Testing:** Jest + `@testing-library/react-native`
- **Package Manager:** `pnpm` (Strictly enforced)

## 📦 Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Start the development server:**

   ```bash
   pnpm start
   ```

   > **Note on Web Development & CORS:** When testing the app in a web browser, API requests are automatically routed through a local Expo API proxy (`/api/proxy`) to safely bypass CORS restrictions. The old `chrome.exe --disable-web-security` workaround is **no longer required**!

## 🧪 Testing

Unit tests cover all core business logic and UI interactions. Test files are located in the `__tests__` directory or alongside components as `*.test.tsx`.

Run the test suite:

```bash
pnpm test
```

_(You can also use pnpm `test:cov` to get the code coverage report.)._

## 🏗️ Architecture & Guidelines

This project strictly adheres to **SOLID principles**

For detailed development guidelines, project structure, domain knowledge, and AI Agent workflows, please review [.agents/AGENTS.md](.agents/AGENTS.md).

## 🛠️ Android from WSL (Easy Setup)

If you are developing inside WSL but running Android Studio and the emulator on Windows, you must configure WSL to use the Windows Android SDK path.

1. Find your Windows username from WSL:

   ```bash
   ls /mnt/c/Users
   ```

2. Export your SDK path (replace `<WINDOWS_USER>` with your actual username). You should add this to your `~/.bashrc` for permanence:

   ```bash
   export ANDROID_HOME=/mnt/c/Users/<WINDOWS_USER>/AppData/Local/Android/Sdk
   export ANDROID_SDK_ROOT=$ANDROID_HOME
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin
   ```

**ADB Fix for WSL:**
Expo might fail with `Error: spawn .../platform-tools/adb ENOENT` because the Windows binary is `adb.exe`, but WSL expects `adb`. Fix this by creating a symlink:

```bash
cd "$ANDROID_HOME/platform-tools"
ln -s adb.exe adb
```

**Running the Emulator from CLI:**

```bash
# List available emulators
"$ANDROID_HOME/emulator/emulator.exe" -list-avds

# Start an emulator (replace <AVD_NAME> with a name from the list above)
"$ANDROID_HOME/emulator/emulator.exe" -avd <AVD_NAME>

# Check that the emulator is connected
"$ANDROID_HOME/platform-tools/adb" devices
```

## 🔄 Updating Dependencies

Use `pnpm` exclusively for installs and updates in this repository.

- Update regular dependencies within their existing version ranges:

  ```bash
  pnpm update
  ```

- Check and align Expo-related packages to the current SDK version:

  ```bash
  pnpm dlx expo install --check
  pnpm dlx expo install --fix --pnpm
  ```

_(When upgrading the Expo SDK itself, follow the official Expo SDK upgrade guide and then re-run the alignment command above)._
