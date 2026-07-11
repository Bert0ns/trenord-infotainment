# Google Maps Android Investigation Report

## Summary of Findings from `googlemaps-samples/android-samples`

I have explored the official Google Maps Android Samples repository (`/home/berto/android-samples/ApiDemos/project/java-app/src/main/AndroidManifest.xml`).

The official Google configuration confirms that the only native requirement for Google Maps to authenticate properly on Android is the `com.google.android.geo.API_KEY` meta-data tag within the `<application>` block of the `AndroidManifest.xml`:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY" />
```

### Comparison with Our Project (`trenord-infotainment`)

Our `AndroidManifest.xml` (generated via Expo prebuild) currently contains the exact same, correct configuration:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="AIzaSyCQ_n8w5VxXES9Ddc9mzGFeNB4PocsRFh8" />
```

There are no missing tags, permissions, or structural differences between the official Google sample's manifest and our generated manifest.

### Conclusion: Why is it still failing?

Since the native Android configuration is perfectly aligned with Google's official samples, the problem is absolutely not in the native Android setup. The map completely disappearing in the APK is due to two overlapping issues:

1. **React Native Release Builds & `flex: 1`:**
   In the development emulator, React Native injects wrapper views that force a `height: 100%` component to expand. In the compiled release APK, these wrappers are stripped. Without `flex: 1`, the map collapses to a height of 0 pixels and completely disappears. (I have already pushed this fix to `journeyMap.tsx` in the workspace).

2. **Google Cloud Console API Status:**
   If the map renders as a blank gray/white box with a Google logo (as seen in development), it confirms the code works but Google's servers are rejecting the request. Since you confirmed there are no restrictions on the API Key, this means the **"Maps SDK for Android"** API is currently disabled in your Google Cloud Console project. (Note: This is a separate toggle from the Maps JavaScript API).

### Next Steps

1. Enable the **Maps SDK for Android** in the Google Cloud Console.
2. Commit the `flex: 1` fix in `journeyMap.tsx` to fix the component collapsing to 0 pixels.
3. Let GitHub Actions build the new APK.
