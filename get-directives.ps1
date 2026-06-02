param(
    [Parameter(Mandatory = $true)]
    [string]$Server
)

$cleanServer = $Server.TrimEnd("/")
$uri = "$cleanServer/api/directives/current"

try {
    $directive = Invoke-RestMethod -Method Get -Uri $uri

    if ($null -eq $directive) {
        Write-Host "No active directive." -ForegroundColor Yellow
        exit 0
    }

    Write-Host "CURRENT TEAM DIRECTIVE" -ForegroundColor Cyan
    Write-Host "======================"
    Write-Host "ID: $($directive.id)"
    Write-Host "Issued By: $($directive.issuedBy)"
    Write-Host "Timestamp: $($directive.timestamp)"
    Write-Host "Priority: $($directive.priority)"
    Write-Host "Scope: $($directive.scope)"
    Write-Host "Status: $($directive.status)"
    Write-Host ""
    Write-Host "Title: $($directive.title)" -ForegroundColor Green
    Write-Host "Objective: $($directive.objective)"
    Write-Host "Instructions: $($directive.instructions)"
    Write-Host "Success Criteria: $($directive.successCriteria)"
}
catch {
    Write-Host "Failed to fetch current directive from $uri" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
