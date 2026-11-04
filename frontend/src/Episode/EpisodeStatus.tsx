import Box from '@mui/material/Box';
import React from 'react';
import { useSelector } from 'react-redux';
import QueueDetails from 'Activity/Queue/QueueDetails';
import Icon from 'Components/Icon';
import ProgressBar from 'Components/ProgressBar';
import Episode from 'Episode/Episode';
import useEpisode, { EpisodeEntities } from 'Episode/useEpisode';
import { EpisodeFile } from 'EpisodeFile/EpisodeFile';
import useEpisodeFile from 'EpisodeFile/useEpisodeFile';
import { icons, kinds, sizes } from 'Helpers/Props';
import { QualityModel } from 'Quality/Quality';
import { createQueueItemSelectorForHook } from 'Store/Selectors/createQueueItemSelector';
import isBefore from 'Utilities/Date/isBefore';
import translate from 'Utilities/String/translate';
import EpisodeQuality from './EpisodeQuality';

interface EpisodeStatusProps {
  episodeId: number;
  episodeEntity?: EpisodeEntities;
  episodeFileId: number;
  resolutionOnly?: boolean;
}

function hasPresentQuality(quality?: QualityModel) {
  const qualityId = quality?.quality?.id;

  return qualityId != null && qualityId !== 0;
}

function hasKnownQuality(
  episodeFile?: EpisodeFile
): episodeFile is EpisodeFile {
  return hasPresentQuality(episodeFile?.quality);
}

function EpisodeStatus(props: EpisodeStatusProps) {
  const {
    episodeId,
    episodeEntity = 'episodes',
    episodeFileId,
    resolutionOnly = false,
  } = props;

  const episode = useEpisode(episodeId, episodeEntity) as Episode | undefined;
  const queueItem = useSelector(createQueueItemSelectorForHook(episodeId));
  const storedFile = useEpisodeFile(episodeFileId);

  if (!episode) {
    return null;
  }

  const {
    releaseDate,
    monitored,
    grabbed = false,
    hasFile = false,
    episodeFile: embeddedFile,
  } = episode;

  const episodeFile = storedFile ?? embeddedFile;

  const hasEpisodeFile = hasKnownQuality(episodeFile);
  const isQueued = !!queueItem;
  const hasAired = isBefore(releaseDate);

  if (isQueued) {
    const { sizeleft, size } = queueItem;

    const progress = size ? 100 - (sizeleft / size) * 100 : 0;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <QueueDetails
          {...queueItem}
          progressBar={
            <ProgressBar
              progress={progress}
              kind={kinds.PURPLE}
              size={sizes.MEDIUM}
            />
          }
        />
      </Box>
    );
  }

  if (grabbed) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Icon
          name={icons.DOWNLOADING}
          title={translate('EpisodeIsDownloading')}
        />
      </Box>
    );
  }

  if (hasEpisodeFile) {
    const quality = episodeFile.quality;
    const isCutoffNotMet = episodeFile.qualityCutoffNotMet;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <EpisodeQuality
          quality={quality}
          size={episodeFile.size}
          isCutoffNotMet={isCutoffNotMet}
          resolutionOnly={resolutionOnly}
          mediaInfoResolution={episodeFile.mediaInfo?.resolution}
          title={
            resolutionOnly
              ? `${translate('EpisodeDownloaded')} - ${quality.quality.name}`
              : translate('EpisodeDownloaded')
          }
        />
      </Box>
    );
  }

  if (hasFile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Icon name={icons.DOWNLOADED} title={translate('EpisodeDownloaded')} />
      </Box>
    );
  }

  if (!releaseDate) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Icon name={icons.TBA} title={translate('Tba')} />
      </Box>
    );
  }

  if (!monitored) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Icon
          name={icons.UNMONITORED}
          kind={kinds.DISABLED}
          title={translate('EpisodeIsNotMonitored')}
        />
      </Box>
    );
  }

  if (hasAired) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Icon
          name={icons.MISSING}
          title={translate('EpisodeMissingFromDisk')}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Icon name={icons.NOT_AIRED} title={translate('EpisodeHasNotAired')} />
    </Box>
  );
}

export default EpisodeStatus;
