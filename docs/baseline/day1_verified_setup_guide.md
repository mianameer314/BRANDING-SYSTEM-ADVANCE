# Day 1 Verified Setup Guide

## Deployed applications

| Component | URL | Audit result |
|---|---|---|
| FastAPI backend | `https://branding-system-production.up.railway.app/` | Healthy |
| API health check | `https://branding-system-production.up.railway.app/healthz` | Healthy; PostgreSQL connected; S3 storage |
| API documentation | `https://branding-system-production.up.railway.app/docs` | Reachable |
| React admin dashboard | `https://branding-system-frontend.vercel.app/` | Reachable; Super Admin sign-in confirmed |
| Nuxt public website | `https://o2geeks-website-v2-black.vercel.app/` | Reachable |

## Local verification environment

- Python virtual environment: available
- Python version observed: 3.14.3
- Docker: unavailable on the audit workstation
- Local container verification: not performed; hosted Railway/Vercel deployments were used instead

## Safe health check

```powershell
Invoke-RestMethod "https://branding-system-production.up.railway.app/healthz" | ConvertTo-Json -Depth 5
```

## Deployment availability and response-time check

Run this PowerShell block to verify the three deployed applications and capture the initial response time for each. `-UseBasicParsing` avoids the interactive script-parsing warning seen in Windows PowerShell.

```powershell
$targets = [ordered]@{
  "Backend Docs" = "https://branding-system-production.up.railway.app/docs"
  "Admin Dashboard" = "https://branding-system-frontend.vercel.app/"
  "Public Website" = "https://o2geeks-website-v2-black.vercel.app/"
}

$targets.GetEnumerator() | ForEach-Object {
  $timer = [System.Diagnostics.Stopwatch]::StartNew()
  try {
    $response = Invoke-WebRequest -Uri $_.Value -UseBasicParsing -MaximumRedirection 5
    $timer.Stop()
    [PSCustomObject]@{
      Service        = $_.Key
      StatusCode     = $response.StatusCode
      ResponseTimeMs = $timer.ElapsedMilliseconds
      FinalUrl       = $response.BaseResponse.ResponseUri.AbsoluteUri
    }
  }
  catch {
    $timer.Stop()
    [PSCustomObject]@{
      Service        = $_.Key
      StatusCode     = "FAILED"
      ResponseTimeMs = $timer.ElapsedMilliseconds
      FinalUrl       = $_.Exception.Message
    }
  }
} | Format-Table -AutoSize
```

### Day 1 observed result

| Service | HTTP status | Response time |
|---|---:|---:|
| Backend Docs | 200 | 14,907 ms |
| Admin Dashboard | 200 | 6,027 ms |
| Public Website | 200 | 2,943 ms |

### Repeatable latency check

For repeated measurements and p95-style summary, run:

```powershell
.\scripts\day1_deployment_monitor.ps1 -Samples 5
```

## Regression baseline command

```powershell
python -m pytest tests -q
```

### Day 1 P0 fix result

The original Day 1 run failed during SQLite schema creation because `webhooks.content_types` was a PostgreSQL `ARRAY`. This was fixed by adding a SQLite JSON variant for the webhook content type list and tightening preview-test dependency override isolation.

Latest local verification:

```powershell
.\venv\Scripts\python.exe -m pytest tests -q --disable-warnings
```

Result: `43 passed, 24 warnings in 13.56s`.

## Manual visibility verification

1. Sign in to the admin dashboard with an authorized account.
2. Confirm unpublished content is visible to a Super Admin in the dashboard.
3. Open the public website in a logged-out/incognito window.
4. Confirm published content is visible and draft content remains hidden.

## Release preflight

Before the Day 5 `backend-alpha` release tag, verify this folder is the authoritative source-controlled repository:

```powershell
.\scripts\day1_release_preflight.ps1
```

The full Day 1 handoff is summarized in [day1_complete.md](../../day1_complete.md), which explains the flow from baseline checks through Day 5 at a high level.
