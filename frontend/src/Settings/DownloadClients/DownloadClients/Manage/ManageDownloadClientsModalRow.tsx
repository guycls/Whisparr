import React, { useCallback } from 'react';
import Label from 'Components/Label';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableSelectCell from 'Components/Table/Cells/TableSelectCell';
import Column from 'Components/Table/Column';
import TableRow from 'Components/Table/TableRow';
import TagListConnector from 'Components/TagListConnector';
import { kinds } from 'Helpers/Props';
import { SelectStateInputProps } from 'typings/props';
import translate from 'Utilities/String/translate';

interface ManageDownloadClientsModalRowProps {
  id: number;
  name: string;
  enable: boolean;
  priority: number;
  removeCompletedDownloads: boolean;
  removeFailedDownloads: boolean;
  implementation: string;
  tags: number[];
  columns: Column[];
  isSelected?: boolean;
  onSelectedChange(result: SelectStateInputProps): void;
}

function ManageDownloadClientsModalRow(
  props: ManageDownloadClientsModalRowProps
) {
  const {
    id,
    isSelected,
    name,
    enable,
    priority,
    removeCompletedDownloads,
    removeFailedDownloads,
    implementation,
    tags,
    onSelectedChange,
  } = props;

  const onSelectedChangeWrapper = useCallback(
    (result: SelectStateInputProps) => {
      onSelectedChange({
        ...result,
      });
    },
    [onSelectedChange]
  );

  return (
    <TableRow>
      <TableSelectCell
        id={id}
        isSelected={isSelected}
        onSelectedChange={onSelectedChangeWrapper}
      />

      <TableRowCell sx={{ wordBreak: 'break-all' }}>{name}</TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>
        {implementation}
      </TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>
        <Label kind={enable ? kinds.SUCCESS : kinds.DISABLED} outline={!enable}>
          {enable ? translate('Yes') : translate('No')}
        </Label>
      </TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>{priority}</TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>
        {removeCompletedDownloads ? translate('Yes') : translate('No')}
      </TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>
        {removeFailedDownloads ? translate('Yes') : translate('No')}
      </TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>
        <TagListConnector tags={tags} />
      </TableRowCell>
    </TableRow>
  );
}

export default ManageDownloadClientsModalRow;
