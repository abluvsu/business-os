# BusinessOS Live Alpha - Founder UAT

This document outlines the User Acceptance Testing (UAT) script that you (the founder) must perform to verify the Live Alpha release on the production environment. 

**Pre-requisite:**
Ensure you have the Vercel Frontend URL (e.g., `https://business-os-web.vercel.app`) and the Render Backend API URL running. 

---

### 1. Unauthenticated Access
- **Action**: Open the Vercel frontend URL in an incognito window without signing in.
- **Expected**: You should be redirected to the Clerk sign-in page. You cannot view the dashboard, chat, or analytics.

### 2. Founder Sign-in
- **Action**: Sign in using your approved founder email via Clerk.
- **Expected**: You are successfully authenticated and redirected to the dashboard. No fallback data is loaded.

### 3. First Workspace
- **Action**: Observe the initial state if you have no workspaces. The system should auto-provision a Default Workspace securely on the backend (tenant context resolved).
- **Expected**: You are in a workspace scope.

### 4. Restart / Reopen
- **Action**: Refresh the page or open the URL in a new tab.
- **Expected**: The session seamlessly restores your active workspace without prompting for login or losing state.

### 5. Instagram Flow
- **Action**: Click "Connect Instagram". Complete the Meta OAuth consent screen selecting your Business/Creator account.
- **Action (Cancellation)**: Cancel the flow midway. **Expected**: App shows "Not connected" gracefully.
- **Action (Failure)**: Revoke access from Meta and try syncing. **Expected**: Honest failure state with retry option.
- **Action (Success)**: Connect successfully. **Expected**: See actual account and media data sync without mock data.

### 6. Gmail Flow
- **Action**: Click "Connect Gmail". Complete the Google OAuth consent using minimal read-only scopes.
- **Action (Success)**: Connect successfully. **Expected**: Actual email threads/metadata sync without exposing secrets.
- **Action (Failure/Retry)**: Force a sync failure (e.g. by disconnecting internet briefly or revoking access). **Expected**: Honest failure state with retry option.

### 7. Empty and Partial Data
- **Action**: Connect a brand new Instagram account with no posts.
- **Expected**: The system gracefully handles zero entities and zero observations.

### 8. Five Supported Questions
- **Action**: Ask the AI: "How many followers do I have on Instagram?"
- **Action**: Ask the AI: "What was my most engaging post last month?"
- **Action**: Ask the AI: "How many unread emails are in my inbox?"
- **Action**: Ask the AI: "Summarize my recent Instagram activity."
- **Action**: Ask the AI: "What is my total audience size?"
- **Expected**: AI provides evidence-backed answers referencing the connected sources and states data limitations if necessary.

### 9. Unsupported Question
- **Action**: Ask the AI: "Should I pause my Facebook Ads campaigns?"
- **Expected**: AI explicitly states it cannot provide ad recommendations because no ad data is available or connected.

### 10. LLM Failure
- **Action**: (Simulated by backend configuration, if OpenAI/Primary AI is down).
- **Expected**: You receive a graceful offline/fallback message, not a technical error stack trace.

### 11. Refresh during Sync
- **Action**: Start a Gmail or Instagram sync and refresh the browser halfway through.
- **Expected**: The sync resumes or correctly reflects the "Syncing" or "Failed" state when the page reloads.

### 12. Product Health Data
- **Action**: Navigate to the Analytics tab.
- **Expected**: The metrics (Sessions, Time to First Insight, Sync Duration, Failures) display real calculated values from your session events. No demo/mock numbers.

### 13. Data Isolation Test (Second Account)
- **Action**: Log in with a *different* test account (if added to the Clerk allowlist).
- **Expected**: The second account sees an entirely blank workspace. They cannot access the founder's Instagram data, Gmail data, or conversations.

### 14. No Mock Data Visible
- **Action**: Browse all UI components.
- **Expected**: No hardcoded "Campaign Alpha" or "Sample Data" is visible anywhere in the live-alpha mode.
