# PowerShell Script to Update Navbar

$projectRoot = Get-Location
$sourceFile = Join-Path $projectRoot "index.html"
$headerRegex = '(?s)(<header id="header">.*?</header>)'

# 1. Get Source Header
try {
    $sourceContent = Get-Content $sourceFile -Raw
    if ($sourceContent -match $headerRegex) {
        $sourceHeader = $matches[0]
        Write-Host "Found <header> in source file."
    } else {
        Write-Error "Could not find <header id='header'> in $sourceFile"
        exit
    }
} catch {
    Write-Error "Error reading source file: $_"
    exit
}

# 2. Function to Adjust Links
function Adjust-Links {
    param (
        [string]$htmlContent,
        [int]$depth
    )

    if ($depth -eq 0) {
        return $htmlContent
    }

    $prefix = "../" * $depth

    # Regex to find src="..." and href="..."
    # We ignore absolute URLs (http, https, //), anchors (#), mailto, tel, javascript
    $pattern = '\b(src|href)=("|'')([^"''\s]*)("|'')'
    
    $newContent = [Regex]::Replace($htmlContent, $pattern, {
        param($match)
        $attr = $match.Groups[1].Value
        $quote = $match.Groups[2].Value
        $url = $match.Groups[3].Value
        $endQuote = $match.Groups[4].Value

        if ($url -match '^(http:|https:|//|#|mailto:|tel:|javascript:|data:)') {
            return $match.Value
        }
        
        return "$attr=$quote$prefix$url$endQuote"
    }, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

    return $newContent
}

# 3. Process Files
$files = Get-ChildItem -Path $projectRoot -Recurse -Filter "*.html"

foreach ($file in $files) {
    # Skip source file
    if ($file.FullName -eq $sourceFile) {
        continue
    }

    # Skip files in hidden directories like .git
    if ($file.FullName -match '\\\.') {
        continue
    }

    try {
        # Calculate depth
        $startPath = $projectRoot.Path
        $endPath = $file.DirectoryName
        
        # Simple depth calculation by splitting path separators
        if ($startPath -eq $endPath) {
            $depth = 0
        } else {
            $relPath = $endPath.Substring($startPath.Length + 1)
            $depth = ($relPath.Split("\").Count)
        }

        # Read target file
        $content = Get-Content $file.FullName -Raw

        # Adjust header links
        $newHeader = Adjust-Links -htmlContent $sourceHeader -depth $depth

        # Replace header
        if ($content -match $headerRegex) {
            $newContent = $content -replace $headerRegex, $newHeader
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            Write-Host "Updated: $($file.FullName) (Depth: $depth)"
        } else {
            Write-Warning "No <header id='header'> found in $($file.FullName)"
        }
    } catch {
        Write-Error "Failed to process $($file.FullName): $_"
    }
}

Write-Host "Navbar update complete."
