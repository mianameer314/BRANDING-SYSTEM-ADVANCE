param(
    [int]$Samples = 5
)

$targets = [ordered]@{
    "Backend Health" = "https://branding-system-production.up.railway.app/healthz"
    "Backend Docs" = "https://branding-system-production.up.railway.app/docs"
    "Admin Dashboard" = "https://branding-system-frontend.vercel.app/"
    "Public Website" = "https://o2geeks-website-v2-black.vercel.app/"
}

$results = New-Object System.Collections.Generic.List[object]

for ($i = 1; $i -le $Samples; $i++) {
    foreach ($target in $targets.GetEnumerator()) {
        $timer = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            $response = Invoke-WebRequest -Uri $target.Value -UseBasicParsing -MaximumRedirection 5
            $timer.Stop()
            $results.Add([PSCustomObject]@{
                Sample = $i
                Service = $target.Key
                StatusCode = $response.StatusCode
                ResponseTimeMs = $timer.ElapsedMilliseconds
                FinalUrl = $response.BaseResponse.ResponseUri.AbsoluteUri
                Error = $null
            })
        }
        catch {
            $timer.Stop()
            $results.Add([PSCustomObject]@{
                Sample = $i
                Service = $target.Key
                StatusCode = "FAILED"
                ResponseTimeMs = $timer.ElapsedMilliseconds
                FinalUrl = $target.Value
                Error = $_.Exception.Message
            })
        }
    }
}

$results | Format-Table -AutoSize

$summary = $results |
    Where-Object { $_.StatusCode -ne "FAILED" } |
    Group-Object Service |
    ForEach-Object {
        $group = $_.Group
        $times = @($group | Sort-Object ResponseTimeMs | Select-Object -ExpandProperty ResponseTimeMs)
        $count = $times.Count
        $p95Index = [Math]::Min($count - 1, [Math]::Ceiling($count * 0.95) - 1)
        [PSCustomObject]@{
            Service = $_.Name
            Samples = $count
            MinMs = ($times | Measure-Object -Minimum).Minimum
            AvgMs = [Math]::Round(($group | Measure-Object ResponseTimeMs -Average).Average, 2)
            P95Ms = $times[$p95Index]
            MaxMs = ($times | Measure-Object -Maximum).Maximum
            Failures = ($results | Where-Object { $_.Service -eq $group[0].Service -and $_.StatusCode -eq "FAILED" }).Count
        }
    }

Write-Host ""
Write-Host "Latency summary"
$summary | Format-Table -AutoSize
