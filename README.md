# Welcome to your Expo app 👋

## Get started

Preferred package manager: pnpm.

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Testing

Unit tests use Jest with React Native Testing Library. Test files live under [**tests**](__tests__) and follow the `*.test.tsx` naming convention.

Run the test suite:

```bash
pnpm test
```

Jest runs in watch mode by default; press `q` to quit or use `pnpm test -- --watchAll=false` for a single run.

## Get a fresh project

When you're ready, run:

```bash
pnpm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## **Android from WSL (easy setup)**

Android Studio and the emulator run on Windows. This project runs in WSL.

To make them work together, configure WSL to use the Windows Android SDK path.

Find your Windows user from WSL:

```bash
ls /mnt/c/Users
```

Then set your SDK path (replace `<WINDOWS_USER>`):

```bash
export ANDROID_HOME=/mnt/c/Users/<WINDOWS_USER>/AppData/Local/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin
```

You can also add the to ~/.bashrc for a permanent export

### What was fixed

Expo failed with:

```text
Error: spawn .../platform-tools/adb ENOENT
```

Reason: in Windows SDK the binary is `adb.exe`, but Expo in WSL tried `adb`.

Fix applied:

```bash
cd "$ANDROID_HOME/platform-tools"
ln -s adb.exe adb
```

### Run emulator from command line

List available emulators:

```bash
"$ANDROID_HOME/emulator/emulator.exe" -list-avds
```

Start one emulator (replace with your AVD name):

```bash
"$ANDROID_HOME/emulator/emulator.exe" -avd <AVD_NAME>
```

Check that the emulator is connected:

```bash
"$ANDROID_HOME/platform-tools/adb" devices
```

## Updating dependencies

Use pnpm for installs and updates in this repo.

Update regular dependencies within existing version ranges:

```bash
pnpm update
```

Check and align Expo-related packages to the current SDK:

```bash
pnpm dlx expo install --check
pnpm dlx expo install --fix --pnpm
```

When upgrading the Expo SDK itself, follow the Expo SDK upgrade guide and then re-run the Expo alignment command above.
