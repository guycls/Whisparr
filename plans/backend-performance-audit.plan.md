---
name: Backend performance audit
overview: Comprehensive performance audit of Whisparr backend APIs and queue tasks. Catalogs ~155 endpoints and 37 command types, identifies hot-path bottlenecks, dead code, and prioritized improvement recommendations for cross-session tracking.
todos:
  - id: p0-series-stats-cache
    content: "P0: Cache/increment series statistics — eliminate 2 full-table aggregates on every GET /series"
    status: completed
  - id: p0-cover-disk-io
    content: "P0: Remove sync disk I/O from MediaCoverService.ConvertToLocalUrls on series list path"
    status: completed
  - id: p0-queue-status-cache
    content: "P0: Cache queue status counts; stop calling GetPendingQueue() on status GET/broadcast"
    status: completed
  - id: p0-siterip-indexes
    content: "P0: Add DB indexes on SiteRipDownloads.DownloadId and SiteRipDownloadFiles.SiteRipDownloadId"
    status: completed
  - id: p1-rss-cache
    content: "P1: Share RSS/decision snapshot between RssSyncService and GET /release (no params)"
    status: pending
  - id: p1-siterip-batch-db
    content: "P1: Batch SiteRip DB lookups in QueueService and SiteRipImportService"
    status: pending
  - id: p1-qbit-throttle
    content: "P1: Cache/throttle qBittorrent GetTorrentFileList in SiteRip import loop"
    status: pending
  - id: p1-health-event-narrow
    content: "P1: Narrow HealthCheckService from IHandleAsync<IEvent> to specific event types"
    status: pending
  - id: p1-episode-quality-index
    content: "P1: Extract quality resolution to indexed columns for episode quality filter"
    status: pending
  - id: p2-stats-linking
    content: "P2: Fix O(n²) stats linking in SeriesController and SeriesStatisticsRepository"
    status: completed
  - id: p2-download-parallel
    content: "P2: Parallelize download client polling in DownloadMonitoringService"
    status: pending
  - id: p2-importlist-hashset
    content: "P2: Use HashSet/Dictionary in ImportListSyncService existence checks"
    status: pending
  - id: p2-mediacover-cache-headers
    content: "P2: Add Cache-Control headers to MediaCover responses"
    status: pending
  - id: dead-code-languageprofile
    content: "Dead code: Remove deprecated LanguageProfile controllers after API deprecation period"
    status: pending
  - id: dead-code-finished-download
    content: "Dead code: Remove CheckForFinishedDownloadCommand handler"
    status: pending
  - id: dead-code-importlist-getall
    content: "Dead code: Remove deprecated GET /importlistexclusion (use /paged)"
    status: pending
  - id: open-delayprofile-schema
    content: "Open: Investigate frontend /delayprofile/schema call — no backend endpoint exists"
    status: pending
isProject: true
---

# Backend Performance Audit

**Created:** 2026-08-05  
**Branch baseline:** current `main` / working tree  
**Scope:** Backend only (`src/NzbDrone.Core`, `src/Whisparr.Api.V3`, `src/Whisparr.Http`, `src/NzbDrone.Host`)

## Purpose

Track backend performance improvements across agent sessions. This plan captures the current implementation state, hot-path analysis, and prioritized recommendations derived from code-path review (not runtime profiling).

## Resource files

| Resource | Description |
|----------|-------------|
| [resources/architecture-overview.md](resources/architecture-overview.md) | Project structure, layers, routing conventions |
| [resources/api-catalog.md](resources/api-catalog.md) | All ~155 API endpoints with usage frequency estimates |
| [resources/queue-task-catalog.md](resources/queue-task-catalog.md) | Scheduled tasks, commands, event handlers |
| [resources/recommendations.md](resources/recommendations.md) | Detailed improvement recommendations with file refs |
| [resources/dead-code.md](resources/dead-code.md) | Deprecated/unused code removal candidates |

---

## Current state summary

### Architecture

Whisparr is a .NET (ASP.NET Core) fork of the *arr stack. Backend layers:

```
NzbDrone.Host          → ASP.NET startup, middleware, SignalR hub
Whisparr.Api.V3        → REST controllers, DTOs (~58 controllers)
Whisparr.Http          → Route attributes, auth, static frontend
NzbDrone.Core          → Business logic, commands, providers, DB
NzbDrone.Common        → Utilities
NzbDrone.SignalR       → Real-time push at /signalr/messages
```

- **Command queue:** 3 worker threads, priority ordering (High > Normal > Low)
- **Scheduler:** 30-second poll, interval-based (no cron)
- **Realtime:** SignalR replaces polling for most live data; exceptions are search progress endpoints (500ms poll)

### Highest-traffic surfaces

**APIs (HTTP):**

| Rank | Endpoint | Est. frequency | Primary bottleneck |
|------|----------|----------------|-------------------|
| 1 | `GET /api/v3/series` | Every page load | Full library + 2 aggregate DB scans + disk I/O per cover |
| 2 | `GET /api/v3/localization` | App boot | Low (cached after first load) |
| 3 | `GET /api/v3/mediacover/{id}/{file}` | Many img tags | Disk stat per request |
| 4 | `GET /api/v3/health` | Sidebar + SignalR | Read path cheap; write path fires on all events |
| 5 | `GET /api/v3/queue/status` | Sidebar badge | Rebuilds full pending queue |
| 6 | `GET /api/v3/episode/paged` | Series detail | Quality filter uses JSON LIKE |
| 7 | `GET /api/v3/release` + progress poll | Search workflow | RSS mode re-fetches on HTTP thread |

**Queue tasks:**

| Rank | Task | Interval | Primary bottleneck |
|------|------|----------|-------------------|
| 1 | RefreshMonitoredDownloads + ProcessMonitoredDownloads | 1 min + events | Sequential download client I/O; SiteRip qBittorrent polling |
| 2 | HealthCheckService event debouncer | Every domain event | `IHandleAsync<IEvent>` global subscription |
| 3 | RssSyncCommand | 15 min (default) | Full indexer fetch + decision pipeline |
| 4 | ImportListSyncCommand | 5 min | O(n) lookups per item |
| 5 | QueueService rebuild | ~1 min + events | SiteRip N+1 DB; full queue rebuild |

---

## Decisions

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D1 | Prioritize P0 items before P2 micro-optimizations | P0 items affect every session / every minute | 2026-08-05 |
| D2 | Do not remove deprecated API stubs until confirming no external consumers | LanguageProfile, CheckForFinishedDownload may have 3rd-party callers | 2026-08-05 |
| D3 | Prefer incremental cache invalidation over full response caching for series list | Series list changes frequently via imports; need event-driven invalidation | 2026-08-05 |
| D4 | SiteRip indexes are safe, zero-risk migration | Confirmed migration 217 has no indexes on lookup columns | 2026-08-05 |

---

## Open questions

| ID | Question | Context | Status |
|----|----------|---------|--------|
| Q1 | Does any external tool still call `LanguageProfile` or `CheckForFinishedDownload` APIs? | Both are deprecated stubs; removal blocked on D2 | Open |
| Q2 | Should `GET /delayprofile/schema` be implemented or frontend call removed? | `delayProfiles.js` line 66 references non-existent endpoint | Open |
| Q3 | What is typical library size for perf testing? | Recommendations assume 100–1000+ series; validate with real data | Open |
| Q4 | Is runtime profiling (dotTrace, MiniProfiler) available in dev? | Code review only so far; confirm hotspots with traces before large refactors | Open |
| Q5 | Should sync `POST /siterip/match` be deprecated in favor of async `match/start`? | Sync endpoint blocks HTTP thread on large torrents | Open |

---

## Improvement roadmap

### P0 — High impact, affects every session or every minute

1. **Series statistics cache** — `SeriesStatisticsRepository` runs grouped scans over all Episodes + EpisodeFiles on every `GET /series`. Cache with invalidation on import/delete/refresh events.
2. **Cover URL disk I/O** — `MediaCoverService.ConvertToLocalUrls` does `FileExists` + `FileGetLastWrite` per cover per series on every list fetch. Use static URLs or in-memory mtime cache.
3. **Queue status cache** — `QueueStatusController.GetQueueStatus()` calls `GetPendingQueue()` which re-parses all pending releases. Maintain lightweight count snapshot.
4. **SiteRip DB indexes** — Migration 217 creates tables without indexes; lookups use case-insensitive OR causing table scans.

### P1 — Significant impact on active workflows

5. RSS snapshot sharing between scheduled sync and `GET /release`
6. Batch SiteRip DB lookups in `QueueService` and `SiteRipImportService`
7. Throttle qBittorrent file list polling in SiteRip import loop
8. Narrow `HealthCheckService` event subscription
9. Indexed quality columns for episode paged filter

### P2 — Incremental wins

10. O(n²) → O(n) stats linking in controller + repository
11. Parallel download client polling
12. HashSet/Dictionary in ImportListSyncService
13. Cache-Control on media cover responses

See [resources/recommendations.md](resources/recommendations.md) for file paths, line references, and implementation notes.

---

## Dead code summary

| Item | Risk | Action |
|------|------|--------|
| `LanguageProfileController` + schema | Low (no FE refs) | Remove after deprecation period |
| `CheckForFinishedDownloadCommand` | Low (logs warning only) | Remove handler |
| `ImportListExclusionController` GET all | Low (FE uses `/paged`) | Remove obsolete action |
| `EventAggregator.cs` commented debug block | None | Safe cleanup |

Full catalog: [resources/dead-code.md](resources/dead-code.md)

---

## Session log

| Date | Agent/session | Work done |
|------|---------------|-----------|
| 2026-08-05 | Initial audit | Created plan + resource files; code-path analysis of APIs, queue tasks, dead code |
| 2026-08-05 | P0 implementation | SiteRip indexes (migration 219), series stats cache + O(n²) linking fix, cover mtime cache, QueueStatusService snapshot |

---

## How to resume

1. Open this plan in Cursor Plans view
2. Pick highest-priority pending todo
3. Read linked resource file for file paths and context
4. Mark todo `in_progress` → implement → mark `completed`
5. Add row to Session log above
