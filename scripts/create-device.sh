#!/usr/bin/env bash
# create-device.sh
#
# End-to-end script that creates a dashguard device via the Nullnet Datastore
# store API (no Next.js / tRPC involved) and installs the Wallguard agent.
# Run this script directly ON the target server (pfSense, Linux, or Windows).
#
# Flow:
#   1. Authenticate (user + root)
#   2. Create a Draft device record
#   3. Create an address and link it to the device
#   4. Set device category and type
#   5. Get or create an installation code (join token)
#   6. Install the Wallguard agent
#   7. Poll until the device reports online
#   8. Activate the device (status → Active)
#
# Requirements: curl, jq, python3
#
# Usage:
#   sudo bash create-device.sh [OPTIONS]     # Recommended — no chmod needed, runs as root
#   chmod +x create-device.sh               # Alternative — make executable first (one-time)
#   sudo ./create-device.sh [OPTIONS]        #   then run directly
#
# The script must run as root (required for package install in Step 6).
# The script self-chmods on first run so subsequent ./create-device.sh calls work without chmod.
#
# Credentials are prompted at runtime when not supplied via flags or env vars.
# Device name, category, type, and address are all auto-detected.
# This script always targets the production environment.
#
# Required:
#   (none — credentials are prompted at runtime; all other fields auto-detect)
#
# Optional:
#   --device-name=NAME           Override auto-detected name (defaults to hostname)
#   --device-category=CAT        Override auto-detected category (Firewall | AppGuard Client)
#   --device-type=TYPE           Override auto-detected type (PFSense | Linux | Windows)
#   --address-city=CITY          Override auto-detected city
#   --address-country=COUNTRY    Override auto-detected country
#   --address-country-code=CODE  Override auto-detected country code (e.g. PH)
#   --wallguard-version=VER      Override auto-fetched version (e.g. 1.1.10)
#   --platform=PLATFORM          pfsense | linux | windows (auto-detected if omitted)
#
# Advanced overrides:
#   --email=EMAIL                Provide org account email (skips prompt)
#   --password=PASS              Provide org account password (skips prompt)
#   --root-secret=SECRET         Provide root account secret (skips prompt)
#   --store-url=URL              Override store API base URL
#   --remote-access-url=HOST     Override control-plane hostname
#   --poll-interval=SECS         Default: 3
#   --poll-timeout=SECS          Default: 300
#   --log-file=PATH              Write timestamped output to this file
#   --quiet                      Suppress stdout (log-file still works)
#   --disable-tls-verification   Skip TLS cert check (for lab environments)
#   -h, --help                   Show this help
#
# Platform notes:
#   Linux   — requires apt-get; installs .deb package; run with sudo
#   FreeBSD — requires pkg; installs .pkg package; run as root (pfSense shell)
#   Windows — requires PowerShell; installs NPCAP + VC Runtime + .msi; run as Administrator
#             Open an elevated PowerShell or Git Bash and run:
#               bash create-device.sh [OPTIONS]
#
# Examples — Linux / FreeBSD (pfSense):
#   sudo bash create-device.sh                          # (Recommended) auto-detect all, prompts for credentials
#   sudo bash create-device.sh --device-name=Firewall-01 --wallguard-version=1.1.10
#
# Examples — Windows (elevated PowerShell / Git Bash):
#   bash create-device.sh                               # auto-detect all, prompts for credentials
#   bash create-device.sh --device-name=WinHost-01 --platform=windows

set -euo pipefail

# Self-chmod: make this script executable so future runs don't need chmod +x.
# Has no effect if already executable or if the filesystem is read-only.
[ -x "$0" ] || chmod +x "$0" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Configuration — edit credentials before running; everything else auto-detects
# ---------------------------------------------------------------------------

# Production URLs — override only if you need a custom endpoint.
STORE_URL=""
REMOTE_ACCESS_URL=""

# Credentials — leave blank to be prompted at runtime.
EMAIL=""
PASSWORD=""
ROOT_SECRET=""

# Auto-detected from platform + public IP; override if needed.
DEVICE_NAME=""
DEVICE_CATEGORY=""
DEVICE_TYPE=""

# Auto-detected via IP geolocation (ip-api.com); override if needed.
ADDRESS_CITY=""
ADDRESS_COUNTRY=""
ADDRESS_COUNTRY_CODE=""

# Auto-fetched from the store API after auth; override if needed.
WALLGUARD_VERSION=""
PLATFORM=""

POLL_INTERVAL=3
POLL_TIMEOUT=300

# Logging / runtime options
LOG_FILENAME=""
QUIET=false
DISABLE_TLS_VERIFICATION=false

# Resume / revert state file (set to "" to disable state tracking)
STATE_FILE="${STATE_FILE:-./.create-device.state}"

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

SCRIPT_NAME="create-device"

# check_exists — returns 0 if named binary is on PATH
check_exists() { type "$1" >/dev/null 2>&1; }

# macos_brew_install — installs a package via Homebrew on macOS.
# Homebrew refuses to run as root, so we delegate to the real user ($SUDO_USER).
macos_brew_install() {
  local pkg="$1"

  # Resolve the real (non-root) user — required because Homebrew rejects root.
  local real_user="${SUDO_USER:-}"
  if [[ -z "${real_user}" ]]; then
    real_user=$(logname 2>/dev/null || id -un)
  fi
  if [[ "${real_user}" == "root" ]] || [[ -z "${real_user}" ]]; then
    echo "Cannot install via Homebrew: unable to determine a non-root user." >&2
    return 1
  fi

  # Locate brew in the known macOS install paths (sudo strips these from PATH).
  local brew_bin=""
  for prefix in /opt/homebrew /usr/local; do
    if [[ -x "${prefix}/bin/brew" ]]; then
      brew_bin="${prefix}/bin/brew"
      break
    fi
  done

  if [[ -z "${brew_bin}" ]]; then
    # Homebrew is not installed — install it non-interactively as the real user
    echo "Homebrew not found — installing Homebrew as ${real_user} (this may take a minute)..."
    sudo -u "${real_user}" /bin/bash -c \
      'NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"' || return 1
    for prefix in /opt/homebrew /usr/local; do
      [[ -x "${prefix}/bin/brew" ]] && brew_bin="${prefix}/bin/brew" && break
    done
    [[ -z "${brew_bin}" ]] && return 1
  fi

  echo "Installing ${pkg} via Homebrew as ${real_user}..."
  sudo -u "${real_user}" "${brew_bin}" install "${pkg}"
}

# auto_install_tool — tries to install a missing tool via the available package manager
auto_install_tool() {
  local tool="$1"
  local pkg
  case "${tool}" in
    python3) pkg="python3" ;;
    curl)    pkg="curl" ;;
    jq)      pkg="jq" ;;
    nc)      pkg="netcat-openbsd" ;;
    *)       pkg="${tool}" ;;
  esac

  echo "Tool not found: ${tool} — attempting auto-install (package: ${pkg})..."

  if check_exists apt-get; then
    apt-get install -y "${pkg}" >/dev/null 2>&1 \
      || { apt-get update -qq && apt-get install -y "${pkg}"; }
  elif check_exists dnf; then
    dnf install -y "${pkg}" >/dev/null 2>&1
  elif check_exists yum; then
    yum install -y "${pkg}" >/dev/null 2>&1
  elif check_exists apk; then
    apk add --no-cache "${pkg}" >/dev/null 2>&1
  elif [[ "$(uname -s)" == "Darwin" ]]; then
    macos_brew_install "${pkg}"
  elif check_exists brew; then
    brew install "${pkg}" >/dev/null 2>&1
  elif check_exists pkg; then
    pkg install -y "${pkg}" >/dev/null 2>&1
  else
    return 1
  fi
}

# check_exists_fatal — auto-installs missing binaries; exits if install also fails
check_exists_fatal() {
  for TOOL in "$@"; do
    if ! check_exists "${TOOL}"; then
      if auto_install_tool "${TOOL}" && check_exists "${TOOL}"; then
        echo "Successfully installed: ${TOOL}"
      else
        echo "ERROR: required tool not found and auto-install failed: ${TOOL}" >&2
        echo "       Please install it manually and re-run this script." >&2
        exit 1
      fi
    fi
  done
}

# check_set — exits if a variable is blank or still a <placeholder>
check_set() {
  local key="$1"
  local val="${!1}"
  if [[ -z "$val" ]] || [[ "$val" == \<*\> ]]; then
    log_important "Required variable not set: ${key}"
    exit 1
  fi
}

# assert_running_as_root — exits if not running as root
assert_running_as_root() {
  if ! [ "$(id -u)" = 0 ]; then
    log_important "This script must be run as root for the install step."
    exit 1
  fi
}

# Logging -------------------------------------------------------------------

log_date() { echo -n "$(date '+%Y-%m-%d %H:%M:%S %Z')"; }

log() {
  local line
  line="$(log_date) [${SCRIPT_NAME}] $*"
  if [[ "${QUIET}" != "true" ]]; then echo "${line}"; fi
  if [[ -n "${LOG_FILENAME}" ]]; then echo "${line}" >> "${LOG_FILENAME}"; fi
}

log_header() {
  if [[ "${QUIET}" != "true" ]]; then
    echo ""
    echo "$*"
    echo ""
  fi
  if [[ -n "${LOG_FILENAME}" ]]; then
    { echo ""; echo "$*"; echo ""; } >> "${LOG_FILENAME}"
  fi
}

log_important() {
  local line
  line="$(log_date) [${SCRIPT_NAME}] ---> $*"
  echo "${line}"
  if [[ -n "${LOG_FILENAME}" ]]; then echo "${line}" >> "${LOG_FILENAME}"; fi
}

# save_state — persists current step + IDs so a re-run can resume
save_state() {
  if [[ -z "${STATE_FILE}" ]]; then return 0; fi
  cat > "${STATE_FILE}" <<STATEEOF
STEP_COMPLETED=${STEP_COMPLETED}
DEVICE_ID="${DEVICE_ID:-}"
DEVICE_CODE="${DEVICE_CODE:-}"
ADDRESS_ID="${ADDRESS_ID:-}"
INSTALL_TOKEN="${INSTALL_TOKEN:-}"
WALLGUARD_VERSION="${WALLGUARD_VERSION:-}"
STATEEOF
}

# load_state — sources the state file and logs what was restored
load_state() {
  # shellcheck source=/dev/null
  source "${STATE_FILE}"
  log "Resumed from state: step_completed=${STEP_COMPLETED}, device=${DEVICE_CODE:-none}"
}

# revert_agent — leave, stop, and uninstall the Wallguard agent
revert_agent() {
  if ! check_exists wallguard-cli 2>/dev/null; then
    log "wallguard-cli not found — skipping agent cleanup"
    return 0
  fi
  local rc=0
  log "Running: wallguard-cli leave"
  wallguard-cli leave 2>&1 || { rc=$?; log "wallguard-cli leave exited ${rc} (continuing)"; }
  log "Running: wallguard-cli stop"
  wallguard-cli stop 2>&1 || { rc=$?; log "wallguard-cli stop exited ${rc} (continuing)"; }
  log "Uninstalling Wallguard package..."
  case "$(uname -s 2>/dev/null)" in
    Linux)
      log "Running: apt-get remove -y wallguard"
      apt-get remove -y wallguard 2>&1 \
        && log "apt-get remove: OK" \
        || log "apt-get remove exited $? (may not have been installed)"
      ;;
    FreeBSD)
      log "Running: pkg delete -y wallguard"
      pkg delete -y wallguard 2>&1 \
        && log "pkg delete: OK" \
        || log "pkg delete exited $? (may not have been installed)"
      ;;
    Darwin)
      log "Removing macOS wallguard files..."
      pkgutil --forget com.nullnet.wallguard 2>&1 || true
      rm -f /usr/local/bin/wallguard-cli 2>/dev/null || true
      log "macOS wallguard files removed"
      ;;
    MINGW*|CYGWIN*|MSYS*)
      log "Running: WMI uninstall wallguard"
      powershell.exe -Command "Get-WmiObject -Class Win32_Product | Where-Object { \$_.Name -like '*wallguard*' } | ForEach-Object { \$_.Uninstall() }" 2>&1 \
        && log "WMI uninstall: OK" \
        || log "WMI uninstall exited $? (may not have been installed)"
      ;;
    *)
      log "Unknown platform — skipping package removal"
      ;;
  esac
}

# do_revert — undo API resources, uninstall agent, then remove state and exit
do_revert() {
  log_important "=== Revert started ==="
  if [[ -n "${DEVICE_ID:-}" ]]; then
    log "Deleting device via API: ${DEVICE_ID} (${DEVICE_CODE:-})"
    store_patch_root "store/root/devices/${DEVICE_ID}" '{"status":"Deleted"}' >/dev/null 2>&1 \
      && log "Device deleted OK" \
      || log_important "Could not auto-delete device — remove ${DEVICE_CODE:-$DEVICE_ID} manually in the portal."
  else
    log "No device ID in state — skipping API deletion"
  fi
  revert_agent
  if [[ -n "${STATE_FILE}" ]]; then
    rm -f "${STATE_FILE}"
    log "State file removed: ${STATE_FILE}"
  fi
  log_important "=== Revert complete ==="
  exit 0
}

# assert_field — exits if a jq-extracted value is empty or "null"
assert_field() {
  local val="$1" label="$2"
  if [[ -z "$val" ]] || [[ "$val" == "null" ]]; then
    log_important "ERROR: API did not return expected field: ${label}"
    exit 1
  fi
}

# download <url> <dest> — curl with retries, TLS option, and size validation
download() {
  local url="$1" dest="$2"
  log "Downloading: ${url}"
  # shellcheck disable=SC2086
  curl -fsSL --retry 5 --retry-delay 5 ${CURL_OPTS} -o "${dest}" "${url}"
  local size
  size=$(wc -c < "${dest}" | xargs)
  if [ "${size}" -eq 0 ]; then
    log_important "Downloaded file is 0 bytes — network or URL error: ${url}"
    exit 1
  fi
  log "Downloaded $(basename "${dest}") (${size} bytes)"
}

# store_post <path> <json-body>
store_post() {
  local path="$1" body="$2" resp
  # shellcheck disable=SC2086
  resp=$(curl -sf --connect-timeout 10 --max-time 30 -X POST "$API/$path" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    ${CURL_OPTS} \
    -d "$body") || { log_important "ERROR: POST $API/$path failed (curl exit $?)"; exit 1; }
  echo "$resp"
}

# store_patch <path> <json-body>
store_patch() {
  local path="$1" body="$2"
  # shellcheck disable=SC2086
  curl -sf --connect-timeout 10 --max-time 30 -X PATCH "$API/$path" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    ${CURL_OPTS} \
    -d "$body" || { log_important "ERROR: PATCH $API/$path failed (curl exit $?)"; exit 1; }
}

# store_patch_root <path> <json-body>
store_patch_root() {
  local path="$1" body="$2"
  # shellcheck disable=SC2086
  curl -sf --connect-timeout 10 --max-time 30 -X PATCH "$API/$path" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ROOT_TOKEN" \
    ${CURL_OPTS} \
    -d "$body" || { log_important "ERROR: PATCH (root) $API/$path failed (curl exit $?)"; exit 1; }
}

# detect_platform — infers the OS from uname -s
detect_platform() {
  case "$(uname -s 2>/dev/null)" in
    FreeBSD)               echo "pfsense" ;;
    Linux)                 echo "linux" ;;
    MINGW*|CYGWIN*|MSYS*)  echo "windows" ;;
    Darwin)                echo "macos" ;;
    *)                     echo "pfsense" ;;
  esac
}

usage() {
  cat <<EOF
Usage:
  sudo bash $(basename "$0") [OPTIONS]     (Recommended — no chmod needed, runs as root)
  chmod +x $(basename "$0") && sudo ./$(basename "$0") [OPTIONS]

Credentials are prompted at runtime if not supplied via flags.
All other fields (device name, category, address) are auto-detected.
Always targets the production environment.

Optional:
  --device-name=NAME           Override auto-detected name (defaults to hostname)
  --device-category=CAT        Override auto-detected category (Firewall | AppGuard Client)
  --device-type=TYPE           Override auto-detected type (PFSense | Linux | Windows)
  --address-city=CITY          Override auto-detected city
  --address-country=COUNTRY    Override auto-detected country
  --address-country-code=CODE  Override auto-detected country code (e.g. PH)
  --wallguard-version=VER      Override auto-fetched version (e.g. 1.1.10)
  --platform=PLATFORM          pfsense | linux | windows (auto-detected if omitted)

Advanced overrides:
  --email=EMAIL                Provide org account email (skips prompt)
  --password=PASS              Provide org account password (skips prompt)
  --root-secret=SECRET         Provide root account secret (skips prompt)
  --store-url=URL              Override store API base URL
  --remote-access-url=HOST     Override control-plane hostname
  --poll-interval=SECS         Seconds between online checks (default: 3)
  --poll-timeout=SECS          Max wait time for device online (default: 300)
  --log-file=PATH              Write timestamped output to this file
  --quiet                      Suppress stdout (log-file still works)
  --disable-tls-verification   Skip TLS cert verification (lab use only)
  -h, --help                   Show this help

Platform notes:
  Linux   — sudo required; installs .deb via apt-get
  FreeBSD — run as root in pfSense shell; installs .pkg via pkg
  Windows — run from elevated PowerShell or Git Bash as Administrator; installs .msi

Examples — Linux / FreeBSD:
  sudo bash $(basename "$0")                                          # auto-detect all, prompts for credentials
  sudo bash $(basename "$0") --device-name=Firewall-01 --wallguard-version=1.1.10

Examples — Windows (elevated PowerShell / Git Bash):
  bash $(basename "$0")
  bash $(basename "$0") --device-name=WinHost-01 --platform=windows
EOF
}

# auto_detect_defaults — fills DEVICE_NAME, DEVICE_CATEGORY, DEVICE_TYPE, and ADDRESS_*
# from the detected platform and IP geolocation. Skips any field already set.
auto_detect_defaults() {
  local PUBLIC_IP
  PUBLIC_IP=$(curl -sf --connect-timeout 5 --max-time 10 --retry 3 ${CURL_OPTS} ifconfig.io 2>/dev/null || echo "")

  if [[ -z "$DEVICE_NAME" ]]; then
    local hn
    hn=$(hostname 2>/dev/null || echo "unknown")
    DEVICE_NAME="${hn}"
    log "Auto-detected device name: $DEVICE_NAME"
  fi

  if [[ -z "$DEVICE_CATEGORY" ]] || [[ -z "$DEVICE_TYPE" ]]; then
    case "$PLATFORM" in
      linux)
        DEVICE_CATEGORY="${DEVICE_CATEGORY:-Appguard Client}"
        DEVICE_TYPE="${DEVICE_TYPE:-Linux}"
        ;;
      windows)
        DEVICE_CATEGORY="${DEVICE_CATEGORY:-Appguard Client}"
        DEVICE_TYPE="${DEVICE_TYPE:-Windows}"
        ;;
      macos)
        DEVICE_CATEGORY="${DEVICE_CATEGORY:-Appguard Client}"
        DEVICE_TYPE="${DEVICE_TYPE:-macOS}"
        ;;
      pfsense|*)
        DEVICE_CATEGORY="${DEVICE_CATEGORY:-Firewall}"
        DEVICE_TYPE="${DEVICE_TYPE:-PFSense}"
        ;;
    esac
    log "Auto-detected: category=$DEVICE_CATEGORY | type=$DEVICE_TYPE"
  fi

  if [[ -z "$ADDRESS_CITY" ]] || [[ -z "$ADDRESS_COUNTRY" ]] || [[ -z "$ADDRESS_COUNTRY_CODE" ]]; then
    local geo
    geo=$(curl -sf --connect-timeout 5 --max-time 10 --retry 3 ${CURL_OPTS} "http://ip-api.com/json/${PUBLIC_IP}" 2>/dev/null || echo "{}")
    ADDRESS_CITY="${ADDRESS_CITY:-$(echo "$geo" | jq -r '.city // ""')}"
    ADDRESS_COUNTRY="${ADDRESS_COUNTRY:-$(echo "$geo" | jq -r '.country // ""')}"
    ADDRESS_COUNTRY_CODE="${ADDRESS_COUNTRY_CODE:-$(echo "$geo" | jq -r '.countryCode // ""')}"
    log "Auto-detected address: $ADDRESS_CITY, $ADDRESS_COUNTRY ($ADDRESS_COUNTRY_CODE)"
  fi
}

# ---------------------------------------------------------------------------
# Parse CLI arguments
# ---------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --store-url=*)              STORE_URL="${1#*=}" ;;
    --email=*)                  EMAIL="${1#*=}" ;;
    --password=*)               PASSWORD="${1#*=}" ;;
    --root-secret=*)            ROOT_SECRET="${1#*=}" ;;
    --device-name=*)            DEVICE_NAME="${1#*=}" ;;
    --device-category=*)        DEVICE_CATEGORY="${1#*=}" ;;
    --device-type=*)            DEVICE_TYPE="${1#*=}" ;;
    --address-city=*)           ADDRESS_CITY="${1#*=}" ;;
    --address-country=*)        ADDRESS_COUNTRY="${1#*=}" ;;
    --address-country-code=*)   ADDRESS_COUNTRY_CODE="${1#*=}" ;;
    --remote-access-url=*)      REMOTE_ACCESS_URL="${1#*=}" ;;
    --wallguard-version=*)      WALLGUARD_VERSION="${1#*=}" ;;
    --platform=*)               PLATFORM="${1#*=}" ;;
    --poll-interval=*)          POLL_INTERVAL="${1#*=}" ;;
    --poll-timeout=*)           POLL_TIMEOUT="${1#*=}" ;;
    --log-file=*)               LOG_FILENAME="${1#*=}" ;;
    --quiet)                    QUIET=true ;;
    --disable-tls-verification) DISABLE_TLS_VERIFICATION=true ;;
    -h|--help)                  usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
  esac
  shift
done

# Production endpoints (override with --store-url / --remote-access-url if needed)
STORE_URL="${STORE_URL:-https://store.appguard.ai}"
REMOTE_ACCESS_URL="${REMOTE_ACCESS_URL:-wallguard-proxy.appguard.ai}"

# Prompt for credentials if not supplied via flags or env vars
if [[ -z "$EMAIL" ]];       then read -rp  "Org email: "    EMAIL;       fi
if [[ -z "$PASSWORD" ]];    then read -rsp "Org password: " PASSWORD;    echo; fi
if [[ -z "$ROOT_SECRET" ]]; then read -rsp "Root secret: "  ROOT_SECRET; echo; fi

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------

# Initialise log file
if [[ -n "${LOG_FILENAME}" ]] && [ -f "${LOG_FILENAME}" ]; then
  echo -n "" > "${LOG_FILENAME}"
fi

# 1. Required tools — fail before any network call
check_exists_fatal curl jq python3

# 2. Required credentials — fail if unset
check_set EMAIL
check_set PASSWORD
check_set ROOT_SECRET

# 3. Build curl options string
CURL_OPTS=""
if [[ "${DISABLE_TLS_VERIFICATION}" == "true" ]]; then
  CURL_OPTS="-k"
  log_important "TLS verification is DISABLED (--disable-tls-verification)"
fi

# 4. Resolve platform
PLATFORM="${PLATFORM:-$(detect_platform)}"
log "Platform: $PLATFORM"
log "Store: $STORE_URL"

# 5a. Auto-detect device name, category, type, and address from platform + IP geo
auto_detect_defaults

# Validate that auto-detection (or explicit args) productionuced all required fields
check_set DEVICE_NAME
check_set DEVICE_CATEGORY
check_set DEVICE_TYPE
check_set ADDRESS_CITY
check_set ADDRESS_COUNTRY
check_set ADDRESS_COUNTRY_CODE
# WALLGUARD_VERSION is auto-fetched after auth (Step 1)

API="$STORE_URL/api"

# 5b. Temp directory for downloaded packages — cleaned up on exit
TEMP_DIR=$(mktemp -d -t wallguard-XXXXXXXXXX)
finish() { rm -rf "${TEMP_DIR}"; }
trap finish EXIT

# ---------------------------------------------------------------------------
# Resume / revert check
# ---------------------------------------------------------------------------
STEP_COMPLETED=0
DEVICE_ID=""
DEVICE_CODE=""
ADDRESS_ID=""
INSTALL_TOKEN=""

if [[ -n "${STATE_FILE}" ]] && [[ -f "${STATE_FILE}" ]]; then
  log_important "Incomplete run detected (${STATE_FILE})."
  printf "  [c] Continue from last completed step (default)\n"
  printf "  [r] Revert — delete created resources and exit\n"
  printf "  [s] Revert then start fresh — clean up and re-run from scratch\n"
  read -rp "Choice [c/r/s]: " _resume_choice 2>/dev/null || _resume_choice="c"
  _resume_choice="${_resume_choice:-c}"

  _do_reauth_root() {
    log "Re-authenticating (root) for revert..."
    _ra=$(curl -sf --connect-timeout 10 --max-time 30 -X POST "$API/organizations/auth?is_root=true" \
      -H "Content-Type: application/json" ${CURL_OPTS} \
      -d "{\"data\":{\"account_id\":\"root\",\"account_secret\":\"$ROOT_SECRET\"}}") \
      || { log_important "Root re-auth failed. Remove device ${DEVICE_ID:-unknown} manually."; exit 1; }
    ROOT_TOKEN=$(echo "$_ra" | jq -r '.data.token // .data.access_token // .token // .access_token')
  }

  case "${_resume_choice}" in
    r|R)
      load_state
      _do_reauth_root
      do_revert  # exits after revert
      ;;
    s|S)
      load_state
      _do_reauth_root
      log_important "=== Revert + restart ==="
      if [[ -n "${DEVICE_ID:-}" ]]; then
        log "Deleting device via API: ${DEVICE_ID} (${DEVICE_CODE:-})"
        store_patch_root "store/root/devices/${DEVICE_ID}" '{"status":"Deleted"}' >/dev/null 2>&1 \
          && log "Device deleted OK" \
          || log_important "Could not auto-delete device — continuing anyway."
      else
        log "No device ID in state — skipping API deletion"
      fi
      revert_agent
      if [[ -n "${STATE_FILE}" ]]; then
        rm -f "${STATE_FILE}"
        log "State file removed: ${STATE_FILE}"
      fi
      log_important "=== Revert complete — restarting from scratch ==="
      STEP_COMPLETED=0; DEVICE_ID=""; DEVICE_CODE=""; ADDRESS_ID=""; INSTALL_TOKEN=""; WALLGUARD_VERSION=""
      ;;
    *)
      load_state
      ;;
  esac
fi

# ---------------------------------------------------------------------------
# Step 1 — Authenticate
# ---------------------------------------------------------------------------
log_header "=== Step 1: Authenticate (user) ==="
auth_resp=$(curl -sf --connect-timeout 10 --max-time 30 -X POST "$API/organizations/auth" \
  -H "Content-Type: application/json" \
  ${CURL_OPTS} \
  -d "{\"data\":{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}}") \
  || { log_important "ERROR: User auth request failed (curl exit $?)"; exit 1; }
USER_TOKEN=$(echo "$auth_resp" | jq -r '.data.token // .data.access_token // .token // .access_token')
assert_field "$USER_TOKEN" "user token"
log "User token obtained"

log_header "=== Step 1b: Authenticate (root) ==="
root_auth_resp=$(curl -sf --connect-timeout 10 --max-time 30 -X POST "$API/organizations/auth?is_root=true" \
  -H "Content-Type: application/json" \
  ${CURL_OPTS} \
  -d "{\"data\":{\"account_id\":\"root\",\"account_secret\":\"$ROOT_SECRET\"}}") \
  || { log_important "ERROR: Root auth request failed (curl exit $?)"; exit 1; }
ROOT_TOKEN=$(echo "$root_auth_resp" | jq -r '.data.token // .data.access_token // .token // .access_token')
assert_field "$ROOT_TOKEN" "root token"
log "Root token obtained"

# Auto-fetch latest Wallguard version if not provided
if [[ -z "$WALLGUARD_VERSION" ]]; then
  log "Fetching latest Wallguard version from store..."
  ver_resp=$(store_post "store/versions/filter?no_caching=true" '{"pluck":["latest_version"],"limit":1}')
  WALLGUARD_VERSION=$(echo "$ver_resp" | jq -r '.data[0].latest_version // ""')
  if [[ -z "$WALLGUARD_VERSION" ]]; then
    log_important "ERROR: Could not fetch Wallguard version from API. Specify --wallguard-version=VER manually."
    exit 1
  fi
fi
log "Wallguard version: $WALLGUARD_VERSION"

# ---------------------------------------------------------------------------
# Step 2 — Create Draft Device
# ---------------------------------------------------------------------------
if [[ "${STEP_COMPLETED}" -lt 2 ]]; then
  log_header "=== Step 2: Create draft device ==="
  create_resp=$(store_post "store/devices?pluck=id,code" '{"status":"Draft"}')
  DEVICE_ID=$(echo "$create_resp" | jq -r '.data[0].id')
  DEVICE_CODE=$(echo "$create_resp" | jq -r '.data[0].code')
  assert_field "$DEVICE_ID"   "device id"
  assert_field "$DEVICE_CODE" "device code"
  log "Device ID   : $DEVICE_ID"
  log "Device Code : $DEVICE_CODE"
  STEP_COMPLETED=2; save_state
else
  log "Step 2 skipped — Device: $DEVICE_CODE ($DEVICE_ID)"
fi

# ---------------------------------------------------------------------------
# Step 3 — Create Address
# ---------------------------------------------------------------------------
if [[ "${STEP_COMPLETED}" -lt 3 ]]; then
  log_header "=== Step 3: Create address ==="
  addr_resp=$(store_post "store/addresses?pluck=id" \
    "{\"city\":\"$ADDRESS_CITY\",\"country\":\"$ADDRESS_COUNTRY\",\"country_code\":\"$ADDRESS_COUNTRY_CODE\"}")
  ADDRESS_ID=$(echo "$addr_resp" | jq -r '.data[0].id')
  assert_field "$ADDRESS_ID" "address id"
  log "Address ID  : $ADDRESS_ID"
  STEP_COMPLETED=3; save_state
else
  log "Step 3 skipped — Address: $ADDRESS_ID"
fi

# ---------------------------------------------------------------------------
# Step 4 — Wizard Step 1: device_category + address_id
# ---------------------------------------------------------------------------
if [[ "${STEP_COMPLETED}" -lt 4 ]]; then
  log_header "=== Step 4: Set device category and link address ==="
  store_patch "store/devices/$DEVICE_ID" \
    "{\"device_category\":\"$DEVICE_CATEGORY\",\"address_id\":\"$ADDRESS_ID\"}" \
    > /dev/null
  log "Category: $DEVICE_CATEGORY  |  Address linked"
  STEP_COMPLETED=4; save_state
else
  log "Step 4 skipped — category/address already linked"
fi

# ---------------------------------------------------------------------------
# Step 5 — Wizard Step 2: device_name + device_type
# ---------------------------------------------------------------------------
if [[ "${STEP_COMPLETED}" -lt 5 ]]; then
  log_header "=== Step 5: Set device type and name ==="
  store_patch "store/devices/$DEVICE_ID" \
    "{\"device_name\":\"$DEVICE_NAME\",\"device_type\":\"$DEVICE_TYPE\"}" \
    > /dev/null
  log "Name: $DEVICE_NAME  |  Type: $DEVICE_TYPE"
  STEP_COMPLETED=5; save_state
else
  log "Step 5 skipped — name/type already set"
fi

# ---------------------------------------------------------------------------
# Step 6 — Installation Code
# ---------------------------------------------------------------------------
if [[ "${STEP_COMPLETED}" -lt 6 ]]; then
  log_header "=== Step 6: Get / create installation code ==="
  filter_resp=$(store_post "store/installation_codes/filter" \
    "{\"pluck\":[\"id\",\"token\"],\"advance_filters\":[{\"type\":\"criteria\",\"field\":\"device_id\",\"operator\":\"equal\",\"values\":[\"$DEVICE_ID\"]}],\"limit\":1}")
  existing_token=$(echo "$filter_resp" | jq -r '.data[0].token // empty')
  if [ -z "$existing_token" ]; then
    log "No existing code — creating one..."
    hex_token=$(python3 -c "import secrets; print(secrets.token_hex(8))")
    code_resp=$(store_post "store/installation_codes?pluck=id,token" \
      "{\"status\":\"Active\",\"device_id\":\"$DEVICE_ID\",\"device_code\":\"$DEVICE_CODE\",\"token\":\"$hex_token\"}")
    INSTALL_TOKEN=$(echo "$code_resp" | jq -r '.data[0].token')
    assert_field "$INSTALL_TOKEN" "install token"
  else
    INSTALL_TOKEN="$existing_token"
  fi
  log "Install token: $INSTALL_TOKEN"
  STEP_COMPLETED=6; save_state
else
  log "Step 6 skipped — install token: $INSTALL_TOKEN"
fi

# ---------------------------------------------------------------------------
# Step 6b — Install Wallguard Agent (requires root)
# ---------------------------------------------------------------------------
if [[ "${STEP_COMPLETED}" -lt 7 ]]; then
log_header "=== Step 6b: Install Wallguard agent  [platform: $PLATFORM] ==="
assert_running_as_root

case "$PLATFORM" in
  linux)
    DEB="wallguard_${WALLGUARD_VERSION}_amd64.deb"
    DEB_URL="https://github.com/NullNet-ai/wallguard/releases/download/v${WALLGUARD_VERSION}/${DEB}"
    download "${DEB_URL}" "${TEMP_DIR}/${DEB}"
    log "Running: apt install -y ${TEMP_DIR}/${DEB}"
    apt install -y "${TEMP_DIR}/${DEB}"
    log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051 --platform=generic"
    wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=generic
    sleep 1
    log "Running: wallguard-cli version"
    wallguard-cli version
    log "Running: wallguard-cli status"
    _wg_status=$(wallguard-cli status 2>/dev/null || echo "Unknown")
    log "Wallguard status: ${_wg_status}"
    if [[ "${_wg_status}" != "IDLE" ]]; then
      log "Status is not IDLE — running: wallguard-cli leave"
      wallguard-cli leave 2>&1 || true
      log "Running: wallguard-cli stop"
      wallguard-cli stop 2>&1 || true
      log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051"
      wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=generic
      sleep 1
    fi
    log "Running: wallguard-cli join ${INSTALL_TOKEN}"
    wallguard-cli join "$INSTALL_TOKEN"
    ;;
  windows)
    MSI="wallguard-${WALLGUARD_VERSION}-x86_64.msi"
    MSI_URL="https://github.com/NullNet-ai/wallguard/releases/download/v${WALLGUARD_VERSION}/${MSI}"
    log "Installing NPCAP..."
    download "https://npcap.com/dist/npcap-1.80.exe" "${TEMP_DIR}/npcap.exe"
    log "Running: Start-Process npcap.exe -Wait"
    powershell.exe -Command "Start-Process '${TEMP_DIR}/npcap.exe' -Wait"
    log "Installing VC Runtime..."
    download "https://aka.ms/vs/17/release/vc_redist.x64.exe" "${TEMP_DIR}/vc_redist.x64.exe"
    log "Running: Start-Process vc_redist.x64.exe /install /quiet /norestart -Wait"
    powershell.exe -Command "Start-Process '${TEMP_DIR}/vc_redist.x64.exe' -ArgumentList '/install /quiet /norestart' -Wait"
    log "Installing WallGuard MSI..."
    download "${MSI_URL}" "${TEMP_DIR}/${MSI}"
    log "Running: msiexec /i ${MSI} /quiet /wait"
    powershell.exe -Command "Start-Process msiexec.exe -ArgumentList '/i','${TEMP_DIR}/${MSI}','/quiet','/wait' -Wait"
    log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051 --platform=generic"
    wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=generic
    sleep 1
    log "Running: wallguard-cli version"
    wallguard-cli version
    log "Running: wallguard-cli status"
    _wg_status=$(wallguard-cli status 2>/dev/null || echo "Unknown")
    log "Wallguard status: ${_wg_status}"
    if [[ "${_wg_status}" != "IDLE" ]]; then
      log "Status is not IDLE — running: wallguard-cli leave"
      wallguard-cli leave 2>&1 || true
      log "Running: wallguard-cli stop"
      wallguard-cli stop 2>&1 || true
      log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051"
      wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=generic
      sleep 1
    fi
    log "Running: wallguard-cli join ${INSTALL_TOKEN}"
    wallguard-cli join "$INSTALL_TOKEN"
    ;;
  macos)
    # Build the DMG filename and GitHub releases download URL
    DMG="wallguard-${WALLGUARD_VERSION}-macos.dmg"
    DMG_URL="https://github.com/NullNet-ai/wallguard/releases/download/v${WALLGUARD_VERSION}/${DMG}"

    # Download the DMG into the temp directory
    download "${DMG_URL}" "${TEMP_DIR}/${DMG}"

    # Create the mount point directory and attach the DMG (hidden from Finder)
    log "Mounting DMG..."
    MOUNT_POINT="${TEMP_DIR}/wallguard-mount"
    mkdir -p "${MOUNT_POINT}"
    hdiutil attach "${TEMP_DIR}/${DMG}" -nobrowse -quiet -mountpoint "${MOUNT_POINT}" || {
      log_important "ERROR: failed to mount DMG"
      exit 1
    }

    # Prefer the .pkg installer if present; fall back to copying the raw binary
    PKG_FILE=$(find "${MOUNT_POINT}" -name "*.pkg" 2>/dev/null | head -1 || true)
    if [[ -n "${PKG_FILE}" ]]; then
      # Use macOS native installer for proper system-wide installation
      log "Running: installer -pkg ${PKG_FILE} -target /"
      installer -pkg "${PKG_FILE}" -target /
    else
      # Locate both binaries independently so each lands at the correct destination
      CLI_BIN=$(find "${MOUNT_POINT}" -type f -name "wallguard-cli" 2>/dev/null | head -1 || true)
      AGENT_BIN=$(find "${MOUNT_POINT}" -type f -name "wallguard" 2>/dev/null | head -1 || true)

      # Abort if wallguard-cli is missing (it is required for all downstream commands)
      if [[ -z "${CLI_BIN}" ]]; then
        log_important "ERROR: could not find wallguard-cli binary in DMG."
        hdiutil detach "${MOUNT_POINT}" -quiet 2>/dev/null || true
        exit 1
      fi

      # Install wallguard-cli
      log "Copying wallguard-cli from ${CLI_BIN}..."
      cp "${CLI_BIN}" /usr/local/bin/wallguard-cli
      chmod +x /usr/local/bin/wallguard-cli

      # Install wallguard agent binary if present
      if [[ -n "${AGENT_BIN}" ]]; then
        log "Copying wallguard from ${AGENT_BIN}..."
        cp "${AGENT_BIN}" /usr/local/bin/wallguard
        chmod +x /usr/local/bin/wallguard
      else
        log "wallguard agent binary not found in DMG — skipping"
      fi
    fi

    # Unmount the DMG; non-fatal since installation already completed
    hdiutil detach "${MOUNT_POINT}" -quiet || true
    log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051 --platform=generic"
    wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=generic
    sleep 1
    log "Running: wallguard-cli version"
    wallguard-cli version
    log "Running: wallguard-cli status"
    _wg_status=$(wallguard-cli status 2>/dev/null || echo "Unknown")
    log "Wallguard status: ${_wg_status}"
    if [[ "${_wg_status}" != "IDLE" ]]; then
      log "Status is not IDLE — running: wallguard-cli leave"
      wallguard-cli leave 2>&1 || true
      log "Running: wallguard-cli stop"
      wallguard-cli stop 2>&1 || true
      log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051"
      wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=generic
      sleep 1
    fi
    log "Running: wallguard-cli join ${INSTALL_TOKEN}"
    wallguard-cli join "$INSTALL_TOKEN"
    ;;
  *)  # pfsense (default)
    PKG_URL="https://github.com/NullNet-ai/wallguard/releases/download/v${WALLGUARD_VERSION}/wallguard-${WALLGUARD_VERSION}.pkg"
    download "${PKG_URL}" "${TEMP_DIR}/wallguard.pkg"
    log "Running: pkg add ${TEMP_DIR}/wallguard.pkg"
    pkg add "${TEMP_DIR}/wallguard.pkg"
    log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051 --platform=pfsense"
    wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=pfsense
    sleep 1
    log "Running: wallguard-cli version"
    wallguard-cli version
    log "Running: wallguard-cli status"
    _wg_status=$(wallguard-cli status 2>/dev/null || echo "Unknown")
    log "Wallguard status: ${_wg_status}"
    if [[ "${_wg_status}" != "IDLE" ]]; then
      log "Status is not IDLE — running: wallguard-cli leave"
      wallguard-cli leave 2>&1 || true
      log "Running: wallguard-cli stop"
      wallguard-cli stop 2>&1 || true
      log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051"
      wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=pfsense
      sleep 1
    fi
    log "Running: wallguard-cli join ${INSTALL_TOKEN}"
    wallguard-cli join "$INSTALL_TOKEN"
    ;;
esac
log "Wallguard agent installed and joined"
STEP_COMPLETED=7; save_state
else
  log "Step 6b skipped — agent already installed"
fi

# ---------------------------------------------------------------------------
# Step 7 — Poll until online
# ---------------------------------------------------------------------------
if [[ "${STEP_COMPLETED}" -lt 8 ]]; then
  log_header "=== Step 7: Waiting for device to come online ==="
  elapsed=0
  online=false
  while [ "$elapsed" -lt "$POLL_TIMEOUT" ]; do
    poll_resp=$(store_post "store/devices/filter?no_caching=true" \
      "{\"pluck\":[\"id\",\"is_device_online\"],\"advance_filters\":[{\"type\":\"criteria\",\"field\":\"code\",\"operator\":\"equal\",\"values\":[\"$DEVICE_CODE\"]}],\"limit\":1}")
    is_online=$(echo "$poll_resp" | jq -r '.data[0].is_device_online // false')
    if [ "$is_online" = "true" ]; then
      online=true
      break
    fi
    log "Not online yet — retrying in ${POLL_INTERVAL}s... (${elapsed}s elapsed)"
    sleep "$POLL_INTERVAL"
    elapsed=$((elapsed + POLL_INTERVAL))
  done
  if [ "$online" = "false" ]; then
    log_important "ERROR: Device did not come online within ${POLL_TIMEOUT}s. Check the Wallguard agent."
    exit 1
  fi
  log "Device is online!"
  STEP_COMPLETED=8; save_state
else
  log "Step 7 skipped — device already online"
fi

# ---------------------------------------------------------------------------
# Step 8 — Activate Device
# ---------------------------------------------------------------------------
if [[ "${STEP_COMPLETED}" -lt 9 ]]; then
  log_header "=== Step 8: Activate device ==="
  store_patch_root "store/root/devices/$DEVICE_ID" \
    '{"status":"Active"}' > /dev/null
  log "Device set to Active"
  STEP_COMPLETED=9; save_state
else
  log "Step 8 skipped — device already activated"
fi

log_header "Done. Device '${DEVICE_NAME}' is live."
log "Device code: $DEVICE_CODE"
if [[ -n "${STATE_FILE}" ]]; then rm -f "${STATE_FILE}"; fi
