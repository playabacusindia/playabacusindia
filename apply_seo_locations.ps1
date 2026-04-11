# apply_seo_locations.ps1
$rootDir = Join-Path (Get-Location) "locations"

if (-not (Test-Path $rootDir)) {
    Write-Error "Locations directory not found!"
    exit
}

$htmlFiles = Get-ChildItem -Path $rootDir -Filter *.html -Recurse

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.FullName)..."
    
    # Extract State and Area
    $state = $file.Directory.Name
    $areaRaw = $file.BaseName -replace "abacus-franchise-in-", ""
    
    # Capitalize function
    $capitalize = {
        param($str)
        $textInfo = (Get-Culture).TextInfo
        $textInfo.ToTitleCase($str.Replace("-", " "))
    }
    
    $stateName = &$capitalize $state
    $areaName = &$capitalize $areaRaw
    
    $title = "Best Abacus Classes & Franchise in $areaName, $stateName | Ideal Play Abacus India"
    $desc = "Start your genius journey with the best abacus training in $areaName, $stateName. Join Ideal Play Abacus (IPA) for online classes and low-investment franchise opportunities."
    $canonicalUrl = "https://www.playabacusindia.com/locations/$state/$($file.Name)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Update Title
    if ($content -match '<title>.*?</title>') {
        $content = $content -replace '<title>.*?</title>', "<title>$title</title>"
    }
    
    # Update Description
    $descTag = '<meta name="description" content="' + $desc + '">'
    if ($content -match '<meta\s+name=["'']description["'']\s+content=["''](.*?)["'']') {
        $content = $content -replace '<meta\s+name=["'']description["'']\s+content=["''](.*?)["'']', $descTag
    }
    
    # Update Canonical
    $canonicalTag = '<link rel="canonical" href="' + $canonicalUrl + '">'
    if ($content -match '<link\s+rel=["'']canonical["'']\s+href=["''](.*?)["'']') {
        $content = $content -replace '<link\s+rel=["'']canonical["'']\s+href=["''](.*?)["'']', $canonicalTag
    }
    
    # Update OG Title/Desc
    if ($content -match '<meta property=["'']og:title["''] content=["''](.*?)["'']') {
        $content = $content -replace '<meta property=["'']og:title["''] content=["''](.*?)["'']', ('<meta property="og:title" content="' + $title + '">')
    }
    if ($content -match '<meta property=["'']og:description["''] content=["''](.*?)["'']') {
        $content = $content -replace '<meta property=["'']og:description["''] content=["''](.*?)["'']', ('<meta property="og:description" content="' + $desc + '">')
    }
    
    # Update Twitter Title/Desc
    if ($content -match '<meta name=["'']twitter:title["''] content=["''](.*?)["'']') {
        $content = $content -replace '<meta name=["'']twitter:title["''] content=["''](.*?)["'']', ('<meta name="twitter:title" content="' + $title + '">')
    }
    if ($content -match '<meta name=["'']twitter:description["''] content=["''](.*?)["'']') {
        $content = $content -replace '<meta name=["'']twitter:description["''] content=["''](.*?)["'']', ('<meta name="twitter:description" content="' + $desc + '">')
    }

    Set-Content -Path $file.FullName -Value $content -NoNewline -Encoding UTF8
}

Write-Host "Success! All $($htmlFiles.Count) location pages updated."
