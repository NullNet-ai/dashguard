#!/bin/sh
# create-device-freebsd.sh
#
# pfSense / FreeBSD installer — pure POSIX sh, no bash/curl/jq required.
# Uses /bin/sh + fetch (GET) + openssl s_client (POST/PATCH) + awk/sed.
#
# Served with credentials pre-injected by the portal (format=bootstrap).
# Run as root:  fetch -qo - 'URL?token=X&format=bootstrap' | sh

set -eu

# ---------------------------------------------------------------------------
# Credentials — replaced at serve time by the portal (format=bootstrap)
# ---------------------------------------------------------------------------

EMAIL=""
PASSWORD=""
ROOT_SECRET=""
SCRIPT_TOKEN=""
STORE_URL=""
REMOTE_ACCESS_URL=""

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEVICE_NAME=""
DEVICE_CATEGORY=""
DEVICE_TYPE=""
ADDRESS_CITY=""
ADDRESS_COUNTRY=""
ADDRESS_COUNTRY_CODE=""
WALLGUARD_VERSION=""
PLATFORM="pfsense"

POLL_INTERVAL=3
POLL_TIMEOUT=300
LOG_FILENAME=""
QUIET=false
FRESH_INSTALL="${FRESH_INSTALL:-false}"
STATE_FILE="${STATE_FILE:-./.create-device.state}"

SCRIPT_NAME="create-device-freebsd"

_log_start() {
  printf '\n=== Dashguard pfSense Installer ===\n'
  printf 'Script version: POSIX sh (openssl s_client)\n'
  printf 'Timestamp: %s\n\n' "$(date '+%Y-%m-%d %H:%M:%S %Z')"
}

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

_log() {
  local _line
  _line="$(date '+%Y-%m-%d %H:%M:%S %Z') [${SCRIPT_NAME}] $*"
  [ "$QUIET" = "false" ] && printf '%s\n' "$_line"
  [ -n "$LOG_FILENAME" ] && printf '%s\n' "$_line" >> "$LOG_FILENAME"
}

_log_header() {
  [ "$QUIET" = "false" ] && printf '\n%s\n\n' "$*"
  [ -n "$LOG_FILENAME" ] && printf '\n%s\n\n' "$*" >> "$LOG_FILENAME"
}

_log_important() {
  local _line
  _line="$(date '+%Y-%m-%d %H:%M:%S %Z') [${SCRIPT_NAME}] ---> $*"
  printf '%s\n' "$_line"
  [ -n "$LOG_FILENAME" ] && printf '%s\n' "$_line" >> "$LOG_FILENAME"
}

# ---------------------------------------------------------------------------
# JSON helpers  (replace jq)
# ---------------------------------------------------------------------------

# Extract string value  "key":"val" -> val
_json_str() {
  printf '%s' "$1" | sed 's/.*"'"$2"'":"\([^"]*\)".*/\1/;t done;d;:done'
}

# Extract raw (unquoted) value  "key":val -> val  (booleans, numbers, null)
_json_raw() {
  printf '%s' "$1" | sed 's/.*"'"$2"'":\([^,}{]*\).*/\1/;t done;d;:done' | tr -d ' '
}

# .data[0].key -- string value
_data0_str() {
  local _obj
  _obj=$(printf '%s' "$1" | sed 's/.*"data":\[{\([^]]*\)}.*/\1/')
  _json_str "{$_obj}" "$2"
}

# .data[0].key -- raw value
_data0_raw() {
  local _obj
  _obj=$(printf '%s' "$1" | sed 's/.*"data":\[{\([^]]*\)}.*/\1/')
  _json_raw "{$_obj}" "$2"
}

# Token extractor -- tries top-level and .data nested keys
_extract_token() {
  local _resp="$1" _val="" _inner _k
  for _k in token access_token; do
    _val=$(_json_str "$_resp" "$_k")
    [ -n "$_val" ] && { printf '%s' "$_val"; return 0; }
  done
  # try keys inside {"data":{...}}
  _inner=$(printf '%s' "$_resp" | sed 's/.*"data":{\([^}]*\)}.*/{\1}/')
  for _k in token access_token; do
    _val=$(_json_str "$_inner" "$_k")
    [ -n "$_val" ] && { printf '%s' "$_val"; return 0; }
  done
  return 0
}

# ---------------------------------------------------------------------------
# HTTP helpers  (replace curl -- openssl s_client over TLS)
# ---------------------------------------------------------------------------

_api_host=""
_api_port=443
_api_basepath=""

# Raw HTTPS request; strips HTTP headers, returns body only
_https_req() {
  local _method="$1" _path="$2" _body="$3" _token="${4:-}"
  local _len _full_path
  _len=$(printf '%s' "$_body" | wc -c | tr -d ' \t\n')
  _full_path="${_api_basepath}/api/${_path}"
  _full_path=$(printf '%s' "$_full_path" | sed 's|//|/|g')
  {
    printf '%s %s HTTP/1.0\r\n'                                "$_method" "$_full_path"
    printf 'Host: %s\r\n'                                      "$_api_host"
    printf 'Content-Type: application/json\r\n'
    printf 'Content-Length: %s\r\n'                            "$_len"
    [ -n "$_token" ] && printf 'Authorization: Bearer %s\r\n' "$_token"
    printf 'Connection: close\r\n'
    printf '\r\n'
    printf '%s' "$_body"
  } | openssl s_client -quiet \
      -connect "${_api_host}:${_api_port}" \
      -servername "$_api_host" \
      -CAfile /etc/ssl/cert.pem \
      -verify_return_error \
    | awk '/^HTTP\//{h=1} h && /^\r?$/{b=1;next} b{print}'
}

# No-auth POST (used for auth endpoints)
_auth_post() {
  _https_req POST "$1" "$2" ""
}

# Authenticated POST (USER_TOKEN)
_store_post() {
  _https_req POST "$1" "$2" "$USER_TOKEN"
}

# Authenticated PATCH (USER_TOKEN)
_store_patch() {
  _https_req PATCH "$1" "$2" "$USER_TOKEN"
}

# Authenticated PATCH (ROOT_TOKEN)
_store_patch_root() {
  _https_req PATCH "$1" "$2" "$ROOT_TOKEN"
}

_assert_field() {
  if [ -z "$1" ] || [ "$1" = "null" ]; then
    _log_important "ERROR: API did not return expected field: $2"
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Prompt helpers
# ---------------------------------------------------------------------------

_prompt() {
  printf '%s' "$1"
  read -r _REPLY
}

_prompt_secret() {
  printf '%s' "$1"
  stty -echo 2>/dev/null || true
  read -r _REPLY
  stty echo 2>/dev/null || true
  printf '\n'
}

# ---------------------------------------------------------------------------
# File download  (replace curl -fsSL -- uses fetch)
# ---------------------------------------------------------------------------

download() {
  local _url="$1" _dest="$2" _size
  _log "Downloading: ${_url}"
  fetch -qo "$_dest" "$_url" || { _log_important "ERROR: download failed: ${_url}"; exit 1; }
  _size=$(wc -c < "$_dest" | tr -d ' \t\n')
  if [ "${_size:-0}" -eq 0 ]; then
    _log_important "Downloaded file is 0 bytes -- network or URL error: ${_url}"
    exit 1
  fi
  _log "Downloaded $(basename "$_dest") (${_size} bytes)"
}

# ---------------------------------------------------------------------------
# State file
# ---------------------------------------------------------------------------

save_state() {
  [ -z "$STATE_FILE" ] && return 0
  cat > "$STATE_FILE" <<STATEEOF
STEP_COMPLETED=${STEP_COMPLETED}
DEVICE_ID="${DEVICE_ID:-}"
DEVICE_CODE="${DEVICE_CODE:-}"
ADDRESS_ID="${ADDRESS_ID:-}"
INSTALL_TOKEN="${INSTALL_TOKEN:-}"
WALLGUARD_VERSION="${WALLGUARD_VERSION:-}"
STATEEOF
}

load_state() {
  # shellcheck source=/dev/null
  . "$STATE_FILE"
  _log "Resumed from state: step_completed=${STEP_COMPLETED}, device=${DEVICE_CODE:-none}"
}

# ---------------------------------------------------------------------------
# Auto-detect device info
# ---------------------------------------------------------------------------

auto_detect_defaults() {
  if [ -z "$DEVICE_NAME" ]; then
    DEVICE_NAME=$(hostname 2>/dev/null || printf 'unknown')
    _log "Auto-detected device name: $DEVICE_NAME"
  fi

  if [ -z "$DEVICE_CATEGORY" ] || [ -z "$DEVICE_TYPE" ]; then
    DEVICE_CATEGORY="${DEVICE_CATEGORY:-Firewall}"
    DEVICE_TYPE="${DEVICE_TYPE:-PFSense}"
    _log "Auto-detected: category=$DEVICE_CATEGORY | type=$DEVICE_TYPE"
  fi

  ADDRESS_CITY="${ADDRESS_CITY:-Unknown}"
  ADDRESS_COUNTRY="${ADDRESS_COUNTRY:-Unknown}"
  ADDRESS_COUNTRY_CODE="${ADDRESS_COUNTRY_CODE:-XX}"
  _log "Address: $ADDRESS_CITY, $ADDRESS_COUNTRY ($ADDRESS_COUNTRY_CODE)"
}

# ---------------------------------------------------------------------------
# Misc
# ---------------------------------------------------------------------------

assert_running_as_root() {
  if [ "$(id -u)" != "0" ]; then
    _log_important "This script must be run as root."
    exit 1
  fi
}

check_set() {
  local _key="$1" _val
  eval "_val=\${${_key}:-}"
  if [ -z "$_val" ]; then
    _log_important "Required variable not set: ${_key}"
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Parse CLI arguments
# ---------------------------------------------------------------------------

while [ $# -gt 0 ]; do
  case "$1" in
    --store-url=*)              STORE_URL="${1#*=}" ;;
    --remote-access-url=*)      REMOTE_ACCESS_URL="${1#*=}" ;;
    --email=*)                  EMAIL="${1#*=}" ;;
    --password=*)               PASSWORD="${1#*=}" ;;
    --root-secret=*)            ROOT_SECRET="${1#*=}" ;;
    --device-name=*)            DEVICE_NAME="${1#*=}" ;;
    --device-category=*)        DEVICE_CATEGORY="${1#*=}" ;;
    --device-type=*)            DEVICE_TYPE="${1#*=}" ;;
    --address-city=*)           ADDRESS_CITY="${1#*=}" ;;
    --address-country=*)        ADDRESS_COUNTRY="${1#*=}" ;;
    --address-country-code=*)   ADDRESS_COUNTRY_CODE="${1#*=}" ;;
    --wallguard-version=*)      WALLGUARD_VERSION="${1#*=}" ;;
    --platform=*)               PLATFORM="${1#*=}" ;;
    --poll-interval=*)          POLL_INTERVAL="${1#*=}" ;;
    --poll-timeout=*)           POLL_TIMEOUT="${1#*=}" ;;
    --log-file=*)               LOG_FILENAME="${1#*=}" ;;
    --fresh|--reinstall)        FRESH_INSTALL=true ;;
    --quiet)                    QUIET=true ;;
    -h|--help)
      printf 'Usage: sh create-device-freebsd.sh [OPTIONS]\n'
      printf 'Pure POSIX sh pfSense/FreeBSD installer. Credentials pre-injected by portal.\n'
      exit 0 ;;
    *) printf 'Unknown option: %s\n' "$1" >&2; exit 1 ;;
  esac
  shift
done

# Production defaults (overridden by injected values or flags)
STORE_URL="${STORE_URL:-https://store.appguard.ai}"
REMOTE_ACCESS_URL="${REMOTE_ACCESS_URL:-wallguard-proxy.appguard.ai}"

# ---------------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------------

_log_start

# ---------------------------------------------------------------------------
# Prompt for missing credentials (skipped when portal injects them)
# ---------------------------------------------------------------------------

if [ -z "$EMAIL" ];       then _prompt        "Org email: ";    EMAIL="$_REPLY";       fi
if [ -z "$PASSWORD" ];    then _prompt_secret "Org password: "; PASSWORD="$_REPLY";    fi
if [ -z "$ROOT_SECRET" ]; then _prompt_secret "Root secret: ";  ROOT_SECRET="$_REPLY"; fi

check_set EMAIL
check_set PASSWORD
check_set ROOT_SECRET

# ---------------------------------------------------------------------------
# Initialise API connection variables
# ---------------------------------------------------------------------------

_log "STORE_URL: $STORE_URL"
_api_host=$(printf '%s' "$STORE_URL" | sed 's|.*://||;s|[:/].*||')
_api_port=$(printf '%s' "$STORE_URL" | grep -o ':[0-9]*' | head -1 | tr -d ':')
_api_port="${_api_port:-443}"
_api_basepath=$(printf '%s' "$STORE_URL" | sed 's|.*://[^/]*||;s|/$||')

USER_TOKEN=""
ROOT_TOKEN=""

PLATFORM="${PLATFORM:-pfsense}"
auto_detect_defaults

check_set DEVICE_NAME
check_set DEVICE_CATEGORY
check_set DEVICE_TYPE
check_set ADDRESS_CITY
check_set ADDRESS_COUNTRY
check_set ADDRESS_COUNTRY_CODE

# Temp dir -- cleaned on exit
TEMP_DIR=$(mktemp -d -t wallguard-XXXXXXXXXX)
_finish() { rm -rf "$TEMP_DIR"; }
trap _finish EXIT

# ---------------------------------------------------------------------------
# Resume / revert check
# ---------------------------------------------------------------------------

STEP_COMPLETED=0
DEVICE_ID=""
DEVICE_CODE=""
ADDRESS_ID=""
INSTALL_TOKEN=""

if [ -n "$STATE_FILE" ] && [ -f "$STATE_FILE" ]; then
  if [ "$FRESH_INSTALL" = "true" ]; then
    load_state
    _log_important "=== --fresh: cleaning prior incomplete run ==="
    _fresh_ra=$(_auth_post "organizations/auth?is_root=true" \
      "{\"data\":{\"account_id\":\"root\",\"account_secret\":\"$ROOT_SECRET\"}}")
    ROOT_TOKEN=$(_extract_token "$_fresh_ra")
    if [ -n "${DEVICE_ID:-}" ]; then
      _log "Deleting device: ${DEVICE_ID} (${DEVICE_CODE:-})"
      _store_patch_root "store/root/devices/${DEVICE_ID}" \
        '{"status":"Deleted","tombstone":1}' > /dev/null 2>&1 || true
    fi
    rm -f "$STATE_FILE" || true
    STEP_COMPLETED=0; DEVICE_ID=""; DEVICE_CODE=""; ADDRESS_ID=""; INSTALL_TOKEN=""
    WALLGUARD_VERSION="${WALLGUARD_VERSION:-}"
    _log_important "=== Clean slate -- starting fresh install ==="
  else
    load_state
    _log_important "Incomplete run detected -- auto-continuing from step ${STEP_COMPLETED} (pass --fresh to reinstall from scratch)."
  fi
fi

# ---------------------------------------------------------------------------
# Step 1 -- Authenticate (user)
# ---------------------------------------------------------------------------

_log_header "=== Step 1: Authenticate (user) ==="
_log "API host: ${_api_host}:${_api_port}  basepath: '${_api_basepath}'"
_log "Sending POST organizations/auth..."
_auth_resp=$(_auth_post "organizations/auth" \
  "{\"data\":{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}}")
_log "Auth response received ($(printf '%s' "$_auth_resp" | wc -c | tr -d ' ') bytes)"
USER_TOKEN=$(_extract_token "$_auth_resp")
_assert_field "$USER_TOKEN" "user token"
_log "User token obtained"

# ---------------------------------------------------------------------------
# Step 1b -- Authenticate (root)
# ---------------------------------------------------------------------------

_log_header "=== Step 1b: Authenticate (root) ==="
_root_resp=$(_auth_post "organizations/auth?is_root=true" \
  "{\"data\":{\"account_id\":\"root\",\"account_secret\":\"$ROOT_SECRET\"}}")
ROOT_TOKEN=$(_extract_token "$_root_resp")
_assert_field "$ROOT_TOKEN" "root token"
_log "Root token obtained"

# ---------------------------------------------------------------------------
# Auto-fetch Wallguard version
# ---------------------------------------------------------------------------

if [ -z "$WALLGUARD_VERSION" ]; then
  _log "Fetching latest Wallguard version..."
  _ver_resp=$(_store_post "store/versions/filter?no_caching=true" \
    '{"pluck":["latest_version"],"limit":1}')
  WALLGUARD_VERSION=$(_data0_str "$_ver_resp" "latest_version")
  if [ -z "$WALLGUARD_VERSION" ]; then
    _log_important "ERROR: Could not fetch Wallguard version. Specify --wallguard-version=VER manually."
    exit 1
  fi
fi
_log "Wallguard version: $WALLGUARD_VERSION"

# ---------------------------------------------------------------------------
# Step 1c -- Check if script_token is tied to an existing device
# ---------------------------------------------------------------------------

if [ -n "$SCRIPT_TOKEN" ] && [ "$STEP_COMPLETED" -lt 2 ]; then
  _log_header "=== Step 1c: Check existing device for this install token ==="
  _st_resp=$(_store_post "store/devices/filter" \
    "{\"pluck\":[\"id\",\"code\",\"status\",\"address_id\",\"device_category\",\"device_name\",\"device_type\"],\"advance_filters\":[{\"type\":\"criteria\",\"field\":\"script_token\",\"operator\":\"equal\",\"values\":[\"$SCRIPT_TOKEN\"]}],\"limit\":1}")
  _st_status=$(_data0_str "$_st_resp" "status")

  if [ "$_st_status" = "Active" ]; then
    _log_important "ERROR: A device is already Active for this install token. Aborting."
    exit 1
  elif [ "$_st_status" = "Draft" ]; then
    DEVICE_ID=$(_data0_str "$_st_resp" "id")
    DEVICE_CODE=$(_data0_str "$_st_resp" "code")
    _assert_field "$DEVICE_ID"   "device id (resumed)"
    _assert_field "$DEVICE_CODE" "device code (resumed)"
    _st_dtype=$(_data0_str "$_st_resp" "device_type")
    _st_dcat=$(_data0_str  "$_st_resp" "device_category")
    _st_addr=$(_data0_str  "$_st_resp" "address_id")
    if [ -n "$_st_dtype" ]; then
      STEP_COMPLETED=5
    elif [ -n "$_st_dcat" ]; then
      STEP_COMPLETED=4
    elif [ -n "$_st_addr" ]; then
      ADDRESS_ID="$_st_addr"
      STEP_COMPLETED=3
    else
      STEP_COMPLETED=2
    fi
    _log_important "Resuming Draft device: $DEVICE_CODE ($DEVICE_ID) -- continuing from step $((STEP_COMPLETED + 1))"
    save_state
  fi
fi

# ---------------------------------------------------------------------------
# Step 2 -- Create Draft Device
# ---------------------------------------------------------------------------

if [ "$STEP_COMPLETED" -lt 2 ]; then
  _log_header "=== Step 2: Create draft device ==="
  _create_resp=$(_store_post "store/devices?pluck=id,code" \
    "{\"status\":\"Draft\",\"script_token\":\"$SCRIPT_TOKEN\"}")
  DEVICE_ID=$(_data0_str "$_create_resp" "id")
  DEVICE_CODE=$(_data0_str "$_create_resp" "code")
  _assert_field "$DEVICE_ID"   "device id"
  _assert_field "$DEVICE_CODE" "device code"
  _log "Device ID   : $DEVICE_ID"
  _log "Device Code : $DEVICE_CODE"
  STEP_COMPLETED=2; save_state
else
  _log "Step 2 skipped -- Device: $DEVICE_CODE ($DEVICE_ID)"
fi

# ---------------------------------------------------------------------------
# Step 3 -- Create Address
# ---------------------------------------------------------------------------

if [ "$STEP_COMPLETED" -lt 3 ]; then
  _log_header "=== Step 3: Create address ==="
  _addr_resp=$(_store_post "store/addresses?pluck=id" \
    "{\"city\":\"$ADDRESS_CITY\",\"country\":\"$ADDRESS_COUNTRY\",\"country_code\":\"$ADDRESS_COUNTRY_CODE\"}")
  ADDRESS_ID=$(_data0_str "$_addr_resp" "id")
  _assert_field "$ADDRESS_ID" "address id"
  _log "Address ID  : $ADDRESS_ID"
  STEP_COMPLETED=3; save_state
else
  _log "Step 3 skipped -- Address: $ADDRESS_ID"
fi

# ---------------------------------------------------------------------------
# Step 4 -- Set device_category + address_id
# ---------------------------------------------------------------------------

if [ "$STEP_COMPLETED" -lt 4 ]; then
  _log_header "=== Step 4: Set device category and link address ==="
  _store_patch "store/devices/$DEVICE_ID" \
    "{\"device_category\":\"$DEVICE_CATEGORY\",\"address_id\":\"$ADDRESS_ID\"}" > /dev/null
  _log "Category: $DEVICE_CATEGORY  |  Address linked"
  STEP_COMPLETED=4; save_state
else
  _log "Step 4 skipped -- category/address already linked"
fi

# ---------------------------------------------------------------------------
# Step 5 -- Set device_name + device_type
# ---------------------------------------------------------------------------

if [ "$STEP_COMPLETED" -lt 5 ]; then
  _log_header "=== Step 5: Set device type and name ==="
  _store_patch "store/devices/$DEVICE_ID" \
    "{\"device_name\":\"$DEVICE_NAME\",\"device_type\":\"$DEVICE_TYPE\"}" > /dev/null
  _log "Name: $DEVICE_NAME  |  Type: $DEVICE_TYPE"
  STEP_COMPLETED=5; save_state
else
  _log "Step 5 skipped -- name/type already set"
fi

# ---------------------------------------------------------------------------
# Step 6 -- Get / create installation code
# ---------------------------------------------------------------------------

if [ "$STEP_COMPLETED" -lt 6 ]; then
  _log_header "=== Step 6: Get / create installation code ==="
  _filter_resp=$(_store_post "store/installation_codes/filter" \
    "{\"pluck\":[\"id\",\"token\"],\"advance_filters\":[{\"type\":\"criteria\",\"field\":\"device_id\",\"operator\":\"equal\",\"values\":[\"$DEVICE_ID\"]}],\"limit\":1}")
  _existing_token=$(_data0_str "$_filter_resp" "token")
  if [ -z "$_existing_token" ]; then
    _log "No existing code -- creating one..."
    _hex_token=$(od -vAn -N8 -tx1 /dev/urandom | tr -d ' \n')
    _code_resp=$(_store_post "store/installation_codes?pluck=id,token" \
      "{\"status\":\"Active\",\"device_id\":\"$DEVICE_ID\",\"device_code\":\"$DEVICE_CODE\",\"token\":\"$_hex_token\"}")
    INSTALL_TOKEN=$(_data0_str "$_code_resp" "token")
    _assert_field "$INSTALL_TOKEN" "install token"
  else
    INSTALL_TOKEN="$_existing_token"
  fi
  _log "Install token: $INSTALL_TOKEN"
  STEP_COMPLETED=6; save_state
else
  _log "Step 6 skipped -- install token: $INSTALL_TOKEN"
fi

# ---------------------------------------------------------------------------
# Step 6b -- Install Wallguard Agent (pfsense)
# ---------------------------------------------------------------------------

if [ "$STEP_COMPLETED" -lt 7 ]; then
  _log_header "=== Step 6b: Install Wallguard agent [platform: pfsense] ==="
  assert_running_as_root

  _pkg_url="https://github.com/NullNet-ai/wallguard/releases/download/v${WALLGUARD_VERSION}/wallguard-${WALLGUARD_VERSION}.pkg"
  download "$_pkg_url" "${TEMP_DIR}/wallguard.pkg"
  _log "Running: pkg add ${TEMP_DIR}/wallguard.pkg"
  pkg add "${TEMP_DIR}/wallguard.pkg"

  _log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051 --platform=pfsense"
  wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=pfsense
  sleep 1
  _log "Running: wallguard-cli version"
  wallguard-cli version
  _log "Running: wallguard-cli status"
  _wg_status=$(wallguard-cli status 2>/dev/null || printf 'Unknown')
  _log "Wallguard status: ${_wg_status}"
  if [ "${_wg_status}" != "IDLE" ]; then
    _log "Status is not IDLE -- running: wallguard-cli leave"
    wallguard-cli leave 2>&1 || true
    _log "Running: wallguard-cli stop"
    wallguard-cli stop 2>&1 || true
    _log "Running: wallguard-cli start --control-channel-url=${REMOTE_ACCESS_URL}:50051"
    wallguard-cli start --control-channel-url="${REMOTE_ACCESS_URL}:50051" --platform=pfsense
    sleep 1
  fi
  _log "Running: wallguard-cli join ${INSTALL_TOKEN}"
  wallguard-cli join "$INSTALL_TOKEN"
  _log "Wallguard agent installed and joined"
  STEP_COMPLETED=7; save_state
else
  _log "Step 6b skipped -- agent already installed"
fi

# ---------------------------------------------------------------------------
# Step 7 -- Poll until device is online
# ---------------------------------------------------------------------------

if [ "$STEP_COMPLETED" -lt 8 ]; then
  _log_header "=== Step 7: Waiting for device to come online ==="
  _elapsed=0
  _online=false
  while [ "$_elapsed" -lt "$POLL_TIMEOUT" ]; do
    _poll_resp=$(_store_post "store/devices/filter?no_caching=true" \
      "{\"pluck\":[\"id\",\"is_device_online\"],\"advance_filters\":[{\"type\":\"criteria\",\"field\":\"code\",\"operator\":\"equal\",\"values\":[\"$DEVICE_CODE\"]}],\"limit\":1}")
    _is_online=$(_data0_raw "$_poll_resp" "is_device_online")
    if [ "$_is_online" = "true" ]; then
      _online=true
      break
    fi
    _log "Not online yet -- retrying in ${POLL_INTERVAL}s... (${_elapsed}s elapsed)"
    sleep "$POLL_INTERVAL"
    _elapsed=$((_elapsed + POLL_INTERVAL))
  done
  if [ "$_online" = "false" ]; then
    _log_important "ERROR: Device did not come online within ${POLL_TIMEOUT}s. Check the Wallguard agent."
    exit 1
  fi
  _log "Device is online!"
  STEP_COMPLETED=8; save_state
else
  _log "Step 7 skipped -- device already online"
fi

# ---------------------------------------------------------------------------
# Step 8 -- Activate Device
# ---------------------------------------------------------------------------

if [ "$STEP_COMPLETED" -lt 9 ]; then
  _log_header "=== Step 8: Activate device ==="
  _store_patch_root "store/root/devices/$DEVICE_ID" '{"status":"Active"}' > /dev/null
  _log "Device set to Active"
  STEP_COMPLETED=9; save_state
else
  _log "Step 8 skipped -- device already activated"
fi

_log_header "Done. Device '${DEVICE_NAME}' is live."
_log "Device code: $DEVICE_CODE"
