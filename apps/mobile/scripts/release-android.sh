#!/usr/bin/env bash
# Build the Google Play release bundle (.aab) on this machine, without EAS.
#
#   pnpm mobile release:android [--apk] [--skip-prebuild]
#
#   --apk            also build a universal release APK for sideload testing
#   --skip-prebuild  keep android/ as it is instead of regenerating it from app.json
#
# See apps/mobile/RELEASING.md for the whole release procedure.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

WANT_APK=0
WANT_PREBUILD=1
for arg in "$@"; do
  case "$arg" in
    --apk) WANT_APK=1 ;;
    --skip-prebuild) WANT_PREBUILD=0 ;;
    -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
    *) printf 'unknown option: %s\n' "$arg" >&2; exit 2 ;;
  esac
done

say()  { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
fail() {
  printf '\n\033[31m✗ %s\033[0m\n' "$1" >&2
  [[ $# -gt 1 ]] && printf '  Next step: %s\n' "$2" >&2
  exit 1
}

# ── 1. Toolchain ─────────────────────────────────────────────────────────
export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
[[ -d "$ANDROID_HOME/platform-tools" ]] \
  || fail "Android SDK not found at $ANDROID_HOME" \
          "install Android Studio (https://developer.android.com/studio) or export ANDROID_HOME"

if [[ -z "${JAVA_HOME:-}" && -x /usr/libexec/java_home ]]; then
  JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null || true)"
  export JAVA_HOME
fi
[[ -n "${JAVA_HOME:-}" && -x "$JAVA_HOME/bin/java" ]] \
  || fail "JDK 17 not found" "install it (brew install --cask zulu@17) or export JAVA_HOME"

# ── 2. Upload key ─────────────────────────────────────────────────────────
if [[ -z "${ANDROID_UPLOAD_STORE_FILE:-}" && ! -f credentials/android/keystore.properties ]]; then
  fail "No Play upload key is configured, so a release build would be signed with the debug key" \
       "run 'pnpm mobile release:setup' (or export ANDROID_UPLOAD_STORE_FILE, ANDROID_UPLOAD_STORE_PASSWORD, ANDROID_UPLOAD_KEY_ALIAS, ANDROID_UPLOAD_KEY_PASSWORD)"
fi

# ── 3. What we are building ───────────────────────────────────────────────
VERSION="$(node -p "require('./app.json').expo.version")"
VERSION_CODE="$(node -p "require('./app.json').expo.android.versionCode")"
say "Speak For Me $VERSION (versionCode $VERSION_CODE) for Google Play"
"$JAVA_HOME/bin/java" -version 2>&1 | head -1 | sed 's/^/  /'

# ── 4. Native project from app.json ───────────────────────────────────────
if (( WANT_PREBUILD )); then
  say "Regenerating android/ from app.json (expo prebuild --clean)"
  CI=1 npx expo prebuild --platform android --clean --no-install
fi

# ── 5. Build ──────────────────────────────────────────────────────────────
TASKS=(:app:bundleRelease)
if (( WANT_APK )); then TASKS+=(:app:assembleRelease); fi
say "Gradle: ${TASKS[*]}"
( cd android && ./gradlew "${TASKS[@]}" --console=plain )

AAB="android/app/build/outputs/bundle/release/app-release.aab"
[[ -f "$AAB" ]] || fail "Gradle finished but $AAB is missing"

# ── 6. Prove it is signed with the upload key, not the debug key ──────────
KEYTOOL="$JAVA_HOME/bin/keytool"
AAB_FINGERPRINT="$("$KEYTOOL" -printcert -jarfile "$AAB" | grep -m1 -o 'SHA256: [0-9A-F:]*' || true)"
DEBUG_FINGERPRINT="$("$KEYTOOL" -list -keystore android/app/debug.keystore -storepass android -alias androiddebugkey 2>/dev/null | grep -m1 -o 'SHA256: [0-9A-F:]*' || true)"
[[ -n "$AAB_FINGERPRINT" ]] || fail "Could not read a signature from $AAB"
[[ "$AAB_FINGERPRINT" != "$DEBUG_FINGERPRINT" ]] \
  || fail "The bundle is signed with the public DEBUG key; Google Play will reject it" \
          "check credentials/android/keystore.properties and re-run"

say "Done"
printf '  Bundle:      %s\n' "$AAB"
printf '  Upload key:  %s\n' "$AAB_FINGERPRINT"
if (( WANT_APK )); then
  printf '  APK:         android/app/build/outputs/apk/release/app-release.apk  (adb install -r <apk>)\n'
fi
cat <<'NEXT'
  Next step:   Play Console → Speak For Me → Release → Testing/Production → Create new release → upload the .aab
               https://play.google.com/console
               Then commit android/ so the repository matches what shipped.
NEXT
