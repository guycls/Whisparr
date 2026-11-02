import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { kinds } from 'Helpers/Props';
import formatShortTimeSpan from 'Utilities/Date/formatShortTimeSpan';
import translate from 'Utilities/String/translate';
import EditImportListModalConnector from './EditImportListModalConnector';

const sxList = (theme) => ({
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

const sxEnabled = (theme) => ({
  display: 'flex',
  flexWrap: 'wrap',
  mt: theme.spacing(0.625)
});

class ImportList extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditImportListModalOpen: false,
      isDeleteImportListModalOpen: false
    };
  }

  //
  // Listeners

  onEditImportListPress = () => {
    this.setState({ isEditImportListModalOpen: true });
  };

  onEditImportListModalClose = () => {
    this.setState({ isEditImportListModalOpen: false });
  };

  onDeleteImportListPress = () => {
    this.setState({
      isEditImportListModalOpen: false,
      isDeleteImportListModalOpen: true
    });
  };

  onDeleteImportListModalClose= () => {
    this.setState({ isDeleteImportListModalOpen: false });
  };

  onConfirmDeleteImportList = () => {
    this.props.onConfirmDeleteImportList(this.props.id);
  };

  //
  // Render

  render() {
    const {
      id,
      name,
      enableAutomaticAdd,
      minRefreshInterval
    } = this.props;

    return (
      <Box sx={sxList}>
<Card
        overlayContent={true}
        onPress={this.onEditImportListPress}
      >
        <Box sx={sxName}>
          {name}
        </Box>

        <Box sx={sxEnabled}>
          {
            enableAutomaticAdd &&
              <Label kind={kinds.SUCCESS}>
                {translate('AutomaticAdd')}
              </Label>
          }

        </Box>

        <Box sx={sxEnabled}>
          <Label kind={kinds.INFO} title='List Refresh Interval'>
            {`${translate('Refresh')}: ${formatShortTimeSpan(minRefreshInterval)}`}
          </Label>
        </Box>

        <EditImportListModalConnector
          id={id}
          isOpen={this.state.isEditImportListModalOpen}
          onModalClose={this.onEditImportListModalClose}
          onDeleteImportListPress={this.onDeleteImportListPress}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteImportListModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteImportList')}
          message={translate('DeleteImportListMessageText', { name })}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeleteImportList}
          onCancel={this.onDeleteImportListModalClose}
        />
      </Card>
</Box>
    );
  }
}

ImportList.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  enableAutomaticAdd: PropTypes.bool.isRequired,
  minRefreshInterval: PropTypes.string.isRequired,
  onConfirmDeleteImportList: PropTypes.func.isRequired
};

export default ImportList;
