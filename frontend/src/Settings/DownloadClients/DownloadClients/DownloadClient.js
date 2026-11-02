import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditDownloadClientModalConnector from './EditDownloadClientModalConnector';

class DownloadClient extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditDownloadClientModalOpen: false,
      isDeleteDownloadClientModalOpen: false
    };
  }

  //
  // Listeners

  onEditDownloadClientPress = () => {
    this.setState({ isEditDownloadClientModalOpen: true });
  };

  onEditDownloadClientModalClose = () => {
    this.setState({ isEditDownloadClientModalOpen: false });
  };

  onDeleteDownloadClientPress = () => {
    this.setState({
      isEditDownloadClientModalOpen: false,
      isDeleteDownloadClientModalOpen: true
    });
  };

  onDeleteDownloadClientModalClose= () => {
    this.setState({ isDeleteDownloadClientModalOpen: false });
  };

  onConfirmDeleteDownloadClient = () => {
    this.props.onConfirmDeleteDownloadClient(this.props.id);
  };

  //
  // Render

  render() {
    const {
      id,
      name,
      enable,
      priority,
      tags,
      tagList
    } = this.props;

    return (
      <Box
        sx={(theme) => ({
          width: 290,
          m: theme.spacing(1.25)
        })}
      >
        <Card
          overlayContent={true}
          onPress={this.onEditDownloadClientPress}
        >
          <Box sx={(theme) => ({ p: theme.spacing(1.25) })}>
            <Typography
              sx={(theme) => ({
                mb: theme.spacing(2.5),
                fontWeight: 300,
                fontSize: 24,
                overflow: 'hidden',
                maxWidth: '100%',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              })}
            >
              {name}
            </Typography>

            <Box
              sx={(theme) => ({
                display: 'flex',
                flexWrap: 'wrap',
                mt: theme.spacing(0.625)
              })}
            >
          {
            enable ?
              <Label kind={kinds.SUCCESS}>
                {translate('Enabled')}
              </Label> :
              <Label
                kind={kinds.DISABLED}
                outline={true}
              >
                {translate('Disabled')}
              </Label>
          }

          {
            priority > 1 &&
              <Label
                kind={kinds.DISABLED}
                outline={true}
              >
                {translate('PrioritySettings', { priority })}
              </Label>
          }
            </Box>

            <TagList
          tags={tags}
          tagList={tagList}
        />

        <EditDownloadClientModalConnector
          id={id}
          isOpen={this.state.isEditDownloadClientModalOpen}
          onModalClose={this.onEditDownloadClientModalClose}
          onDeleteDownloadClientPress={this.onDeleteDownloadClientPress}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteDownloadClientModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteDownloadClient')}
          message={translate('DeleteDownloadClientMessageText', { name })}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeleteDownloadClient}
          onCancel={this.onDeleteDownloadClientModalClose}
        />
          </Box>
        </Card>
      </Box>
    );
  }
}

DownloadClient.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  enable: PropTypes.bool.isRequired,
  priority: PropTypes.number.isRequired,
  tags: PropTypes.arrayOf(PropTypes.number).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteDownloadClient: PropTypes.func.isRequired
};

export default DownloadClient;
