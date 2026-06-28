# Plan: Setup GitHub Actions Deployment Pipeline

## 1. Overview

We need to create a continuous deployment (CD) pipeline using GitHub Actions that builds the application for Web and Android. iOS is excluded for now. The pipeline will automatically run when code is pushed to the `deploy` branch, or when manually triggered via `workflow_dispatch` (in which case it will force checkout of the `main` branch).

## 2. Pipeline Configuration (`.github/workflows/deploy.yml`)

- **Triggers:**
  - `push` to `deploy`
  - `workflow_dispatch` (manual)
- **Environment Setup:**
  - `ubuntu-latest` runner
  - Node.js 22 (for JS execution)
  - Java JDK 17 (for Android Gradle compilation)
  - `pnpm` (package manager)
- **Quality Gates:**
  - Run `pnpm lint` and `pnpm exec jest --watchAll=false` before building, so failing code doesn't reach the deployment phase.
- **Web Build:**
  - Run `pnpm exec expo export -p web`
  - Upload the `dist/` folder as a GitHub Actions artifact (`web-build`).
- **Android Build:**
  - Run `pnpm exec expo prebuild --platform android` to generate the native code.
  - Run `./gradlew assembleRelease` in the `android` directory to compile the standalone APK.
  - Upload the resulting `app-release.apk` as a GitHub Actions artifact (`android-apk`).

## 3. Adherence to Guidelines

- **Precision & Exhaustiveness:** Outlines the exact steps from checkout to artifact generation for both platforms.
- **Task Tracking:**
  - [x] Create the `.github/workflows` directory.
  - [x] Create the `deploy.yml` workflow file.
  - [x] Add explicit logic to ensure `workflow_dispatch` always targets the `main` branch.
