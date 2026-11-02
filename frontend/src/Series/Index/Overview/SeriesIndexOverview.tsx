import Box from '@mui/material/Box';
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextTruncate from 'react-text-truncate';
import { REFRESH_SERIES, SERIES_SEARCH } from 'Commands/commandNames';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import TagListConnector from 'Components/TagListConnector';
import { icons } from 'Helpers/Props';
import DeleteSeriesModal from 'Series/Delete/DeleteSeriesModal';
import EditSeriesModalConnector from 'Series/Edit/EditSeriesModalConnector';
import SeriesIndexProgressBar from 'Series/Index/ProgressBar/SeriesIndexProgressBar';
import SeriesIndexPosterSelect from 'Series/Index/Select/SeriesIndexPosterSelect';
import { Statistics } from 'Series/Series';
import SeriesPoster from 'Series/SeriesPoster';
import { executeCommand } from 'Store/Actions/commandActions';
import translate from 'Utilities/String/translate';
import createSeriesIndexItemSelector from '../createSeriesIndexItemSelector';
import selectOverviewOptions from './selectOverviewOptions';
import SeriesIndexOverviewInfo from './SeriesIndexOverviewInfo';

function statusCornerSx(color: 'error.main' | 'grey.500') {
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    width: 0,
    height: 0,
    borderWidth: '0 25px 25px 0',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRightColor: color,
    color: 'common.white',
  };
}

const columnPadding = parseInt('10px');
const columnPaddingSmallScreen = parseInt(
  '5px'
);
const defaultFontSize = parseInt('14px');
const lineHeight = parseFloat('1.528571429');

// Hardcoded height based on line-height of 32 + bottom margin of 10.
// Less side-effecty than using react-measure.
const TITLE_HEIGHT = 42;

interface SeriesIndexOverviewProps {
  seriesId: number;
  sortKey: string;
  posterWidth: number;
  posterHeight: number;
  rowHeight: number;
  isSelectMode: boolean;
  isSmallScreen: boolean;
}

function SeriesIndexOverview(props: SeriesIndexOverviewProps) {
  const {
    seriesId,
    sortKey,
    posterWidth,
    posterHeight,
    rowHeight,
    isSelectMode,
    isSmallScreen,
  } = props;

  const { series, qualityProfile, isRefreshingSeries, isSearchingSeries } =
    useSelector(createSeriesIndexItemSelector(props.seriesId));

  const overviewOptions = useSelector(selectOverviewOptions);

  const {
    title,
    monitored,
    status,
    path,
    titleSlug,
    nextAiring,
    previousAiring,
    added,
    overview,
    statistics = {} as Statistics,
    images,
    tags,
    network,
  } = series;

  const {
    seasonCount = 0,
    episodeCount = 0,
    episodeFileCount = 0,
    totalEpisodeCount = 0,
    sizeOnDisk = 0,
  } = statistics;

  const dispatch = useDispatch();
  const [isEditSeriesModalOpen, setIsEditSeriesModalOpen] = useState(false);
  const [isDeleteSeriesModalOpen, setIsDeleteSeriesModalOpen] = useState(false);

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

  const link = `/site/${titleSlug}`;

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
  };

  const contentHeight = useMemo(() => {
    const padding = isSmallScreen ? columnPaddingSmallScreen : columnPadding;

    return rowHeight - padding;
  }, [rowHeight, isSmallScreen]);

  const overviewHeight = contentHeight - TITLE_HEIGHT;

  return (
    <div>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'relative' }}>
            {isSelectMode ? (
              <SeriesIndexPosterSelect seriesId={seriesId} />
            ) : null}

            {status === 'ended' ? (
              <Box
                sx={statusCornerSx('error.main')}
                title={translate('Ended')}
              />
            ) : null}

            {status === 'deleted' ? (
              <Box
                sx={statusCornerSx('grey.500')}
                title={translate('Deleted')}
              />
            ) : null}

            <Link
              style={elementStyle}
              to={link}
              sx={{
                display: 'block',
                color: 'text.primary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'text.primary',
                  textDecoration: 'none',
                },
              }}
            >
              <SeriesPoster
                style={elementStyle}
                images={images}
                size={250}
                lazy={false}
                overflow={true}
              />
            </Link>
          </Box>

          <SeriesIndexProgressBar
            seriesId={seriesId}
            monitored={monitored}
            status={status}
            episodeCount={episodeCount}
            episodeFileCount={episodeFileCount}
            totalEpisodeCount={totalEpisodeCount}
            width={posterWidth}
            detailedProgressBar={overviewOptions.detailedProgressBar}
            isStandalone={false}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flex: '1 0 1px',
            flexDirection: 'column',
            overflow: 'hidden',
            pl: '10px',
          }}
          style={{ maxHeight: contentHeight }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flex: '0 0 auto',
              mb: '10px',
              lineHeight: '32px',
            }}
          >
            <Link
              to={link}
              sx={{
                overflow: 'hidden',
                maxWidth: '100%',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: '1 0 1px',
                fontWeight: 300,
                fontSize: 30,
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': { color: 'inherit', textDecoration: 'none' },
              }}
            >
              {title}
            </Link>

            <Box sx={{ whiteSpace: 'nowrap' }}>
              <SpinnerIconButton
                name={icons.REFRESH}
                title={translate('RefreshSite')}
                isSpinning={isRefreshingSeries}
                onPress={onRefreshPress}
              />

              {overviewOptions.showSearchAction ? (
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
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flex: '1 0 auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                flex: '0 1 1000px',
                flexDirection: 'column',
              }}
            >
              <Link
                to={link}
                sx={{
                  overflow: 'hidden',
                  minHeight: 0,
                  display: { xs: 'none', md: 'block' },
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:hover': { color: 'inherit', textDecoration: 'none' },
                }}
              >
                <TextTruncate
                  line={Math.floor(
                    overviewHeight / (defaultFontSize * lineHeight)
                  )}
                  text={overview}
                />
              </Link>

              {overviewOptions.showTags ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    overflow: 'hidden',
                  }}
                >
                  <TagListConnector tags={tags} />
                </Box>
              ) : null}
            </Box>
            <SeriesIndexOverviewInfo
              height={overviewHeight}
              monitored={monitored}
              network={network}
              nextAiring={nextAiring}
              previousAiring={previousAiring}
              added={added}
              seasonCount={seasonCount}
              qualityProfile={qualityProfile}
              sizeOnDisk={sizeOnDisk}
              path={path}
              sortKey={sortKey}
              {...overviewOptions}
            />
          </Box>
        </Box>
      </Box>

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
    </div>
  );
}

export default SeriesIndexOverview;
