param(
    [Parameter(Mandatory = $true)]
    [string]$Server,

    [Parameter(Mandatory = $true)]
    [string]$DirectiveId,

    [string]$Agent = "PC Engineering Workstation"
)

$cleanServer = $Server.TrimEnd("/")
$patchUri = "$cleanServer/api/directive/$DirectiveId"
$ackUri = "$cleanServer/api/acknowledgement"

try {
    $patchBody = @{ status = "acknowledged" } | ConvertTo-Json
    $patchResponse = Invoke-RestMethod -Method Patch -Uri $patchUri -ContentType "application/json" -Body $patchBody

    $ackBody = @{
        directiveId = $DirectiveId
        agent = $Agent
        note = "Directive acknowledged from PowerShell terminal."
    } | ConvertTo-Json
    $ackResponse = Invoke-RestMethod -Method Post -Uri $ackUri -ContentType "application/json" -Body $ackBody

    Write-Host "Directive acknowledged: $DirectiveId" -ForegroundColor Green
    $patchResponse | ConvertTo-Json -Depth 10
    $ackResponse | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Failed to acknowledge directive $DirectiveId" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
