import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';

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

const typeBorderColor = {
  error: 'var(--dangerColor)',
  info: 'var(--infoColor)',
  success: 'var(--successColor)',
  warning: 'var(--warningColor)'
};

function Message(props) {
  const {
    name,
    message,
    type
  } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        borderLeft: `3px solid ${typeBorderColor[type] || 'var(--infoColor)'}`
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          flex: '0 0 25px',
          ml: '24px',
          py: '10px',
          color: 'var(--sidebarColor)'
        }}
      >
        <Icon
          name={getIconName(name)}
          title={name}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          py: '2px',
          mr: '24px',
          color: 'var(--sidebarColor)',
          fontSize: 13
        }}
      >
        {message}
      </Box>
    </Box>
  );
}

Message.propTypes = {
  name: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
};

export default Message;
