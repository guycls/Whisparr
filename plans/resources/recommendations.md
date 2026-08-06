# Performance Recommendations

**Last updated:** 2026-08-05  
**Method:** Static code-path analysis (not runtime profiling)  
**Implementation status:** P0 complete (R1–R4); P2 stats linking bundled with R1

Impact ratings assume **large libraries** (100–1000+ series) and **active download workflows**.

---

## Implemented (2026-08-05)

| ID | Recommendation | Files |
|----|----------------|-------|
| R1 | Series statistics cache + O(n²) linking fix | `SeriesStatisticsService.cs`, `SeriesStatisticsRepository.cs`, `SeriesController.cs` |
| R2 | Cover URL mtime cache | `MediaCoverService.cs` |
| R3 | Queue status snapshot | `QueueStatusService.cs`, `QueueStatusSnapshot.cs`, `PendingReleaseService.cs`, `QueueStatusController.cs` |
| R4 | SiteRip DB indexes | `219_add_siterip_indexes.cs`, `SiteRipDownloadRepository.cs`, `SiteRipDownloadService.cs` |

---

## P0 — Critical ~~(implement first)~~ DONE

### R1. Cache series statistics — **IMPLEMENTED**

| | |
|---|---|
| **Status** | Done 2026-08-05 |
| **Impact** | HIGH |
| **Area** | API — `GET /api/v3/series` |
| **Files** | `src/NzbDrone.Core/SeriesStats/SeriesStatisticsService.cs` |
| | `src/NzbDrone.Core/SeriesStats/SeriesStatisticsRepository.cs` |
| | `src/Whisparr.Api.V3/Series/SeriesController.cs` |
| **Was** | Every series list request ran two grouped aggregate queries over all Episodes and EpisodeFiles. |
| **Done** | `ICacheManager` cache with invalidation on `EpisodeImportedEvent`, `EpisodeFileDeletedEvent`, `EpisodeFileAddedEvent`, `SeriesDeletedEvent`. Dictionary-based linking in repository + controller. |

### R2. Remove sync disk I/O from cover URL generation — **IMPLEMENTED**

| | |
|---|---|
| **Status** | Done 2026-08-05 |
| **Impact** | HIGH |
| **Area** | API — series list, episode pages |
| **Files** | `src/NzbDrone.Core/MediaCover/MediaCoverService.cs` |
| **Was** | `ConvertToLocalUrls` called `FileExists` + `FileGetLastWrite` per cover per series on every list fetch. |
| **Done** | In-memory mtime cache (`ICached<long?>`) keyed by `(seriesId, coverType)`; invalidated on cover download and series delete. |

### R3. Cache queue status counts — **IMPLEMENTED**

| | |
|---|---|
| **Status** | Done 2026-08-05 |
| **Impact** | HIGH |
| **Area** | API — `GET /api/v3/queue/status`, SignalR broadcast |
| **Files** | `src/NzbDrone.Core/Queue/QueueStatusService.cs` |
| | `src/NzbDrone.Core/Download/Pending/PendingReleaseService.cs` (`GetPendingQueueCount`) |
| | `src/Whisparr.Api.V3/Queue/QueueStatusController.cs` |
| **Was** | Every status GET and debounced broadcast called `GetPendingQueue()` — full pending release rebuild. |
| **Done** | `QueueStatusSnapshot` refreshed on `QueueUpdatedEvent` / `PendingReleasesUpdatedEvent`; lightweight pending count via unique episode IDs. |

### R4. Add SiteRip DB indexes — **IMPLEMENTED**

| | |
|---|---|
| **Status** | Done 2026-08-05 |
| **Impact** | HIGH |
| **Area** | Queue — download monitoring (every 1 min) |
| **Files** | `src/NzbDrone.Core/Datastore/Migration/219_add_siterip_indexes.cs` |
| | `src/NzbDrone.Core/SiteRip/SiteRipDownloadRepository.cs` |
| | `src/NzbDrone.Core/SiteRip/SiteRipDownloadService.cs` |
| **Was** | No indexes; case-insensitive OR lookup caused table scans. |
| **Done** | Migration 219: indexes on `DownloadId`, `SiteRipDownloadId`, composite `(SiteRipDownloadId, Imported)`; backfill lowercase; normalized insert. |

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

| Endpoint | Primary file | Status | Top issue |
|----------|-------------|--------|-----------|
| GET /series | SeriesController.cs | Improved | Full library load; stats + cover mtime cached |
| GET /episode/paged | EpisodeController.cs | Open | Quality JSON LIKE filter |
| GET /queue/status | QueueStatusController.cs | **Fixed** | Snapshot via QueueStatusService |
| GET /health | HealthController.cs | Open | Global event handler expensive |
| GET /release | ReleaseController.cs | Open | RSS re-fetch on HTTP thread |
| GET /mediacover | MediaCoverController.cs | Open | Disk stat per request |
| SiteRip * | SiteRipController.cs | Partial | Indexes done; batch DB + sync match remain |

## Queue-specific quick reference

| Task | Primary file | Status | Top issue |
|------|-------------|--------|-----------|
| DownloadMonitoring | DownloadMonitoringService.cs | Partial | Indexed SiteRip lookup; sequential I/O remains |
| DownloadProcessing | DownloadProcessingService.cs | Open | SiteRip qBittorrent poll every cycle |
| RssSync | RssSyncService.cs | Open | Full fetch + duplicate with API |
| HealthCheck | HealthCheckService.cs | Open | IHandleAsync<IEvent> global |
| QueueService | QueueService.cs | Partial | SiteRip N+1 still present; status counts fixed |
| ImportListSync | ImportListSyncService.cs | Open | O(n) lookups |

---

## Validation checklist (before/after)

- [ ] Measure `GET /series` latency with 100, 500, 1000 series (P0 — not yet profiled)
- [ ] Measure `GET /queue/status` during active downloads + pending releases (P0 — not yet profiled)
- [ ] Profile download monitoring cycle duration with 2+ clients + SiteRip
- [ ] Confirm episode paged with quality filter on large series
- [x] Verify SiteRip lookup uses indexes after migration 219 (code complete; runtime query plan TBD)
- [x] Solution builds (`dotnet build src/Whisparr.sln`)
