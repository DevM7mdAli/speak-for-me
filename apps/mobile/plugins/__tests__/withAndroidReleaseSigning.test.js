// The Android release build must never fall back to the debug key. These tests
// pin the transform the config plugin applies to the Expo template, and prove
// the committed android/app/build.gradle is still in sync with it.

const fs = require('fs');
const path = require('path');
const { addReleaseSigning } = require('../withAndroidReleaseSigning');

const TEMPLATE = `apply plugin: "com.android.application"

react {
    autolinkLibrariesWithApp()
}

android {
    namespace 'com.devm7mdali.speakforme'
    defaultConfig {
        applicationId 'com.devm7mdali.speakforme'
        versionCode 1
        versionName "1.0.0"
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
}
`;

describe('addReleaseSigning', () => {
  const output = addReleaseSigning(TEMPLATE);

  it('reads the upload key from the environment or credentials/android before the android block', () => {
    const lookup = output.indexOf("env['ANDROID_UPLOAD_STORE_FILE']");
    expect(lookup).toBeGreaterThan(-1);
    expect(output).toContain("new File(rootProject.projectDir.parentFile, 'credentials/android')");
    expect(lookup).toBeLessThan(output.indexOf('\nandroid {'));
  });

  it('adds a release signing config next to the debug one and keeps debug intact', () => {
    expect(output).toContain('storeFile speakForMeUploadKey.resolvedStoreFile');
    expect(output).toContain("keyAlias 'androiddebugkey'");
    const signingConfigs = output.slice(output.indexOf('signingConfigs {'), output.indexOf('buildTypes {'));
    expect(signingConfigs).toContain('debug {');
    expect(signingConfigs).toContain('release {');
  });

  it('signs the release build type with the upload key, not the debug key', () => {
    const release = output.slice(output.indexOf('buildTypes {'));
    expect(release).toContain('signingConfig signingConfigs.release');
    expect(release.match(/signingConfig signingConfigs\.debug/g)).toHaveLength(1); // only the debug build type
    expect(release).not.toContain('Caution! In production');
  });

  it('fails every release task, naming the next step, when no key is configured', () => {
    expect(output).toContain('/(assemble|bundle|package|install)Release/');
    expect(output).toContain("pnpm mobile release:setup");
    expect(output).toContain('throw new GradleException');
  });

  it('is idempotent, so prebuild can run again on a committed native project', () => {
    expect(addReleaseSigning(output)).toBe(output);
  });

  it('replaces a stale generated block instead of stacking a second one', () => {
    const stale = output.replace(
      "env['ANDROID_UPLOAD_STORE_FILE']",
      "env['OLD_VARIABLE_NAME']"
    );
    const refreshed = addReleaseSigning(stale);
    expect(refreshed).toBe(output);
    expect(refreshed.match(/speak-for-me release signing \(generated/g)).toHaveLength(1);
  });

  it('refuses to guess when the Expo template no longer has the expected anchors', () => {
    expect(() => addReleaseSigning(TEMPLATE.replace('android {', 'android{'))).toThrow(
      /could not find the "android \{" block/
    );
    expect(() =>
      addReleaseSigning(TEMPLATE.replace('signingConfig signingConfigs.debug\n            minifyEnabled', 'minifyEnabled'))
    ).toThrow(/release build type does not use signingConfigs\.debug/);
  });
});

describe('the committed android project', () => {
  const buildGradle = path.join(__dirname, '..', '..', 'android', 'app', 'build.gradle');

  it('already carries the release signing config (run `npx expo prebuild --platform android` if this fails)', () => {
    const contents = fs.readFileSync(buildGradle, 'utf8');
    expect(addReleaseSigning(contents)).toBe(contents);
  });
});
