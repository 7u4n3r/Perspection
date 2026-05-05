# Perspection Tracker — Design Brainstorm

This is a tool for people under pressure. Design must serve speed, clarity, and reliability above all else.

---

<response>
<text>

## Idea 1: "Field Instrument" — Industrial Utility Design

**Design Movement:** Industrial/Instrument design — inspired by military field equipment, medical devices, and aviation instruments. High contrast, zero ambiguity.

**Core Principles:**
- Maximum legibility in any lighting condition
- Touch targets sized for gloved/stressed hands (minimum 48px)
- Zero decorative elements — every pixel serves function
- State is always visible — never hidden behind menus

**Color Philosophy:** Dark background with high-contrast signal colors. Dark grey base (#1a1a1a) with amber (#f59e0b) for warnings, red (#ef4444) for critical, green (#22c55e) for confirmed, white (#f5f5f5) for primary text. Colors communicate severity, not decoration.

**Layout Paradigm:** Single-column stack with persistent action bar at bottom (thumb zone). Cards stack vertically. No horizontal scrolling ever. Fixed header shows current state.

**Signature Elements:**
- Monospace timestamps that feel authoritative
- Color-coded severity strips on left edge of entries
- Large floating action button in thumb zone

**Interaction Philosophy:** One tap to log. Two taps to categorize. Everything reachable with one thumb. No modals that block — use bottom sheets that slide up.

**Animation:** Minimal — only confirmatory. Brief flash on successful log. No transitions that delay input.

**Typography System:** JetBrains Mono for timestamps and data. System UI font (-apple-system) for labels and descriptions. Large base size (16px minimum).

</text>
<probability>0.08</probability>
</response>

<response>
<text>

## Idea 2: "Dispatch Console" — Emergency Services Aesthetic

**Design Movement:** Control room / dispatch interface — inspired by 911 dispatch software, SCADA systems, and emergency management tools. Dense but scannable.

**Core Principles:**
- Information density without cognitive overload
- Persistent status awareness (always know what's logged)
- Rapid-fire entry with minimal confirmation steps
- Offline-first with clear sync status indicators

**Color Philosophy:** Near-black background (#0f1117) with a cool blue-grey palette. Status communicated through saturated accent colors against the dark field. Blue (#3b82f6) for informational, amber (#eab308) for elevated, orange (#f97316) for high, red (#dc2626) for critical.

**Layout Paradigm:** Vertical timeline as primary view. Sticky input bar at bottom. Swipe-based category selection. Filter chips at top that don't scroll away.

**Signature Elements:**
- Pulsing dot for "recording active" state
- Severity badges with abbreviated codes (SEV-1, SEV-2)
- Compact timeline with expandable detail rows

**Interaction Philosophy:** The app is always ready to receive input. No loading states block entry. Tap-and-hold for photo attach. Swipe for quick categorize.

**Animation:** Functional only — new entries slide in from bottom. Severity changes pulse once. Sync indicator rotates when active.

**Typography System:** IBM Plex Mono for data/timestamps. IBM Plex Sans for UI labels. Tight line heights for density. 14px base with 12px for metadata.

</text>
<probability>0.06</probability>
</response>

<response>
<text>

## Idea 3: "Pocket Notebook" — Analog Documentation Feel

**Design Movement:** Digital skeuomorphism of a field notebook — inspired by Moleskine, police notebooks, and reporter pads. Familiar, fast, trustworthy.

**Core Principles:**
- Feels like writing in a notebook — immediate and natural
- No learning curve — anyone can use it in 5 seconds
- Records feel permanent and tamper-evident
- Minimal chrome — content is the interface

**Color Philosophy:** Warm off-white background (#fafaf8) with dark ink (#1c1917) for text. Subtle warm grey (#78716c) for metadata. Severity uses muted but distinct earth tones — rust (#b45309) for high, slate (#475569) for standard, brick (#991b1b) for critical.

**Layout Paradigm:** Full-bleed content area like a blank page. Entries appear as written notes with timestamps in the margin. Input at bottom like a text field in a messaging app — familiar pattern.

**Signature Elements:**
- Timestamp in left margin like a notebook
- Subtle ruled-line texture in background
- Entries feel "written" — left-aligned, natural flow

**Interaction Philosophy:** Type and hit enter. That's it. Category and severity are optional quick-select chips above the input. Photo is a camera icon next to input. No friction.

**Animation:** None. Entries appear instantly. No transitions. Speed is the feature.

**Typography System:** System font stack for speed. Monospace (SF Mono / Menlo) for timestamps only. 16px base to prevent iOS zoom. Regular weight throughout — bold only for severity labels.

</text>
<probability>0.07</probability>
</response>

---

## Selected Approach: Idea 1 — "Field Instrument"

The industrial utility design best serves the core requirement: reliability and speed under pressure. The dark background with high-contrast signal colors provides maximum legibility. The one-thumb-reachable layout respects the "one-hand use" requirement. The authoritative monospace timestamps reinforce record integrity.

Key implementation decisions:
- Dark theme by default (better for varied lighting, less attention-drawing)
- Bottom-anchored input and navigation (thumb zone)
- localStorage for offline-first data persistence
- Export as JSON and CSV for legal/reporting use
- No server dependency — everything runs client-side
