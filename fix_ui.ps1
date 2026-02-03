$baseDir = "c:\Users\navee\OneDrive\Documents\IPA\playabacusindia"
$exclude = "index.html"

# Get all HTML files
$files = Get-ChildItem -Path $baseDir -Filter *.html -Recurse | Where-Object { $_.Name -ne $exclude }

foreach ($file in $files) {
    Write-Host "Processing $($file.FullName)..."
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false

    # Fix Spacing: Remove mt-5 and adjust padding for banner section
    # Target: <section id="banner" class="container-fluid mt-5 pt-3 pt-md-0 pt-lg-5">
    # Replace with index.html style: <section id="banner" class="container-fluid pt-0 pt-md-0">
    
    if ($content -match 'id="banner" class="container-fluid mt-5 pt-3 pt-md-0 pt-lg-5"') {
        $content = $content -replace 'id="banner" class="container-fluid mt-5 pt-3 pt-md-0 pt-lg-5"', 'id="banner" class="container-fluid pt-0 pt-md-0"'
        $modified = $true
        Write-Host "  Fixed spacing."
    } elseif ($content -match 'class="container-fluid mt-5 pt-3 pt-md-0 pt-lg-5"') {
        # Fallback if id="banner" is missing or different order (though synced pages should match)
        $content = $content -replace 'class="container-fluid mt-5 pt-3 pt-md-0 pt-lg-5"', 'class="container-fluid pt-0 pt-md-0"'
        $modified = $true
        Write-Host "  Fixed spacing (fallback pattern)."
    }

    # Fix Back to Top Arrow: Switch from Bootstrap Icon to Font Awesome
    if ($content -match 'bi bi-arrow-up') {
        $content = $content -replace 'bi bi-arrow-up', 'fa-solid fa-arrow-up'
        $modified = $true
        Write-Host "  Fixed back-to-top arrow."
    }

    if ($modified) {
        $content | Set-Content $file.FullName -Encoding UTF8
        Write-Host "Saved $($file.Name)."
    } else {
        Write-Host "No changes needed for $($file.Name)."
    }
}

Write-Host "UI Fix Complete."
