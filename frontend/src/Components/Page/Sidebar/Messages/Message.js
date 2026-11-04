import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';

const SNACKBAR_ICON_PX = 18;
const SNACKBAR_STEP_PX = 44;

function getIconName(name) {
  switch (name) {
    case 'ApplicationUpdate':
      return icons.RESTART;
    case 'Backup':
      return icons.BACKUP;
    case 'CheckHealth':
      return icons.HEALTH;
    case 'EpisodeSearch':
      return icons.SEARCH;
    case 'Housekeeping':
      return icons.HOUSEKEEPING;
    case 'RefreshSeries':
      return icons.REFRESH;
    case 'RssSync':
      return icons.RSS;
    case 'SeasonSearch':
      return icons.SEARCH;
    case 'SeriesSearch':
      return icons.SEARCH;
    case 'UpdateSceneMapping':
      return icons.REFRESH;
    default:
      return icons.SPINNER;
  }
}

function getSeverity(type) {
  switch (type) {
    case 'error':
    case 'info':
    case 'success':
    case 'warning':
      return type;
    default:
      return 'info';
  }
}

function Message(props) {
  const {
    name,
    message,
    type,
    hideAfter,
    index,
    onClose
  } = props;

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    onClose();
  }, [onClose]);

  const bottomOffset = 24 + index * SNACKBAR_STEP_PX;

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      autoHideDuration={hideAfter > 0 ? hideAfter * 1000 : null}
      onClose={handleSnackbarClose}
      sx={{
        '&&': {
          bottom: `${bottomOffset}px`
        }
      }}
    >
      <Alert
        severity={getSeverity(type)}
        variant="filled"
        icon={(
          <Icon
            name={getIconName(name)}
            title={name}
            size={SNACKBAR_ICON_PX}
          />
        )}
        onClose={onClose}
        sx={{
          alignItems: 'center',
          py: 0,
          pl: 1.25,
          pr: 0.5,
          '& .MuiAlert-icon': {
            alignItems: 'center',
            mr: 1,
            py: 0,
            opacity: 1,
            '& span': {
              display: 'flex',
              lineHeight: 0
            }
          },
          '& .MuiAlert-message': {
            py: '6px'
          },
          '& .MuiAlert-action': {
            alignItems: 'center',
            py: 0,
            pl: 0.5,
            mr: 0
          },
          '& .MuiAlert-action .MuiIconButton-root': {
            p: 0.5
          },
          '& .MuiAlert-icon svg, & .MuiAlert-action svg': {
            fontSize: SNACKBAR_ICON_PX,
            width: SNACKBAR_ICON_PX,
            height: SNACKBAR_ICON_PX
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

Message.propTypes = {
  name: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  hideAfter: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Message;
