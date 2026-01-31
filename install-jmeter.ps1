# PowerShell Script to Download and Install Apache JMeter

Write-Host "SSC Voting System - JMeter Installation Script" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Configuration
$jmeterVersion = "5.6.3"
$downloadUrl = "https://downloads.apache.org//jmeter/binaries/apache-jmeter-$jmeterVersion.zip"
$installPath = "C:\apache-jmeter-$jmeterVersion"
$zipPath = "$env:TEMP\apache-jmeter-$jmeterVersion.zip"

# Check if JMeter is already installed
if (Test-Path $installPath) {
    Write-Host "JMeter is already installed at: $installPath" -ForegroundColor Yellow
    $choice = Read-Host "Do you want to reinstall? (y/n)"
    if ($choice -ne "y") {
        Write-Host "Installation cancelled." -ForegroundColor Red
        exit 0
    }
}

# Create installation directory
New-Item -ItemType Directory -Force -Path $installPath | Out-Null

# Download JMeter
Write-Host "Downloading JMeter $jmeterVersion..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "Download completed successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to download JMeter: $_" -ForegroundColor Red
    exit 1
}

# Extract JMeter
Write-Host "Extracting JMeter to $installPath..." -ForegroundColor Cyan
try {
    Expand-Archive -Path $zipPath -DestinationPath $installPath -Force
    Write-Host "Extraction completed successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed to extract JMeter: $_" -ForegroundColor Red
    exit 1
}

# Clean up
Remove-Item $zipPath -Force

# Set environment variables
$jmeterBinPath = "$installPath\apache-jmeter-$jmeterVersion\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$jmeterBinPath*") {
    [Environment]::SetEnvironmentVariable("PATH", $currentPath + ";$jmeterBinPath", "User")
    Write-Host "Added JMeter to PATH environment variable." -ForegroundColor Green
}

# Create desktop shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\JMeter.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$jmeterBinPath\jmeter.bat"
$shortcut.WorkingDirectory = $jmeterBinPath
$shortcut.Description = "Apache JMeter Performance Testing Tool"
$shortcut.Save()

Write-Host "JMeter installation completed successfully!" -ForegroundColor Green
Write-Host "Installation path: $installPath" -ForegroundColor Green
Write-Host "Desktop shortcut created: $shortcutPath" -ForegroundColor Green
Write-Host "You can now start JMeter from the desktop shortcut or run: jmeter" -ForegroundColor Green
