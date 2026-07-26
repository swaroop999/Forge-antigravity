# Generate Forge app icon and splash assets for Android/iOS builds
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path $PSScriptRoot "..\assets\images"
New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null

function Save-Png {
    param(
        [int]$Width,
        [int]$Height,
        [System.Drawing.Color]$Background,
        [System.Drawing.Color]$Accent,
        [string]$Path,
        [switch]$Circle
    )

    $bmp = New-Object System.Drawing.Bitmap $Width, $Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear($Background)

    if ($Circle) {
        $margin = [Math]::Floor([Math]::Min($Width, $Height) * 0.12)
        $rect = New-Object System.Drawing.Rectangle $margin, $margin, ($Width - 2 * $margin), ($Height - 2 * $margin)
        $brush = New-Object System.Drawing.SolidBrush $Accent
        $g.FillEllipse($brush, $rect)
        $brush.Dispose()
    }

    $g.Dispose()
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created $Path"
}

$primary = [System.Drawing.Color]::FromArgb(10, 126, 164)
$lightBg = [System.Drawing.Color]::FromArgb(230, 244, 254)
$darkAccent = [System.Drawing.Color]::FromArgb(6, 95, 126)

Save-Png -Width 1024 -Height 1024 -Background $primary -Accent $darkAccent -Path (Join-Path $assetsDir "icon.png") -Circle
Save-Png -Width 1024 -Height 1024 -Background $lightBg -Accent $primary -Path (Join-Path $assetsDir "android-icon-foreground.png") -Circle
Save-Png -Width 1024 -Height 1024 -Background $lightBg -Accent $lightBg -Path (Join-Path $assetsDir "android-icon-background.png")
Save-Png -Width 1024 -Height 1024 -Background $primary -Accent $darkAccent -Path (Join-Path $assetsDir "android-icon-monochrome.png") -Circle
Save-Png -Width 200 -Height 200 -Background ([System.Drawing.Color]::White) -Accent $primary -Path (Join-Path $assetsDir "splash-icon.png") -Circle
Save-Png -Width 48 -Height 48 -Background $primary -Accent $darkAccent -Path (Join-Path $assetsDir "favicon.png") -Circle

Write-Host "All assets generated in $assetsDir"
