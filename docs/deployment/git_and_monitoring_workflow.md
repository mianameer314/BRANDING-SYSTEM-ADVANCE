# Git Workflow & Production Monitoring Guide

This guide details the standard operating procedures for managing the codebase, safely deploying changes, and monitoring the live production environments.

## 1. Local Development vs. Production Safety

### The Danger of Manual Folder Copying
Manually copy-pasting files between a "development" folder and a "cloned GitHub" folder is a highly dangerous anti-pattern. Windows file explorers often merge folders unpredictably and silently skip hidden files (directories starting with `.`, such as `.github` or `.env`). This leads to desynchronized repositories, lost configuration, and broken cloud deployments (e.g., CI/CD pipelines failing due to missing files or broken folder cases).

**The Solution:** Maintain a single source of truth connected directly to Git.

### The 60-Second Fix for Disconnected Folders
If your working directory is disconnected from Git, but you have a cloned repository elsewhere:
1. Reveal "Hidden Items" in your file explorer (View > Show > Hidden items).
2. Locate the `.git` folder inside the cloned GitHub repository.
3. Move (Cut/Paste) the `.git` folder directly into your active working directory.
4. Add the working directory to GitHub Desktop via `File -> Add Local Repository`.

This instantly converts the active directory into the official Git repository, retaining all remote connections to the cloud without requiring a fresh clone or manual file copying.

## 2. Safe Deployment Workflows

Git provides native safety nets to completely eliminate the need for manual backup folders.

### Safety Net 1: Branches (Parallel Universes)
Never develop new features directly on the `main` branch. 
- Create a new branch (e.g., `testing-new-feature`) in GitHub Desktop.
- This creates an isolated parallel environment for your code.
- You can freely code, test, and push this branch to GitHub as a backup. It will **never** impact the live `main` production environment.
- Only merge into `main` when the feature is 100% verified.

### Safety Net 2: Preview Deployments (Staging Environments)
Modern cloud hosts (Vercel and Railway) automatically detect when non-`main` branches are pushed to GitHub.
- Instead of pushing to the live public website, they automatically spin up a **Preview Deployment** (Staging Environment).
- This generates a secret, temporary URL (e.g., `https://branding-admin-git-testing-new-feature.vercel.app`).
- You can rigorously test your changes on real production cloud infrastructure without end-users seeing it.
- Once verified, merging the branch to `main` seamlessly updates the public production site. This completely eliminates the need to "test in production."

### Safety Net 3: Reverting (The "Undo" Button)
If a critical bug is accidentally pushed to `main`:
- Open the **History** tab in GitHub Desktop.
- Right-click the offending commit and select **Revert change in commit**.
- Git acts as a time machine, deleting the bad code and perfectly restoring the files to their previous safe state.
- Push the reverted commit to instantly fix the live production environment.

## 3. Production Monitoring Scripts

Two automated PowerShell scripts are provided in the `scripts/` directory to remove guesswork from maintaining live applications.

### `day1_deployment_monitor.ps1` (The Health Checker)
A one-click diagnostic tool to verify the entire system's uptime.
- **Function:** Concurrently pings the Railway API, the Vercel Admin Dashboard, and the Public Website.
- **Latency Tracking:** Measures the exact response time (latency) in milliseconds. For example, a latency of `14,907 ms` indicates a cold start (the server was asleep to save resources and took ~15 seconds to wake up). Documenting this baseline helps distinguish between normal cold starts and actual performance degradation.
- **Outcome:** Instantly identifies which specific microservice is offline or struggling.

### `day1_release_preflight.ps1` (The Pre-Release Safety Net)
A pre-deployment checklist script to run before tagging a major release.
- **Function:** Scans the local Git repository for uncommitted files, missing remotes, or unsynced changes.
- **Outcome:** Ensures only clean, finished, and fully tracked code is pushed to the cloud, preventing incomplete features from leaking into production.
