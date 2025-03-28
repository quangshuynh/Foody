## Summary of Voice Notes on Restaurant App Features

Here's a breakdown of the ideas and concerns discussed across the two voice messages:

### 1. Handling Deleted Restaurants (Core Problem)

*   **Initial Concern:** If a user adds a restaurant to their "Visited" or "To Visit" list, they consider it important. If the original community entry for that restaurant gets deleted (e.g., by its creator), the user shouldn't lose their record/interest entirely.
*   **Rejected Idea:** Automatically recreating the deleted restaurant for every user who had it saved leads to undesirable duplicates.
*   **Proposed Solution: "Ghost Restaurants"**
    *   When a community restaurant entry is deleted, users who had it in their "Visited" or "To Visit" lists retain a private "ghost" version.
    *   **Ghost Properties:**
        *   Linked only to the user's account, removed from public view.
        *   Still appears in the user's personal "Visited"/"To Visit" lists.
        *   Retains: Name, Tags, Address, and the *user's own* previously added comments/ratings for that restaurant.
        *   Does *not* retain: Comments/ratings from *other* users (these are deleted with the community entry).
        *   The ghost entry is *not* editable or rateable by the user.
    *   **Notification & Restoration:**
        *   Users receive an email notification that the original restaurant was deleted, but they have a ghost copy.
        *   An option (e.g., a button in the email or app) allows the user to "restore" the ghost.
        *   Restoring effectively creates a *new*, restaurant entry owned by that user, pre-filled with the ghost's data. This does *not* restore the *full* original community entry.
*   **Reactivation Complexity:**
    *   If User A restores/re-creates the restaurant *first*, it becomes a new community entry.
    *   If User B still has a ghost of the *original* deleted restaurant, they should be notified of the re-creation.
    *   User B's ghost should then ideally be replaced by or linked to the newly re-created community entry. This logic needs careful implementation (adding User B’s comments and rating).

### 2. Permissions, Ownership, and Community Edits

*   **Accounts are Necessary:** To manage ownership, permissions, and personal lists, user accounts are essential.
*   **Community Driven Issues:** Allowing anyone to edit/delete anything can lead to vandalism or incorrect data.
*   **Proposed Permission Model:**
    *   **Ownership:** The user who creates a restaurant entry "owns" it.
    *   **Owner Privileges:** Only the owner can directly edit core details (name, address?) or delete the community entry.
    *   **Community Contributions:** Other users cannot directly edit entries they don't own.
    *   **Edit Requests:** Non-owners can *suggest* edits (e.g., add tags, suggest corrections, add photos).
    *   **Approval:** Edit suggestions are sent as requests (notifications/email) to the restaurant entry's owner for approval or rejection. This maintains data integrity while allowing community input.

### 3. Image Handling

*   **Rejected Idea:** Adding images directly to *comments* (potential storage cost, clutter, irrelevance).
*   **Proposed Solution:** Attach images directly to the *restaurant entry* itself (like Google Maps).
    *   Images are part of the main restaurant data.
    *   The owner can upload/manage images.
    *   Other users can *request* to add images via the "Edit Request" system, subject to owner approval.
*   **Image Moderation:**
    *   Option 1: Rely solely on owner approval via edit requests.
    *   Option 2: Supplement with AI moderation to automatically flag/reject inappropriate images before they even become a request.
*   **Image Deletion:** Unclear if images associated with a deleted restaurant should also be deleted or persist with the "ghost" entry. Needs decision.

### 4. User Interface and Lists

*   **List View:** Agreed that a compact view (e.g., grid of squares) is preferable to long cards for restaurant lists.
*   **Visited / To Visit Lists:**
    *   **Initial Idea (Separate Tabs):** Implied distinct sections/tabs for "Visited" and "To Visit".
    *   **Evolved Idea (Unified Tab + Filters):** A single main "Community" / "Browse" tab showing *all* restaurants. Within this tab, filters allow users to view:
        *   All Restaurants
        *   My Visited
        *   My To Visit
        *   Restaurants I Created/Own
    *   This unified approach seems favoured later for reducing tab clutter.
*   **Personal Data Visibility:** User's comments, ratings, and lists ("Visited", "To Visit") should be easily accessible, likely through their account settings/profile page or the filtered main list.

### 5. Calendar and Visit Logging

*   **Feature:** Allow users to log the specific date they visited a restaurant.
*   **Implementation:**
    *   A dedicated "Calendar" tab/view.
    *   Users select a date.
    *   They can add an "event" like "Visited [Restaurant]".
    *   Search for the restaurant: Ideally, search the *community list*. Selecting a restaurant and logging a visit should *automatically add it* to the user's "Visited" list if it wasn't already there.
    *   The date visited information itself is *private* and account-based.
    *   Keep date input optional when adding to the "Visited" list itself.
*   **Future Planning:** The calendar can also be used to plan *future* visits ("To Visit" on a specific date). Selecting a restaurant for a future date could auto-add it to the "To Visit" list.

### 6. Social Features and Future Scope

*   **Counters:** Show non-identifying public counters on restaurant cards (e.g., "X people visited", "Y want to visit").
*   **Invites:** Extending the calendar feature to invite others to planned visits.
    *   **Complexity:** Requires a "friends" system (requests, lists, privacy controls).
    *   **Concern:** This significantly increases scope, potentially turning the app into a full social network ("Foodybook"). Recommendation to potentially defer this.

### 7. Account Management and Notifications

*   **Profile Settings:**
    *   Change Username: Needed.
    *   Change Email: Possible, but requires confirmation.
*   **Email Confirmation:** Strongly recommended for account creation and critical changes (password/email change) to prevent spam and enhance security.
*   **Notifications (Essential via Email):**
    *   Account/Email/Password confirmations.
    *   Restaurant deletion warnings (ghost creation).
    *   Restaurant re-creation/reactivation.
    *   Edit/Image requests received (for owners).
    *   (Potentially) Invite notifications if that feature is added.

### 8. Data Distinction

*   Crucial to differentiate between **Public/Community Data** (restaurant entries, owner-approved tags/images, comments/ratings) and **Private/Account Data** (visited/to-visit lists, calendar logs, potentially friends list).

---

## Gemini's Thoughts and Analysis

This is a very thorough and thoughtful exploration of potential features and pitfalls for a community-driven restaurant app. Here are my observations and suggestions:

1.  **Handling Deletion - Ghost Concept vs. Ownership:**
    *   The "Ghost Restaurant" concept is an innovative way to address the user's data persistence need when an owner deletes an entry. However, the reactivation/replacement logic is indeed complex and prone to edge cases.
    *   Strengthening the **Ownership + Edit Request** model is key. If only the owner can delete, it reduces accidental/malicious deletions impacting the community view.
    *   **Recommendation:** Prioritize the Ownership + Edit Request model first. For deletion:
        *   When an *owner* deletes a restaurant, implement the "Ghost" mechanism for users who had it saved. This preserves their personal record. The restoration process should be clear: it creates a *new private* copy, not resurrecting the community one automatically.
        *   *Non-owners* should only be able to *request* deletion, which the owner approves/rejects. This prevents community vandalism.
        *   The complex "reactivation/replacement" logic for ghosts could potentially be simplified or deferred. If User A recreates a deleted restaurant, it's just a *new* entry. User B, who still has a ghost of the old one, might just see both in searches unless they manually clean up their ghost. Automatic replacement adds significant complexity.

2.  **UI Structure - Unified List is Strong:**
    *   I agree with the later thought of moving towards a **single, filterable list** ("Browse" or "Restaurants"). Separate "Visited" and "To Visit" tabs add clutter. Powerful filters (including "My Visited", "My To Visit", "My Creations", tags, location, rating etc.) within one primary view offer a cleaner and more scalable user experience.

3.  **Image Handling - Restaurant-Level is Best:**
    *   Attaching images to the **restaurant entry via an edit request system** is the most robust approach. It centralizes visual information, allows moderation by the owner, and avoids comment clutter and higher storage costs associated with comment-based images. AI moderation as a supplement is a good idea for larger scale.

4.  **Calendar Feature - Great for Engagement:**
    *   This is a strong feature for personal tracking and engagement. Making the date optional but available is flexible. The idea to **auto-add to "Visited" when logging a visit from a community search** is efficient and user-friendly.

5.  **Social Features - Prioritize Core:**
    *   The observation about "Foodybook" is astute. Adding friends and invites dramatically increases complexity (privacy, notifications, UI).
    *   **Recommendation:** Launch with the core restaurant discovery, listing, rating, commenting, and personal list features first. Add social layers like friends/invites later if the core app gains traction and user demand exists. The non-identifying counters ("X visited") are a good, low-complexity social proof element for initial launch.

6.  **Permissions - Essential:**
    *   The Owner + Edit Request model strikes a good balance between community input and data integrity. This should be a foundational part of the architecture.

7.  **Notifications - Crucial:**
    *   Email (or in-app notifications) are vital for confirmations, requests, and warnings (like deletion). Ensure a robust notification system is planned.

**Overall:** The level of detail considered is excellent. The main challenge lies in managing complexity, particularly around the deletion/ghost/reactivation logic and potential social features. Prioritizing a solid core experience (discovery, personal lists, reliable data via ownership/requests) before adding intricate secondary features would be a prudent strategy. The unified list with filters and restaurant-level image handling seem like the strongest UI/data model choices from the options discussed.

“Thank you mister Gemini.”
\- Olivier C