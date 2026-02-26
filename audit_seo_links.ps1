# audit_seo_links.ps1
$ErrorActionPreference = "SilentlyContinue"

$rootDir = Get-Location
$htmlFiles = Get-ChildItem -Path $rootDir -Filter *.html -Recurse
$reportFile = Join-Path $rootDir "audit_report.csv"

$results = New-Object System.Collections.Generic.List[PSObject]

Write-Host "Starting Audit of $($htmlFiles.Count) HTML files..."

foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Substring($rootDir.Path.Length + 1)
    $content = Get-Content $file.FullName -Raw
    
    # Extract Title
    $title = ""
    if ($content -match '<title>(.*?)</title>') {
        $title = $matches[1].Trim()
    }
    
    # Extract Description
    $description = ""
    if ($content -match '<meta\s+name=["'']description["'']\s+content=["''](.*?)["'']') {
        $description = $matches[1].Trim()
    }
    
    # Extract Canonical
    $canonical = ""
    if ($content -match '<link\s+rel=["'']canonical["'']\s+href=["''](.*?)["'']') {
        $canonical = $matches[1].Trim()
    }

    # Extract Links and Check for 404s
    # This regex is a bit simple but should work for most internal links
    $linkMatches = [regex]::Matches($content, '<a\s+[^>]*href=["''](?!(?:http|https|//|#|mailto:|tel:))([^"'']+)["'']')
    $brokenLinks = @()
    
    foreach ($match in $linkMatches) {
        $linkPath = $match.Groups[1].Value
        
        # Resolve target path relative to current file
        $fileDir = Split-Path $file.FullName
        $targetPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($fileDir, $linkPath))
        
        # If it ends in /, look for index.html (common in web servers, though this project seems to use .html explicitly)
        if ($targetPath.EndsWith("\")) {
            $targetPath = Join-Path $targetPath "index.html"
        }
        
        if (-not (Test-Path $targetPath)) {
            $brokenLinks += $linkPath
        }
    }
    
    $obj = [PSCustomObject]@{
        Full_Path    = $file.FullName
        File         = $relativePath
        Title        = $title
        Description  = $description
        Canonical    = $canonical
        Broken_Links = ($brokenLinks -join "; ")
        Link_Status  = if ($brokenLinks.Count -gt 0) { "BROKEN" } else { "OK" }
    }
    $results.Add($obj)
}

$results | Export-Csv -Path $reportFile -NoTypeInformation
Write-Host "Audit complete! Report saved to audit_report.csv"
