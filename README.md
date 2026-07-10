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

**Other useful commands**

`npx expo-doctor`

## EAS cli deploy and test

Install eas cli
`npm install -g eas-cli`

### Using the local Development Build

When you generate a local dev build (e.g., an `.apk` file for Android), follow these steps to use it:

1. **Install the APK on your device/emulator:**
   - If using WSL, you can access your project files from Windows File Explorer at `\\wsl$\` and copy the generated `.apk` file.
   - For physical devices: transfer the file to your phone and install it.
   - For Windows emulators: drag and drop the `.apk` file into the running emulator to install it.
2. **Start the development server:**
   ```bash
   pnpm start
   ```
3. **Connect the App:**
   - Open the installed app (it will show the Expo Dev Client launcher).
   - In your WSL terminal running `pnpm start`, press `a` to connect, or scan the QR code with your phone.

### EAS Cloud

```bash
eas build --profile development --platform android
eas build --profile development --platform ios --simulator
eas build --profile development --platform ios #(For physical iOS devices, you will need to register your device's UDID with EAS during the prompt).
```

### EAS local (Windows / Mac / Native Linux)

If you are developing natively on Windows (via PowerShell/Command Prompt), Mac, or Native Linux, you can simply run:

```bash
eas build --profile development --platform android --local
eas build --profile development --platform ios --local --simulator
```

### EAS local for Linux (WSL)

> **⚠️ WSL Architecture Conflict:** For local Android builds to work natively inside WSL, the underlying Gradle process requires a Linux Android SDK. However, `pnpm start` still needs your Windows SDK to launch the emulator!

To solve this, you keep your `ANDROID_HOME` pointed to Windows in your `.bashrc` for normal development, but download a separate Linux SDK just for building.

**Step 1: Install the Linux Android SDK inside WSL**

```bash
mkdir -p ~/android-sdk/cmdline-tools
cd ~/android-sdk/cmdline-tools
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q commandlinetools-linux-11076708_latest.zip
mv cmdline-tools latest

# Set temp environment variables for sdkmanager
export ANDROID_HOME=$HOME/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME

# Accept licenses and install required packages (Check Expo documentation for the exact versions you need)
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006"
```

**Step 2: Add a helper command to your `.bashrc`**
Since we still want `pnpm start` to use the Windows SDK by default, add this helper function to your `~/.bashrc` so we can trigger builds using the Linux SDK:

```bash
# Helper function to run local EAS Android builds using the Linux SDK
eas-build-android() {
    ANDROID_HOME=$HOME/android-sdk ANDROID_SDK_ROOT=$HOME/android-sdk eas build --platform android --local "$@"
}
```

Don't forget to reload your bash config with `source ~/.bashrc`.

**Step 3: Run the build**
Whenever you need to build a local APK from within WSL, use the custom helper instead of the standard EAS command:

```bash
eas-build-android --profile development
```
