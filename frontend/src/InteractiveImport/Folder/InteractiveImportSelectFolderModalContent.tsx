import Box from '@mui/material/Box';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import * as commandNames from 'Commands/commandNames';
import PathInputConnector from 'Components/Form/PathInputConnector';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { icons, kinds, sizes } from 'Helpers/Props';
import { executeCommand } from 'Store/Actions/commandActions';
import {
  addRecentFolder,
  removeRecentFolder,
} from 'Store/Actions/interactiveImportActions';
import translate from 'Utilities/String/translate';
import RecentFolderRow from './RecentFolderRow';

const recentFoldersColumns = [
  {
    name: 'folder',
    label: () => translate('Folder'),
  },
  {
    name: 'lastUsed',
    label: () => translate('LastUsed'),
  },
  {
    name: 'actions',
    label: '',
  },
];

interface InteractiveImportSelectFolderModalContentProps {
  modalTitle: string;
  onFolderSelect(folder: string): void;
  onModalClose(): void;
}

function InteractiveImportSelectFolderModalContent(
  props: InteractiveImportSelectFolderModalContentProps
) {
  const { modalTitle, onFolderSelect, onModalClose } = props;
  const [folder, setFolder] = useState('');
  const dispatch = useDispatch();
  const recentFolders = useSelector(
    createSelector(
      (state: AppState) => state.interactiveImport.recentFolders,
      (recentFolders) => {
        return recentFolders;
      }
    )
  );

  const onPathChange = useCallback(
    ({ value }: { value: string }) => {
      setFolder(value);
    },
    [setFolder]
  );

  const onRecentPathPress = useCallback(
    (value: string) => {
      setFolder(value);
    },
    [setFolder]
  );

  const onQuickImportPress = useCallback(() => {
    dispatch(addRecentFolder({ folder }));

    dispatch(
      executeCommand({
        name: commandNames.DOWNLOADED_EPSIODES_SCAN,
        path: folder,
      })
    );

    onModalClose();
  }, [folder, onModalClose, dispatch]);

  const onInteractiveImportPress = useCallback(() => {
    dispatch(addRecentFolder({ folder }));
    onFolderSelect(folder);
  }, [folder, onFolderSelect, dispatch]);

  const onRemoveRecentFolderPress = useCallback(
    (folderToRemove: string) => {
      dispatch(removeRecentFolder({ folder: folderToRemove }));
    },
    [dispatch]
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('SelectFolderModalTitle', { modalTitle })}
      </ModalHeader>

      <ModalBody>
        <PathInputConnector
          name="folder"
          value={folder}
          onChange={onPathChange}
        />

        {recentFolders.length ? (
          <Box sx={{ mt: '15px' }}>
            <Table columns={recentFoldersColumns}>
              <TableBody>
                {recentFolders
                  .slice(0)
                  .reverse()
                  .map((recentFolder) => {
                    return (
                      <RecentFolderRow
                        key={recentFolder.folder}
                        folder={recentFolder.folder}
                        lastUsed={recentFolder.lastUsed}
                        onPress={onRecentPathPress}
                        onRemoveRecentFolderPress={onRemoveRecentFolderPress}
                      />
                    );
                  })}
              </TableBody>
            </Table>
          </Box>
        ) : null}

        <Box sx={{ mt: '30px' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: '10px',
              '& .MuiButton-root': { width: 300 },
            }}
          >
            <Button
              kind={kinds.PRIMARY}
              size={sizes.LARGE}
              isDisabled={!folder}
              onPress={onQuickImportPress}
            >
              <Box component="span" sx={{ mr: '5px', display: 'inline-flex' }}>
                <Icon name={icons.QUICK} />
              </Box>
              {translate('MoveAutomatically')}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: '10px',
              '& .MuiButton-root': { width: 300 },
            }}
          >
            <Button
              kind={kinds.PRIMARY}
              size={sizes.LARGE}
              isDisabled={!folder}
              onPress={onInteractiveImportPress}
            >
              <Box component="span" sx={{ mr: '5px', display: 'inline-flex' }}>
                <Icon name={icons.INTERACTIVE} />
              </Box>
              {translate('InteractiveImport')}
            </Button>
          </Box>
        </Box>
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Cancel')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default InteractiveImportSelectFolderModalContent;
