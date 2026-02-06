# standardize_nav_v2.ps1
$ErrorActionPreference = "Stop"

# Configuration
$rootDir = Get-Location
$sourceFile = Join-Path $rootDir "index.html"
$headerStartTag = '<header id="header">'
$headerEndTag = '</header>'

# Read Source Header
Write-Host "Reading source header from $sourceFile..."
if (-not (Test-Path $sourceFile)) {
    Write-Error "Source file index.html not found!"
}

$indexContent = Get-Content $sourceFile -Raw
$headerStartRegex = [regex]'(?i)<header\s+id=["'']header["''].*?>'
$headerEndRegex = [regex]'(?i)</header>'

$startIndexMatch = $headerStartRegex.Match($indexContent)
$endIndexMatch = $headerEndRegex.Match($indexContent, $startIndexMatch.Index)

if (-not $startIndexMatch.Success -or -not $endIndexMatch.Success) {
    Write-Error "Could not find <header id='header'>...</header> block in index.html using Regex"
}

$startIndex = $startIndexMatch.Index
$endIndex = $endIndexMatch.Index + $endIndexMatch.Length

$headerContent = $indexContent.Substring($startIndex, $endIndex - $startIndex)

Write-Host "Header content extracted ($($headerContent.Length) chars)."

# Function to adjust links
function Adjust-HeaderContent {
    param (
        [string]$Content,
        [int]$Depth
    )

    if ($Depth -eq 0) {
        return $Content
    }

    $prefix = "../" * $Depth
    
    # Regex to find href/src attributes that are relative paths
    # We ignore absolute URLs (http, https, //) and anchor links (#) and mailto:
    # Pattern explanation:
    # (href|src)\s*=\s*"  -> Match href= or src= followed by quote
    # (?!(?:http|https|//|#|mailto:|tel:)) -> Negative lookahead: ignore if starts with these
    # ([^"]+) -> Capture the path until closing quote
    
    $pattern = '(href|src)\s*=\s*"(?!(?:http|https|//|#|mailto:|tel:))([^"]+)"'
    
    $newContent = [Regex]::Replace($Content, $pattern, {
            param($match)
            $attr = $match.Groups[1].Value
            $path = $match.Groups[2].Value
        
            # Don't prefix if path is absolute file path (unlikely in web) or empty
            if ([string]::IsNullOrWhiteSpace($path)) { return $match.Value }
        
            return "$attr=""$prefix$path"""
        })

    return $newContent
}

# Process Files
$files = Get-ChildItem -Path $rootDir -Filter *.html -Recurse | Where-Object { $_.FullName -ne $sourceFile }
$count = 0
$updated = 0

foreach ($file in $files) {
    $count++
    $relativePath = $file.FullName.Substring($rootDir.Path.Length + 1)
    
    # Calculate depth
    # e.g. "about-us.html" -> depth 0
    # "locations\file.html" -> depth 1
    # Count backslashes
    $depth = ($relativePath.ToCharArray() | Where-Object { $_ -eq '\' }).Count

    # Read target file
    $content = Get-Content $file.FullName -Raw
    
    # Find existing header
    # Find existing header using Regex
    $sMatch = $headerStartRegex.Match($content)
    
    if ($sMatch.Success) {
        # Find the *next* </header> after the start match
        $eMatch = $headerEndRegex.Match($content, $sMatch.Index)
        
        if ($eMatch.Success) {
            $s = $sMatch.Index
            $e = $eMatch.Index + $eMatch.Length
            
            # Prepare NEW header
            $adjustedHeader = Adjust-HeaderContent -Content $headerContent -Depth $depth
            
            # Replace
            $newFileContent = $content.Substring(0, $s) + $adjustedHeader + $content.Substring($e)
            
            Set-Content -Path $file.FullName -Value $newFileContent -NoNewline -Encoding UTF8
            Write-Host "Updated: $relativePath (Depth: $depth)"
            $updated++
        }
        else {
            Write-Warning "Skipped: $relativePath (Header start found but no end tag)"
        }
    }
    else {
        Write-Warning "Skipped: $relativePath (No header tag found)"
    }
}

Write-Host "Success! Processed $count files, Updated $updated files."
