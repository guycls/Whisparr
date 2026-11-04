import Box from '@mui/material/Box';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sceneMetadataBackground } from 'App/createAppTheme';
import AppState from 'App/State/AppState';
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
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import formatDateTime from 'Utilities/Date/formatDateTime';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import translate from 'Utilities/String/translate';
import createSeriesIndexItemSelector from '../createSeriesIndexItemSelector';
import { loadLogoGradient, logoCoverUrl } from './logoGradient';
import selectPosterOptions from './selectPosterOptions';
import SeriesIndexPosterInfo from './SeriesIndexPosterInfo';

const posterMetaSx = {
  bgcolor: 'background.paper',
  textAlign: 'center',
  fontSize: 12,
  overflow: 'hidden',
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const posterTitleSx = {
  ...posterMetaSx,
  display: '-webkit-box',
  whiteSpace: 'normal',
  textOverflow: 'unset',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: 1.3,
  minHeight: '2.6em',
  px: '4px',
  wordBreak: 'break-word',
};

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
  };
}

interface SeriesIndexPosterProps {
  seriesId: number;
  sortKey: string;
  isSelectMode: boolean;
  posterWidth: number;
  posterHeight: number;
}

function SeriesIndexPoster(props: SeriesIndexPosterProps) {
  const { seriesId, sortKey, isSelectMode, posterWidth, posterHeight } = props;

  const { series, qualityProfile, isRefreshingSeries, isSearchingSeries } =
    useSelector(createSeriesIndexItemSelector(props.seriesId));

  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const {
    detailedProgressBar,
    showTitle,
    showMonitored,
    showQualityProfile,
    showTags,
    showSearchAction,
  } = useSelector(selectPosterOptions);

  const { showRelativeDates, shortDateFormat, longDateFormat, timeFormat } =
    useSelector(createUISettingsSelector());

  const {
    title,
    monitored,
    status,
    path,
    titleSlug,
    originalLanguage,
    network,
    nextAiring,
    previousAiring,
    added,
    statistics = {} as Statistics,
    images,
    tags,
  } = series;

  const {
    seasonCount,
    episodeCount,
    episodeFileCount,
    totalEpisodeCount,
    sizeOnDisk,
  } = statistics;

  const dispatch = useDispatch();
  const [hasPosterError, setHasPosterError] = useState(false);
  const [logoGradient, setLogoGradient] = useState<{
    url: string;
    value: string;
  } | null>(null);
  const logoUrlRef = useRef<string | null>(null);

  const logoUrl = useMemo(() => {
    const logo = images?.find((image) => image.coverType === 'logo');

    return logo?.url ? logoCoverUrl(logo.url) : null;
  }, [images]);

  logoUrlRef.current = logoUrl;
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

  const onPosterLoadError = useCallback(() => {
    setHasPosterError(true);
  }, []);

  const onPosterLoad = useCallback(() => {
    setHasPosterError(false);

    const requested = logoUrlRef.current;

    if (!requested) {
      return;
    }

    loadLogoGradient(requested).then((gradient) => {
      if (!gradient || logoUrlRef.current !== requested) {
        return;
      }

      setLogoGradient({ url: requested, value: gradient });
    });
  }, []);

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
  const showLogoFallback = !logoUrl || hasPosterError;

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
    objectFit: 'contain' as const,
    paddingRight: '15px',
    paddingLeft: '5px',
  };

  return (
    <Box
      sx={{
        transition: 'all 200ms ease-in',
        p: { xs: '5px', md: 0 },
        '&:hover': {
          zIndex: 2,
          '& .poster-card': {
            boxShadow: (theme) => `0 0 12px ${theme.palette.common.black}`,
          },
          '& .poster-controls': {
            opacity: 1,
            transition: 'opacity 200ms linear 150ms',
          },
        },
      }}
    >
      <Box
        className="poster-card"
        sx={{
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'transparent',
          backgroundImage: 'none',
        }}
      >
      <Box sx={{ position: 'relative', overflow: 'hidden' }} title={title}>
        {isSelectMode ? <SeriesIndexPosterSelect seriesId={seriesId} /> : null}

        <Box
          className="poster-controls"
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            zIndex: 3,
            borderRadius: 1,
            bgcolor: 'rgba(0, 0, 0, 0.82)',
            color: 'common.white',
            fontSize: 12,
            opacity: 0,
            '& .MuiIconButton-root': {
              color: 'common.white',
            },
            '& .MuiIconButton-root:hover': {
              color: 'common.white',
              bgcolor: 'rgba(255, 255, 255, 0.16)',
            },
          }}
        >
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

        {status === 'ended' ? (
          <Box sx={statusCornerSx('error.main')} title={translate('Ended')} />
        ) : null}

        {status === 'deleted' ? (
          <Box sx={statusCornerSx('grey.500')} title={translate('Deleted')} />
        ) : null}

        <Link
          style={elementStyle}
          to={link}
          sx={(theme) => ({
            position: 'relative',
            display: 'block',
            height: 70,
            overflow: 'hidden',
            ...(showLogoFallback
              ? sceneMetadataBackground(theme)
              : { bgcolor: 'grey.800' }),
          })}
        >
          {logoGradient && logoGradient.url === logoUrl && !hasPosterError ? (
            <Box
              sx={{
                position: 'absolute',
                zIndex: 0,
                top: '-30%',
                right: '-30%',
                bottom: '-30%',
                left: '-30%',
                backgroundImage: logoGradient.value,
                filter: 'blur(22px)',
                pointerEvents: 'none',
              }}
            />
          ) : null}

          <SeriesPoster
            blur={safeForWorkMode}
            style={{
              ...elementStyle,
              position: 'relative',
              zIndex: 1,
              visibility: showLogoFallback ? 'hidden' : 'visible',
            }}
            images={images}
            size={250}
            lazy={false}
            overflow={true}
            onError={onPosterLoadError}
            onLoad={onPosterLoad}
          />

          {showLogoFallback ? (
            <Box
              sx={{
                position: 'absolute',
                zIndex: 2,
                top: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: '5px',
                width: '100%',
                height: '100%',
                px: '8px',
                overflow: 'hidden',
                bgcolor: 'transparent',
                color: 'text.primary',
                textAlign: 'center',
                fontSize: 16,
                lineHeight: 1.25,
                wordBreak: 'break-word',
              }}
            >
              {title}
            </Box>
          ) : null}
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
        detailedProgressBar={detailedProgressBar}
        isStandalone={false}
      />

      {showTitle ? (
        <Box sx={posterTitleSx} title={title}>
          {title}
        </Box>
      ) : null}

      {showMonitored || (showQualityProfile && qualityProfile?.name) ? (
        <Box sx={posterMetaSx}>
          {[
            showMonitored
              ? monitored
                ? translate('Monitored')
                : translate('Unmonitored')
              : null,
            showQualityProfile && qualityProfile?.name
              ? qualityProfile.name
              : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Box>
      ) : null}

      {nextAiring ? (
        <Box
          sx={posterMetaSx}
          title={`${translate('NextAiring')}: ${formatDateTime(
            nextAiring,
            longDateFormat,
            timeFormat
          )}`}
        >
          {getRelativeDate({
            date: nextAiring,
            shortDateFormat,
            showRelativeDates,
            timeFormat,
            timeForToday: true,
          })}
        </Box>
      ) : null}

      {showTags && tags.length ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            px: '3px',
            height: 21,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', overflow: 'hidden' }}>
            <TagListConnector tags={tags} />
          </Box>
        </Box>
      ) : null}

      <SeriesIndexPosterInfo
        originalLanguage={originalLanguage}
        network={network}
        previousAiring={previousAiring}
        added={added}
        seasonCount={seasonCount}
        sizeOnDisk={sizeOnDisk}
        path={path}
        qualityProfile={qualityProfile}
        showQualityProfile={showQualityProfile}
        showRelativeDates={showRelativeDates}
        sortKey={sortKey}
        shortDateFormat={shortDateFormat}
        longDateFormat={longDateFormat}
        timeFormat={timeFormat}
        tags={tags}
        showTags={showTags}
      />
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
    </Box>
  );
}

export default SeriesIndexPoster;
