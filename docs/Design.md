# UTS Green

## Overview
Design system for **UTS Tutorías**, a mobile app (Android + iOS, React Native) where students enroll in academic tutoring modules, teachers manage their schedule and talk to students, and the CAE administers everything. It is content-first and card-driven: information is scanned quickly, actions are explicit, and rules (capacity, schedule conflicts, cancellation windows) are always explained to the user instead of failing silently.

The UTS institutional green is used for primary actions and active states. The lime accent is reserved for highlights and dark surfaces. Everything else stays white, soft gray and near-black so that module data (name, teacher, time, room, capacity) dominates.

Three roles share one app: `SUPERADMIN` (CAE), `TEACHER`, `STUDENT`. Each role gets its own navigation and screens but the same components.

## Colors
Source: UTS corporate identity manual. Colors marked *(brand)* come directly from the manual; colors marked *(derived)* were added to complete the system.

- **Primary** (#34531F): Main buttons, active states, progress bars — UTS Green *(brand, Pantone 2266 C)*
- **Primary Hover** (#132F20): Pressed state for green interactive elements — UTS Deep Green *(brand, Pantone 5535 C)*
- **Accent** (#C3D730): Highlights, selected indicators, dark surfaces — UTS Lime *(brand, Pantone 382 C, logo color)*. Never used as text or icon on white (contrast 1.6:1). Always paired with #132F20 text or placed over dark green.
- **Secondary** (#4E7A2F): Text links and inline mentions — Link Green *(derived, 5.0:1 on white)*
- **Neutral** (#575756): Secondary text, metadata, icon buttons — Cool Gray 4 *(brand, Pantone Cool Gray 4 C)*
- **Background** (#FFFFFF): Light mode primary background
- **Surface** (#F2F4EF): Inputs, chat bubbles received, metric cards, inactive chips — Soft Green Gray *(derived)*
- **Surface Warm** (#F8E9D4): Announcements, important notices — UTS Cream *(brand, Pantone 451 C)*
- **Text Primary** (#132F20): Titles, names, primary content — UTS Deep Green *(brand)*
- **Text Secondary** (#575756): Metadata, timestamps, descriptions — Cool Gray 4 *(brand)*
- **Border** (#E5E5E5): Card outlines, dividers
- **Success** (#2BA640): Available, resolved, active. Icon or fill only, not text on white.
- **Warning** (#FB8C00): Last spots, in review, rescheduled. Icon or fill with #132F20 text, not text on white.
- **Error** (#B3261E): Failures, blocked actions, cancellations *(derived)*
- **Error Pressed** (#6D100A): Pressed state for error elements — UTS Burgundy *(brand, Pantone 4975 C)*

### Dark mode
- **Background** (#0B1710) *(derived)*
- **Surface** (#132F20) *(brand)*
- **Primary** (#C3D730) with #132F20 text
- **Text Primary** (#F2F4EF)
- **Text Secondary** (#B3B3B3) *(brand, Cool Gray 5 C)*
- **Border** (rgba(255,255,255,0.08))
- Sent chat bubbles use #34531F with white text; received bubbles use #132F20.

### Chart palette
- Series 1: #34531F
- Comparison series: #878787 *(brand, Pantone 877 C)*
- Highlight series: #C3D730, always with a 1px #34531F stroke on light backgrounds
- Negative / problem series: #6D100A
- Never rely on color alone: every bar, segment and line has a direct value label or legend text.

### Contrast reference
| Pair | Ratio | Use |
|---|---|---|
| #34531F on #FFFFFF | 8.7:1 | Buttons, headings |
| #FFFFFF on #34531F | 8.7:1 | Text on primary buttons and sent bubbles |
| #4E7A2F on #FFFFFF | 5.0:1 | Text links |
| #575756 on #FFFFFF | 7.2:1 | Secondary text |
| #132F20 on #C3D730 | 9.0:1 | Text on accent fills |
| #C3D730 on #132F20 | 9.0:1 | Accent on dark surfaces |
| #B3261E on #FFFFFF | 6.5:1 | Error text |
| #C3D730 on #FFFFFF | 1.6:1 | **Fails.** Decorative fills only |
| #FB8C00 on #FFFFFF | 2.4:1 | **Fails.** Icons and fills only |
| #2BA640 on #FFFFFF | 3.2:1 | **Fails for text.** Icons and fills only |

## Typography
- **Display / Body Font**: Roboto — loaded from Google Fonts
- **Code Font**: Roboto Mono — used for temporary passwords and SMTP values

Roboto is used everywhere for its neutral versatility. Spanish text runs roughly 25-30% longer than English, so layouts must tolerate longer labels (wrap or clamp titles, never clip critical labels such as buttons and statuses).

- **Screen Title**: Roboto 24px/32px, weight 700
- **Section Title**: Roboto 18px/24px, weight 500
- **Card Title**: Roboto 16px/22px, weight 500, max 2 lines, ellipsis
- **Metric Number**: Roboto 28px/36px, weight 700
- **Body**: Roboto 14px/20px, weight 400
- **Body Small**: Roboto 12px/18px, weight 400
- **Metadata**: Roboto 12px/16px, weight 400, #575756
- **Label**: Roboto 12px/16px, weight 500, tracking 0.02em
- **Button Text**: Roboto 14px/20px, weight 500
- **Code**: Roboto Mono 14px/20px, weight 400

Metadata lines use the separator " · " in this order: `Prof. Name · Mon 10:00–12:00 · Room 301`.

## Elevation
Minimal. Level 0: flat with 1px #E5E5E5 border — default for cards. Level 1: 0 1px 2px rgba(0,0,0,0.1) — top app bar on scroll and bottom tab bar. Level 2: 0 4px 32px rgba(0,0,0,0.1) — menus and popovers. Level 3: 0 8px 40px rgba(0,0,0,0.2) — bottom sheets, dialogs, and modals. In dark mode, borders replace shadows (rgba(255,255,255,0.05)).

## Spacing
- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Screen horizontal padding: 16px
- Card padding: 16px; gap between cards: 12px
- Section spacing: 24px
- Minimum touch target: 48 x 48px (smaller visuals get extra hit area)
- Always respect safe areas (notch, home indicator, Android system bars)
- Tablets: lists become 2 columns from 600px width

## Border Radius
- 2px: Small badges
- 4px: Tooltips, message tail corner
- 8px: Banners, inputs, metric cards, schedule blocks
- 12px: Cards, bottom sheets (top corners 16px)
- 16px: Chat bubbles
- 9999px: Buttons, chips, avatars, composer, capacity pills

## Navigation
Bottom tab bar, 64px plus safe area, white, 1px #E5E5E5 top border, Level 1. Active tab: icon inside a 56 x 32px #F2F4EF pill, icon and label in #34531F with weight 700. Inactive: #575756. Unread tab badge: #B3261E circle with white number, 16px min. Top app bar 56px, white, Level 1 on scroll, screen title left, user avatar right (opens profile and sign out).

Tabs per role:
- **STUDENT**: Home · Modules · Schedule · Messages · PQRS
- **TEACHER**: Dashboard · Schedule · Messages · PQRS
- **SUPERADMIN**: Dashboard · Modules · Messages · PQRS · More (Teachers, Students, Settings)

After login, the app routes to the tab set of the user's role. If `mustChangePassword` is true, the change-password screen blocks all navigation until done.

## Components

### Buttons
- **Primary**: #34531F fill, white text, 48px height (40px compact), 16px horizontal padding, 9999px radius, pressed #132F20. Full width on forms and card actions.
- **Outlined**: 1px #E5E5E5 border, #132F20 text, transparent fill.
- **Tonal**: #F2F4EF fill, #132F20 text.
- **Destructive**: #B3261E fill, white text, pressed #6D100A. Always opens a confirmation dialog.
- **Accent** (dark surfaces only): #C3D730 fill, #132F20 text.
- **Disabled**: #F2F4EF fill, #878787 text. A disabled action always shows a helper line below explaining why.
- Icon buttons: 48px touch area, 24px icon, #575756.

### Inputs
- 48px height, #F2F4EF fill, 8px radius, 16px horizontal padding, label above (Label style).
- Focus: 2px #4E7A2F border. Error: 1px #B3261E border and message in #B3261E below. Password fields have a show/hide toggle.
- Textareas grow up to 6 lines, with a character counter when there is a limit.
- Dropdowns open as bottom sheets with a searchable list (values come from the administrable lists).

### Chips and segmented controls
- Chip: 9999px radius, #F2F4EF fill, #132F20 text, 14px weight 500, 8px/12px padding. Selected: #34531F fill, white text.
- Segmented control: 40px height, #F2F4EF track, selected segment white with Level 1.

### Badges
2px radius, Label style, 4px/8px padding. Info: #C3D730 fill, #132F20 text. Success: #2BA640 fill, white text. Warning: #FB8C00 fill, #132F20 text. Error: #B3261E fill, white text. Neutral: #E5E5E5 fill, #575756 text.

### Banners
#F8E9D4 fill, #132F20 text, 8px radius, 12px/16px padding, optional leading icon. Used for announcements, connection status and important notices.

### Dialogs and bottom sheets
Dialogs: 12px radius, Level 3, max 320px wide, title + body + two buttons (cancel left, confirm right). Bottom sheets: 16px top radius, drag handle, Level 3, used for details, pickers and filters.

### Toasts
Bottom, above the tab bar. #132F20 fill, white text, 8px radius, 4s. Success confirmations only; errors that need action use banners or inline messages.

### Avatars
Circle, 40px in lists and 48px in conversation lists. Fallback: initials on #F2F4EF with #132F20 text.

## Screen patterns

### Module card (students)
Container: white, 1px #E5E5E5 border, 12px radius, 16px padding, Level 0. One column on phones.

Layout, top to bottom:
1. Card Title: module name (2 lines max) with a status badge at the top right.
2. Teacher row: avatar 24px + teacher name.
3. Schedule row: calendar icon + `Mon 10:00–12:00`.
4. Room row: location icon + `Room 301 · Building B`.
5. Capacity: text `18/30 spots` (Body Small) above a 4px progress bar.
6. Action button, full width.

Capacity bar colors: under 80% #34531F; 80% to 99% #FB8C00; 100% #575756.

| State | Badge | Action |
|---|---|---|
| Spots available | Success "Spots available" | Primary "Enroll" |
| Last spots (80%+) | Warning "Last spots" | Primary "Enroll" |
| Full | Neutral "Full" | Disabled "Full", helper "No spots left" |
| Enrolled | Info "Enrolled" | Outlined "Cancel enrollment" |
| Enrolled, under 1 hour to start | Info "Enrolled" | Disabled, helper "You can no longer cancel: less than 1 hour left" |
| Schedule conflict | Error "Schedule conflict" | Disabled "Enroll", helper naming the conflicting module |
| Cancelled by teacher/CAE | Error "Cancelled" | No action |

Enrolling and cancelling both use a confirmation sheet showing module, day, time and room. Cancelling uses a destructive confirm button. A student who cancelled can enroll again while spots remain.

Above the list: search field and a horizontally scrolling chip bar to filter (All, Available, Enrolled, by day). Pull to refresh. Skeleton cards while loading.

### Weekly schedule (all roles)
Header: week label (`Nov 3 – 9`), previous/next arrows and a "Today" tonal button. Below it, a day strip with seven day pills (weekday letter + number). Today has a 1px #34531F ring; the selected day is filled #34531F with white text. A dot under a day means it has sessions.

Two views, toggled with a segmented control:
- **Day** (default on phones): vertical timeline for the selected day, hour rows 64px tall, time labels in Metadata style on the left.
- **Week**: seven columns, horizontally scrollable, compact blocks (time and room only). Default on tablets.

A "now" line (2px #B3261E with an 8px dot) crosses the current time on today.

Session block: #F2F4EF fill, 4px #34531F left border, 8px radius, 8px padding, minimum height 44px.
- Teacher block: time range, module name, room, student count (`18 students`).
- Student block: time range, module name, room, teacher name.
- Rescheduled: Warning badge "Rescheduled", new time shown.
- Cancelled: stays visible, text with strikethrough, 4px #B3261E left border, Error badge "Cancelled".

Tapping a block opens a bottom sheet with the full detail. **Students: read-only.** **Teachers** get two actions in the sheet:
- **Change time**: opens a date picker, then a grid of time chips. Available slots are selectable; slots with a room or teacher conflict are disabled with a reason (`Room occupied`, `You have another module`). Selected chip: #34531F fill. Then a confirmation sheet: old time → new time, text `18 students will be notified`, Primary "Confirm change".
- **Cancel session**: Destructive button with a confirmation dialog stating how many students will be notified.
- Under 2 hours to start: both actions are disabled with the helper `You can no longer change this session: less than 2 hours left`.

Empty day: icon, `No sessions this day`.

### Messages
The Messages tab has a segmented control at the top: **Alerts** and **Chats**.

**Alerts** (announcements, cancellations, changes): list rows with a leading 40px circular icon, title, one-line body, relative time, and an unread dot (#34531F, 8px). Icon circle colors by type: announcement #F8E9D4 with #132F20 icon; reschedule #FB8C00 tint with #132F20 icon; cancellation #B3261E tint with #B3261E icon; PQRS update #F2F4EF with #34531F icon. Tapping an alert deep-links to the related module, session or PQRS.

**Chats**: conversation list. Row: 48px avatar, name (weight 500), last message (1 line, #575756), time on the right, and a #34531F pill with the unread count (white text). Module chats show a small group icon. Floating "New message" button (56px circle, #34531F, white icon) for the people the role is allowed to message: students pick one of their module teachers; teachers pick a student of their modules or the CAE; the CAE picks a teacher.

**Chat screen**:
- App bar with avatar, name and a subtitle (`Module name` or connection state).
- Bubbles: max width 78%, 16px radius, with a 4px radius on the tail corner. Sent: #34531F fill, white text, right aligned. Received: #F2F4EF fill, #132F20 text, left aligned. A timestamp (Metadata) under the last message of each group of consecutive messages.
- Date separators: centered neutral chip (`Today`, `Yesterday`, date).
- Message states: sending (clock icon, 60% opacity), sent (single check), failed (red icon with "Tap to retry").
- Teacher announcements to a module are not bubbles: they are full-width banner cards (#F8E9D4) labeled "Announcement" with the teacher's name.
- Composer: pinned above the keyboard, #F2F4EF pill input (min 48px, grows to 5 lines), 48px circular send button (#34531F, white icon). The send button is disabled while the input is empty.
- Typing indicator: three #575756 dots animating, in a received-style bubble.
- Connection: while reconnecting, a #F8E9D4 banner under the app bar says `Reconnecting…`. Messages typed offline stay in the "sending" state and are sent when the connection returns.
- Lists load newest first with infinite scroll upward.

### PQRS
**Status chips**: Filed (Neutral badge), In review (Warning badge), Resolved (Success badge). Type labels: Petition, Complaint, Claim, Suggestion.

**Filing screen (students and teachers)**: single column form. Type as a chip group (single select), Subject input, Description textarea with counter. Primary full-width "Submit". After submitting: confirmation screen with a check icon, the filing number in Roboto Mono, and a button "View my PQRS".

**My PQRS (students and teachers)**: card list, each card with the subject (2 lines), type label, status badge, and relative date (`3 days ago`). Detail screen: header with subject and status, a vertical status timeline (dots connected by a 2px #E5E5E5 line; completed dots #34531F), and the conversation thread below, using the same bubble style as chat. Users can reply only while the PQRS is not resolved.

**Management (CAE)**: list with a filter chip bar (All, Filed, In review, Resolved, plus type chips), oldest unattended first, and a count badge on the PQRS tab for items in "Filed". Detail screen adds a status control (tonal button with a bottom sheet to change status) and two actions: **Notify user** (sends an in-app notification) and **Reply by email** (opens a compose sheet; the thread keeps a copy of what was sent).

### Dashboards
Layout: Screen Title, an optional period selector chip (`This week`, `This month`, `Semester`), then content blocks stacked with 16px gaps.

**Metric card**: #F2F4EF fill, 8px radius, 16px padding, 2 per row. Metric Number on top, label in Metadata style below, optional trend (arrow icon + `+5%`, #34531F up, #B3261E down when higher is worse, with explanatory text, never color alone).

**Hero card** (next session, for teachers and students): #34531F fill, white text, 12px radius, 16px padding. Shows `Next tutoring`, module name, day and time, room, and (for teachers) student count. Button "View details" in Accent style. If there is no next session, show a #F2F4EF card with `No upcoming sessions`.

**Capacity bars**: label left, `18/30` right, 8px bar below (same color rules as the module card).

**CAE Dashboard**
1. Overall occupancy: large progress bar with percentage, plus a line `X modules full · Y with low enrollment`.
2. Metric cards: active modules, active students, active teachers, PQRS in "Filed".
3. PQRS by status: single horizontal stacked bar with labeled segments (Neutral, Warning, Success), plus average response time as a metric card.
4. Recent cancellations and reschedules: list of up to 5 rows with icon, module, and relative time; "See all" link.
5. Room usage: horizontal bar chart, most and least occupied rooms.

**Teacher Dashboard**
1. Hero card: next session.
2. Metric cards: sessions this week, unread messages.
3. Capacity bars for each of their modules.
4. My PQRS: up to 3 recent items with status badges.

**Student Dashboard (Home)**
1. Hero card: next session.
2. Metric cards: enrolled sessions this week, unread alerts and messages.
3. Recent changes: list of cancellations and reschedules affecting them.
4. My PQRS: up to 3 recent items with status badges.

### Admin management patterns
- **Lists (teachers, students, rooms)**: search field, filter chips (All, Active, Inactive), rows with avatar, name, email (Metadata) and a status badge (Active neutral-success, Inactive neutral). Overflow menu per row: Edit, Deactivate/Reactivate, Delete. Deleting is a logical delete and always uses a destructive confirmation dialog; its text says the record is hidden, not erased.
- **Create teacher**: form (name, institutional email, other data). Email validated against the allowed domain with an inline error. On success, a dialog shows the **temporary password** once, in Roboto Mono on a #F2F4EF block with a "Copy" button, and the note that the teacher must change it at first login.
- **Rooms**: card or row with name, location and capacity (`30 people`).
- **Module management**: change room or teacher via a bottom sheet picker. When the selected room has less capacity than the enrolled students, the option is disabled and the message in #B3261E reads `Not enough capacity: 32 enrolled, this room holds 30`. Changing room, teacher or schedule shows a confirmation that states how many students will be notified.
- **Settings**: grouped list rows (Data, Dropdown lists, Institutional emails, SMTP) with chevrons. SMTP form: host, port, user, password (masked, never shown after saving), from address, and a tonal "Send test email" button with inline success or error result. Save is a Primary button pinned at the bottom.

## States
- **Loading**: skeleton shapes in #F2F4EF with a slow shimmer; never a blank screen. Buttons show a spinner and stay the same width while submitting.
- **Empty**: 48px #575756 icon, one-line title, one-line explanation, and a Primary or Tonal button when there is a next step (e.g. `Browse modules`).
- **Error**: inline message with a "Try again" tonal button. Network failure shows a banner `You are offline` (#F8E9D4).
- **Rule feedback**: every blocked action explains the rule in plain language (capacity, conflict, cancellation window, domain). The text comes from the translation files.

## Accessibility and internationalization
- Minimum touch target 48 x 48px. Text scales with the system font size up to 200% without clipping.
- Contrast follows the table above; status is always conveyed by text or icon in addition to color.
- All icons that carry meaning have accessibility labels; the chat, schedule blocks and cards announce their full content to screen readers.
- Language follows the device (Spanish or English; Spanish by default). Dates, times and numbers follow the device locale and the `America/Bogota` time zone. Timestamps are stored in UTC.
- No hard-coded strings in components; all text is in the translation files.

## Do's and Don'ts
- Do show the rule behind every disabled button.
- Do show how many students will be notified before confirming any change or cancellation.
- Do use #34531F for primary actions and keep #C3D730 for highlights and dark surfaces.
- Don't place #C3D730 text or icons on white or light backgrounds; the contrast fails.
- Don't use #2BA640 or #FB8C00 as text color on white; use them as icons or fills.
- Don't use red for anything other than errors, cancellations, destructive actions, unread tab badges and the "now" line.
- Do clamp card titles to 2 lines with ellipsis for consistent lists.
- Do keep cards flat (border, no shadow); reserve shadows for sheets, dialogs and menus.
- Do keep student schedules read-only; actions on sessions belong to teachers and the CAE.
- Don't expose temporary passwords or SMTP passwords after the moment of creation or saving.
- Don't use custom scrollbars; rely on native scrolling.
- Don't alter the brand colors marked *(brand)*; add new shades only as *(derived)* colors.
