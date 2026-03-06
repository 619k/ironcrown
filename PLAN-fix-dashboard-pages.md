# IronCrown Dashboard Pages Implementation Plan

## Overview
The user requested to fix and fully implement all placeholder pages in the admin dashboard (`players`, `punishments`, `logs`, `kingdoms`, `villages`, `wars`, `map`, `settings`). The goal is to build out these UI modules, connect them to the existing backend API, and ensure they follow the "OLED Dark Avant-Garde Minimalism" design language (pure black, midnight blue, rose red).

## Project Type
**WEB** (Next.js App Router, React, Tailwind CSS)
Primary Agent: `frontend-specialist`

## Success Criteria
- All 8 dashboard sections display real data fetched from the Railway API.
- UI components strictly conform to the Avant-Garde minimalist design rules (no templates, intentional minimalism).
- State and data fetching are handled seamlessly (likely via SWR, React Query, or standard fetch inside `useEffect`).
- Zero 404 errors or console errors during navigation.

## Tech Stack
- **Framework**: Next.js 14 App Router
- **Styling**: Tailwind CSS + Custom CSS (OLED Dark Theme)
- **UI Primitives**: Radix UI / Shadcn UI (if available in project, strictly adhered to).
- **Icons**: Lucide React
- **Data Fetching**: Axios / Native Fetch with Auth tokens

## File Structure (Planned Additions)
```text
src/app/(dashboard)/dashboard/
├── players/page.tsx       # Player list and statistics
├── punishments/page.tsx   # active and past punishments
├── logs/page.tsx          # Real-time event logs (deaths, joins)
├── kingdoms/page.tsx      # RP: Kingdom management
├── villages/page.tsx      # RP: Village tracking
├── wars/page.tsx          # RP: Active/past wars
├── settings/page.tsx      # Admin panel settings
└── map/page.tsx           # Interactive/static live map view
src/components/features/   # Feature-specific heavy UI components
```

## Task Breakdown

### Task 1: API Integration Layer & SDK Setup
- **Agent**: `frontend-specialist`
- **Skill**: `api-patterns`, `clean-code`
- **INPUT**: Current `fetch` usages.
- **OUTPUT**: A centralized `api.ts` or hook system to fetch players, logs, etc., with automatic JWT injection.
- **VERIFY**: Token injection works without manual header setting per request.

### Task 2: Implement Players & Punishments Pages
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **INPUT**: Placeholder `players/page.tsx` and `punishments/page.tsx`
- **OUTPUT**: Avant-garde data tables/grids displaying online players, playtimes, and active bans/warnings.
- **VERIFY**: Data displays correctly; OLED pure black aesthetic matches the sidebar.

### Task 3: Implement Game Event Logs Page
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **INPUT**: Placeholder `logs/page.tsx`
- **OUTPUT**: A terminal-style or sleek scrolling list of in-game events (kills, item pickups) fetched from `/api/bridge/event-log` (or corresponding GET endpoint).
- **VERIFY**: Logs render chronologically with clear visual distinction by event type.

### Task 4: Implement Roleplay Pages (Kingdoms, Villages, Wars)
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **INPUT**: Placeholder RP pages.
- **OUTPUT**: Card-based, asymmetrical layouts showing Kingdom stats, Village populations, and active War statuses.
- **VERIFY**: UI renders without overflow; colors reflect kingdom themes minimally.

### Task 5: Implement Map & Settings Pages
- **Agent**: `frontend-specialist`
- **Skill**: `frontend-design`
- **INPUT**: Placeholder `map/page.tsx` and `settings/page.tsx`
- **OUTPUT**: A grid coordinate viewer (Map) and toggle controls (Settings).
- **VERIFY**: UI states toggle properly; layout is responsive.

## Phase X: Verification
- [x] Build Check: `npm run build` completes with 0 errors.
- [x] Design Review: No default templates used; OLED theme strictly applied.
- [x] Data Check: Pages successfully retrieve data from backend API without 401/500s.
