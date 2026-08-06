# Queue Task & Event Handler Catalog

**Last updated:** 2026-08-05

## Scheduler infrastructure

- **Poll interval:** 30 seconds
- **No cron** — all tasks use minute-based intervals since last execution
- **Workers:** 3 concurrent command executor threads
- **Priority:** High > Normal > Low, then FIFO by QueuedAt

---

## Scheduled tasks (10 registered)

Defined in `TaskManager.Handle(ApplicationStartedEvent)` — `src/NzbDrone.Core/Jobs/TaskManager.cs`

| Command | Interval | Priority | Executor | Freq rank |
|---------|----------|----------|----------|-----------|
| **RefreshMonitoredDownloadsCommand** | **1 min** | **High** | DownloadMonitoringService | **1** |
| MessagingCleanupCommand | 5 min | Normal | CleanupCommandMessagingService | 4 |
| ImportListSyncCommand | 5 min | Normal | ImportListSyncService | 4 |
| **RssSyncCommand** | **15 min** (configurable, 0=off) | Normal | RssSyncService | **3** |
| ApplicationUpdateCheckCommand | 6 hours | Normal | InstallUpdateService | 7 |
| CheckHealthCommand | 6 hours | Normal | HealthCheckService | 7 |
| RefreshSeriesCommand | 12 hours | Normal | RefreshSeriesService | 6 |
| HousekeepingCommand | 24 hours | Normal | HousekeepingService | 8 |
| CleanUpRecycleBinCommand | 24 hours | Normal | RecycleBinProvider | 8 |
| BackupCommand | 7 days (configurable) | Normal | BackupService | 8 |

**Chained (not scheduled directly):**

| Command | Triggered by | Executor | Freq rank |
|---------|--------------|----------|-----------|
| **ProcessMonitoredDownloadsCommand** | Every RefreshMonitoredDownloads | DownloadProcessingService | **1** |

---

## All command types (37)

### HIGH frequency

| Command | Trigger | Executor | Notes |
|---------|---------|----------|-------|
| RefreshMonitoredDownloadsCommand | Scheduled 1 min + events (5s debounce) | DownloadMonitoringService | Highest-frequency task |
| ProcessMonitoredDownloadsCommand | Chained from refresh | DownloadProcessingService | IsLongRunning, RequiresDiskAccess |
| RssSyncCommand | Scheduled ~15 min | RssSyncService | IsLongRunning |
| MessagingCleanupCommand | Scheduled 5 min | CleanupCommandMessagingService | Trims command history |

### MEDIUM frequency

| Command | Trigger | Executor |
|---------|---------|----------|
| ImportListSyncCommand | Scheduled 5 min + provider update | ImportListSyncService |
| RefreshSeriesCommand | Scheduled 12h + series add/import | RefreshSeriesService |
| CheckHealthCommand | Scheduled 6h + startup | HealthCheckService |
| ApplicationUpdateCheckCommand | Scheduled 6h | InstallUpdateService |
| EpisodeSearchCommand | Episode add, redownload, manual API | EpisodeSearchService |
| MissingEpisodeSearchCommand | Post-add scan | EpisodeSearchService |
| CutoffUnmetEpisodeSearchCommand | Post-add scan | EpisodeSearchService |
| SeriesSearchCommand | Post-add scan | SeriesSearchService |
| SeasonSearchCommand | Full-season failure redownload | SeasonSearchService |
| RescanSeriesCommand | Post-import | DiskScanService |

### LOW frequency

| Command | Trigger | Executor |
|---------|---------|----------|
| HousekeepingCommand | 24h | HousekeepingService (27 housekeepers + vacuum) |
| CleanUpRecycleBinCommand | 24h | RecycleBinProvider |
| BackupCommand | 7d / manual | BackupService |
| ApplicationUpdateCommand | Update check | InstallUpdateService (IsExclusive) |
| DownloadedEpisodesScanCommand | Manual API | DownloadedEpisodesCommandService |
| ManualImportCommand | Manual API (High priority) | ManualImportService |
| RenameFilesCommand / RenameSeriesCommand | Manual | RenameEpisodeFileService |
| MoveSeriesCommand / BulkMoveSeriesCommand | Manual | MoveSeriesService |
| StashSyncCommand | Manual API | StashSyncService |
| DeleteLogFilesCommand / ClearLogCommand | Manual | Log services |
| ClearBlocklistCommand | Manual | BlocklistService |
| ResetApiKeyCommand / ResetQualityDefinitionsCommand | Manual | Config services |
| ShutdownCommand / RestartCommand | Manual | LifecycleService |
| CheckForFinishedDownloadCommand | **Deprecated** 3rd-party | DownloadMonitoringService (logs warning) |
| TestCommand / UnknownCommand | Internal | Fallback executors |

---

## Event handlers that queue commands

| Handler | Event(s) | Command | Freq |
|---------|----------|---------|------|
| DownloadMonitoringService | EpisodeGrabbed, EpisodeImported, ManualInteractionRequired | RefreshMonitoredDownloads (5s debounce) | **HIGH** |
| SeriesAddedHandler | SeriesAdded, SeriesImported | RefreshSeriesCommand | MEDIUM |
| SeriesScannedHandler | SeriesScanned, SeriesScanSkipped | Search commands | MEDIUM |
| EpisodeAddedService | EpisodeInfoRefreshed | EpisodeSearchCommand | MEDIUM |
| RedownloadFailedDownloadService | DownloadFailedEvent | Episode/Season search | MEDIUM |
| ImportListUpdatedHandler | ProviderUpdated IImportList | ImportListSyncCommand | LOW |
| ImportApprovedEpisodes | post-import | RescanSeriesCommand | MEDIUM |
| Scheduler | ApplicationStarted | All pending tasks | Periodic |

---

## Event handlers (no command queue) — by frequency

### HIGH (during active downloads / sync)

| Handler | Event(s) | Purpose |
|---------|----------|---------|
| **HealthCheckService** | **IHandleAsync<IEvent> (all events)** | Debounced 5s health re-checks |
| DownloadEventHub | Download failed/complete/remove | Client item management |
| NotificationService | 10+ download/series events | Notifications |
| HistoryService | Grab/import/fail/delete/rename | History records |
| DownloadHistoryService | Download lifecycle | Download history |
| PendingReleaseService | RssSyncComplete, EpisodeGrabbed, SeriesDeleted | Pending release management |
| **QueueService** | TrackedDownloadRefreshedEvent | **Rebuilds UI queue (~1 min)** |
| DownloadMonitoringService | DownloadsProcessed, TrackedDownloadsRemoved | Re-publishes refresh events |

### MEDIUM

| Handler | Event(s) | Purpose |
|---------|----------|---------|
| TrackedDownloadService | EpisodeInfoRefreshed, Series add/delete | Tracked download state |
| BlocklistService | DownloadFailedEvent | Auto-blocklist |
| UpdateEpisodeFileService | SeriesScannedEvent | File records |
| UpdateMediaInfoService | SeriesScannedEvent | Media info |
| ExtraService | Series scan/rename events | Extras management |
| EpisodeService | File add/delete, series delete | Episode state |

### LOW / once

TaskManager, SeedConfigProvider, QualityProfileService, LocalizationService, ReconfigureLogging/Sentry, ProviderFactory, UserService — startup/config lifecycle

---

## Key code paths (most frequent)

### A. Download monitoring loop (~every 1 min + events)

```
Scheduler (30s poll)
  → TaskManager.GetPending() [RefreshMonitoredDownloads due]
  → CommandQueueManager.Push(RefreshMonitoredDownloadsCommand, High)
  → DownloadMonitoringService.Execute()
      → foreach downloadClient: GetItems() [sequential, blocking]
      → TrackDownload per item [history DB queries]
      → TrackedDownloadService.UpdateTrackable()
      → Publish TrackedDownloadRefreshedEvent
          → QueueService.Handle() [full rebuild + SiteRip N+1]
          → QueueStatusController debounced broadcast
      → Push ProcessMonitoredDownloadsCommand
  → DownloadProcessingService.Execute()
      → SiteRipImportService.ProcessActiveDownloads() [qBittorrent poll]
      → Import completed / process failures
      → Publish DownloadsProcessedEvent
```

**Files:**
- `src/NzbDrone.Core/Download/TrackedDownloads/DownloadMonitoringService.cs`
- `src/NzbDrone.Core/Download/DownloadProcessingService.cs`
- `src/NzbDrone.Core/Queue/QueueService.cs`

### B. RSS sync (~every 15 min)

```
Scheduler → RssSyncCommand
  → RssSyncService.Execute()
      → FetchAndParseRss.Fetch() [all indexers]
      → PendingReleaseService.GetPending()
      → MakeDownloadDecision.GetRssDecision()
      → ProcessDownloadDecisions.ProcessDecisions()
      → Publish RssSyncCompleteEvent
          → PendingReleaseService.Handle()
```

**File:** `src/NzbDrone.Core/Indexers/RssSyncService.cs`

### C. Series refresh (12h + on add)

```
Scheduler → RefreshSeriesCommand (all series)
  OR SeriesAddedHandler → single series
  → RefreshSeriesService.Execute()
      → Metadata fetch, episode refresh, disk scan
      → Publish SeriesScannedEvent / EpisodeInfoRefreshedEvent
          → SeriesScannedHandler → search commands
          → EpisodeAddedService → cache/search
```

### D. Import list sync (5 min)

```
Scheduler → ImportListSyncCommand
  → ImportListSyncService.SyncAll()
      → FetchAndParseImportList.Fetch()
      → ProcessListItems() [O(n) lookups per item]
          → AddSeriesService → SeriesImportedEvent → RefreshSeriesCommand
```

### E. Housekeeping (daily)

```
Scheduler → HousekeepingCommand
  → 27 IHousekeepingTask implementations
  → MainDatabase.Vacuum()
```

Housekeepers in `src/NzbDrone.Core/Housekeeping/Housekeepers/`

---

## Effective frequency ranking

| Rank | Task | Effective frequency |
|------|------|---------------------|
| 1 | RefreshMonitoredDownloads + ProcessMonitoredDownloads | Every **1 min** + grab/import events |
| 2 | HealthCheckService event debouncer | On **most domain events** (5s debounce) |
| 3 | RssSyncCommand | Default every **15 min** |
| 4 | MessagingCleanup + ImportListSync | Every **5 min** |
| 5 | TrackedDownloadRefreshed → QueueService | ~Every 1 min + download events |
| 6 | RefreshSeriesCommand (all) | Every **12 hours** |
| 7 | CheckHealth + UpdateCheck | Every **6 hours** |
| 8 | Housekeeping + RecycleBin + Backup | 24h / 7d |

---

## Command queue behavior notes

- **Deduplication:** identical command body won't re-queue if already queued/started
- **Concurrency:** RequiresDiskAccess blocks other disk commands; IsLongRunning blocks exclusive; IsExclusive blocks all
- **MessagingCleanup:** trims finished commands every 5 min
