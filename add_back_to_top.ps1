$baseDir = "c:\Users\navee\OneDrive\Documents\IPA\playabacusindia"
$exclude = "index.html"

# Get all HTML files
$files = Get-ChildItem -Path $baseDir -Filter *.html -Recurse | Where-Object { $_.Name -ne $exclude }

$buttonCode = @"
    <!-- Back to Top Button -->
    <button id="backToTop" class="back-to-top" title="Go to top">
        <i class="fa-solid fa-arrow-up"></i>
    </button>

    <script>
        // Back to Top functionality
        const backToTopButton = document.getElementById("backToTop");

        window.onscroll = function () {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                backToTopButton.classList.add("show");
            } else {
                backToTopButton.classList.remove("show");
            }
        };

        backToTopButton.onclick = function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        };
    </script>
</body>
"@

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Check if button already exists
    if ($content -match 'id="backToTop"') {
        Write-Host "Skipping $($file.Name) - Button already exists."
        continue
    }

    Write-Host "Injecting button into $($file.Name)..."
    
    # Inject before </body>
    if ($content -match '</body>') {
        $content = $content -replace '</body>', $buttonCode
        $content | Set-Content $file.FullName -Encoding UTF8
        Write-Host "  Success."
    } else {
        Write-Host "  Failed: Could not find </body> tag."
    }
}

Write-Host "Injection Complete."
