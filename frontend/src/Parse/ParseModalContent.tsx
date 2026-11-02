import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { icons } from 'Helpers/Props';
import { clear, fetch } from 'Store/Actions/parseActions';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import ParseResult from './ParseResult';
import parseStateSelector from './parseStateSelector';

interface ParseModalContentProps {
  onModalClose: () => void;
}

function ParseModalContent(props: ParseModalContentProps) {
  const { onModalClose } = props;
  const { isFetching, error, item } = useSelector(parseStateSelector());

  const [title, setTitle] = useState('');
  const dispatch = useDispatch();

  const onInputChange = useCallback(
    ({ value }: { value: string }) => {
      const trimmedValue = value.trim();

      setTitle(value);

      if (trimmedValue === '') {
        dispatch(clear());
      } else {
        dispatch(fetch({ title: trimmedValue }));
      }
    },
    [setTitle, dispatch]
  );

  const onClearPress = useCallback(() => {
    setTitle('');
    dispatch(clear());
  }, [setTitle, dispatch]);

  useEffect(
    () => {
      return () => {
        dispatch(clear());
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('TestParsing')}</ModalHeader>

      <ModalBody>
        <Stack direction="row" sx={{ mb: '10px' }}>
          <Box
            sx={{
              width: 58,
              height: 46,
              border: '1px solid var(--inputBorderColor)',
              borderRight: 'none',
              borderRadius: '4px 0 0 4px',
              backgroundColor: 'var(--inputIconContainerBackgroundColor)',
              textAlign: 'center',
              lineHeight: '46px',
            }}
          >
            <Icon name={icons.PARSE} size={20} />
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              '& .MuiInputBase-root': {
                height: 46,
                borderRadius: 0,
                fontSize: 18,
              },
            }}
          >
            <TextInput
              name="title"
              value={title}
              placeholder="eg. Site.Title.23.02.05.Episode.Title.720p.HDTV-RlsGroup"
              autoFocus={true}
              onChange={onInputChange}
            />
          </Box>

          <Box
            sx={{
              '& .MuiButton-root': {
                height: 46,
                border: '1px solid var(--inputBorderColor)',
                borderLeft: 'none',
                borderRadius: '0 4px 4px 0',
                boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
              },
            }}
          >
            <Button onPress={onClearPress}>
              <Icon name={icons.REMOVE} size={20} />
            </Button>
          </Box>
        </Stack>

        {isFetching ? <LoadingIndicator /> : null}

        {!isFetching && !!error ? (
          <Box
            sx={{
              mt: '30px',
              textAlign: 'center',
              fontWeight: 300,
              fontSize: 16,
            }}
          >
            <Typography sx={{ mb: '10px', fontSize: 24, fontWeight: 300 }}>
              {translate('ParseModalErrorParsing')}
            </Typography>
            <div>{getErrorMessage(error)}</div>
          </Box>
        ) : null}

        {!isFetching && title && !error && !item.parsedEpisodeInfo ? (
          <Typography
            sx={{
              mt: '30px',
              textAlign: 'center',
              fontWeight: 300,
              fontSize: 16,
            }}
          >
            {translate('ParseModalUnableToParse')}
          </Typography>
        ) : null}

        {!isFetching && !error && item.parsedEpisodeInfo ? (
          <ParseResult item={item} />
        ) : null}

        {title ? null : (
          <Box
            sx={{
              mt: '30px',
              textAlign: 'center',
              fontWeight: 300,
              fontSize: 16,
            }}
          >
            <Typography sx={{ mb: '10px', fontSize: 24, fontWeight: 300 }}>
              {translate('ParseModalHelpText')}
            </Typography>
            <div>{translate('ParseModalHelpTextDetails')}</div>
          </Box>
        )}
      </ModalBody>

      <ModalFooter>
        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default ParseModalContent;
