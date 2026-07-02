import React from 'react';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import EpisodeSearchActions from 'Episode/EpisodeSearchActions';
import { EpisodeEntities } from 'Episode/useEpisode';
import styles from './EpisodeSearchCell.css';

interface EpisodeSearchCellProps {
  episodeId: number;
  episodeEntity: EpisodeEntities;
  seriesId: number;
  episodeTitle: string;
}

function EpisodeSearchCell(props: EpisodeSearchCellProps) {
  const { episodeId, episodeEntity, seriesId, episodeTitle } = props;

  return (
    <TableRowCell className={styles.episodeSearchCell}>
      <EpisodeSearchActions
        episodeId={episodeId}
        episodeEntity={episodeEntity}
        seriesId={seriesId}
        episodeTitle={episodeTitle}
      />
    </TableRowCell>
  );
}

export default EpisodeSearchCell;
