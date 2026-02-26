# filter_issues.ps1
$auditFile = "audit_report.csv"
$issuesFile = "issues_found.csv"

if (Test-Path $auditFile) {
    $data = Import-Csv $auditFile
    $issues = $data | Where-Object { 
        $_.Link_Status -eq 'BROKEN' -or 
        [string]::IsNullOrWhiteSpace($_.Title) -or 
        [string]::IsNullOrWhiteSpace($_.Description) -or 
        [string]::IsNullOrWhiteSpace($_.Canonical)
    }
    $issues | Export-Csv $issuesFile -NoTypeInformation
    Write-Host "Found $($issues.Count) issues. Saved to $issuesFile"
} else {
    Write-Error "Audit report not found!"
}
