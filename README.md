# Whisparr v2: vibe-coded ✨ fork

## What

This is a fork of [Whisparr v2](https://github.com/Whisparr/Whisparr/tree/v2) with vibe-coded enhancements and docker build support via [hotio/whisparr](https://github.com/hotio/whisparr).

### Enhancements:

#### **SiteRip matching**

Search indexers and grab site-rip torrents from a studio page

- Inspect torrent file lists before download
- Auto-match files to scenes
- Selective grab via qBittorrent
- Matching modal with progress UI and file/scene filters
- Cached search results when navigating back

#### **Thumbnail view**

Screenshot-based episode browsing on studio details

- Unified all-seasons grid (removes year-based categorization on studio)
  - **requires TPDB api key setup in Settings -> Metadata Source**
- Runtime filter



#### **Scene modal**

Richer episode/scene details in the details modal

- Expanded scene metadata
- Layout improvements



#### **Interactive search**

Improved release search from episode and series pages

- Custom search query input
- Episode status filter
- Live search progress
- Quality filter



#### **Stash sync**

When stash is added as a Connect client

- Trigger sync to:
  - search and import monitored but not yet tracked Whisparr scenes from stash
  - Trigger stash scan for Whisparr downloaded scenes not yet scanned by stash.



#### **Split import**

Import multi-part scene files as separate episodes

#### **Import fixes**

Various import and matching improvements

- Handle unexpected downloaded filenames
- Serialized studio search
- Skip date-based scene search/matching
- Assorted import and queue bugfixes



#### **Indexer setting**

Option to disable indexer blocking/backoff

#### **Docker**

Container build and deployment support

- Dockerfile and s6-overlay config
- Build scripts



## Build steps

Refer to [Dockerfile (all platforms)](./Dockerfile) and [docker build script (Windows)](./scripts/docker-build.ps1).

The docker file builds both FE and BE bundles.

## Running (Windows)



### Build docker image

- `./scripts/docker-build.ps1`
- Exports to local docker with name `whisparr:local`



### [Optional] Export image for deploy

- Export built image using `docker save whisparr:local -o <full_file_path_for_export.tar>
- Move tar to target machine/NAS with docker
- Import using `docker load -i <full_copied_image_path.tar>`
- Deploy on remote via docker.



## Why

I would love to switch to Whisparr v3 ([eros](https://github.com/Whisparr/Whisparr/tree/eros)), but seems like it doesn't integrate with TPDB at the moment with only StashDB support.

I could attempt adding TPDB support to v3 using AI but It'll be a significant refactor per [#547](https://github.com/Whisparr/Whisparr/issues/547), and might be super janky/full of bugs if not designed properly.

## How

Changes are mostly AI generated using Cursor. Guided & tested by human.