param(
    [Parameter(Mandatory = $true)]
    [string]$Server,

    [Parameter(Mandatory = $true)]
    [string]$Agent,

    [Parameter(Mandatory = $true)]
    [ValidateSet("idle", "working", "testing", "blocked", "done")]
    [string]$Status,

    [Parameter(Mandatory = $true)]
    [string]$Task,

    [Parameter(Mandatory = $true)]
    [string]$Note,

    [Parameter(Mandatory = $true)]
    [ValidateSet("low", "medium", "high")]
    [string]$Risk
)

$cleanServer = $Server.TrimEnd("/")
$uri = "$cleanServer/api/agent-update"

$body = @{
    agent = $Agent
    status = $Status
    task = $Task
    note = $Note
    risk = $Risk
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Method Post -Uri $uri -ContentType "application/json" -Body $body
    Write-Host "Update sent successfully to $uri" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Failed to send update to $uri" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
