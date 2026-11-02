import Box from '@mui/material/Box';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MiddleTruncate from 'react-middle-truncate';
import Card from 'Components/Card';
import Label from 'Components/Label';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditReleaseProfileModalConnector from './EditReleaseProfileModalConnector';

const sxReleaseProfile = (theme) => ({
  width: 290,
  m: theme.spacing(1.25)
});

const sxName = (theme) => ({
  mb: theme.spacing(2.5),
  fontWeight: 300,
  fontSize: 24,
  overflow: 'hidden',
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

const sxLabel = {
  maxWidth: '100%'
};

class ReleaseProfile extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditReleaseProfileModalOpen: false,
      isDeleteReleaseProfileModalOpen: false
    };
  }

  //
  // Listeners

  onEditReleaseProfilePress = () => {
    this.setState({ isEditReleaseProfileModalOpen: true });
  };

  onEditReleaseProfileModalClose = () => {
    this.setState({ isEditReleaseProfileModalOpen: false });
  };

  onDeleteReleaseProfilePress = () => {
    this.setState({
      isEditReleaseProfileModalOpen: false,
      isDeleteReleaseProfileModalOpen: true
    });
  };

  onDeleteReleaseProfileModalClose= () => {
    this.setState({ isDeleteReleaseProfileModalOpen: false });
  };

  onConfirmDeleteReleaseProfile = () => {
    this.props.onConfirmDeleteReleaseProfile(this.props.id);
  };

  //
  // Render

  render() {
    const {
      id,
      name,
      enabled,
      required,
      ignored,
      tags,
      indexerId,
      tagList,
      indexerList
    } = this.props;

    const {
      isEditReleaseProfileModalOpen,
      isDeleteReleaseProfileModalOpen
    } = this.state;

    const indexer = indexerId !== 0 && _.find(indexerList, { id: indexerId });

    return (
      <Box sx={sxReleaseProfile}>
<Card
        overlayContent={true}
        onPress={this.onEditReleaseProfilePress}
      >
        {
          name ?
            <Box sx={sxName}>
              {name}
            </Box> :
            null
        }

        <div>
          {
            required.map((item) => {
              if (!item) {
                return null;
              }

              return (
                <Box sx={sxLabel}>
<Label
                  key={item}
                  kind={kinds.SUCCESS}
                >
                  <MiddleTruncate
                    text={item}
                    start={10}
                    end={10}
                  />
                </Label>
</Box>
              );
            })
          }
        </div>

        <div>
          {
            ignored.map((item) => {
              if (!item) {
                return null;
              }

              return (
                <Box sx={sxLabel}>
<Label
                  key={item}
                  kind={kinds.DANGER}
                >
                  <MiddleTruncate
                    text={item}
                    start={10}
                    end={10}
                  />
                </Label>
</Box>
              );
            })
          }
        </div>

        <TagList
          tags={tags}
          tagList={tagList}
        />

        <div>
          {
            !enabled &&
              <Label
                kind={kinds.DISABLED}
                outline={true}
              >
                {translate('Disabled')}
              </Label>
          }

          {
            indexer &&
              <Label
                kind={kinds.INFO}
                outline={true}
              >
                {indexer.name}
              </Label>
          }
        </div>

        <EditReleaseProfileModalConnector
          id={id}
          isOpen={isEditReleaseProfileModalOpen}
          onModalClose={this.onEditReleaseProfileModalClose}
          onDeleteReleaseProfilePress={this.onDeleteReleaseProfilePress}
        />

        <ConfirmModal
          isOpen={isDeleteReleaseProfileModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteReleaseProfile')}
          message={translate('DeleteReleaseProfileMessageText', { name })}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeleteReleaseProfile}
          onCancel={this.onDeleteReleaseProfileModalClose}
        />
      </Card>
</Box>
    );
  }
}

ReleaseProfile.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string,
  enabled: PropTypes.bool.isRequired,
  required: PropTypes.arrayOf(PropTypes.string).isRequired,
  ignored: PropTypes.arrayOf(PropTypes.string).isRequired,
  tags: PropTypes.arrayOf(PropTypes.number).isRequired,
  indexerId: PropTypes.number.isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  indexerList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteReleaseProfile: PropTypes.func.isRequired
};

ReleaseProfile.defaultProps = {
  enabled: true,
  required: [],
  ignored: [],
  indexerId: 0
};

export default ReleaseProfile;
