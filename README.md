# 🎾 TennisMeetup

A React Native app for tennis players to discover, create, and join tennis sessions. Built for small communities (~20 players) who want to coordinate pickup games quickly.

## Features

- **Discover Sessions** — Browse nearby tennis sessions with filters (All, Mine, Singles, Doubles, Hitting, Coaching)
- **Create Sessions** — Pick a date, time, court, skill level, and publish in seconds
- **Join / Leave** — One-tap join with real-time player count updates
- **Session Detail** — View host info, player list, cost, contact info, and description
- **Contact Host** — Copy phone/WeChat/WhatsApp to clipboard directly
- **Host Controls** — Cancel your own session with confirmation
- **Onboarding** — Simple first-time setup (name, skill, location, contact method)
- **Pull-to-Refresh** — Always see the latest sessions
- **My Sessions** — Filter to see only sessions you've joined or created
- **Preset Courts** — 7 Seattle-area courts with custom court option
- **Dark Theme** — Full dark mode UI with custom design system

## Tech Stack

- **Frontend:** React Native (Expo SDK 52), TypeScript
- **Backend:** Supabase (PostgreSQL)
- **State:** React Context
- **Navigation:** React Navigation (Native Stack)
- **Storage:** AsyncStorage (local user ID) + Supabase (sessions, users)

## Project Structure

```
src/
├── components/
│   ├── discover/        # SessionCard, TopBar, FilterChips, MapView, FAB
│   ├── detail/          # InfoBlock, HostRow, PlayerAvatarList, CostRow, etc.
│   ├── Button.tsx       # Reusable button (5 variants × 3 sizes)
│   ├── Chip.tsx         # Filter/selection chip
│   ├── Card.tsx         # Surface card with elevation
│   ├── Avatar.tsx       # Initial-based avatar
│   └── Badge.tsx        # Semantic badges
├── screens/
│   ├── DiscoverScreen.tsx
│   ├── SessionDetailScreen.tsx
│   ├── CreateSessionScreen.tsx
│   └── OnboardingScreen.tsx
├── context/
│   └── SessionContext.tsx    # Global state (user, sessions, join/leave/cancel)
├── data/
│   ├── supabase.ts          # Supabase client
│   ├── supabaseApi.ts       # All DB operations + transforms
│   ├── storage.ts           # AsyncStorage helpers
│   ├── dateUtils.ts         # Date formatting
│   └── mockSessions.ts      # Type definitions
├── navigation/
│   └── AppNavigator.tsx     # Stack navigator with conditional onboarding
├── theme/
│   ├── colors.ts            # Dark theme palette
│   ├── spacing.ts           # 8pt grid system
│   ├── typography.ts        # Type scale
│   └── shadows.ts           # Elevation levels
└── hooks/
    └── useAnimatedPress.ts  # Press animation hook
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- A [Supabase](https://supabase.com) project

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/yyang15/TennisMeetupRN.git
   cd TennisMeetupRN
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create Supabase tables**

   Run this SQL in your Supabase SQL Editor:

   ```sql
   create table users (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     skill_level text not null,
     location text not null default '',
     contact_method text not null default 'phone',
     contact_value text not null default '',
     created_at timestamptz default now()
   );

   create table sessions (
     id uuid primary key default gen_random_uuid(),
     host_id uuid references users(id) not null,
     title text not null default '',
     session_type text not null,
     date text not null,
     time text not null,
     skill_range text not null,
     court_name text not null,
     court_address text not null default '',
     distance text not null default '0.0 mi',
     total_spots int not null default 2,
     description text not null default '',
     cost jsonb not null default '{"kind":"free"}',
     created_at timestamptz default now()
   );

   create table session_participants (
     id uuid primary key default gen_random_uuid(),
     session_id uuid references sessions(id) on delete cascade not null,
     user_id uuid references users(id) not null,
     joined_at timestamptz default now(),
     unique(session_id, user_id)
   );

   alter table users enable row level security;
   alter table sessions enable row level security;
   alter table session_participants enable row level security;

   create policy "Allow all on users" on users for all using (true) with check (true);
   create policy "Allow all on sessions" on sessions for all using (true) with check (true);
   create policy "Allow all on session_participants" on session_participants for all using (true) with check (true);
   ```

4. **Configure environment**

   Create a `.env` file in the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Run the app**
   ```bash
   npx expo start
   ```

## Database Schema

```
users
├── id (uuid, PK)
├── name, skill_level, location
├── contact_method, contact_value
└── created_at

sessions
├── id (uuid, PK)
├── host_id (FK → users)
├── title, session_type, date, time
├── skill_range, court_name, court_address
├── total_spots, description, cost (jsonb)
└── created_at

session_participants
├── id (uuid, PK)
├── session_id (FK → sessions, cascade delete)
├── user_id (FK → users)
└── joined_at
```

## License

MIT
