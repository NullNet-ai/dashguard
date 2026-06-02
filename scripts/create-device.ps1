<#
.SYNOPSIS
    create-device.ps1 — Windows device installer for Dashguard.
.DESCRIPTION
    End-to-end script that creates a Dashguard device via the Nullnet Datastore
    API and installs the Wallguard agent on Windows without requiring Git Bash.
    Run from an elevated PowerShell session (Run as Administrator).
.NOTES
    Requirements: PowerShell 5.1+, Windows 10/11, Administrator rights, internet access.
.EXAMPLE
    # Paste the one-time command from the Install Device dialog:
    Set-ExecutionPolicy Bypass -Scope Process -Force; irm 'https://app.example.com/api/scripts/create-device?token=abc&format=ps1' | iex
#>

[CmdletBinding()]
param(
    [string]$DeviceName         = '',
    [string]$DeviceCategory     = '',
    [string]$DeviceType         = '',
    [string]$AddressCity        = '',
    [string]$AddressCountry     = '',
    [string]$AddressCountryCode = '',
    [string]$WallguardVersion   = '',
    [string]$StoreUrl           = '',
    [string]$RemoteAccessUrl    = '',
    [int]   $PollInterval       = 3,
    [int]   $PollTimeout        = 300
)

# ---------------------------------------------------------------------------
# Credential placeholders — injected at serve time by the Dashguard API
# ---------------------------------------------------------------------------
$Script:Email      = ""
$Script:Password   = ""
$Script:RootSecret = ""

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
if (-not $StoreUrl)        { $StoreUrl        = 'https://store.appguard.ai' }
if (-not $RemoteAccessUrl) { $RemoteAccessUrl = 'wallguard-proxy.appguard.ai' }

$Script:API       = "$StoreUrl/api"
$Script:UserToken = ''
$Script:RootToken = ''

$ErrorActionPreference = 'Stop'

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
function Write-Log {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [create-device] $Message"
}

function Write-LogHeader {
    param([string]$Message)
    Write-Host ''
    Write-Host $Message
    Write-Host ''
}

function Write-LogImportant {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [create-device] ---> $Message" -ForegroundColor Yellow
}

# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------
function Invoke-StorePost {
    param([string]$Path, [hashtable]$Body)
    $json = $Body | ConvertTo-Json -Depth 10 -Compress
    try {
        return Invoke-RestMethod -Method Post `
            -Uri "$Script:API/$Path" `
            -ContentType 'application/json' `
            -Headers @{ Authorization = "Bearer $Script:UserToken" } `
            -Body $json
    } catch {
        Write-LogImportant "ERROR: POST $Path failed: $_"
        exit 1
    }
}

function Invoke-StorePatch {
    param([string]$Path, [hashtable]$Body)
    $json = $Body | ConvertTo-Json -Depth 10 -Compress
    try {
        Invoke-RestMethod -Method Patch `
            -Uri "$Script:API/$Path" `
            -ContentType 'application/json' `
            -Headers @{ Authorization = "Bearer $Script:UserToken" } `
            -Body $json | Out-Null
    } catch {
        Write-LogImportant "ERROR: PATCH $Path failed: $_"
        exit 1
    }
}

function Invoke-StorePatchRoot {
    param([string]$Path, [hashtable]$Body)
    $json = $Body | ConvertTo-Json -Depth 10 -Compress
    try {
        Invoke-RestMethod -Method Patch `
            -Uri "$Script:API/$Path" `
            -ContentType 'application/json' `
            -Headers @{ Authorization = "Bearer $Script:RootToken" } `
            -Body $json | Out-Null
    } catch {
        Write-LogImportant "ERROR: PATCH (root) $Path failed: $_"
        exit 1
    }
}

function Invoke-Download {
    param([string]$Url, [string]$Dest)
    Write-Log "Downloading: $Url"
    try {
        Invoke-WebRequest -Uri $Url -OutFile $Dest -UseBasicParsing
    } catch {
        Write-LogImportant "ERROR: Download failed: $Url — $_"
        exit 1
    }
    $size = (Get-Item $Dest).Length
    if ($size -eq 0) {
        Write-LogImportant "Downloaded file is 0 bytes — check the URL: $Url"
        exit 1
    }
    Write-Log "Downloaded $(Split-Path $Dest -Leaf) ($size bytes)"
}

# ---------------------------------------------------------------------------
# Credential prompts (if not injected)
# ---------------------------------------------------------------------------
if (-not $Script:Email) {
    $Script:Email = Read-Host 'Org email'
}

if (-not $Script:Password) {
    $secure = Read-Host 'Org password' -AsSecureString
    $Script:Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

if (-not $Script:RootSecret) {
    $secure = Read-Host 'Root secret' -AsSecureString
    $Script:RootSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

# ---------------------------------------------------------------------------
# Auto-detect device info
# ---------------------------------------------------------------------------
if (-not $DeviceName) {
    $DeviceName = $env:COMPUTERNAME
    Write-Log "Auto-detected device name: $DeviceName"
}
if (-not $DeviceCategory) { $DeviceCategory = 'Appguard Client' }
if (-not $DeviceType)     { $DeviceType     = 'Windows' }

if (-not $AddressCity -or -not $AddressCountry -or -not $AddressCountryCode) {
    try {
        $pubIp = (Invoke-RestMethod -Uri 'https://ifconfig.io' -TimeoutSec 10) -replace '\s', ''
        $geo   = Invoke-RestMethod -Uri "http://ip-api.com/json/$pubIp" -TimeoutSec 10
        if (-not $AddressCity)        { $AddressCity        = $geo.city }
        if (-not $AddressCountry)     { $AddressCountry     = $geo.country }
        if (-not $AddressCountryCode) { $AddressCountryCode = $geo.countryCode }
        Write-Log "Auto-detected address: $AddressCity, $AddressCountry ($AddressCountryCode)"
    } catch {
        Write-LogImportant "Could not auto-detect address — use -AddressCity / -AddressCountry / -AddressCountryCode"
    }
}

$TempDir = Join-Path $env:TEMP "wallguard-$(Get-Random)"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# ---------------------------------------------------------------------------
# Step 1 — Authenticate (user)
# ---------------------------------------------------------------------------
Write-LogHeader '=== Step 1: Authenticate (user) ==='
$authBody = @{ data = @{ email = $Script:Email; password = $Script:Password } }
try {
    $authResp = Invoke-RestMethod -Method Post `
        -Uri "$Script:API/organizations/auth" `
        -ContentType 'application/json' `
        -Body ($authBody | ConvertTo-Json -Depth 5 -Compress)
} catch { Write-LogImportant "ERROR: User auth failed: $_"; exit 1 }

$Script:UserToken = if ($authResp.data.token)        { $authResp.data.token }
                    elseif ($authResp.data.access_token) { $authResp.data.access_token }
                    else                               { $authResp.token }
if (-not $Script:UserToken) { Write-LogImportant 'ERROR: No user token in auth response'; exit 1 }
Write-Log 'User token obtained'

Write-LogHeader '=== Step 1b: Authenticate (root) ==='
$rootBody = @{ data = @{ account_id = 'root'; account_secret = $Script:RootSecret } }
try {
    $rootResp = Invoke-RestMethod -Method Post `
        -Uri "$Script:API/organizations/auth?is_root=true" `
        -ContentType 'application/json' `
        -Body ($rootBody | ConvertTo-Json -Depth 5 -Compress)
} catch { Write-LogImportant "ERROR: Root auth failed: $_"; exit 1 }

$Script:RootToken = if ($rootResp.data.token)        { $rootResp.data.token }
                    elseif ($rootResp.data.access_token) { $rootResp.data.access_token }
                    else                               { $rootResp.token }
if (-not $Script:RootToken) { Write-LogImportant 'ERROR: No root token in auth response'; exit 1 }
Write-Log 'Root token obtained'

if (-not $WallguardVersion) {
    Write-Log 'Fetching latest Wallguard version...'
    $verResp = Invoke-StorePost 'store/versions/filter?no_caching=true' @{ pluck = @('latest_version'); limit = 1 }
    $WallguardVersion = $verResp.data[0].latest_version
    if (-not $WallguardVersion) {
        Write-LogImportant 'ERROR: Could not fetch Wallguard version. Use -WallguardVersion parameter.'
        exit 1
    }
    Write-Log "Wallguard version: $WallguardVersion"
}

# ---------------------------------------------------------------------------
# Step 2 — Create Draft Device
# ---------------------------------------------------------------------------
Write-LogHeader '=== Step 2: Create draft device ==='
$createResp = Invoke-StorePost 'store/devices?pluck=id,code' @{ status = 'Draft' }
$DeviceId   = $createResp.data[0].id
$DeviceCode = $createResp.data[0].code
if (-not $DeviceId -or -not $DeviceCode) { Write-LogImportant 'ERROR: No device id/code in response'; exit 1 }
Write-Log "Device ID   : $DeviceId"
Write-Log "Device Code : $DeviceCode"

# ---------------------------------------------------------------------------
# Step 3 — Create Address
# ---------------------------------------------------------------------------
Write-LogHeader '=== Step 3: Create address ==='
$addrResp = Invoke-StorePost 'store/addresses?pluck=id' @{
    city         = $AddressCity
    country      = $AddressCountry
    country_code = $AddressCountryCode
}
$AddressId = $addrResp.data[0].id
if (-not $AddressId) { Write-LogImportant 'ERROR: No address id in response'; exit 1 }
Write-Log "Address ID  : $AddressId"

# ---------------------------------------------------------------------------
# Step 4 — Set Category + Address
# ---------------------------------------------------------------------------
Write-LogHeader '=== Step 4: Set device category and link address ==='
Invoke-StorePatch "store/devices/$DeviceId" @{ device_category = $DeviceCategory; address_id = $AddressId }
Write-Log "Category: $DeviceCategory  |  Address linked"

# ---------------------------------------------------------------------------
# Step 5 — Set Name + Type
# ---------------------------------------------------------------------------
Write-LogHeader '=== Step 5: Set device type and name ==='
Invoke-StorePatch "store/devices/$DeviceId" @{ device_name = $DeviceName; device_type = $DeviceType }
Write-Log "Name: $DeviceName  |  Type: $DeviceType"

# ---------------------------------------------------------------------------
# Step 6 — Installation Code
# ---------------------------------------------------------------------------
Write-LogHeader '=== Step 6: Get / create installation code ==='
$filterResp = Invoke-StorePost 'store/installation_codes/filter' @{
    pluck           = @('id', 'token')
    advance_filters = @(@{ type = 'criteria'; field = 'device_id'; operator = 'equal'; values = @($DeviceId) })
    limit           = 1
}
$InstallToken = $filterResp.data[0].token

if (-not $InstallToken) {
    Write-Log 'No existing code — creating one...'
    $hexToken = -join ((1..8) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
    $codeResp     = Invoke-StorePost 'store/installation_codes?pluck=id,token' @{
        status      = 'Active'
        device_id   = $DeviceId
        device_code = $DeviceCode
        token       = $hexToken
    }
    $InstallToken = $codeResp.data[0].token
    if (-not $InstallToken) { Write-LogImportant 'ERROR: No install token in response'; exit 1 }
}
Write-Log "Install token: $InstallToken"

# ---------------------------------------------------------------------------
# Step 6b — Install Wallguard Agent (Windows)
# ---------------------------------------------------------------------------
Write-LogHeader '=== Step 6b: Install Wallguard agent  [platform: windows] ==='

$NpcapExe   = Join-Path $TempDir 'npcap.exe'
$VcRedist   = Join-Path $TempDir 'vc_redist.x64.exe'
$MsiFile    = Join-Path $TempDir "wallguard-${WallguardVersion}-x86_64.msi"
$MsiUrl     = "https://github.com/NullNet-ai/wallguard/releases/download/v${WallguardVersion}/wallguard-${WallguardVersion}-x86_64.msi"
$ControlUrl = "${RemoteAccessUrl}:50051"

Write-Log 'Installing NPCAP...'
Invoke-Download 'https://npcap.com/dist/npcap-1.80.exe' $NpcapExe
Write-Log 'Running NPCAP installer...'
Start-Process -FilePath $NpcapExe -Wait

Write-Log 'Installing VC Runtime...'
Invoke-Download 'https://aka.ms/vs/17/release/vc_redist.x64.exe' $VcRedist
Write-Log 'Running VC Runtime installer...'
Start-Process -FilePath $VcRedist -ArgumentList '/install', '/quiet', '/norestart' -Wait

Write-Log 'Installing WallGuard MSI...'
Invoke-Download $MsiUrl $MsiFile
Write-Log 'Running MSI installer...'
Start-Process -FilePath 'msiexec.exe' -ArgumentList "/i `"$MsiFile`"", '/quiet', '/wait' -Wait

Write-Log "Running: wallguard-cli start --control-channel-url=$ControlUrl --platform=generic"
& wallguard-cli start --control-channel-url=$ControlUrl --platform=generic
Start-Sleep -Seconds 1

Write-Log 'Running: wallguard-cli version'
& wallguard-cli version

$wgStatus = (& wallguard-cli status 2>$null) -replace '\s', ''
Write-Log "Wallguard status: $wgStatus"

if ($wgStatus -ne 'IDLE') {
    Write-Log 'Status not IDLE — running: wallguard-cli leave'
    & wallguard-cli leave 2>$null
    Write-Log 'Running: wallguard-cli stop'
    & wallguard-cli stop 2>$null
    Write-Log "Running: wallguard-cli start --control-channel-url=$ControlUrl"
    & wallguard-cli start --control-channel-url=$ControlUrl --platform=generic
    Start-Sleep -Seconds 1
}

Write-Log "Running: wallguard-cli join $InstallToken"
& wallguard-cli join $InstallToken
Write-Log 'Wallguard agent installed and joined'

Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue

# ---------------------------------------------------------------------------
# Step 7 — Poll until online
# ---------------------------------------------------------------------------
Write-LogHeader '=== Step 7: Waiting for device to come online ==='
$elapsed = 0
$online  = $false

while ($elapsed -lt $PollTimeout) {
    $pollResp = Invoke-StorePost 'store/devices/filter?no_caching=true' @{
        pluck           = @('id', 'is_device_online')
        advance_filters = @(@{ type = 'criteria'; field = 'code'; operator = 'equal'; values = @($DeviceCode) })
        limit           = 1
    }
    if ($pollResp.data[0].is_device_online -eq $true) { $online = $true; break }
    Write-Log "Not online yet — retrying in ${PollInterval}s... (${elapsed}s elapsed)"
    Start-Sleep -Seconds $PollInterval
    $elapsed += $PollInterval
}

if (-not $online) {
    Write-LogImportant "ERROR: Device did not come online within ${PollTimeout}s. Check the Wallguard agent."
    exit 1
}
Write-Log 'Device is online!'

# ---------------------------------------------------------------------------
# Step 8 — Activate Device
# ---------------------------------------------------------------------------
Write-LogHeader '=== Step 8: Activate device ==='
Invoke-StorePatchRoot "store/root/devices/$DeviceId" @{ status = 'Active' }
Write-Log 'Device set to Active'

Write-LogHeader "Done. Device '$DeviceName' is live."
Write-Log "Device code: $DeviceCode"
