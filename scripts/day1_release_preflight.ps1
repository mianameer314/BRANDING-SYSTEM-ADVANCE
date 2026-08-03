$checks = New-Object System.Collections.Generic.List[object]

$gitCommand = Get-Command git -ErrorAction SilentlyContinue
$checks.Add([PSCustomObject]@{
    Check = "Git command available"
    Status = if ($gitCommand) { "PASS" } else { "FAIL" }
    Detail = if ($gitCommand) { $gitCommand.Source } else { "Install Git for Windows or use a machine with Git available." }
})

$gitDirExists = Test-Path -Path ".git" -PathType Container
$checks.Add([PSCustomObject]@{
    Check = "Local .git directory"
    Status = if ($gitDirExists) { "PASS" } else { "FAIL" }
    Detail = if ($gitDirExists) { (Resolve-Path ".git").Path } else { "This folder is not currently a usable Git checkout." }
})

if ($gitCommand -and $gitDirExists) {
    $remoteOutput = git remote -v
    $checks.Add([PSCustomObject]@{
        Check = "Git remotes"
        Status = if ($remoteOutput) { "PASS" } else { "FAIL" }
        Detail = if ($remoteOutput) { ($remoteOutput -join " | ") } else { "No remote configured." }
    })
}
else {
    $checks.Add([PSCustomObject]@{
        Check = "Git remotes"
        Status = "SKIPPED"
        Detail = "Skipped because Git command or .git directory is missing."
    })
}

$checks | Format-Table -AutoSize

Write-Host ""
Write-Host "Day 5 release-tag requirement:"
Write-Host "The backend-alpha tag must be created only from the authoritative source-controlled repository."
