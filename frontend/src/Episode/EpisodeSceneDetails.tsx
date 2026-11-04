import Box from '@mui/material/Box';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import Scroller from 'Components/Scroller/Scroller';
import Episode from 'Episode/Episode';
import EpisodeScreenshot, {
  getStashPreviewUrl,
  hasEpisodeScreenshot,
} from 'Episode/EpisodeScreenshot';
import formatPerformers from 'Episode/formatPerformers';
import SeasonEpisodeNumber from 'Episode/SeasonEpisodeNumber';
import EpisodeAiring from 'Episode/Summary/EpisodeAiring';
import EpisodeDownloadedFiles from 'Episode/Summary/EpisodeDownloadedFiles';
import useEpisode, { EpisodeEntities } from 'Episode/useEpisode';
import { kinds, scrollDirections, sizes } from 'Helpers/Props';
import Series from 'Series/Series';
import useSeries from 'Series/useSeries';
import QualityProfileNameConnector from 'Settings/Profiles/Quality/QualityProfileNameConnector';
import formatRuntime from 'Utilities/Number/formatRuntime';
import translate from 'Utilities/String/translate';

const METADATA_FADE_MS = 150;

const tpdbLinkSx = {
  borderRadius: '2px',
  textDecoration: 'none',
  transition: 'opacity 200ms ease-in',
  '&:hover': { opacity: 0.85 },
  '&:focus-visible': {
    outline: '2px solid var(--linkColor)',
    outlineOffset: '2px',
    opacity: 0.92,
  },
};

interface EpisodeSceneDetailsProps {
  seriesId: number;
  episodeId?: number;
  episode?: Episode;
  episodeEntity?: EpisodeEntities;
  episodeFileId?: number;
  placeholder?: string;
  showHeader?: boolean;
  showSceneHeading?: boolean;
  showScreenshot?: boolean;
  showMetadata?: boolean;
  showDownloadedFiles?: boolean;
  centerScreenshot?: boolean;
  collapseMetadata?: boolean;
  fillHeight?: boolean;
  className?: string;
  scrollerClassName?: string;
  onMetadataMountChange?: (mounted: boolean) => void;
}

function EpisodeSceneDetails(props: EpisodeSceneDetailsProps) {
  const {
    seriesId,
    episodeId,
    episode: episodeProp,
    episodeEntity = 'episodes',
    episodeFileId: episodeFileIdProp,
    placeholder = translate('SelectEpisode'),
    showHeader = true,
    showSceneHeading = true,
    showScreenshot: showScreenshotProp = true,
    showMetadata = true,
    showDownloadedFiles = true,
    centerScreenshot = false,
    collapseMetadata = false,
    fillHeight = false,
    className,
    scrollerClassName,
    onMetadataMountChange,
  } = props;

  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const {
    title: seriesTitle,
    network,
    seriesType,
    qualityProfileId,
    tvdbId: seriesTvdbId,
  } = useSeries(seriesId) as Series;

  const episodeFromStore = useEpisode(episodeId, episodeEntity) as
    | Episode
    | undefined;
  const episode = episodeProp ?? episodeFromStore;

  const [isMetadataMounted, setIsMetadataMounted] = useState(
    showMetadata && !collapseMetadata
  );
  const [isMetadataFadingOut, setIsMetadataFadingOut] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMetadata) {
      setIsMetadataMounted(false);
      setIsMetadataFadingOut(false);
      return;
    }

    if (!collapseMetadata) {
      setIsMetadataMounted(true);
      setIsMetadataFadingOut(false);
    }
  }, [showMetadata, collapseMetadata]);

  useEffect(() => {
    if (!showMetadata || !collapseMetadata || !isMetadataMounted) {
      return;
    }

    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0;
    }

    setIsMetadataFadingOut(true);

    const timeoutId = window.setTimeout(() => {
      setIsMetadataMounted(false);
      setIsMetadataFadingOut(false);
    }, METADATA_FADE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showMetadata, collapseMetadata, isMetadataMounted]);

  useEffect(() => {
    onMetadataMountChange?.(isMetadataMounted);
  }, [isMetadataMounted, onMetadataMountChange]);

  if (!episodeId || !episode) {
    return (
      <Box
        className={className}
        sx={
          className
            ? undefined
            : {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                width: '100%',
                minHeight: 0,
              }
        }
      >
        <Box sx={{ color: 'var(--helpTextColor)', py: '8px' }}>{placeholder}</Box>
      </Box>
    );
  }

  const {
    id,
    title,
    overview,
    seasonNumber,
    episodeNumber,
    absoluteEpisodeNumber,
    releaseDate,
    runtime,
    monitored,
    images,
    actors,
    tvdbId: episodeTvdbId,
    episodeFileId: episodeFileIdFromEpisode,
  } = episode;

  const episodeFileId = episodeFileIdProp ?? episodeFileIdFromEpisode;
  const performers = formatPerformers(actors);
  const hasPerformers = !!performers;
  const hasOverview = !!overview;
  const hasScreenshot = hasEpisodeScreenshot(images);
  const shouldShowScreenshot = showScreenshotProp && hasScreenshot;

  const isScreenshotGrowing = centerScreenshot && isMetadataMounted;
  const isScreenshotCentered = centerScreenshot && !isMetadataMounted;

  return (
    <Box
      className={className}
      sx={{
        ...(className
          ? null
          : {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              width: '100%',
              minHeight: 0,
            }),
        ...(fillHeight ? { height: '100%' } : null),
      }}
    >
      {showHeader ? (
        <Box sx={{ fontWeight: 600, mb: '10px' }}>{translate('Details')}</Box>
      ) : null}

      <Box
        component={Scroller}
        ref={scrollerRef}
        className={scrollerClassName}
        scrollDirection={scrollDirections.VERTICAL}
        sx={{
          ...(scrollerClassName ? null : { flex: 1, minHeight: 0 }),
          ...(fillHeight ? { height: '100%' } : null),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            ...(fillHeight ? { flex: 1, minHeight: 0, height: '100%' } : null),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              px: 2,
              pt: 1.5,
              pb: 2,
              ...(fillHeight ? { flex: 1, minHeight: 0, height: '100%' } : null),
            }}
          >
            {shouldShowScreenshot ? (
              <Box
                sx={{
                  display: 'flex',
                  flex: isScreenshotCentered ? '1 1 auto' : '0 0 auto',
                  alignItems: isScreenshotCentered ? 'center' : 'flex-start',
                  justifyContent: 'center',
                  width: '100%',
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    mb: isScreenshotCentered ? 0 : '12px',
                  }}
                >
                  <EpisodeScreenshot
                    images={images}
                    blur={safeForWorkMode}
                    previewUrl={getStashPreviewUrl(id, episodeFileId)}
                    style={{
                      display: 'block',
                      width: '100%',
                      maxHeight:
                        isScreenshotGrowing || isScreenshotCentered
                          ? 'min(50vh, 480px)'
                          : 240,
                      borderRadius: 4,
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Box>
            ) : null}

            {isMetadataMounted ? (
              <Box
                sx={{
                  flex: '0 0 auto',
                  overflow: 'hidden',
                  maxHeight: isMetadataFadingOut ? 0 : 3000,
                  opacity: isMetadataFadingOut ? 0 : 1,
                  visibility: isMetadataFadingOut ? 'hidden' : 'visible',
                  mt: isMetadataFadingOut ? 0 : undefined,
                  pointerEvents: isMetadataFadingOut ? 'none' : undefined,
                  transition:
                    'opacity 0.15s ease-in, max-height 0.15s ease-in, margin-top 0.15s ease-in, visibility 0.15s ease-in',
                }}
              >
                {showSceneHeading ? (
                  <>
                    <Box sx={{ fontSize: 16, fontWeight: 600 }}>{title}</Box>

                    <Box sx={{ color: 'text.secondary', mt: 0.25 }}>
                      {seriesTitle}
                    </Box>
                  </>
                ) : null}

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    columnGap: 1,
                    rowGap: 0.5,
                    mt: 1,
                  }}
                >
                  {releaseDate || network ? (
                    <EpisodeAiring
                      releaseDate={releaseDate}
                      network={network}
                    />
                  ) : (
                    <SeasonEpisodeNumber
                      seasonNumber={seasonNumber}
                      episodeNumber={episodeNumber}
                      absoluteEpisodeNumber={absoluteEpisodeNumber}
                      releaseDate={releaseDate}
                      seriesType={seriesType}
                    />
                  )}

                  <Label
                    kind={monitored ? kinds.SUCCESS : kinds.DISABLED}
                    size={sizes.MEDIUM}
                  >
                    {monitored
                      ? translate('Monitored')
                      : translate('Unmonitored')}
                  </Label>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {translate('QualityProfile')}
                  </Box>

                  <Label kind={kinds.PRIMARY} size={sizes.MEDIUM}>
                    <QualityProfileNameConnector
                      qualityProfileId={qualityProfileId}
                    />
                  </Label>

                  {runtime ? (
                    <Box component="span">
                      <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                        {translate('Runtime')}
                      </Box>
                      {formatRuntime(runtime)}
                    </Box>
                  ) : null}

                  {seriesTvdbId ? (
                    <Link
                      to={`https://theporndb.net/sites/${seriesTvdbId}`}
                      sx={tpdbLinkSx}
                    >
                      <Label kind={kinds.PRIMARY} size={sizes.MEDIUM}>
                        {translate('TpdbStudio')}
                      </Label>
                    </Link>
                  ) : null}

                  {episodeTvdbId ? (
                    <Link
                      to={`https://theporndb.net/scenes/${episodeTvdbId}`}
                      sx={tpdbLinkSx}
                    >
                      <Label kind={kinds.PINK} size={sizes.MEDIUM}>
                        {translate('TpdbScene')}
                      </Label>
                    </Link>
                  ) : null}
                </Box>

                {hasPerformers ? (
                  <Box sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{performers}</Box>
                ) : null}

                {hasOverview ? (
                  <Box sx={{ whiteSpace: 'pre-wrap', mt: 1.5 }}>{overview}</Box>
                ) : null}

                {!hasOverview && !hasPerformers ? (
                  <Box sx={{ whiteSpace: 'pre-wrap', mt: 1.5 }}>
                    {translate('NoEpisodeOverview')}
                  </Box>
                ) : null}

                {showDownloadedFiles ? (
                  <EpisodeDownloadedFiles
                    episodeEntity={episodeEntity}
                    episodeFileId={episodeFileId}
                  />
                ) : null}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default EpisodeSceneDetails;
