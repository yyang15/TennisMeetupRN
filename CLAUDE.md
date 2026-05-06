# TennisMeetup RN

## Tech Stack
- React Native (Expo SDK 52), TypeScript
- Functional components + Hooks
- Dark theme
- Supabase backend (users, sessions, session_participants, notifications, user_preferred_locations)
- React Context for state management
- AsyncStorage for local user ID
- expo-location for nearby courts search

## Workflow Rules

### PM → Programmer → QA Development Loop
Every development cycle must follow this process:

**1. PM Agent**
- Review all current features and code
- Identify UX issues from a real user perspective
- Propose improvements prioritized by Impact × Effort
- Provide one "Quick Win" (minimum change, maximum value)

**2. Programmer**
- User selects which feature to implement from PM suggestions
- Implement in priority order
- TypeScript type-check must pass

**3. QA Agent**
- Line-by-line review of newly implemented code
- Write test plan to verify correctness
- Check edge cases, race conditions, error handling
- Report bugs by severity

**4. Fix QA Issues**
- Fix all medium severity and above bugs
- Re-run type-check

### Code Review Process (used outside the PM-QA loop)
After every code change:
1. Spawn two agents in parallel (one focused on architecture/maintainability, one on bugs/performance)
2. Collect feedback from both agents
3. Address every item of feedback
4. Repeat review until no further feedback

## Conventions
- TypeScript type-check: `cd /Users/yuekunyang/TennisMeetupRN && /opt/homebrew/opt/node@22/bin/node ./node_modules/.bin/tsc --noEmit`
- npm install: `cd /Users/yuekunyang/TennisMeetupRN && PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm install <package>`
- Start Expo: `cd /Users/yuekunyang/TennisMeetupRN && PATH="/opt/homebrew/opt/node@22/bin:$PATH" npx expo start`

## Local Testing

When user asks to test the app:

```bash
# 1. Start Metro with cache clear (required after adding new native modules)
cd /Users/yuekunyang/TennisMeetupRN && PATH="/opt/homebrew/opt/node@22/bin:$PATH" npx expo start -c

# 2. Normal start (no new native modules)
cd /Users/yuekunyang/TennisMeetupRN && PATH="/opt/homebrew/opt/node@22/bin:$PATH" npx expo start
```

- After Metro starts, user scans QR code with Expo Go on their phone
- Address is usually `exp://10.0.0.47:8081`
- To reload: press `r` in Metro terminal, or shake the phone
- If new native module was added (e.g. expo-location), must use `-c` to clear cache

## Maestro Automated Testing

**Important: Must use dev build, not Expo Go. Maestro cannot see RN elements inside Expo Go.**

### Build dev build
```bash
# First build (~5 min)
cd /Users/yuekunyang/TennisMeetupRN
PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/opt/homebrew/Cellar/cocoapods/1.16.2_2/bin:$PATH" \
  npx expo run:ios

# Pod install (if needed)
cd ios && PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/Cellar/cocoapods/1.16.2_2/bin/pod install
```

### Run tests + record
```bash
# Full app walkthrough + recording
PATH="/opt/homebrew/opt/node@22/bin:$PATH" node maestro/record.js

# Single flow
export PATH="$PATH:$HOME/.maestro/bin"
maestro test maestro/full_walkthrough.yaml

# View UI elements Maestro can see
maestro hierarchy
```

### Key files
- `maestro/full_walkthrough.yaml` — full app walkthrough (onboarding → discover → join → create → profile)
- `maestro/record.js` — Node.js recording manager (xcrun simctl + Maestro)
- `maestro/test_and_record.sh` — one-click recording script
- App bundle ID: `com.tennismeetup.app`

### Known Issues
- TextInput targeting: Maestro's accessibilityText flattens entire page content, need `accessibilityLabel` to distinguish inputs
- react-native-maps removed (incompatible with SDK 52 new architecture), map uses WebView + Leaflet

## Supabase Tables
- `users` — user info (name, skill_level, location, contact_method, contact_value)
- `sessions` — game sessions (host_id, title, session_type, date, time, skill_range, court_name, court_address, total_spots, description)
- `session_participants` — participants (session_id, user_id), ON DELETE CASCADE
- `notifications` — notifications (user_id=recipient, session_id, actor_user_id=trigger, type=join|leave, is_read, created_at)
- `user_preferred_locations` — saved courts (user_id, location_name, UNIQUE(user_id, location_name))
- SQL migrations in `supabase_migrations/` directory

## Implemented Features
- Onboarding (user registration)
- Discover (browse sessions + map + filters)
- Create Session (Quick Pick time, simplified Skill, Preferred Locations, Find Nearby Courts)
- Session Detail (join/leave/cancel + Toast feedback)
- Notifications (DB-backed, unread badge, mark-as-read, bell → notifications list)
- Profile (view/edit personal info + Toast feedback)
- FAB button "+ Create Session"
- Session Card improvements ("TODAY 6:00 PM" format + "Kevin + 2 others" player summary)
- High contrast Chips (surface bg, accent active, 700 bold)
- Nearby Courts search (expo-location + Overpass API + reverse geocoding + cluster dedup)

## Anti-Loop Rule (HARD RULE)

**Maximum 3 attempts on the same problem.** If still unresolved after 3 tries:
1. Stop
2. Analyze root cause (not symptoms)
3. Tell user: current state + root cause + options
4. Wait for user direction before acting

**Never loop 5+ times on the same issue.**

## Improvement Plan (code review 2026-05-05)

### P0 — Crashes & Broken Features
- [ ] Cost field never displayed — sessions table has cost column but SessionDetailScreen never renders it
- [ ] Share button shows "coming soon" — remove or implement
- [ ] Silent API failures — network errors swallowed by empty `catch {}`, users see stale data with no explanation
- [ ] Location permission failure is silent — distance calculation stops with no user feedback
- [ ] Form too long, key buttons hidden below fold — consider collapsing the All Courts list

### P1 — Major UX Gaps
- [ ] No profile edit screen — users can set up profile in onboarding but can never change it
- [ ] Skill level inconsistency — onboarding uses NTRP ranges, create session uses Beginner/Intermediate/Advanced
- [ ] Player limit only 2 or 4 — add 6 and 8 options for larger groups
- [ ] No past sessions history — users cannot see games they have already played
- [ ] No real-time updates — sessions list only refreshes on manual pull-down

### P2 — Code Quality & Polish
- [ ] 7 courts hard-coded in component — move to `data/courts.ts`
- [ ] Session type magic strings scattered across files — consolidate into a constants file
- [ ] SessionContext too large (14 values) — split into UserContext + SessionsContext
- [ ] No loading skeletons — DiscoverScreen shows empty state while loading instead of skeleton placeholders
- [ ] Duplicate form validation logic — OnboardingScreen and CreateSessionScreen each implement it separately
- [ ] Notifications empty state — add "Host a session to get notified when players join" guidance
- [ ] Session Card typePip too small — replace with text label

## End of Session Checklist

Before ending every session:
1. `git status` to confirm no missing files
2. `git add` new files → `git commit -m "..."` commit changes
3. `git push` to GitHub
4. Confirm push succeeded before telling user the session is done
