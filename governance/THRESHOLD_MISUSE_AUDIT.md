# Threshold Pages Misuse Audit

**Purpose:** Identify and eliminate coercion patterns in Threshold-state pages where community interaction occurs.

**Audit Date:** 2025-01-24  
**Pages Audited:** SubmitMapping, MappingDetail (comments), CommunityGallery, Notification system

---

## SubmitMapping.tsx

### Current State
- **Header copy:** "If you want to share a mapping, this is a place to do that. It is not required. It does not expire."
  - **Assessment:** ✅ PASS - Permission-based, no urgency, explicit non-requirement
  
- **Form field labels:** "What domain or context are you noticing?" / "What are you observing?"
  - **Assessment:** ✅ PASS - Inquiry-based, not directive
  
- **Success message:** "Mapping submitted successfully! Redirecting to community gallery..."
  - **Assessment:** ⚠️ CONCERN - Automatic redirect creates temporal pressure (2-second countdown)
  - **Recommendation:** Change to "Mapping submitted. You can view it in the community gallery if you want." with optional manual navigation, no automatic redirect

- **Submit button:** "Submit Mapping" / "Submitting..." / "Submitted"
  - **Assessment:** ✅ PASS - Neutral action language, no urgency

- **Error messaging:** Direct technical error display
  - **Assessment:** ✅ PASS - Factual, no shame

---

## MappingDetail.tsx (Comments)

### Current State
- **Comment submission form:** Standard textarea with "Send" button
  - **Assessment:** ⚠️ REVIEW NEEDED - Need to check exact copy

- **Comment display:** Shows user attribution and timestamps
  - **Assessment:** ⚠️ CONCERN - Timestamps can create recency pressure ("posted 2 minutes ago" implies urgency to respond)
  - **Recommendation:** Use date-only format ("Jan 24, 2025"), remove relative time

- **Flag button:** Allows users to flag comments
  - **Assessment:** ⚠️ CONCERN - "Flag" language carries moral weight
  - **Recommendation:** Consider "Mark for review" or neutral reporting language

---

## CommunityGallery.tsx

### Current State
- **Header copy:** "Mappings others have shared. You can look. You can leave. Nothing here requires response."
  - **Assessment:** ✅ PASS - Explicit permission to exit, no obligation

- **Empty state:** "Nothing here yet. That is also fine."
  - **Assessment:** ✅ PASS - Normalizes absence, no pressure to contribute

- **Filter UI:** Domain-based filtering
  - **Assessment:** ✅ PASS - Functional navigation, no hidden hierarchy

---

## Notification System

### Current State
- **Notification types:** comment_flagged, new_mapping, comment_reply, admin_alert, system
  - **Assessment:** ⚠️ CONCERN - "comment_reply" creates expectation of response
  - **Recommendation:** Rename to "comment_added" (factual observation, not relational demand)

- **Notification bell with unread count:**
  - **Assessment:** ⚠️ MAJOR CONCERN - Red badge with number is classic urgency/guilt pattern
  - **Recommendation:** Remove unread count badge entirely. Notification center can show list without numerical pressure.

- **Mark as read functionality:**
  - **Assessment:** ⚠️ CONCERN - "Unread" vs "Read" creates obligation to clear
  - **Recommendation:** Change to "New" vs "Seen" (observation, not task completion)

---

## Summary of Required Changes

### High Priority (Coercion Patterns)
1. **Remove automatic redirect** after mapping submission
2. **Remove unread count badge** from notification bell
3. **Change notification type** from "comment_reply" to "comment_added"
4. **Change notification status** from "read/unread" to "seen/new"
5. **Remove relative timestamps** from comments (use date-only format)

### Medium Priority (Language Refinement)
6. **Change "Flag" to "Mark for review"** in comment moderation
7. **Add explicit exit permission** to comment submission areas

### Low Priority (Monitoring)
8. Continue monitoring for emergent coercion patterns as community grows

---

## Perspection Test Applied

**Question:** Does this reduce Fog or increase Discernment right now?

- **Automatic redirects:** NO - Creates temporal pressure, reduces sovereignty
- **Unread count badges:** NO - Creates guilt/obligation, increases Fog
- **Relative timestamps:** NO - Creates recency pressure, distorts time perception
- **"Reply" language:** NO - Creates relational obligation, reduces choice
- **"Flag" language:** UNCLEAR - May carry moral weight depending on context

**Verdict:** Changes 1-5 are required to maintain System Refusal alignment.

---

## Next Steps

1. Implement high-priority changes immediately
2. Test all Threshold flows after changes
3. Document language patterns that passed audit for future reference
4. Schedule follow-up audit after 30 days of community use
