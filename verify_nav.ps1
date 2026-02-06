# PowerShell Script to Verify Navbar Links

$projectRoot = Get-Location
$headerRegex = '(?s)(<header id="header">.*?</header>)'
# Regex to find src="..." and href="..."
$linkPattern = '\b(src|href)=("|'')([^"''\s]*)("|'')'

$errorCount = 0
$filesChecked = 0

Write-Host "Starting Link Verification..."

# Get all HTML files
$files = Get-ChildItem -Path $projectRoot -Recurse -Filter "*.html"

foreach ($file in $files) {
    $filesChecked++
    
    # Skip .git and other hidden dirs
    if ($file.FullName -match '\\\.') {
        continue
    }

    try {
        $content = Get-Content $file.FullName -Raw
        
        # Only check links WITHIN the header
        if ($content -match $headerRegex) {
            $headerContent = $matches[0]
            
            # Find all links in the header
            $links = [Regex]::Matches($headerContent, $linkPattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            
            foreach ($match in $links) {
                $url = $match.Groups[3].Value
                
                # Skip external links, anchors, mailto, tel, javascript
                if ($url -match '^(http:|https:|//|#|mailto:|tel:|javascript:|data:)') {
                    continue
                }
                
                # Construct combined path
                # Note: This handles standard relative paths like "../images/logo.png"
                $targetPath = $null
                try {
                    # Resolve relative path manually to handle '..' safely for checking
                    $targetPath = Join-Path $file.DirectoryName $url -Resolve -ErrorAction SilentlyContinue
                }
                catch {
                    # If Join-Path fails (e.g. invalid characters), targetPath remains null
                }

                # If Resolve failed (file might not exist), try simple join and let Test-Path check it
                if (-not $targetPath) {
                    $simplePath = Join-Path $file.DirectoryName $url
                    if (-not (Test-Path $simplePath)) {
                        Write-Host "BROKEN LINK: '$url'" -ForegroundColor Red
                        Write-Host "  In File: $($file.Name)" -ForegroundColor Yellow
                        Write-Host "  Expected at: $simplePath" -ForegroundColor Gray
                        $errorCount++
                    }
                }
            }
        }
        else {
            Write-Warning "No <header> found in $($file.Name)"
        }

    }
    catch {
        Write-Error "Error processing $($file.Name): $_"
    }
}

Write-Host "Verification Complete."
Write-Host "Files Checked: $filesChecked"
Write-Host "Broken Links Found: $errorCount"

if ($errorCount -eq 0) {
    Write-Host "SUCCESS: All local navbar links are valid." -ForegroundColor Green
}
else {
    Write-Host "FAILURE: Found broken links." -ForegroundColor Red
}
