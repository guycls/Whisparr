import Box from '@mui/material/Box';
import List from '@mui/material/List';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from 'Components/Alert';
import PathInput from 'Components/Form/PathInput';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Scroller from 'Components/Scroller/Scroller';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { kinds, scrollDirections } from 'Helpers/Props';
import { clearPaths, fetchPaths } from 'Store/Actions/pathActions';
import createSystemStatusSelector from 'Store/Selectors/createSystemStatusSelector';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import createPathsSelector from './createPathsSelector';
import FileBrowserRow from './FileBrowserRow';

export interface FileBrowserModalContentProps {
  name: string;
  value: string;
  includeFiles?: boolean;
  onChange: (args: InputChanged<string>) => unknown;
  onModalClose: () => void;
}

function FileBrowserModalContent(props: FileBrowserModalContentProps) {
  const { name, value, includeFiles = true, onChange, onModalClose } = props;

  const dispatch = useDispatch();

  const { isWindows, mode } = useSelector(createSystemStatusSelector());
  const { isFetching, isPopulated, error, parent, directories, files, paths } =
    useSelector(createPathsSelector());

  const [currentPath, setCurrentPath] = useState(value);
  const scrollerRef = useRef(null);
  const previousValue = usePrevious(value);

  const emptyParent = parent === '';
  const isWindowsService = isWindows && mode === 'service';

  const handleClearPaths = useCallback(() => {
    dispatch(clearPaths());
  }, [dispatch]);

  const handlePathInputChange = useCallback(
    ({ value }: InputChanged<string>) => {
      setCurrentPath(value);
    },
    []
  );

  const handleRowPress = useCallback(
    (path: string) => {
      setCurrentPath(path);

      dispatch(
        fetchPaths({
          path,
          allowFoldersWithoutTrailingSlashes: true,
          includeFiles,
        })
      );
    },
    [includeFiles, dispatch, setCurrentPath]
  );

  const handleOkPress = useCallback(() => {
    onChange({
      name,
      value: currentPath,
    });

    dispatch(clearPaths());
    onModalClose();
  }, [name, currentPath, dispatch, onChange, onModalClose]);

  const handleFetchPaths = useCallback(
    (path: string) => {
      dispatch(
        fetchPaths({
          path,
          allowFoldersWithoutTrailingSlashes: true,
          includeFiles,
        })
      );
    },
    [includeFiles, dispatch]
  );

  useEffect(() => {
    if (value !== previousValue && value !== currentPath) {
      setCurrentPath(value);
    }
  }, [value, previousValue, currentPath, setCurrentPath]);

  useEffect(
    () => {
      dispatch(
        fetchPaths({
          path: currentPath,
          allowFoldersWithoutTrailingSlashes: true,
          includeFiles,
        })
      );

      return () => {
        dispatch(clearPaths());
      };
    },
    // This should only run once when the component mounts,
    // so we don't need to include the other dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('FileBrowser')}</ModalHeader>

      <ModalBody scrollDirection={scrollDirections.NONE}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {isWindowsService ? (
          <Alert kind={kinds.WARNING}>
            <InlineMarkdown
              data={translate('MappedNetworkDrivesWindowsService', {
                url: 'https://wiki.servarr.com/whisparr/faq#why-can-whisparr-not-see-my-files-on-a-remote-server',
              })}
            />
          </Alert>
        ) : null}

        <PathInput
          placeholder={translate('FileBrowserPlaceholderText')}
          hasFileBrowser={false}
          includeFiles={includeFiles}
          paths={paths}
          name={name}
          value={currentPath}
          onChange={handlePathInputChange}
          onFetchPaths={handleFetchPaths}
          onClearPaths={handleClearPaths}
        />

        <Scroller
          ref={scrollerRef}
          sx={{ mt: '20px' }}
          scrollDirection="both"
        >
          {error ? <Alert kind={kinds.DANGER}>{translate('ErrorLoadingContents')}</Alert> : null}

          {isPopulated && !error ? (
            <List disablePadding={true}>
                {emptyParent ? (
                  <FileBrowserRow
                    type="computer"
                    name={translate('MyComputer')}
                    path={parent}
                    onPress={handleRowPress}
                  />
                ) : null}

                {!emptyParent && parent ? (
                  <FileBrowserRow
                    type="parent"
                    name="..."
                    path={parent}
                    onPress={handleRowPress}
                  />
                ) : null}

                {directories.map((directory) => {
                  return (
                    <FileBrowserRow
                      key={directory.path}
                      type={directory.type}
                      name={directory.name}
                      path={directory.path}
                      onPress={handleRowPress}
                    />
                  );
                })}

                {files.map((file) => {
                  return (
                    <FileBrowserRow
                      key={file.path}
                      type={file.type}
                      name={file.name}
                      path={file.path}
                      onPress={handleRowPress}
                    />
                  );
                })}
            </List>
          ) : null}
        </Scroller>
        </Box>
      </ModalBody>

      <ModalFooter>
        {isFetching ? (
          <Box sx={{ display: 'inline-block', mr: 'auto' }}>
            <LoadingIndicator size={20} />
          </Box>
        ) : null}

        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <Button onPress={handleOkPress}>{translate('Ok')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default FileBrowserModalContent;
