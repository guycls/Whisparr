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
import styles from './EpisodeCard.css';

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
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Link className={styles.imageLink} onPress={openDetailsModal}>
          <EpisodeScreenshot
            className={styles.image}
            images={images}
            blur={safeForWorkMode}
          />
        </Link>

        <div className={styles.statusOverlay}>
          <EpisodeStatus
            episodeId={id}
            episodeEntity={episodeEntity}
            episodeFileId={episodeFileId || 0}
          />
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.title}>
          <EpisodeTitleLink
            className={styles.titleLink}
            episodeId={id}
            seriesId={seriesId}
            episodeTitle={title}
            episodeEntity={episodeEntity}
            showOpenSeriesButton={false}
            renderModal={false}
            onModalOpen={openDetailsModal}
          />
        </div>

        <div className={styles.meta}>
          <RelativeDateCell
            className={styles.metaDate}
            date={releaseDate}
            component="span"
          />

          {!!runtime && (
            <span className={styles.runtime}>{formatRuntime(runtime)}</span>
          )}
        </div>

        {!!joinedPerformers && (
          <Tooltip
            anchor={<div className={styles.actors}>{joinedPerformers}</div>}
            tooltip={joinedPerformers}
          />
        )}
      </div>

      <div className={styles.actionsRow}>
        <MonitorToggleButton
          monitored={monitored}
          isDisabled={!seriesMonitored}
          isSaving={isSaving}
          size={20}
          onPress={handleMonitorPress}
        />

        <EpisodeSearchActions
          className={styles.actions}
          episodeId={id}
          episodeEntity={episodeEntity}
          seriesId={seriesId}
          episodeTitle={title}
          isSmallScreen={isSmallScreen}
        />
      </div>

      <EpisodeDetailsModal
        isOpen={isDetailsModalOpen}
        episodeId={id}
        episodeEntity={episodeEntity}
        seriesId={seriesId}
        episodeTitle={title}
        onModalClose={closeDetailsModal}
      />
    </div>
  );
}

export default EpisodeCard;
