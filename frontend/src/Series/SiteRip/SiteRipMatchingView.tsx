import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { kinds } from 'Helpers/Props';
import {
  ASCENDING,
  DESCENDING,
  SortDirection,
} from 'Helpers/Props/sortDirections';
import { fetchEpisodeFiles } from 'Store/Actions/episodeFileActions';
import {
  fetchMoreSeriesDetailsUnifiedGrid,
  fetchSeriesDetailsUnifiedGrid,
} from 'Store/Actions/seriesDetailsActions';
import {
  setSiteRipEpisode,
  setSiteRipSelection,
  startSiteRipMatching,
} from 'Store/Actions/siteRipActions';
import { CheckInputChanged } from 'typings/inputs';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import { getEpisodeDownloadedSummary } from './getEpisodeDownloadedSummary';
import {
  matchesSiteRipFileFilter,
  SiteRipFileMatchFilter,
} from './siteRipFileMatchFilter';
import SiteRipMatchingFileList, {
  SiteRipFileListItem,
  SiteRipFileSortKey,
} from './SiteRipMatchingFileList';
import SiteRipSceneDetails from './SiteRipSceneDetails';
import SiteRipScenePicker from './SiteRipScenePicker';
import { useSiteRipSeriesEpisodes } from './useSiteRipSeriesEpisodes';
import styles from './SiteRipMatchingView.css';

interface SiteRipMatchingViewProps {
  seriesId: number;
}

function SiteRipMatchingView(props: SiteRipMatchingViewProps) {
  const { seriesId } = props;
  const dispatch = useDispatch();

  const [filter, setFilter] = useState('');
  const [matchFilter, setMatchFilter] = useState<SiteRipFileMatchFilter>('');
  const [sortKey, setSortKey] = useState<SiteRipFileSortKey>('displayName');
  const [sortDirection, setSortDirection] = useState<SortDirection>(ASCENDING);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  const [episodeFilterYear, setEpisodeFilterYear] = useState('');
  const [episodeFilterTitle, setEpisodeFilterTitle] = useState('');
  const [episodeFilterPerformer, setEpisodeFilterPerformer] = useState('');

  const {
    selectedRelease,
    filesError,
    matches,
    isMatching,
    isFilesFetching,
    matchError,
    matchId,
    matchStatusMessage,
    matchPhase,
    matchCompletedFiles,
    matchTotalFiles,
    selections,
  } = useSelector((state: AppState) => state.siteRip);

  const {
    episodes: seriesEpisodes,
    isFullyLoaded: isSeriesEpisodesFullyLoaded,
    isLoading: isSeriesEpisodesLoading,
    usesUnifiedGrid,
    loadedCount: seriesEpisodesLoadedCount,
    totalCount: seriesEpisodesTotalCount,
    loadError: seriesEpisodesLoadError,
  } = useSiteRipSeriesEpisodes(seriesId);
  const unifiedGrid = useSelector(
    (state: AppState) => state.seriesDetails.unifiedGrid
  );
  const episodeFiles = useSelector(
    (state: AppState) => state.episodeFiles.items
  );
  const isEpisodeFilesPopulated = useSelector(
    (state: AppState) => state.episodeFiles.isPopulated
  );

  const episodeMap = useMemo(() => {
    return seriesEpisodes.reduce<
      Record<number, (typeof seriesEpisodes)[number]>
    >((acc, episode) => {
      acc[episode.id] = episode;
      return acc;
    }, {});
  }, [seriesEpisodes]);

  useEffect(() => {
    if (
      !usesUnifiedGrid ||
      isSeriesEpisodesFullyLoaded ||
      seriesEpisodesLoadError
    ) {
      return;
    }

    if (!unifiedGrid.isPopulated && !unifiedGrid.isFetching) {
      dispatch(fetchSeriesDetailsUnifiedGrid({ seriesId }));
      return;
    }

    if (!unifiedGrid.isFetching) {
      dispatch(fetchMoreSeriesDetailsUnifiedGrid({ seriesId }));
    }
  }, [
    dispatch,
    usesUnifiedGrid,
    isSeriesEpisodesFullyLoaded,
    seriesEpisodesLoadError,
    seriesId,
    unifiedGrid.isPopulated,
    unifiedGrid.isFetching,
    unifiedGrid.items.length,
    unifiedGrid.page,
  ]);

  useEffect(() => {
    if (!isEpisodeFilesPopulated) {
      dispatch(fetchEpisodeFiles({ seriesId }));
    }
  }, [dispatch, isEpisodeFilesPopulated, seriesId]);

  useEffect(() => {
    if (selectedRelease) {
      dispatch(
        startSiteRipMatching({
          guid: selectedRelease.guid,
          indexerId: selectedRelease.indexerId,
          seriesId,
        })
      );
    }
  }, [dispatch, selectedRelease, seriesId]);

  useEffect(() => {
    if (!matches.length) {
      setActiveFileIndex(null);
      return;
    }

    if (activeFileIndex != null && activeFileIndex < matches.length) {
      return;
    }

    const preferredIndex = matches.findIndex(
      (match) => match.matchedEpisodeId != null
    );
    setActiveFileIndex(preferredIndex >= 0 ? preferredIndex : 0);
  }, [matches, activeFileIndex]);

  const getSortValue = useCallback(
    (item: SiteRipFileListItem, key: SiteRipFileSortKey) => {
      const selection = selections[item.index];
      const episode = selection?.episodeId
        ? episodeMap[selection.episodeId]
        : undefined;
      const downloadedSummary = getEpisodeDownloadedSummary(
        episode,
        episodeFiles
      );

      switch (key) {
        case 'totalSize':
          return item.match.totalSize;
        case 'monitored':
          if (!episode) {
            return -1;
          }

          return episode.monitored ? 1 : 0;
        case 'downloaded':
          return downloadedSummary?.totalSize ?? 0;
        case 'displayName':
        default:
          return item.match.displayName.toLowerCase();
      }
    },
    [selections, episodeMap, episodeFiles]
  );

  const filteredAndSortedItems = useMemo(() => {
    const normalizedFilter = filter.toLowerCase();

    const items = matches
      .map((match, index): SiteRipFileListItem => ({ match, index }))
      .filter(({ match }) => {
        if (!normalizedFilter) {
          return true;
        }

        return (
          match.displayName.toLowerCase().includes(normalizedFilter) ||
          match.filePaths.some((path) =>
            path.toLowerCase().includes(normalizedFilter)
          )
        );
      })
      .filter((item) =>
        matchesSiteRipFileFilter(
          item,
          matchFilter,
          selections,
          episodeMap,
          episodeFiles
        )
      );

    return items.sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);
      const direction = sortDirection === ASCENDING ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }

      return ((aValue as number) - (bValue as number)) * direction;
    });
  }, [
    matches,
    filter,
    matchFilter,
    sortKey,
    sortDirection,
    getSortValue,
    selections,
    episodeMap,
    episodeFiles,
  ]);

  const onFilterChange = useCallback((value: string) => {
    setFilter(value);
  }, []);

  const onMatchFilterChange = useCallback((value: SiteRipFileMatchFilter) => {
    setMatchFilter(value);
  }, []);

  const onSortPress = useCallback(
    (name: string, nextSortDirection?: string) => {
      const nextSortKey = name as SiteRipFileSortKey;

      if (nextSortDirection) {
        setSortKey(nextSortKey);
        setSortDirection(nextSortDirection as SortDirection);
        return;
      }

      if (sortKey === nextSortKey) {
        setSortDirection((current) =>
          current === ASCENDING ? DESCENDING : ASCENDING
        );
        return;
      }

      setSortKey(nextSortKey);
      setSortDirection(ASCENDING);
    },
    [sortKey]
  );

  const onSelectAllChange = useCallback(
    (change: CheckInputChanged) => {
      filteredAndSortedItems.forEach(({ index }) => {
        dispatch(setSiteRipSelection({ index, selected: change.value }));
      });
    },
    [dispatch, filteredAndSortedItems]
  );

  const onRowPress = useCallback((index: number) => {
    setActiveFileIndex(index);
  }, []);

  const onSelectionChange = useCallback(
    (index: number, selected: boolean) => {
      dispatch(setSiteRipSelection({ index, selected }));
    },
    [dispatch]
  );

  const onEpisodeSelect = useCallback(
    (episodeId: number) => {
      if (activeFileIndex == null) {
        return;
      }

      dispatch(setSiteRipEpisode({ index: activeFileIndex, episodeId }));
    },
    [activeFileIndex, dispatch]
  );

  const activeEpisodeId =
    activeFileIndex == null
      ? undefined
      : selections[activeFileIndex]?.episodeId;

  const filesErrorMessage =
    typeof filesError === 'string'
      ? filesError
      : getErrorMessage(filesError as never);
  const matchErrorMessage =
    typeof matchError === 'string'
      ? matchError
      : getErrorMessage(matchError as never);
  const isMatchLoading = isMatching || isFilesFetching || !!matchId;
  const isScenesLoading = usesUnifiedGrid && isSeriesEpisodesLoading;
  const isLoading = isMatchLoading || isScenesLoading;
  const showMatchProgressBar = matchPhase === 'matching' && matchTotalFiles > 0;
  const showScenesProgressBar = isScenesLoading && seriesEpisodesTotalCount > 0;
  const matchProgressPercent = showMatchProgressBar
    ? Math.round((matchCompletedFiles / matchTotalFiles) * 100)
    : 0;
  const scenesProgressPercent = showScenesProgressBar
    ? Math.round((seriesEpisodesLoadedCount / seriesEpisodesTotalCount) * 100)
    : 0;
  const seriesEpisodesLoadErrorMessage = seriesEpisodesLoadError
    ? getErrorMessage(seriesEpisodesLoadError as never)
    : null;

  const getMatchPhaseLabel = () => {
    switch (matchPhase) {
      case 'starting':
        return translate('SiteRipMatchingScenes');
      case 'fetching_metadata':
        return translate('SiteRipDownloadingTorrentMetadata');
      case 'parsing_files':
        return translate('SiteRipParsingFiles');
      case 'matching':
        return translate('SiteRipMatchingScenes');
      case 'completed':
        return translate('SiteRipMatchingComplete');
      default:
        return translate('SiteRipMatchingScenes');
    }
  };

  const getLoadingMessage = () => {
    if (isMatchLoading) {
      return matchStatusMessage || getMatchPhaseLabel();
    }

    if (isScenesLoading) {
      if (seriesEpisodesTotalCount > 0) {
        return translate('SiteRipLoadingScenesProgress', {
          loaded: seriesEpisodesLoadedCount,
          total: seriesEpisodesTotalCount,
        });
      }

      return translate('SiteRipLoadingScenes');
    }

    return '';
  };

  return (
    <div className={styles.matchingView}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <LoadingIndicator />
          <div className={styles.statusMessage}>{getLoadingMessage()}</div>
          {showMatchProgressBar ? (
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${matchProgressPercent}%` }}
              />
            </div>
          ) : null}
          {showScenesProgressBar ? (
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${scenesProgressPercent}%` }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {filesErrorMessage ? (
        <Alert kind={kinds.DANGER}>{filesErrorMessage}</Alert>
      ) : null}

      {matchErrorMessage ? (
        <Alert kind={kinds.DANGER}>{matchErrorMessage}</Alert>
      ) : null}

      {seriesEpisodesLoadErrorMessage ? (
        <Alert kind={kinds.DANGER}>{seriesEpisodesLoadErrorMessage}</Alert>
      ) : null}

      {!isLoading && matches.length ? (
        <div className={styles.splitPane}>
          <SiteRipMatchingFileList
            items={filteredAndSortedItems}
            selections={selections}
            episodes={seriesEpisodes}
            episodeFiles={episodeFiles}
            filter={filter}
            matchFilter={matchFilter}
            sortKey={sortKey}
            sortDirection={sortDirection}
            activeFileIndex={activeFileIndex}
            onFilterChange={onFilterChange}
            onMatchFilterChange={onMatchFilterChange}
            onSortPress={onSortPress}
            onSelectAllChange={onSelectAllChange}
            onRowPress={onRowPress}
            onSelectionChange={onSelectionChange}
          />

          <div className={styles.rightPane}>
            <SiteRipScenePicker
              seriesId={seriesId}
              activeFileIndex={activeFileIndex}
              selectedEpisodeId={activeEpisodeId}
              episodeFilterYear={episodeFilterYear}
              episodeFilterTitle={episodeFilterTitle}
              episodeFilterPerformer={episodeFilterPerformer}
              onEpisodeFilterYearChange={setEpisodeFilterYear}
              onEpisodeFilterTitleChange={setEpisodeFilterTitle}
              onEpisodeFilterPerformerChange={setEpisodeFilterPerformer}
              onEpisodeSelect={onEpisodeSelect}
            />

            <SiteRipSceneDetails
              seriesId={seriesId}
              episodeId={activeEpisodeId}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default SiteRipMatchingView;
