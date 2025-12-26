# Quarterly Notification Content Audit Workflow

**Purpose:** Monitor notification language for drift toward obligation, urgency, or reintegration pressure.

**Frequency:** Every 90 days

**Duration:** 30-45 minutes (checklist, not meeting)

**Owner:** System maintainer or designated reviewer

---

## Audit Process

### 1. Collect Notification Samples

**Action:** Export all notification templates and recent notification text (last 90 days)

**Sources:**
- Notification schema type definitions
- Backend notification creation functions
- Email templates (if implemented)
- In-app notification display text

**Output:** Single document with all notification copy

---

### 2. Run Language Audit Checklist

For each notification type, answer these questions:

#### A. Obligation Test
- [ ] Does the notification imply the user "should" do something?
- [ ] Does it use words like "reply," "respond," "join," "continue"?
- [ ] Does it create relational pressure (e.g., "someone is waiting")?

**If YES to any:** Flag for rewrite or removal

#### B. Urgency Test
- [ ] Does the notification use time pressure language?
- [ ] Does it imply something will be "missed" or "expire"?
- [ ] Does it use escalating intensity (e.g., "still unread," "reminder")?

**If YES to any:** Flag for rewrite or removal

#### C. Reintegration Test
- [ ] Does the notification frame engagement as progress or health?
- [ ] Does it use recovery/wellness language?
- [ ] Does it imply the user needs to "stay connected" or "keep up"?

**If YES to any:** Flag for rewrite or removal

#### D. Observation Language Test
- [ ] Does the notification state facts without interpretation?
- [ ] Does it preserve user agency (e.g., "optional," "no action required")?
- [ ] Does it avoid moral framing?

**If NO to any:** Flag for improvement

---

### 3. Review Notification Frequency

**Action:** Check notification volume per user (last 90 days)

**Thresholds:**
- **Alert if >3 notifications per 24 hours** for any single user
- **Alert if >10 notifications per week** for any single user
- **Alert if any notification type fires >1x per 12 hours** for same thread/mapping

**If threshold exceeded:** Investigate cause, tighten rate limiting, or disable trigger

---

### 4. Compare to Previous Audit

**Action:** Create diff showing what changed since last audit

**Document:**
- New notification types added
- Copy changes to existing notifications
- Frequency changes
- New triggers introduced

**Output:** Short summary (5-10 lines max)

**Example:**
```
Q4 2025 Audit Summary:
- No new notification types added
- "comment_reply" copy unchanged (still uses "Thread activity")
- Rate limiting reduced spam by 40%
- No urgency language detected
- One new trigger proposed (mapping milestone) - REJECTED (celebratory framing)
```

---

### 5. Apply "You Should" Test

**The Single Rule:** If a notification could be interpreted as "you should," it fails.

**Test method:** Read each notification aloud and ask:
- Does this sound like an instruction?
- Does this create guilt if ignored?
- Does this imply the user is falling behind?

**If YES to any:** Rewrite or remove

---

### 6. Tripwire Test (Random Sample)

**Purpose:** Catch obligation language that passes individual review but fails random sampling.

**Method:**
1. Select 10 notifications at random from the last 90 days
2. Read each one aloud without context
3. Ask: "Could this be interpreted as 'you should'?"

**Failure condition:** If ANY of the 10 could be interpreted as obligation, the entire audit fails.

**Action on failure:**
- Default to **deletion** of the notification type, not rewording
- If deletion is not possible (essential notification), rewrite with maximum observation language
- Document the failure in audit report
- Run another tripwire test after fix

**Why this works:** Random sampling prevents slow drift through "helpful" tweaks. One failure = system-wide alert.

**Example tripwire failures:**
- "You have a new reply" → Implies duty to read
- "Don't miss this update" → Creates FOMO
- "Your turn to respond" → Creates obligation
- "Keep the conversation going" → Implies engagement duty

**Example tripwire passes:**
- "New activity on a thread" → Observation only
- "A response exists" → Fact, no duty
- "Update available" → Neutral information

---

### 7. Document Findings and Actions

**Output:** Brief audit report (1 page max)

**Template:**

```markdown
# Notification Audit Report - [Quarter] [Year]

**Audit Date:** [Date]
**Reviewer:** [Name]

## Summary
[2-3 sentences: overall health, major changes, action items]

## Flagged Notifications
| Type | Issue | Action Taken |
|------|-------|--------------|
| thread_activity | None | No change |
| mentions | None | No change |
| moderation_outcomes | None | No change |

## Frequency Analysis
- Average notifications per user per week: [X]
- Highest volume user: [X] notifications in 90 days
- Rate limiting incidents: [X]

## Changes Since Last Audit
- [List of changes]

## Recommendations
1. [Action item 1]
2. [Action item 2]

## Next Audit Due
[Date 90 days from now]
```

---

## Red Flags (Immediate Action Required)

If any of these appear, **stop and fix immediately** (do not wait for quarterly audit):

1. **Streak language** - "X days in a row," "don't break your streak"
2. **Comparison language** - "most active users," "top contributors"
3. **Scarcity language** - "limited time," "expiring soon," "last chance"
4. **Social proof** - "X people are waiting," "others have responded"
5. **Celebratory escalation** - "congrats," "you're doing great," "keep it up"
6. **Reminder loops** - Any notification that repeats if ignored

**Action:** Remove immediately, document in next audit report

---

## Maintenance Notes

### When to Run Extra Audits

Run an unscheduled audit if:
- New notification type is added
- Notification volume spikes >50% in any 7-day period
- User feedback mentions "pressure" or "obligation"
- New developer joins team (onboard them to this workflow)

### Archive Location

Store all audit reports in `/docs/audits/notifications/` with naming:
- `notification-audit-YYYY-QX.md`

Example: `notification-audit-2025-Q4.md`

---

## Philosophy Reminder

**Notifications exist to reduce confusion, not to create obligation.**

If a notification does not help the user discern what is real, it should not exist.

If a notification creates guilt when ignored, it is coercion.

If a notification implies the user is falling behind, it is reintegration pressure.

**When in doubt, remove.**

---

## Quick Reference: Approved vs Refused Language

### ✅ Approved (Observation Language)
- "New activity on a thread"
- "A response exists"
- "Update available"
- "Optional. No action required."
- "Informational only"
- "Viewing is optional"

### ❌ Refused (Obligation Language)
- "Reply to this thread"
- "Someone replied to you"
- "Don't miss out"
- "You have unread messages"
- "Keep up with"
- "Stay connected"
- "Join the conversation"
- "Your turn"

---

**End of Workflow**

Next audit due: [90 days from last audit]
