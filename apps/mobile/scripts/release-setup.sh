#!/usr/bin/env bash
# Speak For Me: one-time setup for releasing to the App Store and Google Play
# without EAS. Walks a human through everything that has to be done by hand,
# in order. Re-runnable: it keeps what already exists.
#
#   pnpm mobile release:setup
#
# Values captured:
#   - the Apple Team ID           → app.json (expo.ios.appleTeamId), public
#   - the Play upload keystore    → credentials/android/upload-keystore.jks, secret
#   - its passwords and alias     → credentials/android/keystore.properties, secret
# credentials/ is git-ignored. Back it up somewhere safe (a password manager).
# See apps/mobile/RELEASING.md.
set -euo pipefail

if [[ -t 1 ]] && command -v tput >/dev/null 2>&1 && [[ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]]; then
  BOLD=$(tput bold); DIM=$(tput dim); RESET=$(tput sgr0)
  BLUE=$(tput setaf 4); GREEN=$(tput setaf 2); YELLOW=$(tput setaf 3)
else
  BOLD=""; DIM=""; RESET=""; BLUE=""; GREEN=""; YELLOW=""
fi

TOTAL_STAGES=5
_STAGE_INDEX=0
WRITTEN=() # keys written to keystore.properties this run
SKIPPED=() # things left for the human to do by hand

# ── Helpers ──────────────────────────────────────────────────────────────

# _clear wipes the terminal so only the current step is on screen. No-op when
# output isn't a terminal, so piped logs stay readable.
_clear() {
  [[ -t 1 ]] || return 0
  if command -v tput >/dev/null 2>&1; then tput clear; else printf '\033[2J\033[3J\033[H'; fi
}

banner() {
  _clear
  printf '\n%s%s  %s%s\n' "$BOLD" "$BLUE" "$1" "$RESET"
  printf '%s  %s stages%s\n\n' "$DIM" "$TOTAL_STAGES" "$RESET"
  printf '%s  You drive the browser; this wizard tells you exactly what to do and\n' "$DIM"
  printf '  captures the values you copy back. Stop any time with Ctrl-C and re-run\n'
  printf '  later, since it keeps values already saved.%s\n' "$RESET"
  pause "Ready to start?"
}

stage() {
  _clear
  _STAGE_INDEX=$((_STAGE_INDEX + 1))
  printf '\n%s%s▸ Stage %s/%s · %s%s\n' \
    "$BOLD" "$BLUE" "$_STAGE_INDEX" "$TOTAL_STAGES" "$1" "$RESET"
}

say()  { printf '  %s\n' "$1"; }
step() { printf '  %s•%s %s\n' "$BLUE" "$RESET" "$1"; }
note() { printf '  %s%s%s\n' "$DIM" "$1" "$RESET"; }
warn() { printf '  %s⚠ %s%s\n' "$YELLOW" "$1" "$RESET"; }

open_url() {
  printf '  %s↗ opening%s %s\n' "$GREEN" "$RESET" "$1"
  open "$1" >/dev/null 2>&1 || warn "couldn't open a browser, so visit it manually: $1"
}

pause() {
  printf '  %s%s%s ' "$DIM" "${1:-Press Enter to continue}" "$RESET"
  read -r _ || true
}

confirm() {
  local reply=""
  printf '  %s? %s [y/N] ' "$YELLOW" "$1"
  read -r reply || true
  [[ "$reply" =~ ^[Yy] ]]
}

# ask VAR "Prompt" reads a visible value into $VAR.
ask() {
  local input
  printf '  %s%s%s ' "$BOLD" "$2" "$RESET"
  read -r input || true
  printf -v "$1" '%s' "$input"
}

# ask_secret VAR "Prompt" is like ask, but input is hidden.
ask_secret() {
  local input
  printf '  %s%s%s ' "$BOLD" "$2" "$RESET"
  read -rs input || true
  printf '\n'
  printf -v "$1" '%s' "$input"
}

# write_property KEY VALUE upserts KEY=VALUE into $PROPERTIES_FILE. The
# temporary copy sits next to it, so the password never lands in /tmp.
write_property() {
  local key="$1" value="$2" tmp
  ( umask 077; touch "$PROPERTIES_FILE" )
  tmp=$(umask 077; mktemp "$PROPERTIES_FILE.XXXXXX")
  grep -vE "^${key}=" "$PROPERTIES_FILE" > "$tmp" || true
  printf '%s=%s\n' "$key" "$value" >> "$tmp"
  mv "$tmp" "$PROPERTIES_FILE"
  WRITTEN+=("$key")
  printf '  %s✓ wrote%s %s → %s\n' "$GREEN" "$RESET" "$key" "$PROPERTIES_FILE"
}

finish() {
  _clear
  printf '\n%s%s  ✓ Setup complete%s\n' "$BOLD" "$GREEN" "$RESET"
  (( ${#WRITTEN[@]} )) && note "wrote ${#WRITTEN[@]} value(s) to $PROPERTIES_FILE: ${WRITTEN[*]}"
  if (( ${#SKIPPED[@]} )); then
    printf '\n'; warn "still to do by hand:"
    for s in "${SKIPPED[@]}"; do note "  - $s"; done
  fi
  printf '\n'
}

# ── Stages ───────────────────────────────────────────────────────────────

cd "$(dirname "${BASH_SOURCE[0]}")/.."
mkdir -p credentials/android
chmod 700 credentials credentials/android
PROPERTIES_FILE="credentials/android/keystore.properties"

BUNDLE_ID="$(node -p "require('./app.json').expo.ios.bundleIdentifier")"
PACKAGE="$(node -p "require('./app.json').expo.android.package")"
APP_NAME="$(node -p "require('./app.json').expo.name")"
PRIVACY_URL="https://icu.mohammed.win/legal/privacy"

banner "$APP_NAME: store release setup"

# ── Stage 1: tools on this Mac ────────────────────────────────────────────
stage "This Mac: build tools"
say "Checking what the release scripts need. Nothing here touches the stores."

if xcodebuild -checkFirstLaunchStatus >/dev/null 2>&1; then
  say "${GREEN}✓${RESET} Xcode $(xcodebuild -version | head -n 1 | cut -d' ' -f2) is ready"
else
  warn "Xcode's licence is not accepted yet (or its components are missing)."
  if confirm "Accept the Xcode licence now? (runs sudo; asks for your Mac password)"; then
    sudo xcodebuild -license accept && sudo xcodebuild -runFirstLaunch \
      && say "${GREEN}✓${RESET} Xcode is ready" \
      || SKIPPED+=("Accept the Xcode licence: sudo xcodebuild -license accept && sudo xcodebuild -runFirstLaunch")
  else
    SKIPPED+=("Accept the Xcode licence: sudo xcodebuild -license accept && sudo xcodebuild -runFirstLaunch")
  fi
fi

if JDK="$(/usr/libexec/java_home -v 17 2>/dev/null)"; then
  say "${GREEN}✓${RESET} JDK 17 at $JDK"
else
  warn "JDK 17 not found; Gradle needs it."
  SKIPPED+=("Install JDK 17: brew install --cask zulu@17")
fi

SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
if [[ -d "$SDK/platform-tools" ]]; then
  say "${GREEN}✓${RESET} Android SDK at $SDK"
else
  warn "Android SDK not found at $SDK."
  open_url "https://developer.android.com/studio"
  step "Install Android Studio and, on first launch, let it install the SDK; or export ANDROID_HOME."
  SKIPPED+=("Install the Android SDK (Android Studio) or export ANDROID_HOME")
fi

if command -v pod >/dev/null 2>&1; then
  say "${GREEN}✓${RESET} CocoaPods $(LANG=en_US.UTF-8 pod --version 2>/dev/null || echo installed)"
else
  warn "CocoaPods not found; iOS builds need it."
  SKIPPED+=("Install CocoaPods: brew install cocoapods")
fi
pause

# ── Stage 2: Apple Developer Program + Team ID ────────────────────────────
stage "Apple: Developer Program and Team ID"
say "TestFlight and the App Store need a paid Apple Developer Program membership (about USD 99 a year)."
say "A free 'Personal Team' in Xcode can only install on your own devices; it cannot upload."
say "Enrolment can take a day or two to be approved; you can come back and re-run this."
open_url "https://developer.apple.com/programs/enroll/"
step "Enrol with the Apple ID that will own the app (individual or organisation)."
pause "Enrolled (or already a member)?"
step "Open Xcode → Settings → Accounts → + → sign in with that same Apple ID."
note "This lets Xcode create the signing certificate and provisioning profile automatically."
pause "Signed in to Xcode?"
open_url "https://developer.apple.com/account"
step "Scroll to Membership details and copy the Team ID (10 letters/digits)."
note "Use the paid team's ID, not the Personal Team's."

CURRENT_TEAM="$(node -p "require('./app.json').expo.ios.appleTeamId || ''")"
APPLE_TEAM_ID=""
if [[ -n "$CURRENT_TEAM" ]]; then
  note "app.json already has appleTeamId=$CURRENT_TEAM"
  if ! confirm "Change it?"; then APPLE_TEAM_ID="$CURRENT_TEAM"; fi
fi
while [[ ! "$APPLE_TEAM_ID" =~ ^[A-Z0-9]{10}$ ]]; do
  ask APPLE_TEAM_ID "Paste the Team ID:"
  APPLE_TEAM_ID="$(printf '%s' "$APPLE_TEAM_ID" | tr -d '[:space:]' | tr '[:lower:]' '[:upper:]')"
  [[ "$APPLE_TEAM_ID" =~ ^[A-Z0-9]{10}$ ]] || warn "A Team ID is exactly 10 letters or digits, e.g. AB12CD34EF."
done
if [[ "$APPLE_TEAM_ID" != "$CURRENT_TEAM" ]]; then
  node -e '
    const fs = require("fs");
    const json = JSON.parse(fs.readFileSync("app.json", "utf8"));
    json.expo.ios.appleTeamId = process.argv[1];
    fs.writeFileSync("app.json", JSON.stringify(json, null, 2) + "\n");
  ' "$APPLE_TEAM_ID"
  printf '  %s✓ wrote%s expo.ios.appleTeamId → app.json (commit this)\n' "$GREEN" "$RESET"
fi

# ── Stage 3: App Store Connect record ─────────────────────────────────────
stage "Apple: App Store Connect record"
say "The bundle identifier must be registered, then an app record created for it."
open_url "https://developer.apple.com/account/resources/identifiers/list"
step "Click + → App IDs → App → Description '$APP_NAME', Bundle ID: Explicit → $BUNDLE_ID → no capabilities → Register."
note "If Xcode already registered it during a build, it is simply listed; nothing to do."
pause "Registered?"
open_url "https://appstoreconnect.apple.com/apps"
step "Click + → New App → Platforms: iOS → Name '$APP_NAME' → Primary language → Bundle ID $BUNDLE_ID → SKU e.g. speak-for-me → User access: Full."
note "Store listing (description, screenshots, privacy policy $PRIVACY_URL, App Privacy answers) can be filled in later; RELEASING.md has the checklist."
pause "App record created?"

# ── Stage 4: Android upload key ───────────────────────────────────────────
stage "Android: upload key"
KEYSTORE="credentials/android/upload-keystore.jks"
KEYTOOL="$(/usr/libexec/java_home -v 17 2>/dev/null)/bin/keytool"
[[ -x "$KEYTOOL" ]] || KEYTOOL="keytool"
# keytool reads passwords from the environment (-storepass:env), so they never
# appear in the process list.
if [[ -f "$KEYSTORE" ]]; then
  say "${GREEN}✓${RESET} $KEYSTORE already exists; keeping it."
  note "Google Play ties your app to this key. Never regenerate it casually."
  if [[ -f "$PROPERTIES_FILE" ]]; then
    say "${GREEN}✓${RESET} $PROPERTIES_FILE already exists."
  else
    warn "$PROPERTIES_FILE is missing; the release script needs it."
    while :; do
      ask KEY_ALIAS "Key alias in the keystore:"
      ask_secret SFM_STORE_PASSWORD "Keystore password:"
      export SFM_STORE_PASSWORD
      "$KEYTOOL" -list -keystore "$KEYSTORE" -storepass:env SFM_STORE_PASSWORD -alias "$KEY_ALIAS" >/dev/null 2>&1 && break
      warn "That alias and password do not open $KEYSTORE; try again."
    done
    write_property storeFile "upload-keystore.jks"
    write_property storePassword "$SFM_STORE_PASSWORD"
    write_property keyAlias "$KEY_ALIAS"
    write_property keyPassword "$SFM_STORE_PASSWORD"
    chmod 600 "$PROPERTIES_FILE"
    unset SFM_STORE_PASSWORD
  fi
else
  say "Google Play signs the app it ships with its own key (Play App Signing). You keep an"
  say "upload key to sign the bundles you send. We create that key now, on this Mac only."
  note "keytool will ask for a name/organisation/country to put in the certificate; anything sensible is fine."
  while :; do
    ask_secret SFM_STORE_PASSWORD "Choose a keystore password (6+ characters, no backslashes):"
    if [[ ${#SFM_STORE_PASSWORD} -lt 6 || "$SFM_STORE_PASSWORD" == *\\* ]]; then warn "6+ characters and no backslashes, please."; continue; fi
    ask_secret PASSWORD_AGAIN "Type it again:"
    [[ "$SFM_STORE_PASSWORD" == "$PASSWORD_AGAIN" ]] && break
    warn "They differ; try again."
  done
  unset PASSWORD_AGAIN
  export SFM_STORE_PASSWORD
  ask KEY_ALIAS "Key alias (Enter for 'upload'):"
  KEY_ALIAS="${KEY_ALIAS:-upload}"
  "$KEYTOOL" -genkeypair -v -storetype PKCS12 \
    -keystore "$KEYSTORE" -alias "$KEY_ALIAS" \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass:env SFM_STORE_PASSWORD -keypass:env SFM_STORE_PASSWORD
  chmod 600 "$KEYSTORE"
  write_property storeFile "upload-keystore.jks"
  write_property storePassword "$SFM_STORE_PASSWORD"
  write_property keyAlias "$KEY_ALIAS"
  write_property keyPassword "$SFM_STORE_PASSWORD"
  chmod 600 "$PROPERTIES_FILE"
  say "Upload certificate fingerprint (Play shows the same one after your first upload):"
  "$KEYTOOL" -list -keystore "$KEYSTORE" -storepass:env SFM_STORE_PASSWORD -alias "$KEY_ALIAS" 2>/dev/null \
    | grep -o 'SHA256: .*' | sed 's/^/    /'
  unset SFM_STORE_PASSWORD
fi
warn "Back up the whole credentials/ folder to a password manager now. It is git-ignored on purpose."
note "Lost the upload key later? Play App Signing lets you request a reset from Google, but it takes days."
pause

# ── Stage 5: Google Play Console ──────────────────────────────────────────
stage "Google Play Console: account and app"
say "Google Play needs a developer account (one-time fee, about USD 25) with identity verification."
open_url "https://play.google.com/console/signup"
step "Create the account (personal or organisation). Verification can take a few days."
pause "Account ready?"
open_url "https://play.google.com/console"
step "Create app → Name '$APP_NAME' → default language → App → Free → accept the declarations → Create app."
step "Dashboard → 'Set up your app': privacy policy $PRIVACY_URL; App access: all features available without special access;"
step "Ads: no; Content rating questionnaire; Target audience: adults; Data safety: no data collected or shared;"
step "Health apps declaration (this is a medical communication aid); App category: Medical; store listing text, icon and screenshots."
note "Package name is fixed at first upload: $PACKAGE."
note "Play App Signing is on by default for new apps; the first .aab you upload registers the upload key from stage 4."
pause "Play app created?"

finish
printf '  Next: %spnpm mobile release:android%s and %spnpm mobile release:ios%s — see apps/mobile/RELEASING.md\n\n' "$BOLD" "$RESET" "$BOLD" "$RESET"
