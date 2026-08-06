# API Endpoint Catalog

**Last updated:** 2026-08-05  
**Total:** ~155 HTTP routes across 60+ controllers

**Frequency legend:** **High** = every session / SignalR-driven / sidebar; **Medium** = feature pages; **Low** = admin / external / deprecated

---

## Top 15 by estimated traffic

| Rank | Endpoint | Freq | Rationale |
|------|----------|------|-----------|
| 1 | `GET /api/v3/series` | High | Loaded on every page mount |
| 2 | `GET /api/v3/localization` | High | App initialization |
| 3 | `GET /api/v3/mediacover/{id}/{file}` | High | Image requests throughout UI |
| 4 | `GET /api/v3/health` | High | Sidebar health indicator |
| 5 | `GET /api/v3/queue/status` | High | Sidebar queue badge |
| 6 | `GET /api/v3/command` | High | SignalR-driven command tracking |
| 7 | `GET /api/v3/episode`, `/episode/paged` | High | Series detail pages |
| 8 | `GET /api/v3/episodefile` | High | File state on series pages |
| 9 | `GET /api/v3/calendar` | High | Calendar view |
| 10 | `GET /api/v3/queue` | High | Activity queue page |
| 11 | `GET /api/v3/release` | High | Search/grab workflow |
| 12 | `POST /api/v3/release` | High | Grab action |
| 13 | `POST /api/v3/command` | High | Triggers background jobs |
| 14 | `GET /api/v3/system/status` | High | Post-restart connectivity (5s poll) |
| 15 | `GET /api/v3/tag`, `/tag/detail` | High | Filtering/tagging UI |

---

## System & Health

### SystemController — `/api/v3/system`

| Method | Route | Freq | Description |
|--------|-------|------|-------------|
| GET | `/status` | High | App version, OS, DB, auth, paths |
| GET | `/routes` | Low | DFA route graph (debug) |
| GET | `/routes/duplicate` | Low | Duplicate route detector |
| POST | `/shutdown` | Low | Graceful shutdown |
| POST | `/restart` | Low | Restart app |

### TaskController — `/api/v3/system/task`

| Method | Route | Freq | Description |
|--------|-------|------|-------------|
| GET | `/` | Medium | List scheduled tasks |
| GET | `/{id}` | Low | Single task |

### BackupController — `/api/v3/system/backup`

| Method | Route | Freq | Description |
|--------|-------|------|-------------|
| GET | `/` | Medium | List backup files |
| DELETE | `/{id}` | Low | Delete backup |
| POST | `/restore/{id}` | Low | Restore from backup |
| POST | `/restore/upload` | Low | Upload + restore |

### HealthController — `/api/v3/health`

| Method | Route | Freq | Description |
|--------|-------|------|-------------|
| GET | `/` | High | All health check results (in-memory cache) |

### DiskSpaceController — `/api/v3/diskspace`

| Method | Route | Freq | Description |
|--------|-------|------|-------------|
| GET | `/` | Medium | Free space per volume |

### UpdateController — `/api/v3/update`

| Method | Route | Freq | Description |
|--------|-------|------|-------------|
| GET | `/` | Medium | Available update packages |

### LogController — `/api/v3/log`

| Method | Route | Freq | Description |
|--------|-------|------|-------------|
| GET | `/` | Medium | Paged application logs |

### LogFileController — `/api/v3/log/file`

| Method | Route | Freq | Description |
|--------|-------|------|-------------|
| GET | `/` | Medium | List log file metadata |
| GET | `/{filename}.txt` | Low | Raw log contents |

---

## Series & Episodes

### SeriesController — `/api/v3/series`

| Method | Route | Freq | Perf notes |
|--------|-------|------|------------|
| GET | `/` | **High** | Stats cached (`SeriesStatisticsService`); cover mtime cached; full library still loaded |
| GET | `/{id}` | High | Single series |
| POST | `/` | Medium | Add series |
| PUT | `/{id}` | Medium | Update series |
| DELETE | `/{id}` | Medium | Delete series |

### SeriesEditorController — `/api/v3/series/editor`

| Method | Route | Freq |
|--------|-------|------|
| PUT | `/` | Medium |
| DELETE | `/` | Medium |

### SeriesLookupController — `/api/v3/series/lookup`

| Method | Route | Freq |
|--------|-------|------|
| GET | `/` | Medium |

### SeriesImportController — `/api/v3/series/import`

| Method | Route | Freq |
|--------|-------|------|
| POST | `/` | Medium |

### SeasonPassController — `/api/v3/seasonpass`

| Method | Route | Freq |
|--------|-------|------|
| POST | `/` | Medium |

### EpisodeController — `/api/v3/episode`

| Method | Route | Freq | Perf notes |
|--------|-------|------|------------|
| GET | `/` | High | By seriesId/season/ids |
| GET | `/paged` | **High** | Server-paged; quality filter uses JSON LIKE |
| GET | `/filterBounds` | Medium | Max runtime for filter UI |
| PUT | `/{id}` | Medium | Set monitored |
| PUT | `/monitor` | Medium | Batch monitored |

### EpisodeFileController — `/api/v3/episodefile`

| Method | Route | Freq |
|--------|-------|------|
| GET | `/` | High |
| GET | `/{id}` | Medium |
| PUT | `/{id}` | Medium |
| PUT | `/editor` | Medium |
| PUT | `/bulk` | Medium |
| DELETE | `/{id}` | Medium |
| DELETE | `/bulk` | Medium |

### CalendarController — `/api/v3/calendar`

| Method | Route | Freq |
|--------|-------|------|
| GET | `/` | High |

---

## Queue & Downloads

### QueueController — `/api/v3/queue`

| Method | Route | Freq |
|--------|-------|------|
| GET | `/` | High |
| DELETE | `/{id}` | Medium |
| DELETE | `/bulk` | Medium |

### QueueStatusController — `/api/v3/queue/status`

| Method | Route | Freq | Perf notes |
|--------|-------|------|------------|
| GET | `/` | **High** | Reads `QueueStatusService` snapshot; no `GetPendingQueue()` on GET |

### QueueDetailsController — `/api/v3/queue/details`

| Method | Route | Freq |
|--------|-------|------|
| GET | `/` | Medium |

### QueueActionController — `/api/v3/queue`

| Method | Route | Freq |
|--------|-------|------|
| POST | `/grab/{id}` | Medium |
| POST | `/grab/bulk` | Medium |

---

## Indexers & Releases

### ReleaseController — `/api/v3/release`

| Method | Route | Freq | Perf notes |
|--------|-------|------|------------|
| GET | `/` | **High** | RSS mode re-fetches on HTTP thread |
| GET | `/search/progress/{searchId}` | High | 500ms poll during search (cheap in-memory) |
| POST | `/` | High | Grab release |

### ReleasePushController — `/api/v3/release/push`

| Method | Route | Freq |
|--------|-------|------|
| POST | `/` | Low (webhook) |

---

## SiteRip (Whisparr-specific)

DB lookups indexed (migration 219). Remaining: batch N+1 in `QueueService`, qBittorrent throttle (P1).

### SiteRipController — `/api/v3/siterip`

| Method | Route | Freq | Perf notes |
|--------|-------|------|------------|
| GET | `/search` | Medium | Loads all episodes for series |
| GET | `/search/progress/{searchId}` | Medium | 500ms poll |
| GET | `/torrent/files` | Medium | Blocking indexer HTTP |
| POST | `/match/start` | Medium | Async (preferred) |
| GET | `/match/progress/{matchId}` | Medium | 500ms poll |
| POST | `/match` | Medium | **Sync — blocks HTTP thread** |
| POST | `/grab` | Medium | Grab selected files |

---

## Provider controllers (shared pattern)

Indexer, DownloadClient, ImportList, Notification, Metadata — each provides:

`GET/POST/PUT/DELETE /`, `PUT/DELETE /bulk`, `GET /schema`, `POST /test`, `POST /testall`, `POST /action/{name}`

| Controller | Route | Freq |
|------------|-------|------|
| IndexerController | `/api/v3/indexer` | Medium |
| DownloadClientController | `/api/v3/downloadclient` | Medium |
| ImportListController | `/api/v3/importlist` | Medium |
| NotificationController | `/api/v3/notification` | Medium (+ `POST /stash/sync`) |
| MetadataController | `/api/v3/metadata` | Medium |

---

## Commands, History, Profiles, Config, Utilities

### CommandController — `/api/v3/command`

| Method | Route | Freq |
|--------|-------|------|
| GET | `/` | High |
| POST | `/` | High |
| DELETE | `/{id}` | Medium |

### HistoryController — `/api/v3/history`

| Method | Route | Freq |
|--------|-------|------|
| GET | `/` | Medium |
| GET | `/since` | Low |
| GET | `/series` | Medium |
| POST | `/failed/{id}` | Medium |

### BlocklistController — `/api/v3/blocklist`

| Method | Route | Freq |
|--------|-------|------|
| GET | `/` | Medium |
| DELETE | `/{id}`, `/bulk` | Low |

### Profiles

QualityProfile, ReleaseProfile, DelayProfile, CustomFormat, AutoTagging — standard REST + schema endpoints (Medium/Low)

### Deprecated

| Controller | Route | Freq | Notes |
|------------|-------|------|-------|
| LanguageProfileController | `/api/v3/languageprofile` | Low | Returns hardcoded "Deprecated" |
| LanguageProfileSchemaController | `/api/v3/languageprofile/schema` | Low | Stub |

### Config controllers

Host, UI, MediaManagement, Naming (+ `/examples`), Indexer, DownloadClient, MetadataSource — `GET/PUT` (Medium)

### Other

| Controller | Route | Freq |
|------------|-------|------|
| RootFolderController | `/api/v3/rootfolder` | Medium |
| ManualImportController | `/api/v3/manualimport` | Medium |
| FileSystemController | `/api/v3/filesystem` | Medium |
| ParseController | `/api/v3/parse` | Low |
| LocalizationController | `/api/v3/localization` | High |
| MediaCoverController | `/api/v3/mediacover` | High |
| TagController, TagDetailsController | `/api/v3/tag` | High/Medium |
| CustomFilterController | `/api/v3/customfilter` | Medium |
| MissingController, CutoffController | `/api/v3/wanted/*` | Medium |
| ImportListExclusionController | `/api/v3/importlistexclusion` | Medium (use `/paged`) |

---

## Frontend → backend mismatch

| Frontend call | Backend | Status |
|---------------|---------|--------|
| `GET /delayprofile/schema` | Not found | **Missing endpoint** — see open question Q2 in main plan |

---

## Endpoint count by category

| Category | Controllers | ~Endpoints |
|----------|-------------|------------|
| Whisparr.Api.V3 | ~58 | ~145 |
| Whisparr.Http | 5 | ~10 |
| Feed | 1 | 1 |
| SignalR | 1 | WebSocket |
