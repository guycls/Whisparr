import Box from '@mui/material/Box';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { icons, kinds } from 'Helpers/Props';
import { deleteRootFolder } from 'Store/Actions/rootFolderActions';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';

interface RootFolderRowProps {
  id: number;
  path: string;
  accessible: boolean;
  freeSpace?: number;
  unmappedFolders: object[];
}

function RootFolderRow(props: RootFolderRowProps) {
  const { id, path, accessible, freeSpace = 0, unmappedFolders = [] } = props;

  const isUnavailable = !accessible;

  const dispatch = useDispatch();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDeletePress = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, [setIsDeleteModalOpen]);

  const onConfirmDelete = useCallback(() => {
    dispatch(deleteRootFolder({ id }));

    setIsDeleteModalOpen(false);
  }, [dispatch, id]);

  return (
    <TableRow>
      <TableRowCell>
        {isUnavailable ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {path}

            <Box sx={{ ml: '10px' }}>
              <Label kind={kinds.DANGER}>{translate('Unavailable')}</Label>
            </Box>
          </Box>
        ) : (
          <Link to={`/add/import/${id}`}>{path}</Link>
        )}
      </TableRowCell>

      <TableRowCell sx={{ width: 150 }}>
        {isUnavailable || isNaN(Number(freeSpace))
          ? '-'
          : formatBytes(freeSpace)}
      </TableRowCell>

      <TableRowCell sx={{ width: 150 }}>
        {isUnavailable ? '-' : unmappedFolders.length}
      </TableRowCell>

      <TableRowCell sx={{ width: 45 }}>
        <IconButton
          title={translate('RemoveRootFolder')}
          name={icons.REMOVE}
          onPress={onDeletePress}
        />
      </TableRowCell>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteRootFolder')}
        message={translate('DeleteRootFolderMessageText', { path })}
        confirmLabel={translate('Delete')}
        onConfirm={onConfirmDelete}
        onCancel={onDeleteModalClose}
      />
    </TableRow>
  );
}

export default RootFolderRow;
