import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import AddDownloadClientModal from './AddDownloadClientModal';
import DownloadClient from './DownloadClient';
import EditDownloadClientModalConnector from './EditDownloadClientModalConnector';

class DownloadClients extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddDownloadClientModalOpen: false,
      isEditDownloadClientModalOpen: false
    };
  }

  //
  // Listeners

  onAddDownloadClientPress = () => {
    this.setState({ isAddDownloadClientModalOpen: true });
  };

  onAddDownloadClientModalClose = ({ downloadClientSelected = false } = {}) => {
    this.setState({
      isAddDownloadClientModalOpen: false,
      isEditDownloadClientModalOpen: downloadClientSelected
    });
  };

  onEditDownloadClientModalClose = () => {
    this.setState({ isEditDownloadClientModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      items,
      onConfirmDeleteDownloadClient,
      tagList,
      ...otherProps
    } = this.props;

    const {
      isAddDownloadClientModalOpen,
      isEditDownloadClientModalOpen
    } = this.state;

    return (
      <FieldSet legend={translate('DownloadClients')}>
        <PageSectionContent
          errorMessage={translate('DownloadClientsLoadError')}
          {...otherProps}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {
              items.map((item) => {
                return (
                  <DownloadClient
                    key={item.id}
                    {...item}
                    tagList={tagList}
                    onConfirmDeleteDownloadClient={onConfirmDeleteDownloadClient}
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
                onPress={this.onAddDownloadClientPress}
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

          <AddDownloadClientModal
            isOpen={isAddDownloadClientModalOpen}
            onModalClose={this.onAddDownloadClientModalClose}
          />

          <EditDownloadClientModalConnector
            isOpen={isEditDownloadClientModalOpen}
            onModalClose={this.onEditDownloadClientModalClose}
          />
        </PageSectionContent>
      </FieldSet>
    );
  }
}

DownloadClients.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteDownloadClient: PropTypes.func.isRequired
};

export default DownloadClients;
