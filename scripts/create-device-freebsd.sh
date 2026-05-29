#!/bin/sh
# create-device-freebsd.sh
#
# FreeBSD / pfSense bootstrapper for the Dashguard device installer.
# Run as root from the pfSense CLI shell.
#
# This script:
#   1. Installs bash, curl, jq, and python3 via pkg (if any are missing)
#   2. Downloads the one-time install script from SCRIPT_URL into a temp file
#   3. Executes it with bash, forwarding all remaining arguments
#   4. Removes the temp file on exit
#
# Usage:
#   sh create-device-freebsd.sh 'SCRIPT_URL' [OPTIONS]
#
# SCRIPT_URL is the one-time install URL shown in the Install Device dialog.
# All OPTIONS after SCRIPT_URL are forwarded to create-device.sh unchanged.
#
# Examples:
#   sh create-device-freebsd.sh 'https://app.example.com/api/scripts/create-device?token=abc123'
#   sh create-device-freebsd.sh 'https://...' --device-name=Firewall-01

set -e

SCRIPT_URL="${1:-}"

if [ -z "$SCRIPT_URL" ]; then
  printf 'Usage: sh %s SCRIPT_URL [OPTIONS]\n\n' "$(basename "$0")"
  printf 'SCRIPT_URL is the one-time install URL from the Install Device dialog.\n'
  exit 1
fi

shift  # remaining positional args forwarded to the main script below

# ---------------------------------------------------------------------------
# Ensure required tools are installed
# ---------------------------------------------------------------------------

_ensure_pkg() {
  _tool="$1"
  _pkg="${2:-$1}"
  if ! command -v "$_tool" >/dev/null 2>&1; then
    printf '==> Installing %s via pkg...\n' "$_pkg"
    pkg install -y "$_pkg" || {
      printf 'ERROR: failed to install %s. Install it manually and re-run.\n' "$_pkg" >&2
      exit 1
    }
  fi
}

_ensure_pkg bash bash
_ensure_pkg curl curl
_ensure_pkg jq   jq
_ensure_pkg python3 python3

# ---------------------------------------------------------------------------
# Download and run the installer
# ---------------------------------------------------------------------------

TMPFILE=$(mktemp /tmp/create-device.XXXXXX.sh)
_cleanup() { rm -f "$TMPFILE"; }
trap _cleanup EXIT INT TERM

printf '==> Downloading installer...\n'
curl -fsSL --retry 3 --retry-delay 5 "$SCRIPT_URL" -o "$TMPFILE" || {
  printf 'ERROR: failed to download installer from %s\n' "$SCRIPT_URL" >&2
  exit 1
}

# Verify the download is non-empty
_size=$(wc -c < "$TMPFILE" | tr -d ' ')
if [ "$_size" -eq 0 ]; then
  printf 'ERROR: downloaded file is empty — check the URL or token expiry.\n' >&2
  exit 1
fi

printf '==> Running installer (platform: pfsense)...\n'
exec bash "$TMPFILE" --platform=pfsense "$@"
