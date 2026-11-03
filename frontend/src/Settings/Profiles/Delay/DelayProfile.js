import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import { icons, kinds } from 'Helpers/Props';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import EditDelayProfileModalConnector from './EditDelayProfileModalConnector';

const sxDelayProfile = (theme) => ({
  display: 'flex',
  alignItems: 'stretch',
  mb: theme.spacing(1.25),
  height: 30,
  borderBottom: `1px solid ${theme.palette.divider}`,
  lineHeight: 30
});

const sxColumn = {
  flex: '0 0 200px'
};

const sxActions = {
  display: 'flex'
};

const sxDragHandle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  ml: 'auto',
  width: 40,
  textAlign: 'center',
  cursor: 'grab'
};

const sxDragIcon = {
  top: '0'
};

const sxIsDragging = {
  opacity: 0.25
};

const sxEditButton = {
  width: 40,
  textAlign: 'center'
};

function getDelay(enabled, delay) {
  if (!enabled) {
    return '-';
  }

  if (!delay) {
    return translate('NoDelay');
  }

  if (delay === 1) {
    return translate('OneMinute');
  }

  // TODO: use better units of time than just minutes
  return translate('DelayMinutes', { delay });
}

class DelayProfile extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditDelayProfileModalOpen: false,
      isDeleteDelayProfileModalOpen: false
    };
  }

  //
  // Listeners

  onEditDelayProfilePress = () => {
    this.setState({ isEditDelayProfileModalOpen: true });
  };

  onEditDelayProfileModalClose = () => {
    this.setState({ isEditDelayProfileModalOpen: false });
  };

  onDeleteDelayProfilePress = () => {
    this.setState({
      isEditDelayProfileModalOpen: false,
      isDeleteDelayProfileModalOpen: true
    });
  };

  onDeleteDelayProfileModalClose = () => {
    this.setState({ isDeleteDelayProfileModalOpen: false });
  };

  onConfirmDeleteDelayProfile = () => {
    this.props.onConfirmDeleteDelayProfile(this.props.id);
  };

  //
  // Render

  render() {
    const {
      id,
      enableUsenet,
      enableTorrent,
      preferredProtocol,
      usenetDelay,
      torrentDelay,
      tags,
      tagList,
      isDragging,
      connectDragSource
    } = this.props;

    let preferred = titleCase(translate('PreferProtocol', { preferredProtocol }));

    if (!enableUsenet) {
      preferred = translate('OnlyTorrent');
    } else if (!enableTorrent) {
      preferred = translate('OnlyUsenet');
    }

    return (
      <Box
       sx={[sxDelayProfile, isDragging && sxIsDragging]}>
        <Box sx={sxColumn}>{preferred}</Box>
        <Box sx={sxColumn}>{getDelay(enableUsenet, usenetDelay)}</Box>
        <Box sx={sxColumn}>{getDelay(enableTorrent, torrentDelay)}</Box>

        <TagList
          tags={tags}
          tagList={tagList}
        />

        <Box sx={sxActions}>
          <Box sx={[id === 1 && sxEditButton]}>
<Link
            onPress={this.onEditDelayProfilePress}
          >
            <Icon name={icons.EDIT} />
          </Link>
</Box>

          {
            id !== 1 &&
              connectDragSource(
                <div style={sxDragHandle}>
                  <Box sx={sxDragIcon}>
<Icon
                    name={icons.REORDER}
                  />
</Box>
                </div>
              )
          }
        </Box>

        <EditDelayProfileModalConnector
          id={id}
          isOpen={this.state.isEditDelayProfileModalOpen}
          onModalClose={this.onEditDelayProfileModalClose}
          onDeleteDelayProfilePress={this.onDeleteDelayProfilePress}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteDelayProfileModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteDelayProfile')}
          message={translate('DeleteDelayProfileMessageText')}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeleteDelayProfile}
          onCancel={this.onDeleteDelayProfileModalClose}
        />
      </Box>
    );
  }
}

DelayProfile.propTypes = {
  id: PropTypes.number.isRequired,
  enableUsenet: PropTypes.bool.isRequired,
  enableTorrent: PropTypes.bool.isRequired,
  preferredProtocol: PropTypes.string.isRequired,
  usenetDelay: PropTypes.number.isRequired,
  torrentDelay: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.number).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDragging: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func,
  onConfirmDeleteDelayProfile: PropTypes.func.isRequired
};

DelayProfile.defaultProps = {
  // The drag preview will not connect the drag handle.
  connectDragSource: (node) => node
};

export default DelayProfile;
