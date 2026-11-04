import React, { useCallback } from 'react';
import { useSelect } from 'App/SelectContext';
import CheckInput from 'Components/Form/CheckInput';
import TableRowCell from 'Components/Table/Cells/TableRowCell';

interface EpisodeSelectCellProps {
  id: number;
}

function EpisodeSelectCell(props: EpisodeSelectCellProps) {
  const { id } = props;
  const [selectState, selectDispatch] = useSelect();
  const isSelected = !!selectState.selectedState[id];

  const onChange = useCallback(
    ({ value, shiftKey }: { value: boolean; shiftKey?: boolean }) => {
      selectDispatch({
        type: 'toggleSelected',
        id,
        isSelected: value,
        shiftKey: !!shiftKey,
      });
    },
    [id, selectDispatch]
  );

  return (
    <TableRowCell sx={{ width: 30 }}>
      <CheckInput name={id.toString()} value={isSelected} onChange={onChange} />
    </TableRowCell>
  );
}

export default EpisodeSelectCell;
