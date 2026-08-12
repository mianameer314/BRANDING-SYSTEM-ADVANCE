# Week 7 Explanation — Editorial Workflow & Operations Console

**Project:** O2Geeks Branding System  
**Date:** 2026-08-12

## What This File Is

This is the plain-language explanation of what we are building in Week 7 (which is Week 2 of the August Plan). 

In **Week 6 (Milestone 1)**, we built a rock-solid backend. We added a 7-step content lifecycle, strict permissions, version history, and idempotency to make sure the database is safe and trackable. 

Now, in **Week 7 (Milestone 2)**, our goal is to bring all of that power to the surface. We are going to upgrade the **Frontend Admin Dashboard** so that human editors and administrators can actually see and use these features easily. We are turning a basic list of articles into a professional **Operations Console**.

---

## The Daily Plan in Simple Words

### Monday: The Operations Console & Workflow Views
We will upgrade the main dashboard. Instead of just seeing one big list of everything, editors and admins will have specific, clear workspaces:
*   **Drafts Workspace:** Stuff being written.
*   **Review Queue:** Stuff waiting for an admin's approval.
*   **Approved Items:** Stuff ready to go live.
*   **Published / Scheduled:** Stuff that is live or waiting for a timer.
We will also add search bars, status filters, and author filters so you can easily find exactly what you are looking for.

### Tuesday: Revision History & Visual Previews
Before an admin approves an article, they need to know what changed. 
*   **Side-by-Side Diff:** We will build a visual comparison tool (like track changes in Word) so reviewers can see exactly what was added, deleted, or changed between versions.
*   **Live Preview:** We will add a "Website Preview" button. Even if an article is just a draft, the editor can click this to see exactly how it will look on the real public website, complete with author details and any validation warnings.

### Wednesday: The Approval Queue
We will build a dedicated "Inbox" for administrators. 
*   Admins will see a list of everything marked "In Review".
*   They will have clear action buttons: **Approve**, **Request Changes**, or **Reject**.
*   They will be able to leave reviewer comments explaining *why* they requested changes. All of this will be saved in the audit history so there is a clear record of the decision.

### Thursday: Scheduling, Publish Logs, and Recovery
We will give operators control over time and integrations.
*   **Scheduling:** Editors will be able to pick a specific date and timezone for an article to automatically go live.
*   **Integration Logs:** If the system tries to notify the public website (via webhooks) that a new article is published, and the internet cuts out, the admin needs to know. We will build a page that shows all successful and failed webhook deliveries. Admins will have a "Retry" button to fix failed deliveries manually.

### Friday: Milestone 2 (Small Operations Console MVP)
We will connect everything together and test the entire journey:
1. Write a draft.
2. Edit it and preview it.
3. Submit it for review.
4. Admin reviews the side-by-side changes and approves it.
5. Admin schedules it.
6. It publishes and triggers the webhook logs.
We will fix any user-experience bugs, record a demo, and officially tag the **Milestone 2** release.

---

## Summary
By the end of this week, the O2Geeks Branding System will have a professional, enterprise-grade interface. Editors will have a safe place to write, and Administrators will have total control and visibility over what gets published, when it gets published, and exactly who changed it.
