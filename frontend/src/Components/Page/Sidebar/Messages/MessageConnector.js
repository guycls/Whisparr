import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { hideMessage } from 'Store/Actions/appActions';
import Message from './Message';

const mapDispatchToProps = {
  hideMessage
};

class MessageConnector extends Component {

  //
  // Listeners

  onClose = () => {
    this.props.hideMessage({ id: this.props.id });
  };

  //
  // Render

  render() {
    const {
      name,
      message,
      type,
      hideAfter,
      index
    } = this.props;

    return (
      <Message
        name={name}
        message={message}
        type={type}
        hideAfter={hideAfter}
        index={index}
        onClose={this.onClose}
      />
    );
  }
}

MessageConnector.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  name: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  hideAfter: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  hideMessage: PropTypes.func.isRequired
};

export default connect(undefined, mapDispatchToProps)(MessageConnector);
