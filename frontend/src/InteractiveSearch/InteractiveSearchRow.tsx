import Box from '@mui/material/Box';
import React, { useCallback, useState } from 'react';
import ProtocolLabel from 'Activity/Queue/ProtocolLabel';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import Popover from 'Components/Tooltip/Popover';
import Tooltip from 'Components/Tooltip/Tooltip';
import type DownloadProtocol from 'DownloadClient/DownloadProtocol';
import EpisodeFormats from 'Episode/EpisodeFormats';
import EpisodeLanguages from 'Episode/EpisodeLanguages';
import EpisodeQuality from 'Episode/EpisodeQuality';
import IndexerFlags from 'Episode/IndexerFlags';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import Language from 'Language/Language';
import { QualityModel } from 'Quality/Quality';
import CustomFormat from 'typings/CustomFormat';
import formatDateTime from 'Utilities/Date/formatDateTime';
import formatAge from 'Utilities/Number/formatAge';
import formatBytes from 'Utilities/Number/formatBytes';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import translate from 'Utilities/String/translate';
import OverrideMatchModal from './OverrideMatch/OverrideMatchModal';
import Peers from './Peers';
import ReleaseEpisode from './ReleaseEpisode';
import ReleaseSceneIndicator from './ReleaseSceneIndicator';

const actionContentSx = {
  position: 'relative',
  display: 'inline-block',
  mx: '2px',
  width: 22,
  height: 20.39,
  verticalAlign: 'middle',
  lineHeight: '20.39px',
  '&:hover': {
    color: 'var(--iconButtonHoverColor)',
  },
};

function getDownloadIcon(
  isGrabbing: boolean,
  isGrabbed: boolean,
  grabError?: string
) {
  if (isGrabbing) {
    return icons.SPINNER;
  } else if (isGrabbed) {
    return icons.DOWNLOADING;
  } else if (grabError) {
    return icons.DOWNLOADING;
  }

  return icons.DOWNLOAD;
}

function getDownloadKind(isGrabbed: boolean, grabError?: string) {
  if (isGrabbed) {
    return kinds.SUCCESS;
  }

  if (grabError) {
    return kinds.DANGER;
  }

  return kinds.DEFAULT;
}

function getDownloadTooltip(
  isGrabbing: boolean,
  isGrabbed: boolean,
  grabError?: string
) {
  if (isGrabbing) {
    return '';
  } else if (isGrabbed) {
    return translate('AddedToDownloadQueue');
  } else if (grabError) {
    return grabError;
  }

  return translate('AddToDownloadQueue');
}

interface InteractiveSearchRowProps {
  guid: string;
  protocol: DownloadProtocol;
  age: number;
  ageHours: number;
  ageMinutes: number;
  publishDate: string;
  title: string;
  infoUrl: string;
  indexerId: number;
  indexer: string;
  size: number;
  seeders?: number;
  leechers?: number;
  quality: QualityModel;
  languages: Language[];
  customFormats: CustomFormat[];
  customFormatScore: number;
  sceneMapping?: object;
  seasonNumber?: number;
  episodeNumbers?: number[];
  absoluteEpisodeNumbers?: number[];
  mappedSeriesId?: number;
  mappedSeasonNumber?: number;
  mappedEpisodeNumbers?: number[];
  mappedAbsoluteEpisodeNumbers?: number[];
  mappedEpisodeInfo: ReleaseEpisode[];
  indexerFlags: number;
  rejections: string[];
  episodeRequested: boolean;
  downloadAllowed: boolean;
  isDaily: boolean;
  isGrabbing: boolean;
  isGrabbed: boolean;
  grabError?: string;
  longDateFormat: string;
  timeFormat: string;
  searchPayload: {
    episodeId?: number;
    seriesId?: number;
    seasonNumber?: number;
  };
  onGrabPress(...args: unknown[]): void;
  onForceDownloadPress?(...args: unknown[]): void;
  stackedTitleLayout?: boolean;
  stackedColumnCount?: number;
}

function InteractiveSearchRow(props: InteractiveSearchRowProps) {
  const {
    guid,
    indexerId,
    protocol,
    age,
    ageHours,
    ageMinutes,
    publishDate,
    title,
    infoUrl,
    indexer,
    size,
    seeders,
    leechers,
    quality,
    languages,
    customFormatScore,
    customFormats,
    sceneMapping,
    seasonNumber,
    episodeNumbers,
    absoluteEpisodeNumbers,
    mappedSeriesId,
    mappedSeasonNumber,
    mappedEpisodeNumbers,
    mappedAbsoluteEpisodeNumbers,
    mappedEpisodeInfo,
    indexerFlags = 0,
    rejections = [],
    episodeRequested,
    downloadAllowed,
    isDaily,
    isGrabbing = false,
    isGrabbed = false,
    longDateFormat,
    timeFormat,
    grabError,
    searchPayload,
    onGrabPress,
    onForceDownloadPress,
    stackedTitleLayout = false,
    stackedColumnCount = 0,
  } = props;

  const [isConfirmGrabModalOpen, setIsConfirmGrabModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  const onGrabPressWrapper = useCallback(() => {
    if (downloadAllowed) {
      onGrabPress({
        guid,
        indexerId,
      });

      return;
    }

    setIsConfirmGrabModalOpen(true);
  }, [
    guid,
    indexerId,
    downloadAllowed,
    onGrabPress,
    setIsConfirmGrabModalOpen,
  ]);

  const onGrabConfirm = useCallback(() => {
    setIsConfirmGrabModalOpen(false);

    let episodeIds: number[] = [];
    let seriesId = mappedSeriesId;

    if (mappedEpisodeInfo && mappedEpisodeInfo.length > 0) {
      episodeIds = mappedEpisodeInfo.map(
        (episode: { id: number }) => episode.id
      );
    } else if (searchPayload?.episodeId) {
      episodeIds = [searchPayload.episodeId];
    }

    if (!seriesId && searchPayload?.seriesId) {
      seriesId = searchPayload.seriesId;
    }

    onGrabPress({
      guid,
      indexerId,
      ...searchPayload,
      shouldOverride: true,
      seriesId,
      episodeIds,
      quality,
      languages,
    });
  }, [
    guid,
    indexerId,
    searchPayload,
    onGrabPress,
    setIsConfirmGrabModalOpen,
    mappedSeriesId,
    mappedEpisodeInfo,
    quality,
    languages,
  ]);

  const onGrabCancel = useCallback(() => {
    setIsConfirmGrabModalOpen(false);
  }, [setIsConfirmGrabModalOpen]);

  const onOverridePress = useCallback(() => {
    setIsOverrideModalOpen(true);
  }, [setIsOverrideModalOpen]);

  const onOverrideModalClose = useCallback(() => {
    setIsOverrideModalOpen(false);
  }, [setIsOverrideModalOpen]);

  const onForceDownloadPressWrapper = useCallback(() => {
    if (onForceDownloadPress) {
      // Get episode IDs and series ID from available data
      let episodeIds: number[] = [];
      let seriesId = mappedSeriesId;

      // Try to get episode IDs from mappedEpisodeInfo first
      if (mappedEpisodeInfo && mappedEpisodeInfo.length > 0) {
        episodeIds = mappedEpisodeInfo.map(
          (episode: { id: number }) => episode.id
        );
      }
      // If no mapped episode info, check if this is an episode search (searchPayload.episodeId)
      else if (searchPayload && searchPayload.episodeId) {
        episodeIds = [searchPayload.episodeId];
      }

      // Get series ID from searchPayload if not available in mappedSeriesId
      if (!seriesId && searchPayload && searchPayload.seriesId) {
        seriesId = searchPayload.seriesId;
      }

      onForceDownloadPress({
        guid,
        indexerId,
        ...searchPayload,
        shouldOverride: true,
        seriesId,
        episodeIds,
        quality,
        languages,
      });
    }
  }, [
    guid,
    indexerId,
    searchPayload,
    onForceDownloadPress,
    mappedSeriesId,
    mappedEpisodeInfo,
    quality,
    languages,
  ]);

  const titleContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        wordBreak: stackedTitleLayout ? 'normal' : 'break-all',
        overflowWrap: stackedTitleLayout ? 'anywhere' : undefined,
      }}
    >
      <Link to={infoUrl}>{title}</Link>
      <ReleaseSceneIndicator
        seasonNumber={mappedSeasonNumber}
        episodeNumbers={mappedEpisodeNumbers}
        absoluteEpisodeNumbers={mappedAbsoluteEpisodeNumbers}
        sceneSeasonNumber={seasonNumber}
        sceneEpisodeNumbers={episodeNumbers}
        sceneAbsoluteEpisodeNumbers={absoluteEpisodeNumbers}
        sceneMapping={sceneMapping}
        episodeRequested={episodeRequested}
        isDaily={isDaily}
      />
    </Box>
  );

  const leadingCells = (
    <>
      <TableRowCell sx={{ width: 80 }}>
        <ProtocolLabel protocol={protocol} />
      </TableRowCell>

      <TableRowCell
        sx={{ whiteSpace: 'nowrap' }}
        title={formatDateTime(publishDate, longDateFormat, timeFormat, {
          includeSeconds: true,
        })}
      >
        {formatAge(age, ageHours, ageMinutes)}
      </TableRowCell>
    </>
  );

  const trailingCells = (
    <>
      <TableRowCell sx={{ width: 85 }}>{indexer}</TableRowCell>

      <TableRowCell sx={{ whiteSpace: 'nowrap' }}>{formatBytes(size)}</TableRowCell>

      <TableRowCell sx={{ width: 75 }}>
        {protocol === 'torrent' ? (
          <Peers seeders={seeders} leechers={leechers} />
        ) : null}
      </TableRowCell>

      <TableRowCell sx={{ width: 100, textAlign: 'center' }}>
        <EpisodeLanguages languages={languages} />
      </TableRowCell>

      <TableRowCell sx={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
        <EpisodeQuality quality={quality} showRevision={true} />
      </TableRowCell>

      <TableRowCell sx={{ width: 55, fontWeight: 'bold', cursor: 'default' }}>
        <Tooltip
          anchor={formatCustomFormatScore(
            customFormatScore,
            customFormats.length
          )}
          tooltip={<EpisodeFormats formats={customFormats} />}
          position={tooltipPositions.LEFT}
        />
      </TableRowCell>

      <TableRowCell sx={{ width: 50 }}>
        {indexerFlags ? (
          <Popover
            anchor={<Icon name={icons.FLAG} kind={kinds.PRIMARY} />}
            title={translate('IndexerFlags')}
            body={<IndexerFlags indexerFlags={indexerFlags} />}
            position={tooltipPositions.LEFT}
          />
        ) : null}
      </TableRowCell>

      <TableRowCell sx={{ width: 50 }}>
        {rejections.length ? (
          <Popover
            anchor={<Icon name={icons.DANGER} kind={kinds.DANGER} />}
            title={translate('ReleaseRejected')}
            body={
              <ul>
                {rejections.map((rejection, index) => {
                  return <li key={index}>{rejection}</li>;
                })}
              </ul>
            }
            position={tooltipPositions.LEFT}
          />
        ) : null}
      </TableRowCell>

      <TableRowCell sx={{ width: 110 }}>
        <SpinnerIconButton
          name={getDownloadIcon(isGrabbing, isGrabbed, grabError)}
          kind={getDownloadKind(isGrabbed, grabError)}
          title={getDownloadTooltip(isGrabbing, isGrabbed, grabError)}
          isSpinning={isGrabbing}
          onPress={onGrabPressWrapper}
        />

        {onForceDownloadPress && (
          <Link
            sx={actionContentSx}
            title={translate('ForceDownload')}
            onPress={onForceDownloadPressWrapper}
          >
            <Box component="span" sx={{ position: 'absolute', top: 4, left: 0, textAlign: 'center' }}>
              <Icon
                name={icons.ACTIONS}
                size={12}
              />
            </Box>

            <Box component="span" sx={{ position: 'absolute', top: 7, left: 8, textAlign: 'center' }}>
              <Icon
                name={icons.CIRCLE_DOWN}
                size={10}
              />
            </Box>
          </Link>
        )}

        <Link
          sx={actionContentSx}
          title={translate('OverrideAndAddToDownloadQueue')}
          onPress={onOverridePress}
        >
          <Box component="span" sx={{ position: 'absolute', top: 4, left: 0, textAlign: 'center' }}>
            <Icon
              name={icons.INTERACTIVE}
              size={12}
            />
          </Box>

          <Box component="span" sx={{ position: 'absolute', top: 7, left: 8, textAlign: 'center' }}>
            <Icon
              name={icons.CIRCLE_DOWN}
              size={10}
            />
          </Box>
        </Link>
      </TableRowCell>
    </>
  );

  const modals = (
    <>
      <ConfirmModal
        isOpen={isConfirmGrabModalOpen}
        kind={kinds.WARNING}
        title={translate('GrabRelease')}
        message={translate('GrabReleaseMessageText', { title })}
        confirmLabel={translate('Grab')}
        onConfirm={onGrabConfirm}
        onCancel={onGrabCancel}
      />

      <OverrideMatchModal
        isOpen={isOverrideModalOpen}
        title={title}
        indexerId={indexerId}
        guid={guid}
        seriesId={mappedSeriesId}
        seasonNumber={mappedSeasonNumber}
        episodes={mappedEpisodeInfo}
        languages={languages}
        quality={quality}
        protocol={protocol}
        isGrabbing={isGrabbing}
        grabError={grabError}
        onModalClose={onOverrideModalClose}
      />
    </>
  );

  if (stackedTitleLayout) {
    return (
      <>
        <TableRow
          sx={{
            '&:hover, &:hover + .MuiTableRow-root, &:has(+ .MuiTableRow-root:hover)':
              {
                backgroundColor: 'var(--tableRowHoverBackgroundColor)',
              },
          }}
        >
          <TableRowCell
            colSpan={stackedColumnCount}
            sx={{ pb: '4px', whiteSpace: 'normal' }}
          >
            {titleContent}
          </TableRowCell>
        </TableRow>

        <TableRow
          sx={{
            '&:hover': {
              backgroundColor: 'var(--tableRowHoverBackgroundColor)',
            },
          }}
        >
          {leadingCells}
          {trailingCells}
        </TableRow>

        {modals}
      </>
    );
  }

  return (
    <>
      <TableRow>
        {leadingCells}

        <TableRowCell>{titleContent}</TableRowCell>

        {trailingCells}
      </TableRow>

      {modals}
    </>
  );
}

export default InteractiveSearchRow;
