# UTS Green

## Overview
Design system for **UTS Tutorías**, a mobile app (Android + iOS, React Native) where students enroll in academic tutoring modules, teachers manage their schedule and talk to students, and the CAE administers everything. It is content-first and card-driven: information is scanned quickly, actions are explicit, and rules (capacity, schedule conflicts, cancellation windows) are always explained to the user instead of failing silently.

The UTS institutional green is used for primary actions and active states. The lime accent is reserved for highlights and dark surfaces. Everything else stays white, soft gray and near-black so that module data (name, teacher, time, room, capacity) dominates.

Three roles share one app: `SUPERADMIN` (CAE), `TEACHER`, `STUDENT`. Each role gets its own navigation and screens but the same components.

The visual feel is **modern and smooth**: soft shadows, generous radii, subtle gradients in the institutional greens, fluid micro-animations and consistent line icons. The identity of the university is present through its official logo, colors and brand elements (see "University brand elements").

## Colors
Source: UTS corporate identity manual. Roles marked *brand* come directly from the manual; roles marked *derived* were added to complete the system and are measured against the contrast rules below. **The role table is the single source of truth**: `mobile/src/theme/colors.ts` defines exactly these 40 roles in both modes, and a test (`designDoc.test.ts`) fails when the table and the theme differ. Components use roles, never a hex value.

### Role table
| Role | Light | Dark | Origin | Use |
|---|---|---|---|---|
| `background` | `#FFFFFF` | `#0B1710` | base | Base background of the app, sheets and dialogs |
| `screen` | `#F2F4EF` | `#0B1710` | derived | Background of list and dashboard screens, so cards stand out softly |
| `card` | `#FFFFFF` | `#132F20` | base | Cards, metric cards, sheets, top bar and tab bar |
| `surface` | `#F2F4EF` | `#1B3D2A` | derived | Chips, inactive controls, received chat bubbles, fields on cards; in dark it is lighter than the card |
| `surfaceWarm` | `#F8E9D4` | `#2E2718` | brand (UTS Cream, Pantone 451 C); dark derived | Announcements and important notices; in dark a dark cream, never the light one |
| `primary` | `#34531F` | `#C3D730` | brand (UTS Green, Pantone 2266 C); dark = lime | Main buttons, active states, progress bars |
| `primaryPressed` | `#132F20` | `#9FB01F` | brand (UTS Deep Green, Pantone 5535 C); dark value derived | Pressed state of green interactive elements (dark: a darker lime so the press shows; `onPrimary` 6.0:1) |
| `onPrimary` | `#FFFFFF` | `#132F20` | base | Text and icons on `primary` |
| `accent` | `#C3D730` | `#C3D730` | brand (UTS Lime, Pantone 382 C) | Highlights, selected indicators, dark surfaces. Never text or icon on white (1.6:1) |
| `onAccent` | `#132F20` | `#132F20` | brand | Text on `accent`, on success and on warning fills |
| `link` | `#4E7A2F` | `#C3D730` | derived | Text links and inline mentions |
| `textPrimary` | `#132F20` | `#F2F4EF` | brand | Titles, names, primary content |
| `textSecondary` | `#575756` | `#B3B3B3` | brand (Cool Gray 4 C; dark Cool Gray 5 C) | Metadata, timestamps, descriptions, icon buttons |
| `border` | `#E5E5E5` | `rgba(255,255,255,0.08)` | derived | Dividers and outlines of cards in dark |
| `error` | `#B3261E` | `#B3261E` | derived | Fill of errors, blocked actions and cancellations |
| `errorText` | `#B3261E` | `#FF8A80` | derived | Error as text or icon; in dark a lighter red (the fill is 2.2:1 on dark) |
| `errorPressed` | `#6D100A` | `#6D100A` | brand (UTS Burgundy, Pantone 4975 C) | Pressed state of error elements |
| `onError` | `#FFFFFF` | `#FFFFFF` | base | Text and icons on `error` |
| `success` | `#2BA640` | `#2BA640` | derived | Fill or icon for available, resolved, active. Not text |
| `successPressed` | `#3DBB55` | `#3DBB55` | derived | Pressed state of success |
| `warning` | `#FB8C00` | `#FB8C00` | derived | Fill or icon for last spots, in review, rescheduled. Not text |
| `warningPressed` | `#E07B00` | `#E07B00` | derived | Pressed state of warning |
| `disabledText` | `#878787` | `#878787` | brand (Pantone 877 C) | Disabled text and icons (exempt from contrast, WCAG) |
| `scrim` | `rgba(0,0,0,0.4)` | `rgba(0,0,0,0.4)` | derived | Backdrop of dialogs and sheets |
| `inputFill` | `#F2F4EF` | `#0B1710` | derived | Fill of text fields placed on cards |
| `inputFillOnScreen` | `#FFFFFF` | `#0B1710` | derived | Fill of text fields placed on the screen background |
| `inputBorder` | `#C9D0C3` | `rgba(255,255,255,0.16)` | derived | 1px soft border of every text field (exempt from 3:1 by design) |
| `inputBorderFocus` | `#4E7A2F` | `#C3D730` | derived | 2px border of a focused field (3:1) |
| `inputLabelFocus` | `#34531F` | `#C3D730` | derived | Label of a focused field |
| `inputPlaceholder` | `#6E6E6E` | `#B3B3B3` | derived | Placeholder text inside fields (4.6:1 on the fill; #767676 was 4.1:1, spec 023) |
| `focusGlow` | `rgba(78,122,47,0.15)` | `rgba(195,215,48,0.18)` | derived | Glow around a focused field |
| `errorGlow` | `rgba(179,38,30,0.12)` | `rgba(179,38,30,0.25)` | derived | Glow around a field with an error |
| `onSurfaceWarm` | `#132F20` | `#F8E9D4` | derived | Text and icons on `surfaceWarm` |
| `shadow` | `#132F20` | `#000000` | derived | Color of shadows; deep green in light, black in dark |
| `successText` | `#1B7A2E` | `#5BD16E` | derived | Success as text (4.5:1 on card and screen) |
| `warningText` | `#8A4B00` | `#FFB74D` | derived | Warning as text (4.5:1 on card and screen) |
| `selected` | `#E4EBDD` | `#224A33` | derived | Selected row, chip or card |
| `tabActive` | `#34531F` | `#C3D730` | derived | Active tab icon and label (3:1 on the bar) |
| `tabInactive` | `#575756` | `#B3B3B3` | derived | Inactive tab icon and label (3:1 on the bar) |
| `controlBorder` | `#76827A` | `#7A9A85` | derived | Border of outlined and tonal buttons and of unselected chips (3:1 on `card`, `screen` and `selected`) |

### Gradients and brand
- **Gradient Brand** (#34531F → #132F20, 135°): Hero cards, login header, splash. Always paired with white text. Same in light and dark.
- Never use the lime `accent` as text or icon on a white or light surface; pair it with `onAccent` text or place it over dark green.
- `success` and `warning` are fills and icons. Text that states a status uses `successText` and `warningText`.

### Dark mode
- Dark is a set of roles, not an inversion: every role above has a dark value, and no component may paint a light-mode color in dark.
- The app follows the system mode and changes without restarting; there is no in-app switch.
- Elevation in dark is told by surface and border, not by shadow (see Elevation): `card` over `screen`, `surface` lighter than `card`, and a 1px `border` on cards.
- `primary` is lime in dark, with `onPrimary` text (deep green). Sent chat bubbles use `#34531F` with white text; received bubbles use `card`.
- The cream notice is dark cream (`surfaceWarm`) with light cream text (`onSurfaceWarm`); a light notice on a dark screen is a defect.
- The splash and the system bars follow the mode.

### Chart palette
- Series 1: #34531F
- Comparison series: #878787 *(brand, Pantone 877 C)*
- Highlight series: #C3D730, always with a 1px #34531F stroke on light backgrounds
- Negative / problem series: #6D100A
- Never rely on color alone: every bar, segment and line has a direct value label or legend text.

### Contrast reference
Every text, icon and indicator pair of the role table is measured in both modes by `contrast.test.ts` (text 4.5:1; icons, focus and active-state indicators 3:1). The main pairs:

| Pair | Light | Dark |
|---|---|---|
| `textPrimary` on `card` | 14.4:1 | 13.0:1 |
| `textSecondary` on `card` / on `surface` (dark) | 7.2:1 | 6.9:1 / 5.7:1 |
| `onPrimary` on `primary` | 8.7:1 | 9.0:1 |
| `link` on `card` | 5.1:1 | 9.0:1 |
| `errorText` on `card` | 6.5:1 | 6.3:1 |
| `successText` on `screen` | 4.9:1 | 9.4:1 |
| `warningText` on `screen` | 6.1:1 | 10.6:1 |
| `onSurfaceWarm` on `surfaceWarm` | 12.1:1 | 12.4:1 |
| `tabActive` / `tabInactive` on `card` | 8.7:1 / 7.2:1 | 9.0:1 / 6.9:1 |
| `controlBorder` on `card` / `screen` / `selected` | 4.0:1 / 3.6:1 / 3.3:1 | 4.7:1 / 5.9:1 / 3.2:1 |

Fails by design, fills and icons only: `accent` on white (1.6:1), `warning` on white (2.4:1), `success` on white (3.2:1), `inputBorder` on white (about 1.6:1). The field is identified by its fill, label and focus border (`inputBorderFocus`, 3:1), not by its soft border (D-123).

## Typography
- **Corporate Font**: **Myriad Pro**, the institutional typeface of the UTS. Weights used: Regular (400), Semibold (600) and Bold (700).
- **Code Font**: **Source Code Pro**, used for temporary passwords, filing numbers and SMTP values (Myriad Pro has no monospaced version).
- **Fallback while the license or files are pending**: **Source Sans 3** (free, open source, very similar proportions) with the same three weights. Switching between Myriad Pro and the fallback is a single change in the `fonts` tokens of the theme; no component writes a font name.

**Licensing:** Myriad Pro is a commercial font. The app can only embed it with a license that covers mobile app distribution, and the font files must be provided by the university (see D-051). Do not copy the fonts from a computer without confirming the license.

**Weights:** the earlier medium weight (500) is now **Semibold (600)**, since Myriad Pro has no medium weight. In React Native each weight is a separate font file; never rely on `fontWeight` with custom fonts.

**Size adjustment:** Myriad Pro is narrower and has a smaller x-height than the previous typeface, so sizes grow by 1px to keep the same legibility. Spanish text is still about 25-30% longer than English, so layouts must tolerate longer labels (wrap or clamp titles, never clip critical labels such as buttons and statuses).

If a component spec elsewhere in this file mentions a size or weight, the named type style below prevails.

- **Screen Title**: Myriad Pro 26px/32px, Bold
- **Section Title**: Myriad Pro 19px/26px, Semibold
- **Card Title**: Myriad Pro 17px/22px, Semibold, max 2 lines, ellipsis
- **Metric Number**: Myriad Pro 30px/36px, Bold
- **Body**: Myriad Pro 15px/22px, Regular
- **Body Small**: Myriad Pro 13px/18px, Regular
- **Metadata**: Myriad Pro 13px/18px, Regular, #575756
- **Label**: Myriad Pro 12px/16px, Semibold, tracking 0.02em
- **Button Text**: Myriad Pro 15px/20px, Semibold
- **Code**: Source Code Pro 14px/20px, Regular

The theme names (`typography`): `screenTitle`, `sectionTitle`, `cardTitle`, `metricNumber`, `body`, `bodySmall`, `metadata`, `label`, `button` and `code`. A component uses one of them and never writes a size.

Metadata lines use the separator " · " in this order: `Prof. Name · Mon 10:00–12:00 · Room 301`.

## Elevation
Soft and layered. In light mode shadows use the `shadow` role (deep green #132F20), never pure black, to keep the look warm and smooth. Components get the levels from `useShadows()`, which applies the color of the current mode.

- **Level 0:** flat. Screen background, dividers, inputs.
- **Level 1 (cards):** `0 2px 8px rgba(19,47,32,0.06)`. Default for cards and metric cards. No border.
- **Level 2 (raised):** `0 8px 24px rgba(19,47,32,0.10)`. Hero cards, floating buttons, pressed-and-lifted states, menus and popovers.
- **Level 3 (overlays):** `0 16px 48px rgba(19,47,32,0.18)`. Bottom sheets, dialogs and modals.

On Android, map each level to the closest `elevation` value. In dark mode a shadow does not read on the dark background, so elevation is told by **surface and border**: the screen is `screen`, cards are `card` with a 1px `border`, and anything raised above a card (`surface`, menus, sheets) is lighter than it. The `shadow` role in dark is black, and the level shadow stays only as a soft hint.

## Spacing
- Base unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Screen horizontal padding: 16px
- Card padding: 16px; gap between cards: 12px
- Section spacing: 24px
- Minimum touch target: 48 x 48px (smaller visuals get extra hit area)
- Always respect safe areas (notch, home indicator, Android system bars)
- Tablets: lists become 2 columns from 600px width
- Names in the theme (`spacing`): `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 24 · `xxl` 32 · `xxxl` 48 · `huge` 64. Screen padding is `lg`; section spacing is `xl`; the gap between cards is `md`.

## Border Radius
- 4px: Tooltips, message tail corner
- 8px: Small badges, schedule blocks
- 12px: Inputs, banners
- 16px: Cards, metric cards, chat bubbles
- 20px: Hero cards, dialogs
- 24px: Top corners of bottom sheets, login card, curved header bottom (32px)
- 9999px: Buttons, chips, avatars, composer, capacity pills
- Names in the theme (`radius`): `tooltip` 4 · `badge` 8 · `input` 12 · `banner` 12 · `card` 16 · `hero` 20 · `sheet` 24 · `header` 32 · `pill` 9999.

## Iconography (Iconify)

**All icons come from Iconify. No other icon library is allowed** (no `@expo/vector-icons`, no Lucide, no emoji as icons, no hand-pasted SVGs for UI icons).

- **Icon set:** `solar` for the whole app. Style `-linear` by default and `-bold` for the active or selected state (for example `solar:home-2-linear` and `solar:home-2-bold`). Use another set (`mdi`) only when `solar` lacks the icon, and record it in `Decisions.md`.
- **Package:** `react-native-iconify` (pure JS plus `react-native-svg`), because it works in Expo Go, which the iPhone demo depends on. Do not use `@huymobile/react-native-iconify`: it needs native modules and a development build.
- **One registry:** every icon is declared in a single file, `mobile/src/icons/`, with the Iconify name written as a literal string (the library does not accept names from variables). Components import icons from that file through a shared `Icon` wrapper.
- **Sizes:** 16px in metadata lines, 20px inside buttons and inputs, 24px in the tab bar and app bar, 40px in empty states.
- **Color:** always from theme tokens. Icons in dark text use `textPrimary` or `neutral`; the accent lime follows the same rule as text (never on light backgrounds).
- **Accessibility:** an icon next to a text label is decorative and hidden from screen readers; an icon-only control has an `accessibilityLabel` and a 48px touch target.

Reference names (verify each one exists on icones.js.org before using it):

| Meaning | Iconify name |
|---|---|
| Home / Dashboard | `solar:home-2-linear` |
| Modules | `solar:book-2-linear` |
| Schedule | `solar:calendar-linear` |
| Messages / chat | `solar:chat-round-dots-linear` |
| PQRS | `solar:clipboard-text-linear` |
| More | `solar:hamburger-menu-linear` |
| Teacher / user | `solar:user-linear` |
| Students / group | `solar:users-group-rounded-linear` |
| Room / location | `solar:map-point-linear` |
| Time | `solar:clock-circle-linear` |
| Sign in | `solar:login-3-linear` |
| Sign out | `solar:logout-2-linear` |
| Create account | `solar:user-plus-linear` |
| Email | `solar:letter-linear` |
| Password | `solar:lock-password-linear` |
| Show / hide password | `solar:eye-linear` / `solar:eye-closed-linear` |
| Add | `solar:add-circle-linear` |
| Edit | `solar:pen-linear` |
| Delete | `solar:trash-bin-trash-linear` |
| Send | `solar:plain-linear` |
| Search | `solar:magnifer-linear` |
| Notifications | `solar:bell-linear` |
| Settings | `solar:settings-linear` |
| Back | `solar:arrow-left-linear` |
| Success | `solar:check-circle-linear` |
| Warning | `solar:danger-triangle-linear` |
| Error / close | `solar:close-circle-linear` |

## Motion and feel
Animations make the app feel smooth, never slow. Use `react-native-reanimated`, `expo-linear-gradient` and `expo-haptics`.

- **Durations:** 150ms for press feedback, 250ms for standard transitions, 350ms for sheets and screen changes. Nothing above 400ms.
- **Easing:** `cubic-bezier(0.2, 0, 0, 1)` for movement; spring (damping 20, stiffness 200) for bottom sheets and dialogs.
- **Press feedback:** buttons scale to 0.97, cards to 0.98, with a 100ms return.
- **Entrance:** the first screen of list items fades in and rises 8px, staggered 40ms, up to 8 items. Never animate items that scroll into view later.
- **Screen transitions:** native stack slide; modals and sheets rise from the bottom.
- **State changes:** badges, progress bars and capacity bars animate their change over 250ms. Numbers in metric cards count up once on first load.
- **Skeletons:** shimmer loop of 1.2s in `Screen` and `Card` tones.
- **Brand loader:** one brand icon at a time (book, feather, leaf), 900ms per icon, inside a ring that spins once per second, where each icon grows in and shrinks out (see Loader); with reduce motion, no size change or spin, an instant icon swap and a pulsing ring.
- **Haptics:** light impact on primary actions; success, warning and error notification haptics after enrolling, cancelling and failed actions.
- **Reduce motion:** when the system setting is on, remove movement, shimmer and count-up, and keep only fades.
- **Performance:** animations run on the UI thread; keep 60 fps. No animation is allowed to delay a user action.

## University brand elements
The app must feel institutional. The official assets come from the UTS corporate identity manual and are provided by the university; they live in `mobile/assets/brand/`:

- `uts-logo.svg` (full color), `uts-logo-white.svg` (for green and dark backgrounds), `uts-logo-mark.svg` (symbol only), app icon and splash.
- **Never** redraw, recolor, stretch, rotate, outline or add effects to the logo. Respect the clear space and minimum size from the manual.
- **Where it appears:** splash, login, password recovery and change-password screens, profile or About screen, email headers, and (as a single-color silhouette) the Android notification icon.
- **Where it does not:** repeated on every screen or inside cards.
- **Institutional palette:** primary green, deep green, lime and cream from the Colors section. Use them in gradients and shapes before introducing any other color.
- **Signature details:** a 4px lime line under hero titles, and the Brand pattern (below) over the green gradient headers. Geometric shapes such as circles, arcs or blobs are not used as decoration; the only exception is the functional loading ring of the Brand loader (D-080).
- **Photography:** only authorized campus images, always under a deep-green overlay at 60% when text sits on top.
- **Naming:** the app is called "UTS Tutorías". The official name of the institution is **Institución Universitaria Tecnológica de Santander – UTS** (Resolución MEN 019103 of 23 July 2026; the acronym UTS is kept). The full name appears in the login footer, the About screen and emails; in short texts use "UTS". The former name "Unidades Tecnológicas de Santander" is not used anywhere in the app.

### Brand pattern (leaves, feathers and books)
A decorative pattern inspired by the elements of the university crest replaces any geometric decoration. It is not a reproduction of the crest: the official crest only appears as the official logo asset.

- **Icons:** a leaf, a feather and an open book, from Iconify (`mdi:leaf`, `mdi:feather`, `mdi:book-open-page-variant`; verify the names on icones.js.org). These decorative icons may come from `mdi` when `solar` has no equivalent (see D-049).
- **Component:** one `BrandPattern` component with a fixed list of placements (position in %, size, rotation, icon). The list is deterministic, never random per render, so the layout does not jump.
- **Style:** about 14 icons in the login header, sizes 30 to 64px, rotations between -30° and 30°, a mix of the three icons staggered (not in straight rows). White at 8-12% opacity; up to 3 icons in lime #C3D730 at 14-18% for warmth. In dark mode, white at 6%.
- **Clear zone:** nothing is placed in the central area where the logo and title sit, so the logo keeps its clear space and the text stays legible.
- **Empty variant:** `BrandPattern variant="empty"` (4 fixed icons at the corners, 38 to 46px) sits behind the icon of every empty state, over `screen` or `card` instead of the green gradient (`onSurface`: the icons take the `primary` role, at 12-14% in light and 6% in dark). It is the one pattern of that screen.
- **Clipping:** icons may be cut by the edge of the header or card; that is intended.
- **Where:** headers of login, registration, password recovery and change-password screens, the splash background, and hero cards (3 icons at 10%, bottom-right corner). Never on regular content screens, lists or inside cards.
- **Behavior:** static. A single 350ms fade-in on first show; with reduce motion, no animation. The pattern ignores touches and is hidden from screen readers.
- **Performance:** memoize the component and never re-render it with the keyboard.



## Visual registers
Two registers, chosen by the type of screen. The type decides the register, not the taste of whoever builds the screen.

| Register | Screens | What it looks like |
|---|---|---|
| **Sober** | Lists, schedule, module and session detail, administration forms and detail, chat, PQRS, settings | `screen` background, `card` surfaces, `primary` only on actions and active states, hierarchy by type and spacing. No gradient and no brand pattern |
| **Sober with header** | Administration lists (modules, locations, rooms, teachers, students, periods, holidays, dropdown lists and items), the changes list and the "More" index | Everything of the sober register plus one compact `ScreenHeader` at the top: brand gradient, `screenTitle` in `onGradient.text`, a 4px `accent` line and an optional count in `metricNumber`. No `BrandPattern`; the title is an existing text and the count is a number, never a new string |
| **Expressive** | Login and password screens, the home of each role, empty states | Brand gradient or colored header, `BrandPattern` leaves, feathers and books, `accent` highlights over dark green |

Rules to check a screen (they turn "elegant", "modern", "consistent" and "close to the UTS" into something a reviewer can verify):
1. **One focus.** At most one primary button per screen area and one `accent` element per screen.
2. **Expressive budget.** An expressive screen has at most one gradient or colored block and one `BrandPattern`; a sober screen has none; a sober screen with header has exactly one `ScreenHeader` and no `BrandPattern` (a test, `headerBudget`, checks it).
3. **Hierarchy by type.** Each screen has one `screenTitle`; sections use `sectionTitle`; a screen never uses more than four type styles.
4. **Rhythm.** Spacing only from the `spacing` scale; 16px screen padding, 12px between cards, 24px between sections.
5. **Surfaces.** A card is always `card` on `screen`; nothing is a card inside a card.
6. **Roles only.** No hex value, font name or size in a component (a test fails on loose colors).
7. **Both modes.** A screen is reviewed in light and dark; a leftover of one mode in the other is a defect.
8. **Brand.** The UTS logo, the green and the lime appear as in "University brand elements"; the pattern is the only decoration.

## Navigation
Bottom tab bar, 64px plus safe area, white, 1px #E5E5E5 top border, Level 1. Active tab: icon inside a 56 x 32px #F2F4EF pill, icon and label in #34531F with weight 700. Inactive: #575756. Unread tab badge: #B3261E circle with white number, 16px min. Top app bar 56px, white, Level 1 on scroll, screen title left, then the notifications bell and the user avatar on the right (the avatar opens profile and sign out). The bell (`solar:bell-linear`, bold when there is something unread) is a 48px target with the unread count in a #B3261E badge with a white number (16px min, `99+` above 99); it opens the inbox of the role.

Tabs per role:
- **STUDENT**: Home · Modules · Schedule · Messages · PQRS
- **TEACHER**: Dashboard · Schedule · Messages · PQRS
- **SUPERADMIN**: Dashboard · Modules · Messages · PQRS · More (Teachers, Students, Settings)

After login, the app routes to the tab set of the user's role. If `mustChangePassword` is true, the change-password screen blocks all navigation until done.


### Screens without a tab
A screen that has no tab (the notifications inbox for all roles and the CAE changes list) is **hidden from the bar but reachable by route** (D-121). It never leaves a gap in the bar, and going back returns to the screen the person came from (the tab history). Every hidden screen has a visible way back and appears in the route tests. The tab bar and the top bar keep their shape; only their colors change with the mode (`tabActive`, `tabInactive`, `card`).

## Components

### Buttons
- **Every button has a leading icon** (Iconify, 20px) followed by its label, with an 8px gap between icon and text. Exceptions: inline text links, and icon-only controls (send, close, back, toolbar), which have an `accessibilityLabel` and a 48px touch target. A "Next" style action may use a trailing arrow icon instead.
- **Spacing:** buttons stacked vertically are separated by **16px** (never less than 12px); buttons side by side by 12px; a button group is separated from other content by 24px. Buttons never touch each other.
- **Primary**: #34531F fill, white text and icon, 52px height (44px compact), 20px horizontal padding, 9999px radius, Level 1, pressed #132F20 with scale 0.97. Full width on forms and card actions.
- **Outlined**: 1px #E5E5E5 border, #132F20 text and icon, transparent fill.
- **Tonal**: #F2F4EF fill, #132F20 text and icon.
- **Severity buttons** (spec 016): the same shape as Primary (52px, 9999px radius, Level 1, scale 0.97 on press, leading icon). The fill says how serious the action is, so the user reads the risk before reading the label. Use the lowest severity that fits, and never more than one severity button next to a Primary.

  | Severity | Fill | Text and icon | Pressed | Use | Confirmation |
  |---|---|---|---|---|---|
  | **Success** | #2BA640 | #132F20 (4.6:1) | #3DBB55 *(derived)* | A positive or restoring action: Reactivate, Restore, Enable | None |
  | **Warning** | #FB8C00 | #132F20 | #E07B00 *(derived)* | A reversible action with side effects: Deactivate, Cancel a session, Close a period | Dialog that states the effect in numbers |
  | **Destructive** | #B3261E *(derived)* | #FFFFFF | #6D100A *(brand)* | An action that cannot be undone from the app: Delete | Dialog that states the effect in numbers and that it cannot be undone |

  Text on Success and Warning is deep green, not white: white on #2BA640 is 3.2:1 and on #FB8C00 is 2.2:1, below AA. Every pair above, pressed included, is at least 4.5:1 and a test checks it. The icon follows the action, not the severity (power for Deactivate, trash for Delete, activate for Reactivate). The confirm button of a dialog takes the severity of the action it confirms (`ConfirmDialog` prop `variant`); its Cancel stays Outlined.
- **Accent** (dark surfaces only): #C3D730 fill, #132F20 text and icon.
- **Disabled**: #F2F4EF fill, #878787 text and icon. A disabled action always shows a helper line below explaining why.
- **Loading**: the icon is replaced by the compact brand loader (see Loader); the button keeps its width.
- Icon-only buttons: 48px touch area, 24px icon, #575756.

### Inputs
Every text field must read clearly as a field: it always has **both a fill and a soft border**.

- **Size and shape:** 52px height, 12px radius, 16px horizontal padding. The label sits above the field in Label style (8px gap).
- **Fill and border:**
  - On a white card or sheet: fill #F2F4EF + 1px #C9D0C3 border.
  - On the Screen background (#F2F4EF): fill #FFFFFF + the same border.
- **Icons:** a leading 20px icon in #575756 (email, lock, search, and so on) and, when needed, a trailing icon button (show/hide password, clear, dropdown chevron).
- **Placeholder:** #6E6E6E (light), Body style.
- **Focus:** 2px #4E7A2F border, fill #FFFFFF, soft glow `0 0 0 4px rgba(78,122,47,0.15)`, label turns #34531F. The change animates over 150ms.
- **Error:** 1px #B3261E border, glow `rgba(179,38,30,0.12)`, and the message below with an error icon, in #B3261E.
- **Disabled:** 60% opacity, no glow.
- **Same style for:** textareas (grow up to 6 lines, counter inside the bottom-right corner), dropdown triggers (with a chevron), the search field and the chat composer.
- **Passwords** have a show/hide toggle. **Dropdowns** open as bottom sheets with a searchable list (values come from the administrable lists).
- **Date fields** (calendar days such as the start and end of an academic period): same look as any input, with a leading calendar icon. They show the date as **dd/mm/YYYY** in both languages and the user **picks** it from the system date picker (Android dialog; iOS bottom sheet with Confirm and Cancel buttons, 16px apart; cancelling keeps the previous value); the field is not typed by hand, so an invalid date cannot be entered. The chosen day is kept as `YYYY-MM-DD` for the API and never goes through a time zone conversion. When a rule depends on another field (an end date must be after the start date), the picker blocks the dates that break it and the rule is still explained below the field.
- **Contrast note:** the border is intentionally soft (about 1.6:1 on white). The field is identified by its fill, label and icon together. If the institution requires a strict 3:1 boundary, use #8C968A as the border color.

### Chips and segmented controls
- Chip: 9999px radius, #F2F4EF fill, #132F20 text, Button Text style, 8px/12px padding. Selected: #34531F fill, white text.
- Segmented control: 40px height, #F2F4EF track, selected segment white with Level 1.

### Badges
2px radius, Label style, 4px/8px padding. Info: #C3D730 fill, #132F20 text. Success: #2BA640 fill, white text. Warning: #FB8C00 fill, #132F20 text. Error: #B3261E fill, white text. Neutral: #E5E5E5 fill, #575756 text.

### Banners
8px radius, 12px/16px padding, always a leading icon, and a short entrance (fade and 8px rise, fade only when motion is reduced). Banners have a severity; the louder it is, the more it stands out from the screen:

| Severity | Fill | Text and icon | Icon | Weight | Use |
|---|---|---|---|---|---|
| **Info** | #F8E9D4 | #132F20 | info | Body text, no shadow | Announcements, connection status, the rule that explains a read-only or locked state |
| **Success** | #2BA640 | #132F20 | success | Semibold, Level 1 | A saved or finished action that the user must notice |
| **Warning** | #FB8C00 | #132F20 | warning | Semibold, Level 1 | A state that needs attention but did not fail: a teacher or room unavailable, no sessions generated |
| **Error** | #B3261E | #FFFFFF | error | Semibold, Level 1 | A failure or a rule that blocked the action: the message is always the translated rule, never the raw API text |

Alerts are placed where the user is looking: at the top of the form or sheet that produced them, above the fields and the action buttons, and they replace the previous alert instead of stacking. An error never appears only as a badge or a colored field border: it also shows this banner. `role="alert"` makes screen readers announce it.

### Dialogs and bottom sheets
Dialogs: 20px radius, Level 3, max 320px wide, title + body + two buttons (cancel left, confirm right). Bottom sheets: 24px top radius, drag handle, Level 3, used for details, pickers and filters.

### Toasts
Bottom, above the tab bar. #132F20 fill, white text, 8px radius, 4s. Success confirmations only; errors that need action use banners or inline messages.

### Loader (BrandLoader)
The app's own loading indicator replaces the system spinner everywhere (`ActivityIndicator` is not used). It is a single brand icon that changes on every iteration (an open book, then a feather, then a leaf, and back to the book), surrounded by a spinning ring that says "loading"; each icon grows in and shrinks out. It reuses the icons of the Brand pattern (see D-049 for why `mdi` is allowed). The ring is functional feedback, not decoration, so it is the one allowed use of a circle in the app (D-080).

- **Sequence:** one icon at a time, always in the same order: open book → feather → leaf → open book… Each iteration lasts 900ms: fade in 250ms, hold 400ms, fade out 250ms, and the next icon starts right after. The loop restarts from the book whenever the loader appears.
- **Ring:** a thin circle around the icon made of a faint track and a moving arc. Track: the icon color at 20% opacity (derived). Arc: the icon color, a quarter of the circle (90°), round ends, turning once per second at constant speed. Regular size: 64px across, 3px stroke; compact size: 28px across, 2px stroke. The icon stays centered and upright inside it; the ring never touches the message below.
- **Icon size change (between icons):** every icon grows from 50% to 100% of its size while it enters (the 250ms fade in) and shrinks from 100% to 50% while it leaves (the 250ms fade out), always centered, with opacity 0 → 100% and 100% → 0%. In between it rests at full size. The size change is part of the 900ms iteration, so the next icon starts growing as the previous one finishes shrinking. There is no sideways shake. The whole loader (icon, ring and message) fades in and out over 150ms when it appears and when it leaves, and the exit never delays the content.
- **Waiting phases** (screens and content areas, counted from the start of the load): 0 to 300ms nothing is shown (a fast load never shows a flash); 300 to 1000ms the loader alone; after 1000ms the loader stays and a message appears below it: `Cargando… Esto está tardando más de lo normal.` / `Loading… This is taking longer than usual.` (Body style, #575756, centered, text from the translation files). The loader and the message leave together when the load ends or fails.
- **Buttons:** a button in loading state shows the compact loader (icon and ring) immediately, with no 300ms wait and no message, the icons only fading and the whole loader fading in and out over 150ms, because the person has just pressed it and needs instant feedback. The fade never delays the action or the next state of the screen. It must fit inside the button without changing its size.
- **First load only:** the loader appears while a screen has no data yet. Background refreshes of data that is already visible never show it or hide the content.
- **Look:** the icon and the ring in #34531F on light surfaces; the near-white text color on dark surfaces (never lime) and white on filled buttons. No background shape behind it.
- **Sizes:** the icon is 32px (regular, screens and content areas) or 14px (compact, buttons and inline rows) inside a ring of 64px and 28px, so it never touches the ring or the message below.
- **Motion:** the icons fade; the ring spins; each icon grows as it enters and shrinks as it leaves; there is no shake anywhere. With reduce motion: no size change and no spinning; the icon changes every 900ms with no fade (instant swap), the ring stays still and its arc pulses between 40% and 100% opacity every 1.2s so the app still looks busy, and the entrance and exit of the whole loader are a 150ms fade. The phases and the message stay the same.
- **Position:** a screen with no data yet and nothing else to show returns `LoadingScreen`, which centers the loader on both axes over the screen background (D-101). Inside a built screen (under a title, in a list) the loader is centered horizontally within its area.
- **Where:** full-screen and content-area loading, and the loading state of buttons. List and card layouts may still use skeleton shapes (see States).
- **Accessibility:** one element with the role `progressbar`, the label `Loading…` from the translation files and the busy state; the icon and the ring are hidden from screen readers and the label does not change with the icon. The delay message is announced once when it appears.
- **Component:** one `BrandLoader` component with a `size` prop (`regular` or `compact`) and an optional `color`; no animation or timer runs while it is not mounted.

### Avatars
Circle, 40px in lists and 48px in conversation lists. Fallback: initials on #F2F4EF with #132F20 text.

**Profile menu** (avatar in the app bar): the 40px avatar has a 1px #575756 outline so it stays visible in dark mode. The menu opens right under the avatar (app bar height plus the top safe area), has a 1px border and holds the Sign out item: 48px high, 1px #B3261E outline with rounded corners, and icon and text in #B3261E so it reads as the session action.

### Component states
Every interactive component has these states, using roles only (the role table gives both modes). A state never relies on color alone: it also changes shape, text or icon.

| Component | Pressed | Focused | Disabled | Loading | Error | Selected |
|---|---|---|---|---|---|---|
| Primary button | `primaryPressed`, scale 0.97 | 2px `inputBorderFocus` ring | `surface` fill, `disabledText`, helper line says why | compact BrandLoader in place of the icon | not applicable | not applicable |
| Destructive button | `errorPressed` | ring | as above | as above | not applicable | not applicable |
| Outlined / tonal button | `selected` fill | ring | as above | as above | not applicable | not applicable |
| Control boundary | not applicable | not applicable | not applicable | not applicable | not applicable | Outlined and tonal buttons and unselected chips draw a 1px `controlBorder` (3:1 on `card`, `screen` and `selected`). Filled buttons are told apart by their text (4.5:1); the text field keeps its soft border (D-123) |
| Status indicator | not applicable | not applicable | not applicable | not applicable | not applicable | An icon, line or bar fill that tells a state (session status, now line, capacity bar, badge border) uses `errorText`, `warningText`, `successText` or `primary` (3:1 on `card`, `screen` and `surface`). `error`, `warning` and `success` are fills only (buttons, notices, the numeric badge) |
| Text field | not applicable | 2px `inputBorderFocus`, `focusGlow`, label `inputLabelFocus` | 60% opacity, no glow | not applicable | 1px `errorText` border, `errorGlow`, message in `errorText` with icon | not applicable |
| Chip / segment | scale 0.98 | ring | `surface`, `disabledText` | not applicable | not applicable | `primary` fill with `onPrimary` text, or `selected` with `textPrimary` and a check icon |
| Card (tappable) | scale 0.98 | ring | 60% opacity | skeleton blocks | `error` icon and text in `errorText` | `selected` fill and `primary` 2px border |
| List row | `selected` fill | ring | `disabledText` | skeleton rows | row note in `errorText` | `selected` fill |
| Tab | not applicable | ring | not applicable | not applicable | not applicable | `tabActive` icon (bold) and label; the others `tabInactive` |
| Banner | not applicable | not applicable | not applicable | not applicable | `error` fill with `onError` | not applicable |

## Screen patterns

### Login (and password recovery, change password)
Modern and branded, built to be calm and easy to tap.

- **Header:** brand gradient (#34531F → #132F20) over about 35% of the screen height, with a 32px curved bottom edge, the Brand pattern (leaves, feathers and books) behind the content, the white UTS logo centered, and "UTS Tutorías" in Screen Title style (white) with the 4px lime line below. The logo shrinks when the keyboard opens.
- **Form card:** white, 24px top radius, Level 3, overlapping the header by 24px. 24px padding.
- **Content, top to bottom, with these gaps:**
  1. Title "Sign in" and a one-line subtitle (8px between them).
  2. 24px, then the email input with a leading `solar:letter-linear` icon.
  3. 16px, then the password input with a leading `solar:lock-password-linear` icon and a trailing show/hide icon button.
  4. 8px, then a right-aligned text link "Forgot your password?" (text link, no icon).
  5. 24px, then the **primary button** "Sign in" with the leading `solar:login-3-linear` icon, full width, 52px.
  6. 16px, then a divider with the word "or" (16px above and below its text).
  7. 16px, then the **outlined button** "Create student account" with the leading `solar:user-plus-linear` icon, full width.
- **Footer:** "Institución Universitaria Tecnológica de Santander" in Metadata style, centered, 24px below the last button.
- **Errors:** an inline error banner with an icon above the primary button; field errors under the field in #B3261E.
- **States:** the primary button shows a spinner while signing in; inputs and buttons are disabled meanwhile.
- **Keyboard:** the form scrolls and stays visible above the keyboard; pressing "done" on the password field submits.
- Student registration, password recovery and the teacher's change-password screen reuse the same header, card and spacing.

### Module card (students)
Container: white (Card), 16px radius, 16px padding, Level 1 soft shadow, no border. One column on phones. Pressed state scales to 0.98.

Layout, top to bottom:
1. Card Title: module name (2 lines max) with a status badge at the top right.
2. Teacher row: avatar 24px + teacher name.
3. Schedule row: calendar icon + `Weekly · Mon 10:00–12:00`.
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

Above the list: search field and a horizontally scrolling chip bar to filter (All, Available, Enrolled, by day) and a period selector chip (default: the active academic period, e.g. `2026-2`). Pull to refresh. Skeleton cards while loading.

### Student module detail and cancellation
Opened from a card or from "My tutoring". It shows the module card, the description and the list of future sessions. Each session shows its date and time (Bogota), a state as text plus icon (Scheduled, Rescheduled, Cancelled for a holiday, Cancelled by you) and its action: **Cancel session** (outlined) or **Restore** (tonal). A blocked action is disabled and shows the rule under the button: less than the lead time left, closed period, cancelled session or no room to restore. Once enrolled, an outlined **Cancel enrollment** button opens a bottom sheet that asks the scope (**Only this session** or **The whole module**), shows the rule of the hour, and asks one more confirmation (dialog) before cancelling the whole module. A closed period shows a banner and no actions. Enrolling is done from this detail, which already shows the module, schedule, room and sessions, so it needs no extra sheet. The capacity text is `occupied/capacity` (occupied = capacity minus the free spots of the fullest session).

### Teacher schedule and session sheet
The teacher Schedule tab shows, top to bottom: the weekly calendar (see Weekly schedule below), the upcoming sessions grouped by day (they always start from now, whatever week the calendar shows), and last "My modules": a chip bar to filter the upcoming sessions by module when there are several, and one card per module the teacher dictates (name, weekly slots, room, `enrolled of capacity`). Each session card shows the module, hours in Bogota, room, attendees and a state as text plus icon (Scheduled, Rescheduled with the original hour, Cancelled for a holiday, Cancelled by you). Tapping a session opens a bottom sheet with its data, the lead-time rule (2 hours) and the actions the rules allow: **Reschedule**, **Cancel session** (outlined) or **Restore session**. A blocked action is not offered and a banner shows the rule that blocks it: less than the lead time left, closed period, past session or cancelled by a holiday. Reschedule asks the scope (**Only this session** or **This and the following**), a date limited to the week of the session and a time between 06:00 and 18:00; every change of date or time asks the API for availability (dry run) and shows the reason (room or teacher busy with the module, holiday, other week, outside the hours, how many students overlap) before **Confirm change** is enabled. Cancelling asks for one more confirmation (dialog). A closed period shows no actions.

### Weekly schedule (all roles)
Header: week label (`Nov 3 – 9`), previous/next arrows and a "Today" tonal button. Below it, a day strip with seven day pills (weekday letter + number). Today has a 1px #34531F ring; the selected day is filled #34531F with white text. A dot under a day means it has sessions.

Two views, toggled with a segmented control:
- **Day** (default on phones): vertical timeline for the selected day, hour rows 64px tall, time labels in Metadata style on the left.
- **Week**: seven columns, horizontally scrollable, compact blocks (time and room only). Default on tablets.

A "now" line (2px #B3261E with an 8px dot) crosses the current time on today when it falls inside the visible hours (a day without sessions shows only its empty message).

Implemented (spec 013): the segmented control (Day / Week, each option with its icon) opens on **Day** below 600 dp wide and on **Week** from 600 dp up; the choice is kept while navigating weeks and pressing Today. The visible hours are the allowed hours of the configuration (today 06:00 to 18:00), in whole hours and widened to show a session outside them. The week arrows only move inside the academic period; a blocked arrow looks disabled and, when pressed, shows `Outside the academic period`. While the first week loads the arrows wait. A session shows its state as text plus icon (Scheduled, Rescheduled with the original hour, Cancelled with its reason); the block label for screen readers lists module, hours, room and state. Week columns show hours, room and state only. Component: `src/components/calendar/`, reusable by the student and the CAE.

**Student (spec 021)**: the student Schedule tab is this same calendar, read only, and nothing else (no upcoming list, no sheet). A block shows the hour range, the module, the room and the teacher's name; its state is text plus icon: Scheduled, Rescheduled (the new hour and `Before: date · time`), Cancelled for a holiday, Cancelled by the teacher and Cancelled by you (a session the student skipped for themselves), the cancelled ones struck through, and the cause that the institution gave wins over the student's own choice. Tapping a block opens that module's detail, where the student cancels under the usual rules; the calendar offers no Cancel, Restore or Reschedule. A student with no enrollments sees an empty state ("You are not enrolled in any module yet") with an "Explore modules" button instead of the calendar; the calendar asks the week again when the tab regains focus.

Session block: #F2F4EF fill, 4px #34531F left border, 8px radius, 8px padding, minimum height 44px.
- Teacher block: time range, module name, room, student count (`18 students`).
- Student block: time range, module name, room, teacher name.
- Rescheduled: Warning badge "Rescheduled", new time shown.
- Cancelled: stays visible, text with strikethrough, 4px #B3261E left border, Error badge "Cancelled".

Tapping a block opens a bottom sheet with the full detail. **Students: read-only.** **Teachers** get two actions in the sheet:
- **Change time**: opens a date picker, then a grid of time chips. Available slots are selectable; slots with a room or teacher conflict are disabled with a reason (`Room occupied`, `You have another module`). Selected chip: #34531F fill. Then a confirmation sheet: old time → new time, text `18 students will be notified`, Primary "Confirm change".
- **Cancel session**: Destructive button with a confirmation dialog stating how many students will be notified.
- Under 2 hours to start: both actions are disabled with the helper `You can no longer change this session: less than 2 hours left`.

Week navigation is limited to the dates of the active academic period; outside them, show `Outside the academic period`. Sessions repeat weekly, so each week shows the same module blocks unless a session was rescheduled or cancelled.

Empty day: icon, `No sessions this day`.

### Notifications inbox and mail settings
**Inbox (all roles, reached from the bell):** a list of cards, newest first, loaded in pages as the end is reached. Each card shows a leading icon by type (cancelled sessions in #B3261E, the rest in #34531F), the title in Card Title, the text in Body, and the date and time in Bogota time in Body Small #575756. An unread notice has a 4px left line, a bold icon and an "Unread" badge (state is never only color); tapping a card marks it read and opens the module it refers to (48px target for the whole card). A tonal "Mark all as read" button with a leading icon sits at the top of the list while something is unread. States: loading (Brand loader), empty (`solar:bell-off-linear` icon, a title and what will appear here), error with "Try again", and a #F8E9D4 banner with the error when a later load fails and the loaded notices stay. When the phone permission for push was not given, a banner above the list explains why it matters and an outlined "Turn on notifications" button asks for it (or opens the phone settings if it was denied). The first time, a dialog explains the permission before the system one appears; "Not now" is a real choice and is not asked again.

**Mail settings (CAE, More tab):** a status badge (text plus icon: Configured in #2BA640, Not configured in #575756, Needs to be configured again in #FB8C00), a #F8E9D4 banner when the app server's own settings are in use or the saved password cannot be read, and filled fields with a soft border and a leading icon: server, port (number keypad), user, password (hidden, never shown again; an empty one keeps the saved one, with that said in the placeholder) and sender. "Save" and "Send test email" are stacked 16px apart, each with a leading icon; the test button is disabled with the reason below it ("Save the settings to be able to test them") until there is something saved. The result of the test is a banner with a plain-words cause, never the text of the mail server.

### Emails
Every email the API sends (account codes, notices of changes in a module, the mail test) follows one layout (D-106). It is a card, not a screen, so it adapts the app components to what mail clients support.

- **Frame:** a white card, 16px radius, on the #F2F4EF Screen background, 600px at most and full width on a phone. Header with the full-color logo (`logo-uts.png`, embedded, never modified, alt text with the institution name). Under it, a hero band in #34531F (gradient to #132F20 only as an enhancement; the solid color is always set), with a badge, the title in Screen Title style (26px/32px, Bold, white) and the 4px lime line of the heroes. The Brand pattern is not used in emails.
- **Body:** 16px/24px in #132F20 (one size up from the app Body, because mail clients do not scale text). The text of a notice goes in a box with the #F2F4EF fill, 12px radius and a 4px left line in the color of its tone. A one-time code goes in a box styled like an input (#F2F4EF fill, 1px #C9D0C3 border, 12px radius) in a monospaced stack at 32px, 8px letter spacing. The expiry is Metadata (#575756, 14px) and always in Bogota time.
- **Tones and badges:** the badge names the state in text (Cancelled, Time change, Reinstated, Teacher change, Room change, Verify your account…) and its color follows the tone: info #C3D730 with #132F20 text, warning #FB8C00 with #132F20 text, error #B3261E with white text, success #2BA640 with **#132F20** text (4.6:1; white on #2BA640 is 3.2:1 and fails AA, so the success badge in the app, which uses white text, should be reviewed). Cancellations are error, a changed time is warning, restores are success and a change of teacher or room is info.
- **Footer:** a 1px #E5E5E5 line, the official name of the institution in Semibold, the contact as a #4E7A2F link (underlined by default) and the legal text in Metadata. All three come from configuration.
- **Fonts:** a mail client shows only fonts already installed on the reader's device, so the email asks for the corporate font first and falls back: text in `'Myriad Pro', 'Source Sans 3', Arial, Helvetica, sans-serif` and code in `'Source Code Pro', 'Courier New', Courier, monospace`. Most readers will see Arial. No web fonts (Gmail and Outlook ignore them and the request would tell a third party the email was opened). The stacks are the `FONTS` constants in `mail/templates/layout.ts`, the one place to change the font of every email (D-107).
- **Accessibility:** `lang` on the page, one `h1`, layout tables marked as presentation, a hidden preview text (the first paragraph), text of 12px at least and 16px in the body, status never only by color, every text/background pair at 4.5:1 or more (checked by a test), and the plain-text version with the same content. Light scheme only (`color-scheme: light`).
- **Compatibility:** no `overflow`, no styles on `<body>`, no `background` shorthand, and every fill also carries a `bgcolor`. The HTML stays well under 100 KB so Gmail does not clip it. The Mailpit checker gives 94.1% supported on average for the 20 emails.
- **Not in emails:** buttons or links that open the app (an email client may block them; the text says to open the app), emoji or other icons, and a dark theme.

### Messages
The Messages tab has a segmented control at the top: **Alerts** and **Chats**.

**Alerts** (announcements, cancellations, changes): list rows with a leading 40px circular icon, title, one-line body, relative time, and an unread dot (#34531F, 8px). Icon circle colors by type: announcement #F8E9D4 with #132F20 icon; reschedule #FB8C00 tint with #132F20 icon; cancellation #B3261E tint with #B3261E icon; PQRS update #F2F4EF with #34531F icon. Tapping an alert deep-links to the related module, session or PQRS.

**Chats**: conversation list. Row: 48px avatar, name (Semibold), last message (1 line, #575756), time on the right, and a #34531F pill with the unread count (white text). Module chats show a small group icon. Floating "New message" button (56px circle, #34531F, white icon) for the people the role is allowed to message: students pick one of their module teachers; teachers pick a student of their modules or the CAE; the CAE picks a teacher.

**Chat screen**:
- App bar with avatar, name and a subtitle (`Module name` or connection state).
- Bubbles: max width 78%, 16px radius, with a 4px radius on the tail corner. Sent: #34531F fill, white text, right aligned. Received: white fill with a soft level-1 shadow, #132F20 text, left aligned (D-115). Consecutive messages from the same person form a group: only the first has the tail corner (top, 4px) and the writer's name; 2px between messages of a group, 16px between groups. The time and the state icon sit inside the bubble, bottom right.
- Date separators: centered neutral chip (`Today`, `Yesterday`, date).
- Message states: sending (clock icon, 60% opacity), sent (single check), failed (red icon with "Tap to retry").
- Teacher announcements to a module are not bubbles: they are full-width banner cards (#F8E9D4) labeled "Announcement" with the teacher's name.
- Composer: sits right above the tab bar and rises with the keyboard (measured against the window, D-115), pinned above the keyboard, #F2F4EF pill input with a 1px #C9D0C3 border (min 48px, grows to 5 lines), 48px circular send button (#34531F, white icon). The send button is disabled while the input is empty.
- Typing indicator: three #575756 dots animating, in a received-style bubble.
- Connection: while reconnecting, a #F8E9D4 banner under the app bar says `Reconnecting…`. Messages typed offline stay in the "sending" state and are sent when the connection returns.
- Lists load newest first with infinite scroll upward.

**As built (spec 018)**: the tab has a segmented control "Alerts" (the inbox of spec 014) and "Chats". Chats: a "New message" button with the add icon above the list; each row has a 48px avatar circle (person icon, or group icon for a module chat), the name or module, the last message in one line (prefixed "Announcement:" for an announcement), the time and an unread pill whose text is the count. Chat screen: a title header (the module chat adds "Module chat"), an inverted list with date separators ("Today", "Yesterday", date), bubbles as above (the writer's name above a message of someone else in a module chat), announcements as full-width cream cards with the label and the teacher's name, the "Reconnecting…" warning banner under the header, and the composer at the bottom: a pill input with the character counter under it, a 48px circular icon-only send button (label "Send", disabled while empty; D-115) and, only for the teacher of a module, a segmented control "Message" and "Announcement". What I send shows its state as an icon with an accessibility label ("Sending…" at 60% opacity, "Sent"); "Not sent" keeps its text and "Tap to retry". A read-only conversation hides the composer and shows the rule in an info banner (no shared module, closed period, unavailable account).

**Built in spec 022**:
- **Initials**: the avatar of a person shows the initial of the first name and of the last name in capitals (one letter with a single name; the person icon without a name) on the `surface` fill with the letters in primary; a module chat keeps the group icon. The chat header now has the same avatar to the left of the title. The letters are hidden from screen readers (the name is written next to it).
- **Typing indicator**: in a direct chat, three #575756 dots in a received-style bubble at the foot of the list with the words "is typing…"; the dots breathe at different paces and stand still with "reduce motion", the words stay. It turns off after 5 seconds without a signal, when a message of that person arrives or when the connection drops. A module chat never shows it.
- **Pending messages**: an unsent message is kept on the device and goes out when the app opens again with a connection. A message that is sending or failed shows a **Discard** action (trash icon, 48px) under the bubble; a failed one also keeps "Tap to retry". They belong to the user who wrote them and are erased on sign out.

**Not built yet (chat)**: read receipts, floating action button, avatar photos, editing or deleting a message and attachments.

### PQRS
**Status chips**: Filed (Neutral badge), In review (Warning badge), Resolved (Success badge). Type labels: Petition, Complaint, Claim, Suggestion.

**Filing screen (students and teachers, spec 017)**: single column form. Type as a chip group (single select, only the active types, in the device language), Subject input and Description textarea with counter; the limits come from the API. Primary full-width "File" button with the send icon; the screen goes back to the list when it succeeds. A missing field is named under the field; a type that is no longer available shows the rule as an error banner.

**My PQRS (students and teachers)**: card list, newest first, with a status filter chip bar (All, Filed, In review, Resolved) and a "New PQRS" button with the add icon above it. Each card has the subject, the type label, the filing date and the status badge. Detail screen: status badge, subject, type and date, a card with the description, and the replies of the CAE in chronological order, or a line saying there are none yet. The author does not reply inside a PQRS.

**Management (CAE)**: list newest first with three chip bars that combine (status, type, including deactivated types, and author role); each card adds the name and role of the author. Detail screen: author card (name, role, email), the same body as the author view, and the actions of its state. "Filed" shows the rule "move it to In review first" and a button "Move to In review". "In review" shows the reply field with counter, "Send reply" and "Mark as resolved" (success button, disabled with its rule while there is no reply, and a confirmation dialog before it runs). "Resolved" shows that it no longer accepts changes.

**Status badge**: outlined pill with an icon and the state as text (never color alone): Filed `solar:clipboard-text` in primary, In review `solar:clock-circle` in warning, Resolved `solar:check-circle` in success; the text is always #132F20.

**Built in spec 020**:
- **Filing number**: `N.º A1B2C3D4` in `typography.code` (Source Code Pro) on every PQRS card and detail, for the author and the CAE. It is the first 8 characters of the id in capitals, not consecutive.
- **Confirmation screen**: after filing, the form is replaced (back never returns to the sent form) by a screen with the success icon, "Your PQRS was filed", a card with the filing number (large, in code type), the filing date and time in Bogota and the status badge, and two stacked buttons 16px apart: "View my PQRS" (primary, `solar:clipboard-text`) and "Back to my PQRS" (outlined, back icon).
- **Status timeline** (author and CAE detail, between the description and the replies): a vertical rail with the three steps Filed, In review and Resolved. Each step has its icon (`clipboard-text`, `clock-circle`, `check-circle`), its name in text and, once it happened, its date and time in Bogota. The current step is in semibold with the word "Current"; pending steps are muted with the word "Pending" and no date; a done step without a stored date shows no time. Each step reads as one phrase for screen readers.
- **Count badge on the CAE tab**: the "PQRS" tab shows the number of PQRS in "Filed" as the unread tab badge (#B3261E, white number, `99+` above 99, hidden at zero). Teacher and student tabs have none.
- **Count-up**: the whole numbers of the metric cards count from 0 to their value in 600ms the first time they show, later changes show at once, "reduce motion" shows the final value, and the screen reader always reads the final value.

**Not built yet**: the Notify user and Reply by email actions (the CAE continues by email outside the app).

### Dashboards
Layout: Screen Title, an optional period selector chip (`This week`, `This month`, `Semester`), then content blocks stacked with 16px gaps.

**Metric card**: white fill, 16px radius, 16px padding, Level 1, 2 per row, on the Screen background. Metric Number on top, label in Metadata style below, optional trend (arrow icon + `+5%`, #34531F up, #B3261E down when higher is worse, with explanatory text, never color alone).

**Hero card** (next session, for teachers and students): Brand gradient fill (#34531F → #132F20), white text, 20px radius, 20px padding, Level 2, with the lime 4px line under the title and 3 decorative leaf, feather and book icons at 10% in the bottom-right corner (see Brand pattern). Shows `Next tutoring`, module name, day and time, room, and (for teachers) student count. Button "View details" in Accent style, with a leading icon. If there is no next session, show a #F2F4EF card with `No upcoming sessions`.

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

**Built (spec 019)**: the three dashboards replace the empty tab screens. Each block loads on its own and has its four states (loading, empty with its sentence, error with a "Try again" button, data), so one failing block never hides the others; pull-to-refresh and a refresh when the tab regains focus. Every block leads to where that data is worked with: the hero card to the module (teacher: the schedule), the unread counters to Messages and the inbox, "My PQRS" and the PQRS-by-status legend to the PQRS list (the CAE opens it already filtered by the tapped state), and each change to its module. The hero "View details" button uses the new **Accent** button variant (lime fill, #132F20 text and icon, dark surfaces only).

**Recent changes list (CAE)**: opened from "See all" in the Recent changes block. A screen on the Screen background with one white card per change (icon, module, `Cancelled · 5 min ago` or `Rescheduled · 2 h ago`), loading more pages at the end, with the four states. The kind of change is always written, never only an icon.

### Admin management patterns
- **Lists (teachers, students, rooms)**: search field, filter chips (All, Active, Inactive), rows with avatar, name, email (Metadata) and a status badge (Active neutral-success, Inactive neutral). Overflow menu per row: Edit, Deactivate/Reactivate, Delete. Deleting is a logical delete and always uses a destructive confirmation dialog; its text says the record is hidden, not erased.
- **Create teacher**: form (name, institutional email, other data). Email validated against the allowed domain with an inline error. On success, a dialog shows the **temporary password** once, in Source Code Pro on a #F2F4EF block with a "Copy" button, and the note that the teacher must change it at first login.
- **Teacher and student accounts (spec 016)**: opened from the More tab. A list with a search field, filter chips (All, Active, Disabled), cards with name, email, a status badge with text and icon (never color alone) and a count (modules or enrollments), and the four states (loading, empty with its explanation, error with Retry, data) with more pages loading at the end. Tapping a card opens a bottom sheet with the actions, each button with a leading icon and 16 px between them: Edit and Regenerate password (teachers only; the latter disabled on a disabled account with the reason under it), Deactivate or Reactivate, and Delete. Deactivating or deleting opens a confirmation dialog that states the effect in numbers before anything happens (`2 modules will be left with an unavailable teacher.`, `3 enrollments will be cancelled and 3 seats will be freed.`) and, for Delete, that it cannot be undone from the app. Edit teacher is a form with fill-and-border fields (name, last name, phone) and the email shown disabled with the reason under it.
- **Rooms**: card or row with name, location and capacity (`30 people`).
- **Module management**: change room or teacher via a bottom sheet picker. When the selected room has less capacity than the enrolled students, the option is disabled and the message in #B3261E reads `Not enough capacity: 32 enrolled, this room holds 30`. Changing room, teacher or schedule shows a confirmation that states how many students will be notified.
- **Settings**: grouped list rows (Data, Dropdown lists, Academic periods, Institutional emails, SMTP) with chevrons. SMTP form: host, port, user, password (masked, never shown after saving), from address, and a tonal "Send test email" button with inline success or error result. Save is a Primary button pinned at the bottom.

## States
- **Loading**: the brand loader (see Loader) for screens and content areas, or skeleton shapes in #F2F4EF with a slow shimmer for list and card layouts; never a blank screen for more than 300ms (the screen background stays and the loader starts after 300ms, see Loader). Buttons show the compact brand loader and stay the same width while submitting.
- **Empty**: 48px #575756 icon, one-line title, one-line explanation, and a Primary or Tonal button when there is a next step (e.g. `Browse modules`).
- **Error**: inline message with a "Try again" tonal button. Network failure shows a banner `You are offline` (#F8E9D4).
- **Rule feedback**: every blocked action explains the rule in plain language (capacity, conflict, cancellation window, domain). The text comes from the translation files.

## Accessibility and internationalization
- Minimum touch target 48 x 48px. Text scales with the system font size up to 200% without clipping.
- Contrast follows the table above; status is always conveyed by text or icon in addition to color.
- All icons that carry meaning have accessibility labels; the chat, schedule blocks and cards announce their full content to screen readers.
- Language follows the device (Spanish or English; Spanish by default). Times and numbers follow the device locale and the `America/Bogota` time zone. Calendar dates in forms and lists are shown as dd/mm/YYYY in both languages (see Date fields). Timestamps are stored in UTC.
- No hard-coded strings in components; all text is in the translation files.

## Do's and Don'ts
- Do show the rule behind every disabled button.
- Do show how many students will be notified before confirming any change or cancellation.
- Do use #34531F for primary actions and keep #C3D730 for highlights and dark surfaces.
- Don't place #C3D730 text or icons on white or light backgrounds; the contrast fails.
- Don't use #2BA640 or #FB8C00 as text color on white; use them as icons or fills.
- Don't use red for anything other than errors, cancellations, destructive actions, unread tab badges and the "now" line.
- Do clamp card titles to 2 lines with ellipsis for consistent lists.
- Do give cards a soft Level 1 shadow on the Screen background; use stronger shadows only for raised elements, sheets and dialogs.
- Do use Iconify icons from the `solar` set for every icon, and put a leading icon in every button.
- Do keep 16px between stacked buttons.
- Do keep animations short, on the UI thread, and respect the reduce-motion setting.
- Don't use any other icon library, emoji as icons, or a modified UTS logo.
- Don't use geometric shapes (circles, arcs, blobs) as decoration; use the Brand pattern. The loading ring of the Brand loader is feedback, not decoration, and is allowed.
- Do give every text field a fill and a soft border so it reads as an input.
- Do keep student schedules read-only; actions on sessions belong to teachers and the CAE.
- Don't expose temporary passwords or SMTP passwords after the moment of creation or saving.
- Don't use custom scrollbars; rely on native scrolling.
- Don't alter the brand colors marked *(brand)*; add new shades only as *(derived)* colors.
