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

interface ManageIndexersModalRowProps {
  id: number;
  name: string;
  enableRss: boolean;
  enableAutomaticSearch: boolean;
  enableInteractiveSearch: boolean;
  priority: number;
  implementation: string;
  tags: number[];
  columns: Column[];
  isSelected?: boolean;
  onSelectedChange(result: SelectStateInputProps): void;
}

function ManageIndexersModalRow(props: ManageIndexersModalRowProps) {
  const {
    id,
    isSelected,
    name,
    enableRss,
    enableAutomaticSearch,
    enableInteractiveSearch,
    priority,
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
        <Label
          kind={enableRss ? kinds.SUCCESS : kinds.DISABLED}
          outline={!enableRss}
        >
          {enableRss ? translate('Yes') : translate('No')}
        </Label>
      </TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>
        <Label
          kind={enableAutomaticSearch ? kinds.SUCCESS : kinds.DISABLED}
          outline={!enableAutomaticSearch}
        >
          {enableAutomaticSearch ? translate('Yes') : translate('No')}
        </Label>
      </TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>
        <Label
          kind={enableInteractiveSearch ? kinds.SUCCESS : kinds.DISABLED}
          outline={!enableInteractiveSearch}
        >
          {enableInteractiveSearch ? translate('Yes') : translate('No')}
        </Label>
      </TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>{priority}</TableRowCell>

      <TableRowCell sx={{ wordBreak: 'break-all' }}>
        <TagListConnector tags={tags} />
      </TableRowCell>
    </TableRow>
  );
}

export default ManageIndexersModalRow;
