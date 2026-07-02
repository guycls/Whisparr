#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$ImageName = if ($env:WHISPARR_IMAGE) { $env:WHISPARR_IMAGE } else { 'whisparr:local' }
$Platform = if ($env:DOCKER_PLATFORM) { $env:DOCKER_PLATFORM } else { 'linux/amd64' }
$Version = if ($env:WHISPARR_VERSION) { $env:WHISPARR_VERSION } else { '0.0.0-local' }
$VersionBranch = if ($env:WHISPARR_VERSION_BRANCH) { $env:WHISPARR_VERSION_BRANCH } else { 'develop' }

# Match the repo's actual TargetFramework (see src/NzbDrone.Console/Whisparr.Console.csproj).
# Dockerfile defaults to net10.0 for forward compatibility; the script passes the working TFM.
$DotnetFramework = if ($env:DOTNET_FRAMEWORK) { $env:DOTNET_FRAMEWORK } else { 'net6.0' }
$DotnetRuntime = if ($env:DOTNET_RUNTIME) { $env:DOTNET_RUNTIME } else { 'linux-musl-x64' }
$PublishProject = if ($env:DOTNET_PUBLISH_PROJECT) { $env:DOTNET_PUBLISH_PROJECT } else { 'src/NzbDrone.Console/Whisparr.Console.csproj' }

# hotio init-setup base64-decodes IMAGE_STATS; "0" causes startup failure.
function New-ImageStatsBase64 {
    param(
        [string]$Image,
        [string]$Version
    )

    $stats = @{
        app      = 'whisparr'
        image    = $Image
        revision = 'local'
        version  = $Version
    } | ConvertTo-Json -Compress

    return [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($stats))
}

$ImageStats = if ($env:IMAGE_STATS) { $env:IMAGE_STATS } else { New-ImageStatsBase64 -Image $ImageName -Version $Version }

Write-Host "Building $ImageName (platform: $Platform, version: $Version)..." -ForegroundColor Cyan
Write-Host "  backend: $PublishProject ($DotnetFramework, $DotnetRuntime)" -ForegroundColor Cyan

# Avoid stale intermediate assets on the host being picked up by bind mounts or local tooling.
foreach ($dir in @('_output', '_tests', '_temp')) {
    $path = Join-Path $RepoRoot $dir
    if (Test-Path -LiteralPath $path) {
        Write-Host "Removing stale $dir..." -ForegroundColor Yellow
        Remove-Item -LiteralPath $path -Recurse -Force
    }
}

Push-Location $RepoRoot
try {
    docker build `
        --platform $Platform `
        --build-arg "DOTNET_FRAMEWORK=$DotnetFramework" `
        --build-arg "DOTNET_RUNTIME=$DotnetRuntime" `
        --build-arg "DOTNET_PUBLISH_PROJECT=$PublishProject" `
        --build-arg "VERSION=$Version" `
        --build-arg "VERSION_BRANCH=$VersionBranch" `
        --build-arg "IMAGE_STATS=$ImageStats" `
        -t $ImageName `
        -f Dockerfile `
        .

    if ($LASTEXITCODE -ne 0) {
        throw "docker build failed with exit code $LASTEXITCODE"
    }

    Write-Host "Built $ImageName successfully." -ForegroundColor Green
}
finally {
    Pop-Location
}
