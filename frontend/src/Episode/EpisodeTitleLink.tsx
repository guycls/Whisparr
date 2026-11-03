import Box from '@mui/material/Box';
import React, { KeyboardEvent, useCallback, useState } from 'react';
import Link from 'Components/Link/Link';
import EpisodeDetailsModal from 'Episode/EpisodeDetailsModal';
import { EpisodeEntities } from 'Episode/useEpisode';
import FinaleType from './FinaleType';

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
  wrap?: boolean;
}

function EpisodeTitleLink(props: EpisodeTitleLinkProps) {
  const {
    className,
    episodeTitle,
    finaleType,
    onModalOpen,
    renderModal = true,
    wrap = false,
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
    <Box
      sx={
        wrap
          ? { display: 'block', width: '100%', minWidth: 0 }
          : { display: 'inline-flex', alignItems: 'center' }
      }
    >
      <Box
        sx={
          wrap
            ? {
                width: '100%',
                minWidth: 0,
                '& .MuiButton-root': {
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  minWidth: 0,
                  maxWidth: '100%',
                  p: 0,
                  overflow: 'visible',
                  textOverflow: 'unset',
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  textAlign: 'left',
                  lineHeight: 1.35,
                  cursor: 'pointer',
                  userSelect: 'text',
                  '&:hover': {
                    color: 'var(--linkHoverColor)',
                    textDecoration: 'underline',
                  },
                },
              }
            : {
                maxWidth: 800,
                '@media (min-width: 2560px)': { maxWidth: 1200 },
                '@media (min-width: 3840px)': { maxWidth: 2000 },
                '& .MuiButton-root': {
                  display: 'inline-block',
                  overflow: 'hidden',
                  maxWidth: '100%',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  userSelect: 'text',
                  '&:hover': {
                    color: 'var(--linkHoverColor)',
                    textDecoration: 'underline',
                  },
                },
              }
        }
      >
        <Link
          className={className}
          component="span"
          role="button"
          tabIndex={0}
          onPress={handleLinkPress}
          onKeyDown={handleKeyDown}
        >
        {episodeTitle}
        </Link>
      </Box>

      {finaleType ? <FinaleType finaleType={finaleType} /> : null}

      {renderModal ? (
        <EpisodeDetailsModal
          isOpen={isDetailsModalOpen}
          episodeTitle={episodeTitle}
          {...otherProps}
          onModalClose={handleModalClose}
        />
      ) : null}
    </Box>
  );
}

export default EpisodeTitleLink;
