import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { SyntheticEvent, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { sceneMetadataBackground } from 'App/createAppTheme';
import { useSelect } from 'App/SelectContext';
import AppState from 'App/State/AppState';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import Tooltip from 'Components/Tooltip/Tooltip';
import { Actor } from 'Episode/Episode';
import EpisodeDetailsModal from 'Episode/EpisodeDetailsModal';
import EpisodeScreenshot, {
  getStashPreviewUrl,
} from 'Episode/EpisodeScreenshot';
import EpisodeSearchActions from 'Episode/EpisodeSearchActions';
import EpisodeStatus from 'Episode/EpisodeStatus';
import EpisodeTitleLink from 'Episode/EpisodeTitleLink';
import { EpisodeEntities } from 'Episode/useEpisode';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons } from 'Helpers/Props';
import { Image } from 'Series/Series';
import formatRuntime from 'Utilities/Number/formatRuntime';
import translate from 'Utilities/String/translate';
import SeriesDetailsEpisodeSelect from './Select/SeriesDetailsEpisodeSelect';

interface EpisodeCardProps {
  id: number;
  seriesId: number;
  episodeFileId?: number;
  monitored: boolean;
  actors: Actor[];
  releaseDate?: string;
  runtime?: number;
  title: string;
  images?: Image[];
  isSaving?: boolean;
  seriesMonitored: boolean;
  isSmallScreen: boolean;
  isSelectMode?: boolean;
  episodeEntity?: EpisodeEntities;
  isBookmarked?: boolean;
  onBookmarkPress?(id: number): void;
  onMonitorEpisodePress(
    id: number,
    monitored: boolean,
    options: { shiftKey: boolean }
  ): void;
}

function EpisodeCard(props: EpisodeCardProps) {
  const {
    id,
    seriesId,
    episodeFileId,
    monitored,
    actors,
    releaseDate,
    runtime,
    title,
    images,
    isSaving,
    seriesMonitored,
    isSmallScreen,
    isSelectMode = false,
    episodeEntity = 'episodes',
    isBookmarked = false,
    onBookmarkPress,
    onMonitorEpisodePress,
  } = props;

  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const [isDetailsModalOpen, openDetailsModal, closeDetailsModal] =
    useModalOpenState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [selectState, selectDispatch] = useSelect();
  const isSelected = !!selectState.selectedState[id];

  const onSelectPress = useCallback(
    (event?: SyntheticEvent) => {
      const shiftKey =
        !!event &&
        'shiftKey' in event.nativeEvent &&
        !!event.nativeEvent.shiftKey;

      selectDispatch({
        type: 'toggleSelected',
        id,
        isSelected: !isSelected,
        shiftKey,
      });
    },
    [id, isSelected, selectDispatch]
  );

  const joinedPerformers = actors
    .map((a) => a.character)
    .slice(0, 4)
    .join(', ');

  const handleMonitorPress = useCallback(
    (nextMonitored: boolean, options: { shiftKey: boolean }) => {
      onMonitorEpisodePress(id, nextMonitored, options);
    },
    [id, onMonitorEpisodePress]
  );

  const handleBookmarkPress = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault();
      event.stopPropagation();
      onBookmarkPress?.(id);
    },
    [id, onBookmarkPress]
  );

  return (
    <Box
      data-episode-id={id}
      data-episode-title={title}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'transparent',
        backgroundImage: 'none',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          bgcolor: 'action.hover',
        }}
      >
        {isSelectMode ? <SeriesDetailsEpisodeSelect episodeId={id} /> : null}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            '& .MuiButton-root': {
              display: 'block',
              width: '100%',
              height: '100%',
              p: 0,
              border: 'none',
              minWidth: 0,
              '&:hover': { opacity: isPreviewActive ? 1 : 0.9 },
            },
            '& img, & video': {
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            },
          }}
        >
          <Link onPress={isSelectMode ? onSelectPress : openDetailsModal}>
            <EpisodeScreenshot
              images={images}
              blur={safeForWorkMode}
              previewUrl={getStashPreviewUrl(id, episodeFileId)}
              onPreviewActiveChange={setIsPreviewActive}
            />
          </Link>
        </Box>

        {isPreviewActive ? null : (
          <Box
            sx={{
              position: 'absolute',
              top: 6,
              left: isSelectMode ? 42 : 6,
              zIndex: 2,
              maxWidth: 'calc(100% - 12px)',
              '& .MuiChip-root': {
                height: 22,
                maxWidth: '100%',
              },
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          >
            <EpisodeStatus
              episodeId={id}
              episodeEntity={episodeEntity}
              episodeFileId={episodeFileId || 0}
              resolutionOnly={true}
            />
          </Box>
        )}
      </Box>

      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          ...sceneMetadataBackground(theme),
        })}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: '4px',
            minWidth: 0,
            p: { xs: '6px', md: 1 },
          }}
        >
          <Typography
            sx={{
              minWidth: 0,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              fontSize: 14,
              lineHeight: 1.35,
            }}
          >
            <EpisodeTitleLink
              episodeId={id}
              seriesId={seriesId}
              episodeTitle={title}
              episodeEntity={episodeEntity}
              showOpenSeriesButton={false}
              renderModal={false}
              wrap={true}
              onModalOpen={
                isSelectMode ? () => onSelectPress() : openDetailsModal
              }
            />
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              pt: '4px',
              borderTop: 1,
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: 12,
            }}
          >
            <Box sx={{ minWidth: 0, p: 0 }}>
              <RelativeDateCell date={releaseDate} component="span" />
            </Box>

            {!!runtime && (
              <Box
                component="span"
                sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                {formatRuntime(runtime)}
              </Box>
            )}
          </Box>

          {!!joinedPerformers && (
            <Tooltip
              anchor={
                <Box
                  sx={{
                    overflow: 'hidden',
                    maxWidth: '100%',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'text.secondary',
                    fontSize: 12,
                  }}
                >
                  {joinedPerformers}
                </Box>
              }
              tooltip={joinedPerformers}
            />
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            mt: 'auto',
            py: '4px',
            px: 1,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <MonitorToggleButton
            monitored={monitored}
            isDisabled={!seriesMonitored}
            isSaving={isSaving}
            size={20}
            useTooltip={true}
            onPress={handleMonitorPress}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {onBookmarkPress ? (
              <IconButton
                name={
                  isBookmarked
                    ? icons.SCENE_BOOKMARK
                    : icons.SCENE_BOOKMARK_OUTLINE
                }
                size={20}
                title={translate(
                  isBookmarked ? 'RemoveBookmark' : 'BookmarkScene'
                )}
                useTooltip={true}
                aria-pressed={isBookmarked}
                onPress={handleBookmarkPress}
              />
            ) : null}

            <EpisodeSearchActions
              episodeId={id}
              episodeEntity={episodeEntity}
              seriesId={seriesId}
              episodeTitle={title}
              isSmallScreen={isSmallScreen}
            />
          </Box>
        </Box>
      </Box>

      <EpisodeDetailsModal
        isOpen={isDetailsModalOpen}
        episodeId={id}
        episodeEntity={episodeEntity}
        seriesId={seriesId}
        episodeTitle={title}
        onModalClose={closeDetailsModal}
      />
    </Box>
  );
}

export default EpisodeCard;
