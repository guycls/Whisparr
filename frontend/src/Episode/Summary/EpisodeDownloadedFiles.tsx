import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Icon from 'Components/Icon';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { EpisodeEntities } from 'Episode/useEpisode';
import useEpisodeFile from 'EpisodeFile/useEpisodeFile';
import { icons } from 'Helpers/Props';
import {
  deleteEpisodeFile,
  fetchEpisodeFile,
} from 'Store/Actions/episodeFileActions';
import translate from 'Utilities/String/translate';
import EpisodeFileRow from './EpisodeFileRow';
import styles from './EpisodeDownloadedFiles.css';

const COLUMNS: Column[] = [
  {
    name: 'path',
    label: () => translate('Path'),
    isSortable: false,
    isVisible: true,
  },
  {
    name: 'size',
    label: () => translate('Size'),
    isSortable: false,
    isVisible: true,
  },
  {
    name: 'languages',
    label: () => translate('Languages'),
    isSortable: false,
    isVisible: true,
  },
  {
    name: 'quality',
    label: () => translate('Quality'),
    isSortable: false,
    isVisible: true,
  },
  {
    name: 'customFormats',
    label: () => translate('Formats'),
    isSortable: false,
    isVisible: true,
  },
  {
    name: 'customFormatScore',
    label: React.createElement(Icon, {
      name: icons.SCORE,
      title: () => translate('CustomFormatScore'),
    }),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'actions',
    label: '',
    isSortable: false,
    isVisible: true,
  },
];

interface EpisodeDownloadedFilesProps {
  episodeEntity: EpisodeEntities;
  episodeFileId?: number;
}

function EpisodeDownloadedFiles(props: EpisodeDownloadedFilesProps) {
  const { episodeEntity, episodeFileId } = props;

  const dispatch = useDispatch();

  const {
    path,
    mediaInfo,
    size,
    languages,
    quality,
    qualityCutoffNotMet,
    customFormats,
    customFormatScore,
  } = useEpisodeFile(episodeFileId) || {};

  const handleDeleteEpisodeFile = useCallback(() => {
    dispatch(
      deleteEpisodeFile({
        id: episodeFileId,
        episodeEntity,
      })
    );
  }, [episodeFileId, episodeEntity, dispatch]);

  useEffect(() => {
    if (episodeFileId && !path) {
      dispatch(fetchEpisodeFile({ id: episodeFileId }));
    }
  }, [episodeFileId, path, dispatch]);

  if (
    !path ||
    size == null ||
    !languages ||
    !quality ||
    qualityCutoffNotMet == null ||
    !customFormats ||
    customFormatScore == null ||
    !mediaInfo
  ) {
    return null;
  }

  return (
    <div className={styles.downloadedFiles}>
      <Table columns={COLUMNS}>
        <TableBody>
          <EpisodeFileRow
            path={path}
            size={size}
            languages={languages}
            quality={quality}
            qualityCutoffNotMet={qualityCutoffNotMet}
            customFormats={customFormats}
            customFormatScore={customFormatScore}
            mediaInfo={mediaInfo}
            columns={COLUMNS}
            onDeleteEpisodeFile={handleDeleteEpisodeFile}
          />
        </TableBody>
      </Table>
    </div>
  );
}

export default EpisodeDownloadedFiles;
