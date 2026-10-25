# Releasing Speak For Me to the stores

Both store builds are made on a Mac in this repository. There is no EAS
account, cloud build or `eas-cli` involved.

- `app.json` is the source of truth: version numbers, identifiers, permissions,
  icons and the signing plugin all live there.
- `android/` and `ios/` are committed, but they are generated. Every release
  script regenerates them with `expo prebuild --clean` and you commit the
  result, so the repository matches what shipped.
- Store credentials live in `credentials/` (git-ignored), never inside
  `android/` or `ios/`, because `prebuild --clean` deletes those folders.

| Where | What |
| --- | --- |
| `app.json` | `expo.version`, `expo.ios.buildNumber`, `expo.android.versionCode`, `expo.ios.appleTeamId` |
| `plugins/withAndroidReleaseSigning.js` | Signs Android release builds with the upload key; refuses to fall back to the debug key |
| `plugins/withPodResourceBundleDeploymentTarget.js` | Raises pod resource bundles (ReachabilitySwift, from expo-updates) to a deployment target Xcode 27 accepts |
| `credentials/android/upload-keystore.jks` | Play upload key (secret, backed up by you) |
| `credentials/android/keystore.properties` | Its `storeFile`, `storePassword`, `keyAlias`, `keyPassword` |
| `scripts/release-setup.sh` | One-time wizard: tools, Apple and Google accounts, upload key |
| `scripts/release-android.sh` | Builds `android/app/build/outputs/bundle/release/app-release.aab` |
| `scripts/release-ios.sh` | Builds `ios/build/SpeakForMe.xcarchive` and an `.ipa` |

## One-time setup

```bash
pnpm mobile release:setup
```

The wizard walks through, in order: accepting the Xcode licence and checking
JDK 17, the Android SDK and CocoaPods; enrolling in the Apple Developer
Program, signing in to Xcode and writing the Team ID into `app.json`;
registering the bundle ID and creating the App Store Connect record; creating
the Play upload key and `keystore.properties`; creating the Google Play
developer account and app. It can be re-run; it keeps what already exists.

Back up `credentials/` to a password manager as soon as the wizard finishes.
Google Play can reset a lost upload key, but only through a support request.

For CI, the same four values can come from the environment instead of the
properties file: `ANDROID_UPLOAD_STORE_FILE`, `ANDROID_UPLOAD_STORE_PASSWORD`,
`ANDROID_UPLOAD_KEY_ALIAS`, `ANDROID_UPLOAD_KEY_PASSWORD`.

## Every release

1. **Bump the numbers in `app.json`.**
   - `expo.version` is what users see (`1.1.0`). Use it for both platforms.
   - `expo.android.versionCode` must be higher than every bundle ever
     uploaded to Play, whatever the version. Add one per upload.
   - `expo.ios.buildNumber` must be unique per `version` on App Store Connect.
     Add one per upload too; keeping it equal to `versionCode` is simplest.
2. **Check the code.** From the repository root: `pnpm test`, `pnpm typecheck`,
   `pnpm lint`.
3. **Android.**
   ```bash
   pnpm mobile release:android --apk
   ```
   The script regenerates `android/`, builds the bundle, and proves it is
   signed with the upload key rather than the debug key. `--apk` also writes
   `android/app/build/outputs/apk/release/app-release.apk`; install it on a
   phone with `adb install -r` and try the app before uploading.
   Then in Play Console: Release → Testing → Internal testing → Create new
   release → upload the `.aab` → roll out to testers. Promote to Production
   from there once it has been used on a real device. Review usually takes a
   few days for the first submission.
4. **iOS.**
   ```bash
   pnpm mobile release:ios
   ```
   The script regenerates `ios/`, installs pods, archives with automatic
   signing for the team in `app.json`, and exports an `.ipa`. Upload it with
   Apple's Transporter app, or `open ios/build/SpeakForMe.xcarchive` to
   use Xcode's Organizer → Distribute App. `--upload` sends it straight from
   the script when Xcode is signed in to the account (or when
   `ASC_KEY_ID`, `ASC_ISSUER_ID` and `ASC_KEY_PATH` point at an App Store
   Connect API key).
   Then in App Store Connect: TestFlight → install it on a phone → App Store
   → add the build → Submit for Review.
   The manual route is always available too: `xed ios`, pick the team under
   Signing & Capabilities, Product → Archive, Distribute App.
5. **Commit.** `app.json`, `android/` and `ios/` (including `Podfile.lock`)
   should all be committed together, tagged `mobile-v<version>`, so a
   shipped build can be reproduced.

## Store listing checklist

Things the stores ask for that are not in the code.

- **Privacy policy URL**, required by both: `https://icu.mohammed.win/legal/privacy`.
  The legal documents in `libs/content/src/legal.ts` are still drafts
  awaiting a lawyer's review. That review must happen before the first
  submission; both stores treat the policy as a binding statement.
- **Medical disclaimer.** The store description must say what the README
  says: it speaks phrases aloud on the device, it is not a nurse-call system
  and does not alert staff. Reviewers read this as a health app.
- **Category:** Medical on both stores. Google Play then requires the Health
  apps declaration; App Store review may ask for the same clarifications.
- **Data collection:** App Privacy on App Store Connect and Data safety on
  Play are both "no data collected". Everything stays in SQLite on the
  device; there is no account, no analytics and no network calls.
- **Permissions the build asks for**, so the answers match the binary:
  - iOS: photo library only (a caregiver can attach a photo to a custom
    phrase). No camera, microphone, or background audio mode.
  - Android: no runtime permissions. The manifest declares `INTERNET`,
    `VIBRATE`, `MODIFY_AUDIO_SETTINGS` and the storage permissions capped at
    Android 12 that the image picker needs. Camera and microphone are
    explicitly removed. `SYSTEM_ALERT_WINDOW` comes from the React Native
    template; it does not prompt the user.
- **Platform minimums:** Play requires new apps to target Android 16
  (API 36) since 31 August 2026; React Native 0.86 does. Apple requires
  the iOS 26 SDK or newer; Xcode 27 satisfies it.
- **Assets:** 1024×1024 icon (from `assets/images/app-icon-v2.png`),
  iPhone 6.9" and 6.5" screenshots plus iPad 13" (the app supports tablets),
  Play phone screenshots plus 7" and 10" tablet, a 1024×500 feature graphic,
  and a 512×512 Play icon.
- **Age rating / target audience:** adults; not designed for children.
- **Accessibility and languages:** the listing should mention English and
  Arabic together, and the large-button, offline design.

## When something fails

Every script stops with a named next step. The common ones:

| Message | Fix |
| --- | --- |
| Xcode's licence is not accepted | `sudo xcodebuild -license accept && sudo xcodebuild -runFirstLaunch` |
| JDK 17 not found / Android SDK not found | Install them, or export `JAVA_HOME` / `ANDROID_HOME`; the scripts default to `/usr/libexec/java_home -v 17` and `~/Library/Android/sdk` |
| No Play upload key is configured | `pnpm mobile release:setup`, or the four `ANDROID_UPLOAD_*` variables |
| Gradle: "Speak For Me release signing: keystore not found" | `storeFile` in `keystore.properties` is relative to `credentials/android/`; fix the path |
| The bundle is signed with the public DEBUG key | The plugin was bypassed; run `npx expo prebuild --platform android --clean` and check `plugins/withAndroidReleaseSigning.js` is still listed in `app.json` |
| `pod install` complains about UTF-8 | `export LANG=en_US.UTF-8` |
| xcodebuild: no signing certificate / no profiles | Xcode → Settings → Accounts → sign in with the team's Apple ID; the archive uses automatic signing |
| Export or upload fails although the archive succeeded, team says "Personal Team" | A free Personal Team cannot distribute. Enrol in the Apple Developer Program (stage 2 of the wizard) and put the paid team's ID in `app.json` |
| xcodebuild: "deployment target … is set to 12.0, but the range of supported deployment target versions is 15.0 to …" | A pod resource bundle escaped the fix; check `plugins/withPodResourceBundleDeploymentTarget.js` is still listed in `app.json`, then re-run without `--skip-prebuild` |
| `app.json has no valid ios.appleTeamId` | Stage 2 of the wizard, or paste the Team ID from developer.apple.com/account |
| App Store Connect rejects the build number | `expo.ios.buildNumber` was already used for this version; bump it |
| Play rejects the version code | `expo.android.versionCode` is not higher than the last upload; bump it |

`plugins/__tests__/withAndroidReleaseSigning.test.js` runs with `pnpm test`
and fails if the committed `android/app/build.gradle` ever loses the release
signing config, or if the Expo template changes shape under the plugin.
`plugins/__tests__/withPodResourceBundleDeploymentTarget.test.js` does the same
for the resource bundle fix in the committed `ios/Podfile`.
