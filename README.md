# ⚔️ IronCrown Admin Suite

> Full-stack admin system for an **Unturned Medieval RP** server.
> Compose: **C# OpenMod Plugin** + **Express TypeScript API** + **Next.js 14 Admin Panel**

---

## 📁 Project Structure

```
ironcrown/
├── api/          ← Express TypeScript backend
├── panel/        ← Next.js 14 admin frontend
└── plugin/       ← C# OpenMod Unturned plugin
```

---

## 🚀 Quick Start

### 1. Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| PostgreSQL | 14+ |
| Redis (optional) | 7+ |
| .NET / OpenMod | 4.7.2+ |

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb ironcrown

# (Optional) Start Redis
redis-server
```

### 3. API Setup

```bash
cd ironcrown/api
cp .env.example .env
# → Edit .env with your DATABASE_URL, JWT_SECRET, PLUGIN_API_KEY

npm install
npm run db:generate   # generate Prisma client
npm run db:push       # apply schema to database
npm run db:seed       # seed demo data
npm run dev           # start API on port 4000
```

### 4. Panel Setup

```bash
cd ironcrown/panel
cp .env.example .env.local
# → Set NEXT_PUBLIC_API_URL=http://localhost:4000/api

npm install
npm run dev           # start panel on port 3000
```

### 5. Plugin Setup

1. Copy `plugin/` folder to your OpenMod plugins directory
2. Configure `config.yaml` (generated from `Config.cs`):
   ```yaml
   ApiBaseUrl: "http://localhost:4000/api/bridge"
   ApiKey: "your-plugin-api-key"
   HeartbeatInterval: 60
   PlayerSyncInterval: 30
   JobPollingInterval: 10
   InventorySyncInterval: 120
   ```
3. Restart OpenMod / Unturned server

---

## 🔐 Demo Logins

| Email | Password | Role |
|-------|----------|------|
| `superadmin@ironcrown.local` | `superadmin123` | SUPERADMIN |
| `admin@ironcrown.local` | `admin123456` | ADMIN |
| `mod@ironcrown.local` | `moderator123` | MODERATOR |

---

## 🏰 Feature Overview

### API Routes

| Route | Auth | Description |
|-------|------|-------------|
| `POST /api/auth/login` | Public | JWT login |
| `GET /api/players` | JWT | Player list with search |
| `GET /api/players/:id` | JWT | Player detail |
| `POST /api/players/:id/kick` | JWT + Mod | Kick player |
| `POST /api/players/:id/ban` | JWT + Admin | Permanent ban |
| `POST /api/players/:id/temp-ban` | JWT + Mod | Temp ban |
| `POST /api/players/:id/warn` | JWT + Mod | Warn player |
| `POST /api/players/:id/unban` | JWT + Admin | Unban player |
| `POST /api/players/:id/give-item` | JWT + Admin | Queue give item |
| `GET /api/kingdoms` | JWT | All kingdoms |
| `GET /api/wars` | JWT | All wars |
| `GET /api/logs/admin-actions` | JWT | Admin action log |
| `GET /api/logs/events` | JWT | Plugin event log |
| `GET /api/map/players` | JWT | Online positions |
| `GET /api/map/zones` | JWT | Kingdom/village/war zones |
| `POST /api/bridge/heartbeat` | API Key + IP | Plugin ping |
| `POST /api/bridge/player-sync` | API Key + IP | Player position sync |
| `POST /api/bridge/inventory-sync` | API Key + IP | Inventory snapshot |
| `POST /api/bridge/event-log` | API Key + IP | Plugin event log |
| `GET /api/bridge/jobs/pending` | API Key + IP | Pending admin jobs |
| `POST /api/bridge/jobs/:id/result` | API Key + IP | Job completion |

### Security Layers

- **Panel JWT**: 15-min access tokens + 7-day refresh tokens with rotation
- **Bridge**: IP whitelist + X-API-Key + rate limit (20 req/min)
- **RBAC**: SUPERADMIN > ADMIN > MODERATOR per-route enforcement
- **Rate limiting**: Auth (10/15min), API (200/15min), Bridge (20/min)
- **Validation**: All inputs validated with Zod

### Plugin Features

- 4 configurable sync timers (heartbeat, players, jobs, inventory)
- Job executor: KICK, GIVE_ITEM, CLEAR_INVENTORY
- Job retry: attempts tracked, maxAttempts configurable
- Event logging: join, leave, death, pickup, drop
- Inventory grid: x, y, rotation, container per item
- Discord webhook: punishments, war status changes, player deaths (optional)

---

## 🌐 Environment Variables

### API (`.env`)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ironcrown
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PLUGIN_API_KEY=...
BRIDGE_ALLOWED_IPS=127.0.0.1,::1
REDIS_URL=                            # leave empty for in-memory cache
DISCORD_WEBHOOK_URL=                  # leave empty to disable
PORT=4000
```

### Panel (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Plugin | C# + OpenMod + System.Net.Http |
| API | Node.js 20 + Express + TypeScript |
| ORM | Prisma 5 + PostgreSQL |
| Cache | Redis (or node-cache fallback) |
| Validation | Zod |
| Auth | JWT (access + refresh) + bcrypt |
| Frontend | Next.js 14 + TypeScript |
| UI | Custom CSS + Radix UI primitives |
| State | TanStack Query + Zustand |
| Animation | Framer Motion |

---

*Built with ⚔️ for the IronCrown Medieval RP community.*
