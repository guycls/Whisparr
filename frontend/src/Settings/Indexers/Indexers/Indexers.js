import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import AddIndexerModal from './AddIndexerModal';
import EditIndexerModalConnector from './EditIndexerModalConnector';
import Indexer from './Indexer';

class Indexers extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddIndexerModalOpen: false,
      isEditIndexerModalOpen: false
    };
  }

  //
  // Listeners

  onAddIndexerPress = () => {
    this.setState({ isAddIndexerModalOpen: true });
  };

  onCloneIndexerPress = (id) => {
    this.props.dispatchCloneIndexer({ id });
    this.setState({ isEditIndexerModalOpen: true });
  };

  onAddIndexerModalClose = ({ indexerSelected = false } = {}) => {
    this.setState({
      isAddIndexerModalOpen: false,
      isEditIndexerModalOpen: indexerSelected
    });
  };

  onEditIndexerModalClose = () => {
    this.setState({ isEditIndexerModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      items,
      tagList,
      dispatchCloneIndexer,
      onConfirmDeleteIndexer,
      ...otherProps
    } = this.props;

    const {
      isAddIndexerModalOpen,
      isEditIndexerModalOpen
    } = this.state;

    const showPriority = items.some((index) => index.priority !== 25);

    return (
      <FieldSet legend={translate('Indexers')}>
        <PageSectionContent
          errorMessage={translate('IndexersLoadError')}
          {...otherProps}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {
              items.map((item) => {
                return (
                  <Indexer
                    key={item.id}
                    {...item}
                    tagList={tagList}
                    showPriority={showPriority}
                    onCloneIndexerPress={this.onCloneIndexerPress}
                    onConfirmDeleteIndexer={onConfirmDeleteIndexer}
                  />
                );
              })
            }

            <Box
              sx={(theme) => ({
                width: 290,
                m: theme.spacing(1.25)
              })}
            >
              <Card
                onPress={this.onAddIndexerPress}
              >
                <Box
                  sx={(theme) => ({
                    p: theme.spacing(1.25),
                    bgcolor: theme.palette.action.hover,
                    color: theme.palette.text.secondary,
                    textAlign: 'center'
                  })}
                >
                  <Box
                    sx={(theme) => ({
                      display: 'inline-block',
                      pt: theme.spacing(0.625),
                      px: theme.spacing(2.5),
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      bgcolor: theme.palette.background.paper
                    })}
                  >
                    <Icon
                      name={icons.ADD}
                      size={45}
                    />
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>

          <AddIndexerModal
            isOpen={isAddIndexerModalOpen}
            onModalClose={this.onAddIndexerModalClose}
          />

          <EditIndexerModalConnector
            isOpen={isEditIndexerModalOpen}
            onModalClose={this.onEditIndexerModalClose}
          />
        </PageSectionContent>
      </FieldSet>
    );
  }
}

Indexers.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchCloneIndexer: PropTypes.func.isRequired,
  onConfirmDeleteIndexer: PropTypes.func.isRequired
};

export default Indexers;
