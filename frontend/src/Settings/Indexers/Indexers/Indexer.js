import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditIndexerModalConnector from './EditIndexerModalConnector';

class Indexer extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditIndexerModalOpen: false,
      isDeleteIndexerModalOpen: false
    };
  }

  //
  // Listeners

  onEditIndexerPress = () => {
    this.setState({ isEditIndexerModalOpen: true });
  };

  onEditIndexerModalClose = () => {
    this.setState({ isEditIndexerModalOpen: false });
  };

  onDeleteIndexerPress = () => {
    this.setState({
      isEditIndexerModalOpen: false,
      isDeleteIndexerModalOpen: true
    });
  };

  onDeleteIndexerModalClose= () => {
    this.setState({ isDeleteIndexerModalOpen: false });
  };

  onConfirmDeleteIndexer = () => {
    this.props.onConfirmDeleteIndexer(this.props.id);
  };

  onCloneIndexerPress = () => {
    const {
      id,
      onCloneIndexerPress
    } = this.props;

    onCloneIndexerPress(id);
  };

  //
  // Render

  render() {
    const {
      id,
      name,
      enableRss,
      enableAutomaticSearch,
      enableInteractiveSearch,
      tags,
      tagList,
      supportsRss,
      supportsSearch,
      priority,
      showPriority
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
          onPress={this.onEditIndexerPress}
        >
          <Box sx={(theme) => ({ p: theme.spacing(1.25) })}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                sx={(theme) => ({
                  mb: theme.spacing(2.5),
                  fontWeight: 300,
                  fontSize: 24,
                  overflow: 'hidden',
                  maxWidth: '100%',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0
                })}
              >
                {name}
              </Typography>

              <IconButton
                sx={{ height: 36 }}
                title={translate('CloneIndexer')}
                name={icons.CLONE}
                onPress={this.onCloneIndexerPress}
              />
            </Box>

            <Box
              sx={(theme) => ({
                display: 'flex',
                flexWrap: 'wrap',
                mt: theme.spacing(0.625)
              })}
            >

          {
            supportsRss && enableRss &&
              <Label kind={kinds.SUCCESS}>
                {translate('Rss')}
              </Label>
          }

          {
            supportsSearch && enableAutomaticSearch &&
              <Label kind={kinds.SUCCESS}>
                {translate('AutomaticSearch')}
              </Label>
          }

          {
            supportsSearch && enableInteractiveSearch &&
              <Label kind={kinds.SUCCESS}>
                {translate('InteractiveSearch')}
              </Label>
          }

          {
            showPriority &&
              <Label kind={kinds.DEFAULT}>
                {translate('Priority')}: {priority}
              </Label>
          }
          {
            !enableRss && !enableAutomaticSearch && !enableInteractiveSearch &&
              <Label
                kind={kinds.DISABLED}
                outline={true}
              >
                {translate('Disabled')}
              </Label>
          }
            </Box>

            <TagList
          tags={tags}
          tagList={tagList}
        />

        <EditIndexerModalConnector
          id={id}
          isOpen={this.state.isEditIndexerModalOpen}
          onModalClose={this.onEditIndexerModalClose}
          onDeleteIndexerPress={this.onDeleteIndexerPress}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteIndexerModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteIndexer')}
          message={translate('DeleteIndexerMessageText', { name })}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeleteIndexer}
          onCancel={this.onDeleteIndexerModalClose}
        />
          </Box>
        </Card>
      </Box>
    );
  }
}

Indexer.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  priority: PropTypes.number.isRequired,
  enableRss: PropTypes.bool.isRequired,
  enableAutomaticSearch: PropTypes.bool.isRequired,
  enableInteractiveSearch: PropTypes.bool.isRequired,
  tags: PropTypes.arrayOf(PropTypes.number).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  supportsRss: PropTypes.bool.isRequired,
  supportsSearch: PropTypes.bool.isRequired,
  showPriority: PropTypes.bool.isRequired,
  onCloneIndexerPress: PropTypes.func.isRequired,
  onConfirmDeleteIndexer: PropTypes.func.isRequired
};

export default Indexer;
