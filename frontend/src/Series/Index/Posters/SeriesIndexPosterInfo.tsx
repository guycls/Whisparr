import Box from '@mui/material/Box';
import React from 'react';
import TagListConnector from 'Components/TagListConnector';
import Language from 'Language/Language';
import QualityProfile from 'typings/QualityProfile';
import formatDateTime from 'Utilities/Date/formatDateTime';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';

interface SeriesIndexPosterInfoProps {
  originalLanguage?: Language;
  network?: string;
  showQualityProfile: boolean;
  qualityProfile?: QualityProfile;
  previousAiring?: string;
  added?: string;
  seasonCount: number;
  path: string;
  sizeOnDisk?: number;
  tags: number[];
  sortKey: string;
  showRelativeDates: boolean;
  shortDateFormat: string;
  longDateFormat: string;
  timeFormat: string;
  showTags: boolean;
}

const infoSx = {
  bgcolor: 'background.paper',
  textAlign: 'center',
  fontSize: 12,
};

const tagsSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  px: '3px',
  height: 21,
  bgcolor: 'background.paper',
};

const tagsListSx = {
  display: 'flex',
  overflow: 'hidden',
};

function SeriesIndexPosterInfo(props: SeriesIndexPosterInfoProps) {
  const {
    originalLanguage,
    network,
    qualityProfile,
    showQualityProfile,
    previousAiring,
    added,
    seasonCount,
    path,
    sizeOnDisk = 0,
    tags,
    sortKey,
    showRelativeDates,
    shortDateFormat,
    longDateFormat,
    timeFormat,
    showTags,
  } = props;

  if (sortKey === 'network' && network) {
    return (
      <Box sx={infoSx} title={translate('Network')}>
        {network}
      </Box>
    );
  }

  if (sortKey === 'originalLanguage' && !!originalLanguage?.name) {
    return (
      <Box sx={infoSx} title={translate('OriginalLanguage')}>
        {originalLanguage.name}
      </Box>
    );
  }

  if (
    sortKey === 'qualityProfileId' &&
    !showQualityProfile &&
    !!qualityProfile?.name
  ) {
    return (
      <Box sx={infoSx} title={translate('QualityProfile')}>
        {qualityProfile.name}
      </Box>
    );
  }

  if (sortKey === 'previousAiring' && previousAiring) {
    return (
      <Box
        sx={infoSx}
        title={`${translate('PreviousAiring')}: ${formatDateTime(
          previousAiring,
          longDateFormat,
          timeFormat
        )}`}
      >
        {getRelativeDate({
          date: previousAiring,
          shortDateFormat,
          showRelativeDates,
          timeFormat,
          timeForToday: true,
        })}
      </Box>
    );
  }

  if (sortKey === 'added' && added) {
    const addedDate = getRelativeDate({
      date: added,
      shortDateFormat,
      showRelativeDates,
      timeFormat,
      timeForToday: false,
    });

    return (
      <Box
        sx={infoSx}
        title={formatDateTime(added, longDateFormat, timeFormat)}
      >
        {translate('Added')}: {addedDate}
      </Box>
    );
  }

  if (sortKey === 'seasonCount') {
    let seasons = translate('OneSeason');

    if (seasonCount === 0) {
      seasons = translate('NoSeasons');
    } else if (seasonCount > 1) {
      seasons = translate('CountSeasons', { count: seasonCount });
    }

    return <Box sx={infoSx}>{seasons}</Box>;
  }

  if (!showTags && sortKey === 'tags' && tags.length) {
    return (
      <Box sx={tagsSx}>
        <Box sx={tagsListSx}>
          <TagListConnector tags={tags} />
        </Box>
      </Box>
    );
  }

  if (sortKey === 'path') {
    return (
      <Box sx={infoSx} title={translate('Path')}>
        {path}
      </Box>
    );
  }

  if (sortKey === 'sizeOnDisk') {
    return (
      <Box sx={infoSx} title={translate('SizeOnDisk')}>
        {formatBytes(sizeOnDisk)}
      </Box>
    );
  }

  return null;
}

export default SeriesIndexPosterInfo;
