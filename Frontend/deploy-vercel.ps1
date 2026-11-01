
$ErrorActionPreference = "Stop"

# Existing Vercel project details
$ProjectId = Read-Host "Enter Vercel Project ID"
$ProjectName = Read-Host "Enter Vercel Project Name"
$TeamId = Read-Host "Enter Team ID (press Enter for personal account)"

# Read token securely
$SecureToken = Read-Host "Enter Vercel Bearer Token" -AsSecureString
$BSTR = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureToken)
$Token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)

$Headers = @{
    Authorization = "Bearer $Token"
}

$Root = (Get-Location).Path
$Excluded = @("node_modules", ".git", ".vercel", "dist", "build", ".next")

# Collect source files, excluding secrets and generated files
$Files = Get-ChildItem $Root -Recurse -File -Force |
    Where-Object {
        $relative = $_.FullName.Substring($Root.Length).TrimStart('\')
        $parts = $relative -split '[\\/]'

        ($parts | Where-Object { $Excluded -contains $_ }).Count -eq 0 -and
        $_.Name -notlike ".env*" -and
        $_.Name -ne "deploy-vercel.ps1"
    }

$TotalBytes = ($Files | Measure-Object Length -Sum).Sum
Write-Host "Files to upload: $($Files.Count)"
Write-Host "Total size: $([math]::Round($TotalBytes / 1MB, 2)) MB"

$confirm = Read-Host "Continue with upload? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Deployment cancelled."
    exit
}

$Query = ""
if ($TeamId) {
    $Query = "?teamId=$([uri]::EscapeDataString($TeamId))"
}

$UploadUrl = "https://api.vercel.com/v2/files$Query"
$DeploymentUrl = "https://api.vercel.com/v13/deployments$Query"

$DeploymentFiles = @()

foreach ($File in $Files) {
    $RelativePath = $File.FullName.Substring($Root.Length).
        TrimStart('\').Replace('\', '/')

    $Bytes = [System.IO.File]::ReadAllBytes($File.FullName)

    $SHA = [System.Security.Cryptography.SHA1]::Create()
    try {
        $DigestBytes = $SHA.ComputeHash($Bytes)
        $Digest = [BitConverter]::ToString($DigestBytes).Replace("-", "").ToLower()
    }
    finally {
        $SHA.Dispose()
    }

    Write-Host "Uploading: $RelativePath"

    Invoke-WebRequest `
        -Uri $UploadUrl `
        -Method POST `
        -Headers @{
            Authorization = "Bearer $Token"
            "x-vercel-digest" = $Digest
        } `
        -ContentType "application/octet-stream" `
        -Body $Bytes | Out-Null

    $DeploymentFiles += @{
        file = $RelativePath
        sha = $Digest
        size = $Bytes.Length
    }
}

Write-Host "All files uploaded. Creating production deployment..."

$Body = @{
    name = $ProjectName
    project = $ProjectId
    target = "production"
    files = $DeploymentFiles
} | ConvertTo-Json -Depth 20

try {
    $Result = Invoke-RestMethod `
        -Uri $DeploymentUrl `
        -Method POST `
        -Headers $Headers `
        -ContentType "application/json" `
        -Body $Body

    Write-Host "Deployment created!"
    Write-Host "Deployment URL: https://$($Result.url)"
    Write-Host "Deployment ID: $($Result.id)"
    Write-Host "State: $($Result.readyState)"
}
finally {
    $Token = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}
