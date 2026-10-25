#!/usr/bin/env bash
# Archive the iOS app for App Store Connect on this Mac, without EAS.
#
#   pnpm mobile release:ios [--upload] [--skip-prebuild] [--skip-pods]
#
#   --upload         send the build to App Store Connect from here. Needs the
#                    Apple account signed in to Xcode, or an App Store Connect
#                    API key in ASC_KEY_ID, ASC_ISSUER_ID and ASC_KEY_PATH (.p8).
#   --skip-prebuild  keep ios/ as it is instead of regenerating it from app.json
#   --skip-pods      do not run `pod install` (only sensible with --skip-prebuild)
#
# Output: ios/build/SpeakForMe.xcarchive and, without --upload, ios/build/*.ipa.
# See apps/mobile/RELEASING.md for the whole release procedure.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

WANT_UPLOAD=0
WANT_PREBUILD=1
WANT_PODS=1
for arg in "$@"; do
  case "$arg" in
    --upload) WANT_UPLOAD=1 ;;
    --skip-prebuild) WANT_PREBUILD=0 ;;
    --skip-pods) WANT_PODS=0 ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) printf 'unknown option: %s\n' "$arg" >&2; exit 2 ;;
  esac
done

say()  { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
fail() {
  printf '\n\033[31m✗ %s\033[0m\n' "$1" >&2
  [[ $# -gt 1 ]] && printf '  Next step: %s\n' "$2" >&2
  exit 1
}
show_errors() { grep -E "error:|\*\* .* FAILED \*\*" "$1" | head -n 20 | sed 's/^/  /' >&2 || true; }

# ── 1. Toolchain ─────────────────────────────────────────────────────────
[[ "$(uname)" == "Darwin" ]] || fail "iOS builds need macOS with Xcode"
command -v xcodebuild >/dev/null 2>&1 || fail "Xcode is not installed" "install Xcode from the App Store, then re-run"
xcodebuild -checkFirstLaunchStatus >/dev/null 2>&1 \
  || fail "Xcode's licence is not accepted or its components are not installed" \
          "run: sudo xcodebuild -license accept && sudo xcodebuild -runFirstLaunch"
command -v pod >/dev/null 2>&1 || fail "CocoaPods is not installed" "brew install cocoapods"
export LANG="${LANG:-en_US.UTF-8}"   # CocoaPods refuses to run in a non-UTF-8 terminal

# ── 2. Apple team ─────────────────────────────────────────────────────────
TEAM_ID="$(node -p "require('./app.json').expo.ios.appleTeamId || ''")"
[[ "$TEAM_ID" =~ ^[A-Z0-9]{10}$ ]] \
  || fail "app.json has no valid ios.appleTeamId (got '${TEAM_ID}')" \
          "run 'pnpm mobile release:setup' or paste your 10-character Team ID from https://developer.apple.com/account"

AUTH=()
if [[ -n "${ASC_KEY_ID:-}" || -n "${ASC_ISSUER_ID:-}" || -n "${ASC_KEY_PATH:-}" ]]; then
  [[ -n "${ASC_KEY_ID:-}" && -n "${ASC_ISSUER_ID:-}" && -f "${ASC_KEY_PATH:-}" ]] \
    || fail "ASC_KEY_ID, ASC_ISSUER_ID and ASC_KEY_PATH (an existing .p8 file) must all be set together"
  AUTH=(-authenticationKeyPath "$ASC_KEY_PATH" -authenticationKeyID "$ASC_KEY_ID" -authenticationKeyIssuerID "$ASC_ISSUER_ID")
fi

# ── 3. What we are building ───────────────────────────────────────────────
VERSION="$(node -p "require('./app.json').expo.version")"
BUILD_NUMBER="$(node -p "require('./app.json').expo.ios.buildNumber")"
say "Speak For Me $VERSION ($BUILD_NUMBER) for the App Store, team $TEAM_ID"
xcodebuild -version | head -n 1 | sed 's/^/  /'

# ── 4. Native project from app.json ───────────────────────────────────────
if (( WANT_PREBUILD )); then
  say "Regenerating ios/ from app.json (expo prebuild --clean)"
  CI=1 npx expo prebuild --platform ios --clean --no-install
fi
if (( WANT_PODS )); then
  say "Installing pods"
  ( cd ios && pod install )
fi

# ── 5. Archive ────────────────────────────────────────────────────────────
OUT="ios/build"
ARCHIVE="$OUT/SpeakForMe.xcarchive"
mkdir -p "$OUT"
rm -rf "$ARCHIVE"
say "Archiving (this takes a while; log: $OUT/archive.log)"
if ! xcodebuild \
      -workspace ios/SpeakForMe.xcworkspace \
      -scheme SpeakForMe \
      -configuration Release \
      -destination 'generic/platform=iOS' \
      -archivePath "$ARCHIVE" \
      -allowProvisioningUpdates ${AUTH[@]+"${AUTH[@]}"} \
      DEVELOPMENT_TEAM="$TEAM_ID" CODE_SIGN_STYLE=Automatic \
      archive > "$OUT/archive.log" 2>&1; then
  show_errors "$OUT/archive.log"
  fail "Archive failed (full log: $OUT/archive.log)" \
       "if it mentions signing or provisioning, sign in to Xcode → Settings → Accounts with the team's Apple ID and re-run"
fi

# ── 6. Export or upload ───────────────────────────────────────────────────
DESTINATION="export"
if (( WANT_UPLOAD )); then DESTINATION="upload"; fi
cat > "$OUT/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key>
  <string>app-store-connect</string>
  <key>destination</key>
  <string>${DESTINATION}</string>
  <key>teamID</key>
  <string>${TEAM_ID}</string>
  <key>signingStyle</key>
  <string>automatic</string>
  <key>uploadSymbols</key>
  <true/>
  <key>manageAppVersionAndBuildNumber</key>
  <false/>
</dict>
</plist>
PLIST

say "Exporting for App Store Connect ($DESTINATION; log: $OUT/export.log)"
if ! xcodebuild -exportArchive \
      -archivePath "$ARCHIVE" \
      -exportOptionsPlist "$OUT/ExportOptions.plist" \
      -exportPath "$OUT" \
      -allowProvisioningUpdates ${AUTH[@]+"${AUTH[@]}"} > "$OUT/export.log" 2>&1; then
  show_errors "$OUT/export.log"
  fail "Export failed (full log: $OUT/export.log)" \
       "the archive is intact; you can still upload it by hand: open $ARCHIVE → Distribute App"
fi

# ── 7. Result ─────────────────────────────────────────────────────────────
say "Done"
printf '  Archive:  %s\n' "$ARCHIVE"
if (( WANT_UPLOAD )); then
  cat <<'NEXT'
  Uploaded to App Store Connect. Processing takes a few minutes.
  Next step:  https://appstoreconnect.apple.com → Speak For Me → TestFlight (test it) → App Store → add the build → Submit for Review
              Then commit ios/ so the repository matches what shipped.
NEXT
else
  IPA="$(ls "$OUT"/*.ipa 2>/dev/null | head -n 1 || true)"
  [[ -n "$IPA" ]] || fail "Export finished but no .ipa was written to $OUT"
  printf '  IPA:      %s\n' "$IPA"
  cat <<NEXT
  Next step:  upload it with Apple's Transporter app (Mac App Store) — sign in, drop the .ipa, Deliver —
              or run: open "$ARCHIVE"   (Xcode Organizer → Distribute App → App Store Connect)
              Then in App Store Connect: TestFlight → App Store → add the build → Submit for Review.
              Then commit ios/ so the repository matches what shipped.
NEXT
fi
