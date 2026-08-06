# Performance Recommendations

**Last updated:** 2026-08-05  
**Method:** Static code-path analysis (not runtime profiling)

Impact ratings assume **large libraries** (100–1000+ series) and **active download workflows**.

---

## P0 — Critical (implement first)

### R1. Cache series statistics

| | |
|---|---|
| **Impact** | HIGH |
| **Area** | API — `GET /api/v3/series` |
| **Files** | `src/Whisparr.Api.V3/Series/SeriesController.cs:99` |
| | `src/NzbDrone.Core/SeriesStats/SeriesStatisticsRepository.cs:29-34` |
| **Problem** | Every series list request runs two grouped aggregate queries over all Episodes and EpisodeFiles. |
| **Fix** | Cache `SeriesStatistics()` result in memory with TTL or invalidate on `EpisodeImportedEvent`, `EpisodeFileDeletedEvent`, `SeriesDeletedEvent`, `SeriesUpdatedEvent`. Controller already handles several of these via SignalR. |
| **Also fix** | O(n²) linking in `MapResults` (lines 44-52) and `LinkSeriesStatistics` in controller — use `Dictionary<(SeriesId, SeasonNumber), ...>`. |

### R2. Remove sync disk I/O from cover URL generation

| | |
|---|---|
| **Impact** | HIGH |
| **Area** | API — series list, episode pages |
| **Files** | `src/NzbDrone.Core/MediaCover/MediaCoverService.cs:96-100` |
| **Problem** | `ConvertToLocalUrls` calls `FileExists` + `FileGetLastWrite` for every cover of every series on every list fetch. With 500 series × 2-3 covers = 1000+ disk syscalls per request. |
| **Fix** | Option A: Omit `?lastWrite=` cache buster (rely on SignalR `MediaCoversUpdatedEvent`). Option B: Cache mtime in memory keyed by `(seriesId, coverType)`. Option C: Store cover mtime in DB. |

### R3. Cache queue status counts

| | |
|---|---|
| **Impact** | HIGH |
| **Area** | API — `GET /api/v3/queue/status`, SignalR broadcast |
| **Files** | `src/Whisparr.Api.V3/Queue/QueueStatusController.cs:46-61, 69-71` |
| | `src/NzbDrone.Core/Download/Pending/PendingReleaseService.cs:177-214` |
| **Problem** | Every status GET and debounced SignalR broadcast calls `GetPendingQueue()` which loads all pending releases, re-parses episodes, runs quality comparer dedup. |
| **Fix** | Maintain `QueueStatusSnapshot` updated incrementally on `QueueUpdatedEvent` / `PendingReleasesUpdatedEvent`. Status GET reads snapshot only. Single-pass counter loop instead of 6 LINQ iterations. |

### R4. Add SiteRip DB indexes

| | |
|---|---|
| **Impact** | HIGH |
| **Area** | Queue — download monitoring (every 1 min) |
| **Files** | `src/NzbDrone.Core/Datastore/Migration/217_add_siterip_downloads.cs` |
| | `src/NzbDrone.Core/SiteRip/SiteRipDownloadRepository.cs` (FindByDownloadId) |
| **Problem** | Migration 217 creates tables with no indexes. Lookups use case-insensitive OR → table scan on every download refresh per SiteRip item. |
| **Fix** | New migration: index on `SiteRipDownloads(DownloadId)`, index on `SiteRipDownloadFiles(SiteRipDownloadId, Imported)`. Consider storing normalized DownloadId to avoid OR query. |

---

## P1 — Significant

### R5. Share RSS snapshot between sync and API

| | |
|---|---|
| **Impact** | HIGH (when RSS tab used) |
| **Area** | API + Queue |
| **Files** | `src/Whisparr.Api.V3/Indexers/ReleaseController.cs` (GetRss) |
| | `src/NzbDrone.Core/Indexers/RssSyncService.cs` |
| **Problem** | `GET /release` with no search params re-fetches RSS and runs full decision pipeline on HTTP thread, duplicating scheduled RssSync work. |
| **Fix** | Cache last RSS sync results with timestamp; return cached if fresh (< interval). Return 409 or stale indicator if sync in progress. |

### R6. Batch SiteRip DB lookups

| | |
|---|---|
| **Impact** | HIGH (SiteRip users) |
| **Area** | Queue rebuild |
| **Files** | `src/NzbDrone.Core/Queue/QueueService.cs:87-110` |
| | `src/NzbDrone.Core/SiteRip/SiteRipImportService.cs` |
| **Problem** | Per trackable download: `FindByDownloadId`, `GetPendingFiles`, `FindEpisodes` — N+1 pattern every ~1 min. |
| **Fix** | Pre-load all SiteRip downloads + pending files for current tracked download IDs in 2-3 queries; build lookup dictionaries. |

### R7. Throttle qBittorrent file list polling

| | |
|---|---|
| **Impact** | HIGH (SiteRip users) |
| **Area** | Queue — ProcessMonitoredDownloads |
| **Files** | `src/NzbDrone.Core/SiteRip/SiteRipImportService.cs:74-85` |
| **Problem** | `GetTorrentFileList` called every minute per active SiteRip download. |
| **Fix** | Cache file completion bitmap; poll every N minutes or on download progress change threshold. |

### R8. Narrow HealthCheckService event subscription

| | |
|---|---|
| **Impact** | MEDIUM-HIGH |
| **Area** | Event system (global) |
| **Files** | `src/NzbDrone.Core/HealthCheck/HealthCheckService.cs:24, 165-229` |
| **Problem** | `IHandleAsync<IEvent>` receives every domain event. Each triggers grace-period check + dictionary lookup even when no health check is registered for that event type. |
| **Fix** | Replace with explicit `IHandleAsync<T>` for each event type in `_eventDrivenHealthChecks` dictionary. Or filter in handler: early return if event type not in map. |

### R9. Indexed quality columns for episode filter

| | |
|---|---|
| **Impact** | HIGH (when quality filter active) |
| **Area** | API — `GET /episode/paged` |
| **Files** | `src/NzbDrone.Core/Tv/EpisodeQualityFilter.cs:54-62` |
| **Problem** | `EpisodeFiles.Quality LIKE '%"resolution":1080%'` prevents index use. |
| **Fix** | Add `QualityResolution`, `QualitySource` columns to EpisodeFiles (populated on insert/update) with composite index `(SeriesId, QualityResolution)`. |

---

## P2 — Incremental

### R10. Parallel download client polling

| | |
|---|---|
| **Impact** | MEDIUM |
| **Files** | `src/NzbDrone.Core/Download/TrackedDownloads/DownloadMonitoringService.cs:70-94` |
| **Problem** | Sequential `GetItems()` per client; network-bound. |
| **Fix** | `Task.WhenAll` with per-client timeout. |

### R11. Skip unchanged download tracking

| | |
|---|---|
| **Impact** | MEDIUM |
| **Files** | `DownloadMonitoringService.cs:106-109`, `TrackedDownloadService.cs:135-143` |
| **Problem** | Full history/DB path even when hash/size/status unchanged. |
| **Fix** | Compare to cached TrackedDownload state; skip TrackDownload if unchanged. |

### R12. ImportListSyncService lookup optimization

| | |
|---|---|
| **Impact** | MEDIUM |
| **Files** | `src/NzbDrone.Core/ImportLists/ImportListSyncService.cs:94, 110, 119, 126-130` |
| **Problem** | O(n) `Any`/`SingleOrDefault`/`Where` per item; loads all episodes for single-episode monitor flip. |
| **Fix** | `HashSet<int>` for existing IDs; `Dictionary` for exclusions and import lists; query single episode by TvdbId. |

### R13. MediaCoverProxy cache sweep

| | |
|---|---|
| **Impact** | MEDIUM |
| **Files** | `src/NzbDrone.Core/MediaCover/MediaCoverProxy.cs:44` |
| **Problem** | `_cache.ClearExpired()` on every `RegisterUrl` call during episode paged load. |
| **Fix** | Periodic background sweep or lazy sweep every N registrations. |

### R14. MediaCover Cache-Control headers

| | |
|---|---|
| **Impact** | MEDIUM |
| **Files** | `src/Whisparr.Api.V3/MediaCovers/MediaCoverController.cs:33-46` |
| **Problem** | `FileExists` + `GetFileSize` per image request; no browser caching. |
| **Fix** | `Cache-Control: public, max-age=86400`; use ETag/Last-Modified from file mtime. |

### R15. Episode paged index for default sort

| | |
|---|---|
| **Impact** | MEDIUM |
| **Files** | `src/NzbDrone.Core/Tv/EpisodeRepository.cs` |
| **Problem** | Default sort on `AirDateUtc`; existing index is `(SeriesId, AirDate)`. |
| **Fix** | Migration: index `(SeriesId, AirDateUtc DESC)`. |

### R16. RssSyncService async

| | |
|---|---|
| **Impact** | LOW-MEDIUM |
| **Files** | `src/NzbDrone.Core/Indexers/RssSyncService.cs:70` |
| **Problem** | `Sync().GetAwaiter().GetResult()` blocks scheduler thread. |
| **Fix** | Async command handler if framework supports it. |

### R17. SiteRip sync match endpoint

| | |
|---|---|
| **Impact** | MEDIUM |
| **Files** | `src/Whisparr.Api.V3/SiteRip/SiteRipController.cs:161-186` |
| **Problem** | `POST /match` runs `Parallel.ForEach` on HTTP thread. |
| **Fix** | Deprecate sync endpoint; route all clients to `match/start` + progress poll. |

### R18. Diff-based queue rebuild

| | |
|---|---|
| **Impact** | MEDIUM |
| **Files** | `src/NzbDrone.Core/Queue/QueueService.cs:157-165` |
| **Problem** | Full `_queue` rebuild + event publish every refresh. |
| **Fix** | Compare previous/new; only publish if changed. |

---

## API-specific quick reference

| Endpoint | Primary file | Top issue |
|----------|-------------|-----------|
| GET /series | SeriesController.cs | Stats aggregates + cover disk I/O |
| GET /episode/paged | EpisodeController.cs | Quality JSON LIKE filter |
| GET /queue/status | QueueStatusController.cs | GetPendingQueue on every request |
| GET /health | HealthController.cs | Read cheap; global event handler expensive |
| GET /release | ReleaseController.cs | RSS re-fetch on HTTP thread |
| GET /mediacover | MediaCoverController.cs | Disk stat per request |
| SiteRip * | SiteRipController.cs | Sync match, missing indexes, all-episodes load |

## Queue-specific quick reference

| Task | Primary file | Top issue |
|------|-------------|-----------|
| DownloadMonitoring | DownloadMonitoringService.cs | Sequential client I/O, per-item history |
| DownloadProcessing | DownloadProcessingService.cs | SiteRip qBittorrent poll every cycle |
| RssSync | RssSyncService.cs | Full fetch + duplicate with API |
| HealthCheck | HealthCheckService.cs | IHandleAsync<IEvent> global |
| QueueService | QueueService.cs | SiteRip N+1, full rebuild |
| ImportListSync | ImportListSyncService.cs | O(n) lookups |

---

## Validation checklist (before/after)

- [ ] Measure `GET /series` latency with 100, 500, 1000 series
- [ ] Measure `GET /queue/status` during active downloads + pending releases
- [ ] Profile download monitoring cycle duration with 2+ clients + SiteRip
- [ ] Confirm episode paged with quality filter on large series
- [ ] Verify SiteRip lookup query plan after index migration
