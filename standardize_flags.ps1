# standardize_flags.ps1
$ErrorActionPreference = "Stop"

# Configuration
$rootDir = Get-Location
$sourceFile = Join-Path $rootDir "index.html"
# The section has id="flags"
$sectionStartStart = '<section id="flags"' 
$sectionEndTag = '</section>'

# Read Source Section
Write-Host "Reading source flags section from $sourceFile..."
if (-not (Test-Path $sourceFile)) {
    Write-Error "Source file index.html not found!"
}

$indexContent = Get-Content $sourceFile -Raw

# We need to find the START of the section, and the corresponding END
# This simple logic assumes the closing </section> is the one matching the opening tag.
# Since we are extracting a specific block known to be well-formed in index.html, we can use a heuristic or regex.
# However, finding the specific closing tag for nested sections can be tricky with simple string search.
# But the flags section usually doesn't contain other sections. Let's try to grab the block.

# Find start index
$startIndex = $indexContent.IndexOf($sectionStartStart)
if ($startIndex -eq -1) {
    Write-Error "Could not find <section id='flags'... in index.html"
}

# Find the next </section> after the start
$endIndex = $indexContent.IndexOf($sectionEndTag, $startIndex)
if ($endIndex -eq -1) {
    Write-Error "Could not find closing </section> for flags section in index.html"
}

$endIndex += $sectionEndTag.Length
$sectionContent = $indexContent.Substring($startIndex, $endIndex - $startIndex)

Write-Host "Flags section extracted ($($sectionContent.Length) chars)."

# Function to adjust links
function Adjust-SectionContent {
    param (
        [string]$Content,
        [int]$Depth
    )

    if ($Depth -eq 0) {
        return $Content
    }

    $prefix = "../" * $Depth
    
    # Regex to find href/src attributes that are relative paths
    $pattern = '(href|src)\s*=\s*"(?!(?:http|https|//|#|mailto:|tel:))([^"]+)"'
    
    $newContent = [Regex]::Replace($Content, $pattern, {
            param($match)
            $attr = $match.Groups[1].Value
            $path = $match.Groups[2].Value
        
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
    
    $depth = ($relativePath.ToCharArray() | Where-Object { $_ -eq '\' }).Count

    $content = Get-Content $file.FullName -Raw
    
    # We need to replace the EXISTING flags section in the target file.
    # It attempts to find <section id="flags" ... </section>
    
    # Regex for safe replacement across multiple lines
    # (?s) enables single-line mode (dot matches newline)
    # .*? is non-greedy match until the first </section>
    $regex = '(?s)<section id="flags".*?</section>'
    
    if ($content -match $regex) {
        $adjustedSection = Adjust-SectionContent -Content $sectionContent -Depth $depth
        
        # Replace the matched content with the new adjusted section
        $newFileContent = $content -replace $regex, $adjustedSection
        
        Set-Content -Path $file.FullName -Value $newFileContent -NoNewline -Encoding UTF8
        Write-Host "Updated: $relativePath (Depth: $depth)"
        $updated++
    }
    else {
        Write-Warning "Skipped: $relativePath (No 'flags' section found to replace)"
    }
}

Write-Host "Success! Processed $count files, Updated $updated files."
