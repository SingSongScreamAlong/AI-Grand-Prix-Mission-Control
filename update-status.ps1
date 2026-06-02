param(
    [Parameter(Mandatory = $true)]
    [string]$Server,

    [ValidateSet("green", "yellow", "red")]
    [string]$ProjectHealth,

    [string]$BuildStatus,

    [string]$TestStatus,

    [string]$BestLapTime,

    [string]$AverageLapTime,

    [string]$CrashRate,

    [string]$CompletionRate,

    [string]$ActiveBranch,

    [string]$LastCommit,

    [string[]]$CurrentBlockers,

    [string]$LastUpdate
)

$cleanServer = $Server.TrimEnd("/")
$uri = "$cleanServer/api/status-update"
$payload = @{}

if ($ProjectHealth) { $payload.projectHealth = $ProjectHealth }
if ($BuildStatus) { $payload.buildStatus = $BuildStatus }
if ($TestStatus) { $payload.testStatus = $TestStatus }
if ($BestLapTime) { $payload.bestLapTime = $BestLapTime }
if ($AverageLapTime) { $payload.averageLapTime = $AverageLapTime }
if ($CrashRate) { $payload.crashRate = $CrashRate }
if ($CompletionRate) { $payload.completionRate = $CompletionRate }
if ($ActiveBranch) { $payload.activeBranch = $ActiveBranch }
if ($LastCommit) { $payload.lastCommit = $LastCommit }
if ($CurrentBlockers) { $payload.currentBlockers = $CurrentBlockers }
if ($LastUpdate) { $payload.lastUpdate = $LastUpdate }

if ($payload.Count -eq 0) {
    Write-Host "No status fields provided. Nothing to send." -ForegroundColor Yellow
    exit 1
}

$body = $payload | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body $body
    Write-Host "Status update sent successfully to $uri" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Failed to send status update to $uri" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
