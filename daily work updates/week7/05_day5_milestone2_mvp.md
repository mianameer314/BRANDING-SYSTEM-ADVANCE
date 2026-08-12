# Day 11 — MILESTONE 2: Small Operations Console MVP

**Date:** August 15, 2026  
**Status:** Not Started

---

## Goal

Demonstrate the **complete editorial workflow** as one end-to-end flow: create ? edit ? preview ? review ? approve ? schedule ? publish ? inspect logs. Conduct a usability review, fix issues, record a demo, and tag the MVP release.

---

## Simple Explanation

> This is the big day — we put everything together and show that it works.  
> We'll walk through the entire workflow from start to finish, like a real editor would use it. If anything breaks or looks weird, we fix it. Then we record a short video showing how it works, and officially mark this as "Milestone 2 — done."

---

## Tasks

### 1. End-to-End Workflow Test

**What:** Walk through the complete editorial workflow to verify everything works together.

**Details:**
The full workflow is:

1. **Create or Ingest Draft**
   - Log in as an Editor
   - Create a new Blog post (or any content type)
   - Fill in title, excerpt, body, SEO fields, cover image
   - Save as Draft

2. **Edit Content**
   - Open the draft
   - Make edits (change title, update body, add images)
   - Verify revision history records the changes
   - Verify audit event is created

3. **Preview Content**
   - Click "Preview" to see website-style preview
   - Verify the preview looks correct
   - Verify validation warnings appear if fields are missing
   - Verify author, source, and last editor info is shown

4. **Submit for Review**
   - Change status from Draft ? In Review
   - Verify the item appears in the Review Queue
   - Verify the queue shows correct metadata (age, owner, etc.)

5. **Review and Approve**
   - Log in as a Reviewer (or Admin with approve permission)
   - Open the Review Queue
   - Find the submitted item
   - View revision history and side-by-side diff
   - Approve the content with a comment
   - Verify the item moves to Approved status
   - Verify audit event and revision are recorded

6. **Schedule Publishing**
   - Open the scheduled content
   - Pick a future date and time
   - Schedule it for publishing
   - Verify the item shows in the Schedule page
   - Verify status is 'scheduled'

7. **Publish / Test Webhook**
   - For testing: manually trigger publish (or wait for scheduled time)
   - Verify the item status changes to 'published'
   - Verify webhooks are dispatched
   - Verify webhook delivery is logged

8. **Inspect Logs**
   - Open the Publish Logs page
   - Find the delivery entry
   - Verify it shows success status, response code, duration
   - If failed: verify retry and resolve controls work

**Acceptance:**
- All 8 steps complete without errors
- Data flows correctly between all components
- Audit trail is complete and accurate

### 2. Mentor Usability Review

**What:** Conduct a usability review with a mentor or peer and fix the highest-impact issues.

**Details:**
- Walk through the workflow with a fresh pair of eyes
- Note any UX issues:
  - Confusing navigation
  - Missing feedback (no success/error messages)
  - Unclear labels or buttons
  - Broken layouts or styling
  - Slow loading or missing states
- Prioritize issues by impact:
  - **P0** — Blocks the workflow (must fix)
  - **P1** — Confusing but not blocking (should fix)
  - **P2** — Minor polish (nice to have)
- Fix P0 and P1 issues before demo
- Document P2 issues for future sprints

**Checklist:**
- [ ] Navigation is clear and intuitive
- [ ] All buttons do what they say
- [ ] Loading states show while data loads
- [ ] Error states show when things fail
- [ ] Success toasts appear after actions
- [ ] Empty states show helpful messages
- [ ] Forms validate before submission
- [ ] Confirmation dialogs appear for destructive actions
- [ ] Status transitions are clearly communicated
- [ ] Revision history is easy to understand
- [ ] Preview looks like the public website
- [ ] Publish logs are informative and scannable
- [ ] Schedule controls are intuitive
- [ ] Retry/resolve controls are clear

### 3. Record Demo

**What:** Record a short video (2-3 minutes) demonstrating the complete workflow.

**Details:**
- Record screen capture of the full workflow
- Narrate each step clearly
- Show:
  - Creating a draft
  - Editing and previewing
  - Submitting for review
  - Approving in the queue
  - Scheduling for publish
  - Checking publish logs
- Save the video in the project documentation
- Upload to shared drive or link in the milestone report

### 4. Tag MVP Release

**What:** Create a git tag for the Milestone 2 release.

**Details:**
- Ensure all tests pass
- Ensure CI/CD pipeline is green
- Create a git tag: `v0.2.0-m2`
- Write release notes:
  - What's included
  - What's new since M1
  - Known issues
  - Next steps
- Push the tag to remote

**Commands:**
```bash
git tag -a v0.2.0-m2 -m "Milestone 2: Editorial Workflow & Operations Console MVP"
git push origin v0.2.0-m2
```

### 5. Milestone Report

**What:** Write a summary report of what was accomplished.

**Details:**
- Executive summary
- Features delivered
- Test results
- Usability review findings
- Demo link
- Known issues
- Next steps for Week 3

---

## Workflow Test Script

```
STEP 1: Create Draft
---------------------
1. Login as Editor (editor@o2geeks.com)
2. Navigate to Blogs ? Create
3. Enter title: "M2 Test Blog Post"
4. Enter excerpt: "This is a test post for Milestone 2"
5. Enter body: "Lorem ipsum dolor sit amet..."
6. Set category: "Technology"
7. Add tags: "test, milestone"
8. Click Save ? Status: Draft
9. ? Verify: Content saved, revision created

STEP 2: Edit Content
---------------------
1. Open the draft
2. Change title to "M2 Test Blog Post - Updated"
3. Add a paragraph to the body
4. Click Save
5. ? Verify: Revision history shows 2 versions
6. ? Verify: Audit event recorded

STEP 3: Preview
-----------------
1. Click "Preview" button
2. ? Verify: Preview shows title, excerpt, body
3. ? Verify: Preview looks like public website
4. ? Verify: Author and metadata shown

STEP 4: Submit for Review
--------------------------
1. Change status: Draft ? In Review
2. ? Verify: Status updated
3. Navigate to Operations ? Review Queue
4. ? Verify: Item appears in queue with correct info

STEP 5: Review and Approve
---------------------------
1. Login as Admin (admin@o2geeks.com)
2. Navigate to Operations ? Review Queue
3. Find "M2 Test Blog Post - Updated"
4. Click to expand detail
5. View revision history
6. Click "Compare" to see diff
7. ? Verify: Side-by-side diff shows changes
8. Click "Approve"
9. Enter comment: "Looks good, approved for publishing"
10. Confirm approval
11. ? Verify: Item removed from queue
12. ? Verify: Status is now "approved"
13. ? Verify: Audit event recorded

STEP 6: Schedule
-----------------
1. Navigate to Operations ? Schedule
2. Find the approved item
3. Pick a date: tomorrow at 9:00 AM
4. Select timezone: Asia/Karachi
5. Click "Schedule"
6. ? Verify: Status changed to "scheduled"
7. ? Verify: scheduled_at date is correct
8. ? Verify: Audit event recorded

STEP 7: Publish & Webhook
--------------------------
1. For testing: Change status directly to "published"
   (or wait for scheduled time in real scenario)
2. ? Verify: Status changed to "published"
3. ? Verify: published_at timestamp set
4. ? Verify: Webhooks dispatched
5. ? Verify: Webhook logs created

STEP 8: Inspect Logs
----------------------
1. Navigate to Operations ? Publish Logs
2. Find the delivery entry for "M2 Test Blog Post"
3. ? Verify: Shows content title and type
4. ? Verify: Shows event type "content.published"
5. ? Verify: Shows status (success/failed)
6. ? Verify: Shows response code and duration
7. If failed:
   - Click "Retry" ? verify retry works
   - Click "Resolve" ? verify resolve works
8. ? Verify: Complete audit trail exists
```

---

## Files to Modify/Fix

Based on usability review, these are likely candidates:

### Quick Fixes
- `admin/src/components/layout/Sidebar.tsx` — Add missing icons or labels
- `admin/src/features/operations/pages/ApprovalQueuePage.tsx` — Fix any UX issues
- `admin/src/features/operations/components/ApprovalActionPanel.tsx` — Improve button styling
- `admin/src/features/operations/pages/PublishLogsPage.tsx` — Fix any layout issues

### Possible New Files
- `admin/src/features/operations/components/WorkflowBreadcrumb.tsx` — Navigation breadcrumb
- `admin/src/features/operations/components/QuickActionMenu.tsx` — Context menu for items

---

## Release Notes Template

```markdown
# Milestone 2: Editorial Workflow & Operations Console MVP

**Release:** v0.2.0-m2  
**Date:** August 15, 2026

## What's New

### Operations Console
- New Operations section in sidebar with workflow overview
- Dashboard transformed into editorial operations workspace
- Filtered views for each lifecycle stage

### Revision History & Preview
- Dedicated revision history page with timeline view
- Side-by-side diff comparison for any two revisions
- Full-page website-style content preview
- Validation warnings for incomplete content

### Approval Queue
- Dedicated review queue showing all pending items
- Approve, request changes, or reject with comments
- Role-based access control enforced
- Complete audit trail for all decisions

### Scheduling & Publish Logs
- Schedule content for future publishing with timezone support
- Reschedule or cancel scheduled publishing
- Comprehensive publish/webhook delivery history
- Retry failed webhooks or mark as resolved

### End-to-End Workflow
- Complete editorial flow: draft ? review ? approve ? schedule ? publish
- Full audit trail and revision history
- Webhook integration with delivery tracking

## What's Changed Since M1

- Backend lifecycle model expanded with scheduling support
- Frontend admin dashboard transformed into operations console
- New operations API endpoints for workflow management
- Enhanced webhook system with retry and recovery

## Known Issues

- Background job scheduler uses in-process cron (not production-ready)
- Rich text diff shows paragraph-level changes, not character-level
- Scheduling timezone support limited to major timezones

## Next Steps

- Week 3: Production background job scheduler
- Week 3: Advanced diff with character-level highlighting
- Week 3: Email notifications for review queue items
```

---

## Acceptance Criteria

- [ ] Complete workflow test passes all 8 steps
- [ ] No P0 usability issues remain
- [ ] All P1 usability issues fixed
- [ ] Demo video recorded (2-3 minutes)
- [ ] All tests pass (existing + new)
- [ ] CI/CD pipeline is green
- [ ] Git tag `v0.2.0-m2` created and pushed
- [ ] Release notes written
- [ ] Milestone report completed
- [ ] All files documented

---

## Dependencies

- ? All Day 7 work (Operations Console)
- ? All Day 8 work (Revision & Preview)
- ? All Day 9 work (Approval Queue)
- ? All Day 10 work (Scheduling & Logs)
- ? Existing test suite passing
- ? CI/CD pipeline working

---

## Estimated Time: 6–8 hours
