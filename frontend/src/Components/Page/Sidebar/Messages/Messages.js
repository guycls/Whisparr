import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import MessageConnector from './MessageConnector';

function Messages({ messages }) {
  return (
    <Box
      sx={{
        mt: 'auto',
        mb: '20px',
        pt: '20px',
        '@media (max-width: 768px)': {
          mb: 0
        }
      }}
    >
      {
        messages.map((message) => {
          return (
            <MessageConnector
              key={message.id}
              {...message}
            />
          );
        })
      }
    </Box>
  );
}

Messages.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Messages;
