import classNames from 'classnames';
import React, { KeyboardEvent, useCallback, useState } from 'react';
import Link from 'Components/Link/Link';
import EpisodeDetailsModal from 'Episode/EpisodeDetailsModal';
import { EpisodeEntities } from 'Episode/useEpisode';
import FinaleType from './FinaleType';
import styles from './EpisodeTitleLink.css';

interface EpisodeTitleLinkProps {
  className?: string;
  episodeId: number;
  seriesId: number;
  episodeEntity: EpisodeEntities;
  episodeTitle: string;
  finaleType?: string;
  showOpenSeriesButton: boolean;
  onModalOpen?(): void;
  renderModal?: boolean;
}

function EpisodeTitleLink(props: EpisodeTitleLinkProps) {
  const {
    className,
    episodeTitle,
    finaleType,
    onModalOpen,
    renderModal = true,
    ...otherProps
  } = props;
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const handleLinkPress = useCallback(() => {
    if (onModalOpen) {
      onModalOpen();
      return;
    }

    setIsDetailsModalOpen(true);
  }, [onModalOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleLinkPress();
      }
    },
    [handleLinkPress]
  );
  const handleModalClose = useCallback(() => {
    setIsDetailsModalOpen(false);
  }, []);

  return (
    <div className={styles.container}>
      <Link
        className={classNames(styles.link, className)}
        component="span"
        role="button"
        tabIndex={0}
        onPress={handleLinkPress}
        onKeyDown={handleKeyDown}
      >
        {episodeTitle}
      </Link>

      {finaleType ? <FinaleType finaleType={finaleType} /> : null}

      {renderModal ? (
        <EpisodeDetailsModal
          isOpen={isDetailsModalOpen}
          episodeTitle={episodeTitle}
          {...otherProps}
          onModalClose={handleModalClose}
        />
      ) : null}
    </div>
  );
}

export default EpisodeTitleLink;
