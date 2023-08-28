param (
    [Parameter(Position = 0, Mandatory = $true, HelpMessage = "Specify the working directory path.")]
    [string]$WorkingDirectory
)
Set-Location $WorkingDirectory;

$configContent = Get-Content -Path src\\srv-configs\\config.json -RAW; # CONFIG FILE THAT CONTAINS HTTP PORT as "portHttp"
$config = $configContent | ConvertFrom-Json;

$portHttp  = $config.portHttp;
$portHttps = $config.portHttps;

$url = "http://localhost:$portHttp";
Write-Output "Starting browser-sync with url: $url";

Start-Sleep -Milliseconds 4500;
browser-sync start --proxy $url --files=**/*  --ignore=node_modules --no-ui --no-inject-changes --no-open
