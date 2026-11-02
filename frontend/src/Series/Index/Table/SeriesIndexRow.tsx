import Box from '@mui/material/Box';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSelect } from 'App/SelectContext';
import { REFRESH_SERIES, SERIES_SEARCH } from 'Commands/commandNames';
import CheckInput from 'Components/Form/CheckInput';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import VirtualTableSelectCell from 'Components/Table/Cells/VirtualTableSelectCell';
import Column from 'Components/Table/Column';
import TagListConnector from 'Components/TagListConnector';
import { icons } from 'Helpers/Props';
import DeleteSeriesModal from 'Series/Delete/DeleteSeriesModal';
import EditSeriesModalConnector from 'Series/Edit/EditSeriesModalConnector';
import createSeriesIndexItemSelector from 'Series/Index/createSeriesIndexItemSelector';
import { Statistics } from 'Series/Series';
import SeriesBanner from 'Series/SeriesBanner';
import SeriesTitleLink from 'Series/SeriesTitleLink';
import { executeCommand } from 'Store/Actions/commandActions';
import { SelectStateInputProps } from 'typings/props';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import SeriesIndexProgressBar from '../ProgressBar/SeriesIndexProgressBar';
import hasGrowableColumns from './hasGrowableColumns';
import SeasonsCell from './SeasonsCell';
import selectTableOptions from './selectTableOptions';
import SeriesStatusCell from './SeriesStatusCell';

const rowCellBase = {
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flexGrow: 0,
  flexShrink: 1,
  minWidth: 0,
};

const rowColumnFlex: Record<string, Record<string, unknown>> = {
  status: { flex: '0 0 60px' },
  sortTitle: { flex: '4 0 110px' },
  network: { flex: '2 0 90px' },
  originalLanguage: { flex: '1 0 125px' },
  qualityProfileId: { flex: '1 0 125px' },
  releaseGroups: { flex: '0 0 180px' },
  nextAiring: { flex: '0 0 180px' },
  previousAiring: { flex: '0 0 180px' },
  added: { flex: '0 0 180px' },
  genres: { flex: '0 0 180px' },
  seasonCount: { flex: '0 0 100px' },
  certification: { flex: '0 0 100px' },
  seasonFolder: { width: 150 },
  episodeProgress: {
    justifyContent: 'center',
    flex: '0 0 150px',
    flexDirection: 'column',
  },
  latestSeason: {
    justifyContent: 'center',
    flex: '0 0 150px',
    flexDirection: 'column',
  },
  episodeCount: { flex: '0 0 130px' },
  year: { flex: '0 0 80px' },
  path: { flex: '1 0 150px' },
  sizeOnDisk: { flex: '0 0 120px' },
  tags: { flex: '1 0 60px' },
  useSceneNumbering: { flex: '0 0 145px' },
  actions: { flex: '0 1 90px', minWidth: 60 },
};

function rowCellSx(name: string, extra?: Record<string, unknown>) {
  return {
    ...rowCellBase,
    ...rowColumnFlex[name],
    ...extra,
  };
}

function dateCell(name: string) {
  return function DateCell({
    className,
    children,
  }: {
    className?: string;
    children?: React.ReactNode;
  }) {
    return (
      <Box className={className} sx={rowCellSx(name)}>
        {children}
      </Box>
    );
  };
}

const NextAiringCell = dateCell('nextAiring');
const PreviousAiringCell = dateCell('previousAiring');
const AddedCell = dateCell('added');

interface SeriesIndexRowProps {
  seriesId: number;
  sortKey: string;
  columns: Column[];
  isSelectMode: boolean;
}

function SeriesIndexRow(props: SeriesIndexRowProps) {
  const { seriesId, columns, isSelectMode } = props;

  const {
    series,
    qualityProfile,
    latestSeason,
    isRefreshingSeries,
    isSearchingSeries,
  } = useSelector(createSeriesIndexItemSelector(props.seriesId));

  const { showBanners, showSearchAction } = useSelector(selectTableOptions);

  const {
    title,
    monitored,
    status,
    path,
    titleSlug,
    nextAiring,
    previousAiring,
    added,
    statistics = {} as Statistics,
    seasonFolder,
    images,
    network,
    originalLanguage,
    certification,
    year,
    useSceneNumbering,
    genres = [],
    seasons = [],
    tags = [],
    isSaving = false,
  } = series;

  const {
    seasonCount = 0,
    episodeCount = 0,
    episodeFileCount = 0,
    totalEpisodeCount = 0,
    sizeOnDisk = 0,
    releaseGroups = [],
  } = statistics;

  const dispatch = useDispatch();
  const [hasBannerError, setHasBannerError] = useState(false);
  const [isEditSeriesModalOpen, setIsEditSeriesModalOpen] = useState(false);
  const [isDeleteSeriesModalOpen, setIsDeleteSeriesModalOpen] = useState(false);
  const [selectState, selectDispatch] = useSelect();

  const onRefreshPress = useCallback(() => {
    dispatch(
      executeCommand({
        name: REFRESH_SERIES,
        seriesId,
      })
    );
  }, [seriesId, dispatch]);

  const onSearchPress = useCallback(() => {
    dispatch(
      executeCommand({
        name: SERIES_SEARCH,
        seriesId,
      })
    );
  }, [seriesId, dispatch]);

  const onBannerLoadError = useCallback(() => {
    setHasBannerError(true);
  }, [setHasBannerError]);

  const onBannerLoad = useCallback(() => {
    setHasBannerError(false);
  }, [setHasBannerError]);

  const onEditSeriesPress = useCallback(() => {
    setIsEditSeriesModalOpen(true);
  }, [setIsEditSeriesModalOpen]);

  const onEditSeriesModalClose = useCallback(() => {
    setIsEditSeriesModalOpen(false);
  }, [setIsEditSeriesModalOpen]);

  const onDeleteSeriesPress = useCallback(() => {
    setIsEditSeriesModalOpen(false);
    setIsDeleteSeriesModalOpen(true);
  }, [setIsDeleteSeriesModalOpen]);

  const onDeleteSeriesModalClose = useCallback(() => {
    setIsDeleteSeriesModalOpen(false);
  }, [setIsDeleteSeriesModalOpen]);

  const checkInputCallback = useCallback(() => {
    // Mock handler to satisfy `onChange` being required for `CheckInput`.
  }, []);

  const onSelectedChange = useCallback(
    ({ id, value, shiftKey }: SelectStateInputProps) => {
      selectDispatch({
        type: 'toggleSelected',
        id,
        isSelected: value,
        shiftKey,
      });
    },
    [selectDispatch]
  );

  return (
    <>
      {isSelectMode ? (
        <VirtualTableSelectCell
          id={seriesId}
          isSelected={selectState.selectedState[seriesId]}
          isDisabled={false}
          onSelectedChange={onSelectedChange}
        />
      ) : null}

      {columns.map((column) => {
        const { name, isVisible } = column;

        if (!isVisible) {
          return null;
        }

        if (name === 'status') {
          return (
            <SeriesStatusCell
              key={name}
              sx={rowCellSx(name)}
              seriesId={seriesId}
              monitored={monitored}
              status={status}
              isSelectMode={isSelectMode}
              isSaving={isSaving}
            />
          );
        }

        if (name === 'sortTitle') {
          return (
            <Box
              key={name}
              sx={rowCellSx(
                name,
                showBanners
                  ? {
                      flex: '0 0 379px',
                      ...(hasGrowableColumns(columns) ? {} : { flexGrow: 1 }),
                    }
                  : undefined
              )}
            >
              {showBanners ? (
                <Link
                  to={`/site/${titleSlug}`}
                  sx={{
                    position: 'relative',
                    display: 'block',
                    height: 70,
                    bgcolor: 'text.primary',
                  }}
                >
                  <SeriesBanner
                    images={images}
                    lazy={false}
                    overflow={true}
                    onError={onBannerLoadError}
                    onLoad={onBannerLoad}
                    style={{ width: 379, height: 70 }}
                  />

                  {hasBannerError && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: '5px',
                        width: '100%',
                        height: '100%',
                        color: 'common.white',
                        textAlign: 'center',
                        fontSize: 20,
                      }}
                    >
                      {title}
                    </Box>
                  )}
                </Link>
              ) : (
                <SeriesTitleLink titleSlug={titleSlug} title={title} />
              )}
            </Box>
          );
        }

        if (name === 'network') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              {network}
            </Box>
          );
        }

        if (name === 'originalLanguage') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              {originalLanguage.name}
            </Box>
          );
        }

        if (name === 'qualityProfileId') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              {qualityProfile?.name ?? ''}
            </Box>
          );
        }

        if (name === 'nextAiring') {
          return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ts(2739)
            <RelativeDateCell
              key={name}
              className=""
              date={nextAiring}
              component={NextAiringCell}
            />
          );
        }

        if (name === 'previousAiring') {
          return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ts(2739)
            <RelativeDateCell
              key={name}
              className=""
              date={previousAiring}
              component={PreviousAiringCell}
            />
          );
        }

        if (name === 'added') {
          return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ts(2739)
            <RelativeDateCell
              key={name}
              className=""
              date={added}
              component={AddedCell}
            />
          );
        }

        if (name === 'seasonCount') {
          return (
            <SeasonsCell
              key={name}
              sx={rowCellSx(name)}
              seriesId={seriesId}
              seasonCount={seasonCount}
              seasons={seasons}
              isSelectMode={isSelectMode}
            />
          );
        }

        if (name === 'seasonFolder') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              <CheckInput
                name="seasonFolder"
                value={seasonFolder}
                isDisabled={true}
                onChange={checkInputCallback}
              />
            </Box>
          );
        }

        if (name === 'episodeProgress') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              <SeriesIndexProgressBar
                seriesId={seriesId}
                monitored={monitored}
                status={status}
                episodeCount={episodeCount}
                episodeFileCount={episodeFileCount}
                totalEpisodeCount={totalEpisodeCount}
                width={125}
                detailedProgressBar={true}
                isStandalone={true}
              />
            </Box>
          );
        }

        if (name === 'latestSeason') {
          if (!latestSeason) {
            return <Box key={name} sx={rowCellSx(name)} />;
          }

          const {
            episodeCount: seasonEpisodeCount = 0,
            episodeFileCount: seasonEpisodeFileCount = 0,
            totalEpisodeCount: seasonTotalEpisodeCount = 0,
          } = latestSeason.statistics ?? {};

          return (
            <Box key={name} sx={rowCellSx(name)}>
              <SeriesIndexProgressBar
                seriesId={seriesId}
                seasonNumber={latestSeason.seasonNumber}
                monitored={monitored}
                status={status}
                episodeCount={seasonEpisodeCount}
                episodeFileCount={seasonEpisodeFileCount}
                totalEpisodeCount={seasonTotalEpisodeCount}
                width={125}
                detailedProgressBar={true}
                isStandalone={true}
              />
            </Box>
          );
        }

        if (name === 'episodeCount') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              {totalEpisodeCount}
            </Box>
          );
        }

        if (name === 'year') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              {year}
            </Box>
          );
        }

        if (name === 'path') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              {path}
            </Box>
          );
        }

        if (name === 'sizeOnDisk') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              {formatBytes(sizeOnDisk)}
            </Box>
          );
        }

        if (name === 'genres') {
          const joinedGenres = genres.join(', ');

          return (
            <Box key={name} sx={rowCellSx(name)}>
              <span title={joinedGenres}>{joinedGenres}</span>
            </Box>
          );
        }

        if (name === 'certification') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              {certification}
            </Box>
          );
        }

        if (name === 'releaseGroups') {
          const joinedReleaseGroups = releaseGroups.join(', ');
          const truncatedReleaseGroups =
            releaseGroups.length > 3
              ? `${releaseGroups.slice(0, 3).join(', ')}...`
              : joinedReleaseGroups;

          return (
            <Box key={name} sx={rowCellSx(name)}>
              <span title={joinedReleaseGroups}>{truncatedReleaseGroups}</span>
            </Box>
          );
        }

        if (name === 'tags') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              <TagListConnector tags={tags} />
            </Box>
          );
        }

        if (name === 'useSceneNumbering') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              <CheckInput
                name="useSceneNumbering"
                value={useSceneNumbering}
                isDisabled={true}
                onChange={checkInputCallback}
              />
            </Box>
          );
        }

        if (name === 'actions') {
          return (
            <Box key={name} sx={rowCellSx(name)}>
              <SpinnerIconButton
                name={icons.REFRESH}
                title={translate('RefreshSite')}
                isSpinning={isRefreshingSeries}
                onPress={onRefreshPress}
              />

              {showSearchAction ? (
                <SpinnerIconButton
                  name={icons.SEARCH}
                  title={translate('SearchForMonitoredEpisodes')}
                  isSpinning={isSearchingSeries}
                  onPress={onSearchPress}
                />
              ) : null}

              <IconButton
                name={icons.EDIT}
                title={translate('EditSite')}
                onPress={onEditSeriesPress}
              />
            </Box>
          );
        }

        return null;
      })}

      <EditSeriesModalConnector
        isOpen={isEditSeriesModalOpen}
        seriesId={seriesId}
        onModalClose={onEditSeriesModalClose}
        onDeleteSeriesPress={onDeleteSeriesPress}
      />

      <DeleteSeriesModal
        isOpen={isDeleteSeriesModalOpen}
        seriesId={seriesId}
        onModalClose={onDeleteSeriesModalClose}
      />
    </>
  );
}

export default SeriesIndexRow;
