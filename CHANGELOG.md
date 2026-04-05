# TennisMeetup – Change Log

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
### Changed
### Fixed
### Notes

---

## [0.3.0] – 2026-04-05

### Added
- Pull-to-refresh on Discover screen for real-time session updates
- "Mine" filter chip to view joined/hosted sessions only
- Host can cancel/delete their own session with confirmation dialog
- Join/Leave loading spinner with disabled state during API calls
- Leave session confirmation dialog to prevent accidental exits
- Session title displayed on Discover cards and Detail screen
- Preset court selection (7 Seattle-area courts) with custom "Other" option
- Real date picker with next 7 days, replacing hardcoded Today/Tomorrow slots
- Shared `formatDate` utility for consistent date rendering across screens
- `dateUtils.ts` for reusable date formatting logic

### Changed
- TopBar location now reads from user profile instead of hardcoded "Seattle, WA"
- Notification count set to 0 (was hardcoded decorative "3")
- Date storage uses ISO 8601 format (e.g., `2026-04-05`) instead of relative strings
- `StickyJoinButton` supports 5 states: join, loading, joined, full, host
- `InfoBlock` shows user-written title as heading, session type as subtitle

### Fixed
- Cancel session no longer navigates back on API failure
- `cancelSession` validates host ownership before deleting
- UTC timezone offset in date generation (`toISOString` → local date math)
- Session card date displays formatted text instead of raw ISO string
- Custom court input only appears after tapping "Other" chip

---

## [0.2.0] – 2026-04-05

### Added
- Supabase backend integration (users, sessions, session_participants tables)
- Onboarding screen with user creation in Supabase (name, skill, location, contact)
- Contact Host section in Session Detail with copy-to-clipboard
- `expo-clipboard` integration for contact copying
- `supabaseApi.ts` data layer with full CRUD + JOIN queries
- `storage.ts` simplified to local user ID persistence only
- Conditional navigation: Onboarding when no user, main stack when authenticated
- Loading spinner during app hydration from Supabase
- AsyncStorage error handling with try/catch/finally

### Changed
- Session data source migrated from AsyncStorage to Supabase
- User identity is now dynamic (no more hardcoded `currentUser` export)
- All screens read user from context instead of module-level constant
- `Session` type now includes `hostId` (UUID FK to users table)
- Host info derived from `users` table JOIN, not denormalized fields
- `CreateSessionScreen` attaches contact info from user profile automatically
- Skill range uses proper mapping (e.g., `3.5` → `3.5–4.0`)

### Fixed
- **Host identity bug**: sessions now display correct host name from users table instead of mock data
- `fetchUser` distinguishes "not found" (PGRST116) from network errors
- `spotsLeft` clamped to `Math.max(0, ...)` to prevent negative values

---

## [0.1.0] – 2026-04-05

### Added
- Discover screen with dark theme UI and 8pt grid design system
- Session cards with time-dominant layout, skill badges, reliability scores
- Horizontal filter chips (All, Singles, Doubles, Hitting, Coaching)
- Map placeholder with color-coded session pins by type
- Floating Action Button for session creation
- Session Detail screen (full-screen, scroll layout)
  - Header image placeholder with session type badge and distance
  - Info block (court name, address, date/time, skill range)
  - Host row with avatar, name, and color-coded reliability score
  - Player avatar list with empty spot indicators
  - Cost display (free / split / paid states)
  - Collapsible description with "Show more/less"
- Create Session form (title, type, time, location, skill, player limit, notes)
- Join / Leave session with immediate state updates
  - Duplicate join protection
  - Full session blocking
  - Host cannot leave their own session
- Joined sessions sorted to top of Discover list
- "Joined" badge on session cards for participating sessions
- Reusable component library: Button, Chip, Card, Avatar, Badge
- Design system: colors, spacing (8pt grid), typography, shadows
- Press animation hook (`useAnimatedPress`) with spring physics
- React Navigation stack with slide animations
- React Context state management
- TypeScript with zero type errors
- Git repository with GitHub remote

### Notes
- Initial MVP targeting ~20 tennis players in Seattle
- iOS simulator tested with Xcode 26.2
