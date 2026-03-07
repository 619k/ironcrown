# IronCrown Admin Panel — Full Functionality Plan

## Objective

Move from a "beautiful but static" admin panel to a **fully functional, production-ready** system with:
- All dashboard routes accessible (no more 404s)
- Real API data flowing into every page 
- Interactive player actions (kick, ban, warn, give item)
- Clickable player detail modals
- Inventory viewer per player
- Real punishment management (create + revoke)
- working logs stream

---

## 🔴 Critical Issue First: Vercel 404 Root Cause

**Problem:** The page structure is `src/app/(dashboard)/dashboard/logs/page.tsx` which creates the URL `/dashboard/logs`. But Vercel's Next.js build is NOT picking them up as live routes.

**True Root Cause:** The `(dashboard)` route group contains `layout.tsx` BUT the nested `dashboard/` folder is NOT a route group  — it creates an actual `/dashboard` URL prefix. This is correct. However, Vercel may be deploying a **stale version** because the Root Directory in Vercel settings is pointing to `ironcrown/panel/` or the full monorepo root. 

**Fix:** Verify Vercel's Root Directory is `panel` and ensure `vercel.json` is not interfering. Also confirm the correct `framework` preset (Next.js).

---

## Phase 0: Fix Vercel 404 (Routing Infrastructure)

### 0-A: Verify/Add `vercel.json`
Add a `vercel.json` to `/panel` root to explicitly set framework and confirm routes:

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### 0-B: Check Vercel Project Root Directory
In the Vercel dashboard → Project Settings → General → Root Directory must be set to `panel` (not the monorepo root).

### 0-C: Force Redeploy
After the above fixes, force a fresh redeploy via Vercel dashboard or `git commit --allow-empty`.

---

## Phase 1: Player Actions (Interactive Features)

Currently the Players page shows cards but clicking does nothing. We need:

### 1-A: Player Detail Slide-Over Panel
A side drawer/modal that opens when you click a player card, showing:
- Steam avatar + name + ID
- Online status + location
- Total playtime + first seen / last seen
- Kingdom + Village affiliation
- Recent punishments (last 5)
- Action buttons: **Kick**, **Warn**, **Temp Ban**, **Perm Ban**, **Give Item**, **View Inventory**

**Files to create:**
- `src/components/players/PlayerDrawer.tsx` — slide-over panel component
- `src/components/players/PunishModal.tsx` — confirmation modal for ban/kick with reason input
- `src/components/players/GiveItemModal.tsx` — item ID + amount input

**Files to modify:**
- `src/app/(dashboard)/dashboard/players/page.tsx` — wire up drawer on card click

### 1-B: Player Actions API Calls
Add action functions to `src/lib/services.ts`:
```typescript
PlayerService.kick(playerId, reason)
PlayerService.warn(playerId, reason)
PlayerService.tempBan(playerId, reason, durationMinutes)
PlayerService.permBan(playerId, reason, evidence?)
PlayerService.unban(playerId)
PlayerService.giveItem(playerId, itemId, amount, quality)
```

---

## Phase 2: Inventory Viewer

### 2-A: Inventory Page/Modal
When "View Inventory" is clicked inside the PlayerDrawer, show a grid of items from the player's last snapshot.

**File:** `src/components/players/InventoryViewer.tsx`

API call: `GET /api/players/:id/inventory`
Response: container-grouped item list (Head, Vest, Pants, Storage, Hands)

---

## Phase 3: Punishment Management

### 3-A: Punishments Page Improvements
Currently shows a table but there's no way to REVOKE an active ban. Add:
- **Revoke** button on active punishment rows → calls `POST /api/players/:id/unban`
- Status filter tabs (All / Active / Expired)
- Pagination (next/prev buttons)

### 3-B: Backend: Fix Punishment Service
`punishments.controller.ts` currently exists but only does `GET /`. We already have ban/unban in `players.routes.ts` and `player.service.ts`. The controller just needs to be wired correctly.

---

## Phase 4: Logs Page — Real-Time Stream

### 4-A: Fix LogService Endpoint
Already fixed to `/logs/events`. Verify the backend `requireModerator` middleware isn't blocking the request (might need to check what role the admin user has).

### 4-B: Event Type Filter Buttons
Add filter pill buttons to the Logs page header:
- ALL | JOIN | LEAVE | DEATH | ITEM_PICKUP | ITEM_DROP

---

## Phase 5: Kingdoms & Wars — Real Data

### 5-A: Kingdoms Page
Wire up real data from `GET /api/kingdoms`. The backend already returns `players._count` and `villages`. Update the UI to show real counts instead of hardcoded "12 Citizens / 2 Villages".

### 5-B: Wars Page  
Wire up real data from `GET /api/wars`. The backend returns war details but the current UI shows "Kingdom A vs Kingdom B" as placeholder. Get the real attacker/defender kingdom names from the API response.

---

## Phase 6: Main Dashboard Stats Fix

The main dashboard page's `useQuery` calls return raw paginated objects which then crash `.filter()`. Already partially fixed. Ensure:
- `players.total` is properly read for the stat card
- `wars` array is safely accessed
- `bans` is safely accessed as an array

---

## Verification Plan

### Automated
```bash
# Run local Next.js build — must exit 0
cd ironcrown/panel && npm run build

# Run local API build
cd ironcrown/api && npm run build
```

### Manual Verification Checklist
After deployment:

| Test | How to Check |
|------|-------------|
| All dashboard routes load | Visit `/dashboard`, `/dashboard/players`, `/dashboard/logs`, `/dashboard/kingdoms`, `/dashboard/wars`, `/dashboard/punishments`, `/dashboard/map`, `/dashboard/settings` |
| Player cards are clickable | Click any player card on Players page → Drawer slides open |
| Kick action works | Open a player → Click Kick → Enter reason → Confirm → Toast "Job queued" appears |
| Warn action works | Open a player → Click Warn → Enter reason → Confirm → Punishment appears in table |
| Temporary ban works | Open a player → Click Temp Ban → Set 60 minutes → Confirm |
| Permanent ban works | Open a player → Click Perm Ban → Confirm |
| Unban works | Find a banned player in Punishments → Click Revoke |
| Logs stream | Visit `/dashboard/logs` → See events (or empty state if plugin offline) — no crash |
| Kingdoms page shows real data | Visit Kingdoms → Cards show actual kingdom names from DB |
| Wars page shows real data | Kingdom names in cards are not "Kingdom A / Kingdom B" |
| Main dashboard no crash | Visit `/dashboard` → Stats load or show 0 without white screen |

---

## File Summary

| Status | File | Change |
|--------|------|--------|
| NEW | `panel/src/components/players/PlayerDrawer.tsx` | Full player detail side panel |
| NEW | `panel/src/components/players/PunishModal.tsx` | Confirmation modal with reason input |
| NEW | `panel/src/components/players/GiveItemModal.tsx` | Give item form |
| NEW | `panel/src/components/players/InventoryViewer.tsx` | Item grid viewer |
| NEW | `panel/vercel.json` | Force correct Next.js deployment settings |
| MODIFY | `panel/src/lib/services.ts` | Add action API calls |
| MODIFY | `panel/src/app/(dashboard)/dashboard/players/page.tsx` | Wire up drawer |
| MODIFY | `panel/src/app/(dashboard)/dashboard/punishments/page.tsx` | Add revoke + filters |
| MODIFY | `panel/src/app/(dashboard)/dashboard/logs/page.tsx` | Add filter pills |
| MODIFY | `panel/src/app/(dashboard)/dashboard/kingdoms/page.tsx` | Real data binding |
| MODIFY | `panel/src/app/(dashboard)/dashboard/wars/page.tsx` | Real attacker/defender names |
| MODIFY | `panel/src/app/(dashboard)/dashboard/page.tsx` | Final crash fix |
