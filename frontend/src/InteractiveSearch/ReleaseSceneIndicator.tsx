import Box from '@mui/material/Box';
import _ from 'lodash';
import React from 'react';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import Icon from 'Components/Icon';
import Popover from 'Components/Tooltip/Popover';
import { icons, tooltipPositions } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

type SceneLevel =
  | 'none'
  | 'mixed'
  | 'unknown'
  | 'mapped'
  | 'normal'
  | 'notRequested';

const levelSx: Record<SceneLevel, object> = {
  none: {
    borderColor: 'var(--textColor)',
    color: 'var(--textColor)',
    opacity: 0.2,
    '&:hover': { opacity: 1 },
  },
  mixed: {
    borderColor: 'var(--dangerColor)',
    color: 'var(--dangerColor)',
  },
  unknown: {
    borderColor: 'var(--warningColor)',
    color: 'var(--warningColor)',
  },
  mapped: {
    borderColor: 'var(--textColor)',
    color: 'var(--textColor)',
  },
  normal: {
    borderColor: 'var(--textColor)',
    color: 'var(--textColor)',
  },
  notRequested: {
    borderColor: 'var(--dangerColor)',
    color: 'var(--dangerColor)',
  },
};

function formatReleaseNumber(
  seasonNumber: number | undefined,
  episodeNumbers: number[] | undefined,
  absoluteEpisodeNumbers: number[] | undefined
) {
  if (episodeNumbers && episodeNumbers.length) {
    if (episodeNumbers.length > 1) {
      return `${seasonNumber}x${episodeNumbers[0]}-${
        episodeNumbers[episodeNumbers.length - 1]
      }`;
    }
    return `${seasonNumber}x${episodeNumbers[0]}`;
  }

  if (absoluteEpisodeNumbers && absoluteEpisodeNumbers.length) {
    if (absoluteEpisodeNumbers.length > 1) {
      return `${absoluteEpisodeNumbers[0]}-${
        absoluteEpisodeNumbers[absoluteEpisodeNumbers.length - 1]
      }`;
    }
    return absoluteEpisodeNumbers[0];
  }

  if (seasonNumber !== undefined) {
    return translate('SeasonNumberToken', { seasonNumber });
  }

  return null;
}

interface ReleaseSceneIndicatorProps {
  className?: string;
  seasonNumber?: number;
  episodeNumbers?: number[];
  absoluteEpisodeNumbers?: number[];
  sceneSeasonNumber?: number;
  sceneEpisodeNumbers?: number[];
  sceneAbsoluteEpisodeNumbers?: number[];
  sceneMapping?: {
    sceneOrigin?: string;
    title?: string;
    comment?: string;
  };
  episodeRequested: boolean;
  isDaily: boolean;
}

function ReleaseSceneIndicator(props: ReleaseSceneIndicatorProps) {
  const {
    className,
    seasonNumber,
    episodeNumbers,
    absoluteEpisodeNumbers,
    sceneSeasonNumber,
    sceneEpisodeNumbers,
    sceneAbsoluteEpisodeNumbers,
    sceneMapping = {},
    episodeRequested,
    isDaily,
  } = props;

  const { sceneOrigin, title, comment } = sceneMapping;

  if (isDaily) {
    return null;
  }

  let mappingDifferent =
    sceneSeasonNumber !== undefined && seasonNumber !== sceneSeasonNumber;

  if (sceneEpisodeNumbers !== undefined) {
    mappingDifferent =
      mappingDifferent || !_.isEqual(sceneEpisodeNumbers, episodeNumbers);
  } else if (sceneAbsoluteEpisodeNumbers !== undefined) {
    mappingDifferent =
      mappingDifferent ||
      !_.isEqual(sceneAbsoluteEpisodeNumbers, absoluteEpisodeNumbers);
  }

  if (!sceneMapping && !mappingDifferent) {
    return null;
  }

  const releaseNumber = formatReleaseNumber(
    sceneSeasonNumber,
    sceneEpisodeNumbers,
    sceneAbsoluteEpisodeNumbers
  );
  const mappedNumber = formatReleaseNumber(
    seasonNumber,
    episodeNumbers,
    absoluteEpisodeNumbers
  );
  const messages = [];

  const isMixed = sceneOrigin === 'mixed';
  const isUnknown = sceneOrigin === 'unknown' || sceneOrigin === 'unknown:tvdb';

  let level: SceneLevel = 'none';

  if (isMixed) {
    level = 'mixed';
    messages.push(
      <div key="source">
        {translate('ReleaseSceneIndicatorSourceMessage', {
          message: comment ?? 'Source',
        })}
      </div>
    );
  } else if (isUnknown) {
    level = 'unknown';
    messages.push(
      <div key="unknown">
        {translate('ReleaseSceneIndicatorUnknownMessage')}
      </div>
    );
    if (sceneOrigin === 'unknown') {
      messages.push(
        <div key="origin">
          {translate('ReleaseSceneIndicatorAssumingScene')}.
        </div>
      );
    } else if (sceneOrigin === 'unknown:tvdb') {
      messages.push(
        <div key="origin">{translate('ReleaseSceneIndicatorAssumingTvdb')}</div>
      );
    }
  } else if (mappingDifferent) {
    level = 'mapped';
  } else if (sceneOrigin) {
    level = 'normal';
  }

  if (!episodeRequested) {
    if (!isMixed && !isUnknown) {
      level = 'notRequested';
    }
    if (mappedNumber) {
      messages.push(
        <div key="not-requested">
          {translate('ReleaseSceneIndicatorMappedNotRequested')}
        </div>
      );
    } else {
      messages.push(
        <div key="unknown-series">
          {translate('ReleaseSceneIndicatorUnknownSeries')}
        </div>
      );
    }
  }

  const table = (
    <Box
      sx={{
        mr: '10px',
        '& dt': {
          '@media (min-width: 768px)': {
            width: '80px !important',
          },
        },
        '& dd': {
          '@media (min-width: 768px)': {
            marginLeft: '100px !important',
          },
        },
      }}
    >
    <DescriptionList>
      {comment !== undefined && (
        <DescriptionListItem
          title={translate('Mapping')}
          data={comment}
        />
      )}

      {title !== undefined && (
        <DescriptionListItem
          title={translate('Title')}
          data={title}
        />
      )}

      {releaseNumber !== undefined && (
        <DescriptionListItem
          title={translate('Release')}
          data={releaseNumber ?? 'unknown'}
        />
      )}

      {releaseNumber !== undefined && (
        <DescriptionListItem
          title={translate('TheTvdb')}
          data={mappedNumber ?? 'unknown'}
        />
      )}
    </DescriptionList>
    </Box>
  );

  return (
    <Popover
      anchor={
        <Box
          className={className}
          sx={{
            m: '2px',
            px: '2px',
            border: '1px solid',
            borderRadius: '2px',
            whiteSpace: 'nowrap',
            fontSize: 12,
            cursor: 'default',
            flexShrink: 0,
            ...levelSx[level],
          }}
        >
          <Icon name={icons.SCENE_MAPPING} />
        </Box>
      }
      title={translate('SceneInfo')}
      body={
        <div>
          {table}
          {(messages.length && (
            <Box sx={{ mt: '15px' }}>{messages}</Box>
          )) ||
            null}
        </div>
      }
      position={tooltipPositions.RIGHT}
    />
  );
}

export default ReleaseSceneIndicator;
