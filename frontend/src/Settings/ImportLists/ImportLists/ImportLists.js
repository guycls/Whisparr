import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import sortByName from 'Utilities/Array/sortByName';
import translate from 'Utilities/String/translate';
import AddImportListModal from './AddImportListModal';
import EditImportListModalConnector from './EditImportListModalConnector';
import ImportList from './ImportList';

const sxLists = {
  display: 'flex',
  flexWrap: 'wrap'
};

const sxAddList = (theme) => ({
  width: 290,
  m: theme.spacing(1.25)
});

const sxAddListContent = (theme) => ({
  p: theme.spacing(1.25),
  bgcolor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
  textAlign: 'center'
});

const sxCenter = (theme) => ({
  display: 'inline-block',
  pt: theme.spacing(0.625),
  px: theme.spacing(2.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 1,
  bgcolor: theme.palette.background.paper
});

class ImportLists extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddImportListModalOpen: false,
      isEditImportListModalOpen: false
    };
  }

  //
  // Listeners

  onAddImportListPress = () => {
    this.setState({ isAddImportListModalOpen: true });
  };

  onAddImportListModalClose = ({ listSelected = false } = {}) => {
    this.setState({
      isAddImportListModalOpen: false,
      isEditImportListModalOpen: listSelected
    });
  };

  onEditImportListModalClose = () => {
    this.setState({ isEditImportListModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      items,
      onConfirmDeleteImportList,
      ...otherProps
    } = this.props;

    const {
      isAddImportListModalOpen,
      isEditImportListModalOpen
    } = this.state;

    return (
      <FieldSet legend={translate('ImportLists')} >
        <PageSectionContent
          errorMessage={translate('ImportListsLoadError')}
          {...otherProps}
        >
          <Box sx={sxLists}>
            {
              items.sort(sortByName).map((item) => {
                return (
                  <ImportList
                    key={item.id}
                    {...item}
                    onConfirmDeleteImportList={onConfirmDeleteImportList}
                  />
                );
              })
            }

            <Box sx={sxAddList}>
              <Card
                onPress={this.onAddImportListPress}
              >
                <Box sx={sxAddListContent}>
                  <Box sx={sxCenter}>
                    <Icon
                      name={icons.ADD}
                      size={45}
                    />
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>

          <AddImportListModal
            isOpen={isAddImportListModalOpen}
            onModalClose={this.onAddImportListModalClose}
          />

          <EditImportListModalConnector
            isOpen={isEditImportListModalOpen}
            onModalClose={this.onEditImportListModalClose}
          />
        </PageSectionContent>
      </FieldSet>
    );
  }
}

ImportLists.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteImportList: PropTypes.func.isRequired
};

export default ImportLists;
