import React from 'react';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import EpisodeSearchActions from 'Episode/EpisodeSearchActions';
import { EpisodeEntities } from 'Episode/useEpisode';
interface EpisodeSearchCellProps {
  episodeId: number;
  episodeEntity: EpisodeEntities;
  seriesId: number;
  episodeTitle: string;
}

function EpisodeSearchCell(props: EpisodeSearchCellProps) {
  const { episodeId, episodeEntity, seriesId, episodeTitle } = props;

  return (
    <TableRowCell sx={{ width: 70, whiteSpace: 'nowrap' }}>
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
