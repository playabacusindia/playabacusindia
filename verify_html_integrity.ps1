$files = Get-ChildItem -Path . -Recurse -Filter *.html
$issueCount = 0
$logFile = "$PSScriptRoot\verification_results.txt"
"System-Wide HTML Integrity Check Report - $(Get-Date)" | Set-Content $logFile

Write-Host "Starting System-Wide HTML Integrity Check (Logging to $logFile)..." -ForegroundColor Cyan

foreach ($file in $files) {
    if ($file.FullName -match "node_modules") { continue } # Skip node_modules if any

    $content = Get-Content $file.FullName -Raw
    
    # 1. Check for suspicious content in <head>
    if ($content -match '(?si)<head>.*?(<textarea|<div|<form|<body).*?</head>') {
        "CORRUPTION: $($file.FullName) -> Suspicious content (div/textarea/form/body) in <head>" | Add-Content $logFile
        $issueCount++
    }

    # 2. Check for Multiple tags
    $htmlCount = ([regex]'(?i)<html\b').Matches($content).Count
    $headCount = ([regex]'(?i)<head\b').Matches($content).Count
    $bodyCount = ([regex]'(?i)<body\b').Matches($content).Count

    if ($htmlCount -gt 1) {
        "WARNING: $($file.FullName) -> $htmlCount <html> tags" | Add-Content $logFile
        $issueCount++
    }
    if ($headCount -gt 1) {
        "WARNING: $($file.FullName) -> $headCount <head> tags" | Add-Content $logFile
        $issueCount++
    }
    if ($bodyCount -gt 1) {
        "WARNING: $($file.FullName) -> $bodyCount <body> tags" | Add-Content $logFile
        $issueCount++
    }
}

"Scan Complete. Total Issues: $issueCount" | Add-Content $logFile
Write-Host "Scan Complete. See $logFile for details." -ForegroundColor Green
