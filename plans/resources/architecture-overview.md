# Backend Architecture Overview

**Last updated:** 2026-08-05 (post-P0)

## Project structure

| Project | Path | Role |
|---------|------|------|
| Host | `src/NzbDrone.Host/` | ASP.NET Core startup, middleware, endpoint mapping, SignalR hub registration |
| API v3 | `src/Whisparr.Api.V3/` | Versioned REST controllers (~58), DTOs/resources, FluentValidation validators |
| HTTP infra | `src/Whisparr.Http/` | `[V3ApiController]`, REST base classes, auth, frontend static serving |
| Core | `src/NzbDrone.Core/` | Business logic, services, commands, providers, datastore, migrations |
| Common | `src/NzbDrone.Common/` | Utilities, environment info, HTTP, disk, cache |
| SignalR | `src/NzbDrone.SignalR/` | `MessageHub` at `/signalr/messages` |

## Routing conventions

- **`[V3ApiController]`** → `api/v3/{resource}` (controller name minus `Controller`)
- **`[V3ApiController("custom/path")]`** → explicit path (e.g. `queue/status`)
- **`[V3FeedController]`** → `feed/v3/{resource}`
- **`RestController<T>`** base: `GET /{id}`, plus per-controller list/create/update/delete
- **`LowercaseUrls = true`** globally

## Non-API HTTP surfaces

| Route | Purpose |
|-------|---------|
| `GET /api` | API version info |
| `GET /ping` | DB health (anonymous) |
| `GET /initialize.json` | Boot config (apiRoot, apiKey, version) |
| `GET/POST /login`, `GET /logout` | Forms auth |
| `GET /`, `GET /content/**` | SPA shell + static assets |
| `GET /feed/v3/calendar/Whisparr.ics` | iCal export |
| `GET /signalr/messages` | WebSocket realtime push |

## Command queue infrastructure

| Component | File | Role |
|-----------|------|------|
| Scheduler | `NzbDrone.Core/Jobs/Scheduler.cs` | 30s timer; polls pending tasks → command queue |
| TaskManager | `NzbDrone.Core/Jobs/TaskManager.cs` | Registers 10 default scheduled tasks; updates LastExecution |
| CommandQueueManager | `NzbDrone.Core/Messaging/Commands/CommandQueueManager.cs` | Push/dedupe/persist; requeue orphans on startup |
| CommandQueue | `NzbDrone.Core/Messaging/Commands/CommandQueue.cs` | Priority queue; respects IsLongRunning, IsExclusive, RequiresDiskAccess |
| CommandExecutor | `NzbDrone.Core/Messaging/Commands/CommandExecutor.cs` | **3 worker threads** |

## Realtime patterns

SignalR events trigger refetches or direct state updates:

| Event | Effect |
|-------|--------|
| `series`, `episode`, `episodefile`, `calendar` | Incremental UI update |
| `queue`, `queueDetails`, `queueStatus` | Refetch or push status |
| `command`, `systemTask` | Refetch commands |
| `health`, `qualitydefinition`, `rootfolder`, `tag` | Refetch |
| `wantedMissing`, `wantedCutoff` | Incremental update |

## Active HTTP polling (exceptions to SignalR)

| Endpoint | Interval | When |
|----------|----------|------|
| `GET /release/search/progress/{id}` | 500ms | During indexer search |
| `GET /siterip/search/progress/{id}` | ~500ms | During SiteRip search |
| `GET /siterip/match/progress/{id}` | ~500ms | During file matching |
| `GET /system/status` | 5s | After restart until server responds |

## Whisparr-specific backend additions

- **SiteRip** — `src/NzbDrone.Core/SiteRip/`, `src/Whisparr.Api.V3/SiteRip/`
- **Stash sync** — `StashSyncCommand`, notification action
- **TPDB metadata** — GraphQL metadata source integration
- **Split import** — Multi-part scene file handling

## Database

- SQLite (main DB) via Dapper + FluentMigrator
- Migrations in `src/NzbDrone.Core/Datastore/Migration/`
- Latest SiteRip tables: migration 217 (`SiteRipDownloads`, `SiteRipDownloadFiles`); indexes added in migration 219
