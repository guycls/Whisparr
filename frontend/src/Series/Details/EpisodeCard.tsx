import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Link from 'Components/Link/Link';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import Tooltip from 'Components/Tooltip/Tooltip';
import { Actor } from 'Episode/Episode';
import EpisodeDetailsModal from 'Episode/EpisodeDetailsModal';
import EpisodeScreenshot from 'Episode/EpisodeScreenshot';
import EpisodeSearchActions from 'Episode/EpisodeSearchActions';
import EpisodeStatus from 'Episode/EpisodeStatus';
import EpisodeTitleLink from 'Episode/EpisodeTitleLink';
import { EpisodeEntities } from 'Episode/useEpisode';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { Image } from 'Series/Series';
import formatRuntime from 'Utilities/Number/formatRuntime';

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
  episodeEntity?: EpisodeEntities;
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
    episodeEntity = 'episodes',
    onMonitorEpisodePress,
  } = props;

  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const [isDetailsModalOpen, openDetailsModal, closeDetailsModal] =
    useModalOpenState(false);

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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '16 / 9',
          bgcolor: 'action.hover',
        }}
      >
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
              '&:hover': { opacity: 0.9 },
            },
            '& img': {
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            },
          }}
        >
          <Link onPress={openDetailsModal}>
            <EpisodeScreenshot images={images} blur={safeForWorkMode} />
          </Link>
        </Box>

        <Box sx={{ position: 'absolute', top: 6, left: 6, zIndex: 2 }}>
          <EpisodeStatus
            episodeId={id}
            episodeEntity={episodeEntity}
            episodeFileId={episodeFileId || 0}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          p: { xs: '6px', md: 1 },
        }}
      >
        <Typography
          sx={{
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            fontSize: 14,
            '& a, & span, & .MuiButton-root': {
              display: 'block',
              maxWidth: 'none',
              overflow: 'visible',
              textOverflow: 'unset',
              whiteSpace: 'normal',
            },
          }}
        >
          <EpisodeTitleLink
            episodeId={id}
            seriesId={seriesId}
            episodeTitle={title}
            episodeEntity={episodeEntity}
            showOpenSeriesButton={false}
            renderModal={false}
            onModalOpen={openDetailsModal}
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
            <Box component="span" sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
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
          onPress={handleMonitorPress}
        />

        <Box sx={{ flexShrink: 0 }}>
          <EpisodeSearchActions
            episodeId={id}
            episodeEntity={episodeEntity}
            seriesId={seriesId}
            episodeTitle={title}
            isSmallScreen={isSmallScreen}
          />
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
