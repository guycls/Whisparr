import PropTypes from 'prop-types';
import React from 'react';
import MessageConnector from './MessageConnector';

function Messages({ messages }) {
  return (
    <>
      {
        messages.map((message, index) => {
          return (
            <MessageConnector
              key={message.id}
              index={index}
              {...message}
            />
          );
        })
      }
    </>
  );
}

Messages.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Messages;
