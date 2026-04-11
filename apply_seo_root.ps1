# apply_seo_root.ps1
$rootDir = Get-Location

$seoData = @(
    @{ File = "404.html"; Title = "404 - Page Not Found | Ideal Play Abacus India"; Desc = "Oops! The page you are looking for does not exist. Return to Ideal Play Abacus India home page."; Canonical = "https://www.playabacusindia.com/404.html" },
    @{ File = "abacus-class-near-me.html"; Title = "Best Abacus Classes & Training for Kids Near Me | IPA Abacus"; Desc = "Discover the best abacus classes for kids near you at IPA Abacus! Our program uses Abacus, Brain Gym, and Speed Writing to boost skills and self-confidence."; Canonical = "https://www.playabacusindia.com/abacus-class-near-me.html" },
    @{ File = "abacus-class.html"; Title = "Best Abacus Coaching Classes & Training for Kids | IPA Abacus"; Desc = "Discover the best abacus coaching classes for kids at IPA Abacus! Our program uses Abacus, Brain Gym, and Speed Writing to boost skills and self-confidence."; Canonical = "https://www.playabacusindia.com/abacus-class.html" },
    @{ File = "abacus-classes-online.html"; Title = "Best Abacus Classes Online & Training for Kids | IPA Abacus"; Desc = "Discover the best abacus classes online for kids at IPA Abacus! Our program uses Abacus, Brain Gym, and Speed Writing to boost skills and self-confidence."; Canonical = "https://www.playabacusindia.com/abacus-classes-online.html" },
    @{ File = "abacus-franchise.html"; Title = "Start Your Own Abacus Franchise in India | Ideal Play Abacus"; Desc = "Start your own Abacus Franchise with Ideal Play Abacus in India. Low investment, high returns, full training & marketing support across India."; Canonical = "https://www.playabacusindia.com/abacus-franchise.html" },
    @{ File = "about-us.html"; Title = "Ideal Play Abacus India: Empowering Young Minds Since 2003"; Desc = "Learn more about Ideal Play Abacus India (IPA), founded in 2003 to revolutionize brain and math skills in children. 1500+ centers and 4,00,000+ students."; Canonical = "https://www.playabacusindia.com/about-us.html" },
    @{ File = "blog.html"; Title = "Abacus Learning Blog | Expert Articles | Ideal Play Abacus India"; Desc = "Explore expert articles on abacus training, brain development, and child learning. Stay informed with Ideal Play Abacus India Learning Blog."; Canonical = "https://www.playabacusindia.com/blog.html" },
    @{ File = "contact-us.html"; Title = "Contact Ideal Play Abacus India | Franchise & Class Inquiries"; Desc = "Reach out to Ideal Play Abacus India for franchise inquiries, class details, or general support. Call, email, or use our contact form to connect."; Canonical = "https://www.playabacusindia.com/contact-us.html" },
    @{ File = "events.html"; Title = "Abacus Events & Competitions | National Level | Ideal Play Abacus India"; Desc = "Explore our latest national and regional abacus events and competitions designed to enhance children's calculation speed and focus."; Canonical = "https://www.playabacusindia.com/events.html" },
    @{ File = "franchise.html"; Title = "Join Ideal Play Abacus India Franchise | Low Investment Opportunity"; Desc = "Start your career as an educator and entrepreneur with Ideal Play Abacus India. Low investment franchise opportunities with complete support."; Canonical = "https://www.playabacusindia.com/franchise.html" },
    @{ File = "gallery.html"; Title = "Gallery | Student Achievements & Events | Ideal Play Abacus India"; Desc = "Explore the vibrant gallery of Ideal Play Abacus India showcasing student achievements, events, and classroom activities across 1500+ centers."; Canonical = "https://www.playabacusindia.com/gallery.html" },
    @{ File = "how-to-do-abacus-fast.html"; Title = "How to Do Abacus Fast: Speed Tricks & Techniques | IPA Abacus"; Desc = "Learn how to do abacus fast with proven abacus speed tricks and mental math techniques. Boost your calculation speed with IPA Abacus!"; Canonical = "https://www.playabacusindia.com/how-to-do-abacus-fast.html" },
    @{ File = "phonics-star-class.html"; Title = "Phonics Star Classes: English Fluency for Kids | IPA Abacus"; Desc = "Enroll your child in Phonics Star classes at IPA Abacus. Boost English pronunciation, vocabulary, and communication skills for kids aged 4-10."; Canonical = "https://www.playabacusindia.com/phonics-star-class.html" },
    @{ File = "terms-and-conditions.html"; Title = "Terms and Conditions | Ideal Play Abacus India"; Desc = "Read the Terms and Conditions for using the services of Ideal Play Abacus India. Understand the rights and obligations of our students and partners."; Canonical = "https://www.playabacusindia.com/terms-and-conditions.html" },
    @{ File = "what-is-the-right-age-for-a-child-to-learn-abacus.html"; Title = "What Is the Right Age for a Child to Learn Abacus? | IPA Abacus"; Desc = "Discover the ideal age for a child to start learning abacus. Learn the benefits of early abacus training for brain development and math skills."; Canonical = "https://www.playabacusindia.com/what-is-the-right-age-for-a-child-to-learn-abacus.html" },
    @{ File = "when-did-abacus-got-invented.html"; Title = "When Was the Abacus Invented? Origin & History of Abacus | IPA"; Desc = "Explore the fascinating history and origin of the abacus. From ancient calculation tools to modern brain development programs at IPA Abacus."; Canonical = "https://www.playabacusindia.com/when-did-abacus-got-invented.html" }
)

foreach ($item in $seoData) {
    $filePath = Join-Path $rootDir $item.File
    if (Test-Path $filePath) {
        Write-Host "Updating SEO for $($item.File)..."
        $content = Get-Content $filePath -Raw
        
        # Update Title
        if ($content -match '<title>.*?</title>') {
            $content = $content -replace '<title>.*?</title>', "<title>$($item.Title)</title>"
        } else {
             $content = $content -replace '<head>', "<head>`n    <title>$($item.Title)</title>"
        }
        
        # Update Description
        $descTag = '<meta name="description" content="' + $item.Desc + '">'
        if ($content -match '<meta\s+name=["'']description["'']\s+content=["''](.*?)["'']') {
            $content = $content -replace '<meta\s+name=["'']description["'']\s+content=["''](.*?)["'']', $descTag
        } else {
             $content = $content -replace '</title>', "</title>`n    $descTag"
        }
        
        # Update Canonical
        $canonicalTag = '<link rel="canonical" href="' + $item.Canonical + '">'
        if ($content -match '<link\s+rel=["'']canonical["'']\s+href=["''](.*?)["'']') {
            $content = $content -replace '<link\s+rel=["'']canonical["'']\s+href=["''](.*?)["'']', $canonicalTag
        } else {
            $content = $content -replace '<meta name="description".*?>', "$&`n    $canonicalTag"
        }
        
        Set-Content -Path $filePath -Value $content -NoNewline -Encoding UTF8
    } else {
        Write-Warning "File not found: $($item.File)"
    }
}

Write-Host "Success! Root SEO standardized."
