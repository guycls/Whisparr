# Dead Code & Deprecation Catalog

**Last updated:** 2026-08-05

Items identified for potential removal. **Do not remove deprecated API stubs until confirming no external consumers** (see decision D2 in main plan).

---

## Confirmed dead / deprecated backend

### 1. LanguageProfileController + LanguageProfileSchemaController

| | |
|---|---|
| **Path** | `src/Whisparr.Api.V3/Profiles/Languages/LanguageProfileController.cs` |
| | `src/Whisparr.Api.V3/Profiles/Languages/LanguageProfileSchemaController.cs` |
| **Status** | `[Obsolete("Deprecated")]` — returns hardcoded "Deprecated" profile |
| **Frontend refs** | None found (frontend uses `/language`, not `/languageprofile`) |
| **Risk** | Low — but external *arr tools may still call |
| **Action** | Remove after deprecation period; add to `ApiInfoResource.Deprecated` first |

### 2. CheckForFinishedDownloadCommand

| | |
|---|---|
| **Path** | `src/NzbDrone.Core/Download/CheckForFinishedDownloadCommand.cs` |
| **Handler** | `DownloadMonitoringService.cs:163-166` — logs warning, calls `Refresh()` |
| **Frontend refs** | None |
| **Risk** | Low — 3rd-party apps may still send this command name |
| **Action** | Remove command class + handler after logging review confirms no usage |

### 3. ImportListExclusionController GET all (non-paged)

| | |
|---|---|
| **Path** | `src/Whisparr.Api.V3/ImportLists/ImportListExclusionController.cs:36-42` |
| **Status** | `[Obsolete("Deprecated")]` |
| **Frontend refs** | Uses `/importlistexclusion/paged` (`importListExclusions.js:76`) |
| **Risk** | Low |
| **Action** | Remove obsolete GET action |

### 4. EventAggregator commented debug block

| | |
|---|---|
| **Path** | `src/NzbDrone.Core/Messaging/Events/EventAggregator.cs:56-71` (approx) |
| **Status** | Commented thread-pool debug code |
| **Risk** | None |
| **Action** | Safe cleanup |

### 5. MediaCoverController fallback TODO

| | |
|---|---|
| **Path** | `src/Whisparr.Api.V3/MediaCovers/MediaCoverController.cs:36-37` |
| **Status** | Commented legacy resized-image fallback |
| **Duplicate** | Logic also in `MediaCoverMapper.cs` |
| **Action** | Consolidate serving paths; remove duplicate |

---

## Frontend → backend mismatches (potential dead frontend code)

### 6. GET /delayprofile/schema

| | |
|---|---|
| **Frontend** | `frontend/src/Store/Actions/Settings/delayProfiles.js:66` |
| **Backend** | **No endpoint exists** |
| **Status** | Likely dead frontend call or never-implemented feature |
| **Action** | Investigate (open question Q2): implement schema endpoint or remove fetch handler |

---

## Stub / placeholder code (keep for now)

| Item | Path | Notes |
|------|------|-------|
| UnknownCommand | `NzbDrone.Core/Messaging/Commands/UnknownCommand.cs` | Fallback for deserialized unknown commands — required |
| LanguageProfileResource | `Whisparr.Api.V3/Profiles/Languages/LanguageProfileResource.cs` | Used by deprecated controllers |
| ApiInfoResource.Deprecated | `Whisparr.Http/ApiInfoResource.cs` | Empty list — should list deprecated endpoints when removing |

---

## Related resource files (not dead, but low traffic)

| Item | Notes |
|------|-------|
| `GET /api/v3/system/routes` | Debug-only route graph |
| `GET /feed/v3/calendar/Whisparr.ics` | External calendar subscription |
| `POST /api/v3/release/push` | Webhook integration |
| ParseController | Developer tool only |
| AutoTaggingController | Low usage settings feature |

---

## Removal checklist

When removing deprecated items:

1. [ ] Search GitHub/issues for external references
2. [ ] Add endpoint to `ApiInfoResource.Deprecated` for one release cycle
3. [ ] Remove controller/handler code
4. [ ] Remove associated tests
5. [ ] Remove frontend calls if any
6. [ ] Update API catalog resource file

---

## Estimated LOC savings

| Item | Est. lines |
|------|------------|
| LanguageProfile controllers + resources | ~120 |
| CheckForFinishedDownload command + handler | ~15 |
| ImportListExclusion obsolete GET | ~10 |
| EventAggregator comments | ~15 |
| **Total** | ~160 |

Small but reduces maintenance surface and confusion for future agents.
