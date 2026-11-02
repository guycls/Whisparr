import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditRemotePathMappingModalConnector from './EditRemotePathMappingModalConnector';

const sxRemotePathMapping = (theme) => ({
  display: 'flex',
  alignItems: 'stretch',
  mb: theme.spacing(1.25),
  height: 30,
  borderBottom: `1px solid ${theme.palette.divider}`,
  lineHeight: 30
});

const sxHost = {
  flex: '0 1 300px'
};

const sxPath = {
  flex: '0 1 400px'
};

const sxActions = (theme) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  flex: '1 0 auto',
  pr: theme.spacing(1.25)
});

class RemotePathMapping extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditRemotePathMappingModalOpen: false,
      isDeleteRemotePathMappingModalOpen: false
    };
  }

  //
  // Listeners

  onEditRemotePathMappingPress = () => {
    this.setState({ isEditRemotePathMappingModalOpen: true });
  };

  onEditRemotePathMappingModalClose = () => {
    this.setState({ isEditRemotePathMappingModalOpen: false });
  };

  onDeleteRemotePathMappingPress = () => {
    this.setState({
      isEditRemotePathMappingModalOpen: false,
      isDeleteRemotePathMappingModalOpen: true
    });
  };

  onDeleteRemotePathMappingModalClose = () => {
    this.setState({ isDeleteRemotePathMappingModalOpen: false });
  };

  onConfirmDeleteRemotePathMapping = () => {
    this.props.onConfirmDeleteRemotePathMapping(this.props.id);
  };

  //
  // Render

  render() {
    const {
      id,
      host,
      remotePath,
      localPath
    } = this.props;

    return (
      <Box
       sx={sxRemotePathMapping}>
        <Box sx={sxHost}>{host}</Box>
        <Box sx={sxPath}>{remotePath}</Box>
        <Box sx={sxPath}>{localPath}</Box>

        <Box sx={sxActions}>
          <Link
            onPress={this.onEditRemotePathMappingPress}
          >
            <Icon name={icons.EDIT} />
          </Link>
        </Box>

        <EditRemotePathMappingModalConnector
          id={id}
          isOpen={this.state.isEditRemotePathMappingModalOpen}
          onModalClose={this.onEditRemotePathMappingModalClose}
          onDeleteRemotePathMappingPress={this.onDeleteRemotePathMappingPress}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteRemotePathMappingModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteRemotePathMapping')}
          message={translate('DeleteRemotePathMappingMessageText')}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeleteRemotePathMapping}
          onCancel={this.onDeleteRemotePathMappingModalClose}
        />
      </Box>
    );
  }
}

RemotePathMapping.propTypes = {
  id: PropTypes.number.isRequired,
  host: PropTypes.string.isRequired,
  remotePath: PropTypes.string.isRequired,
  localPath: PropTypes.string.isRequired,
  onConfirmDeleteRemotePathMapping: PropTypes.func.isRequired
};

RemotePathMapping.defaultProps = {
  // The drag preview will not connect the drag handle.
  connectDragSource: (node) => node
};

export default RemotePathMapping;
