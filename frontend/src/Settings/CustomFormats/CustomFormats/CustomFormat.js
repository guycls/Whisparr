import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditCustomFormatModalConnector from './EditCustomFormatModalConnector';
import ExportCustomFormatModal from './ExportCustomFormatModal';

const sxCustomFormat = (theme) => ({
  width: 300,
  m: theme.spacing(1.25)
});

const sxNameContainer = {
  display: 'flex',
  justifyContent: 'space-between'
};

const sxName = (theme) => ({
  mb: theme.spacing(2.5),
  fontWeight: 300,
  fontSize: 24,
  overflow: 'hidden',
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

const sxButtons = {
  flex: '0 0 auto'
};

const sxCloneButton = {
  height: 36
};

const sxLabel = {
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

class CustomFormat extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditCustomFormatModalOpen: false,
      isExportCustomFormatModalOpen: false,
      isDeleteCustomFormatModalOpen: false
    };
  }

  //
  // Listeners

  onEditCustomFormatPress = () => {
    this.setState({ isEditCustomFormatModalOpen: true });
  };

  onEditCustomFormatModalClose = () => {
    this.setState({ isEditCustomFormatModalOpen: false });
  };

  onExportCustomFormatPress = () => {
    this.setState({ isExportCustomFormatModalOpen: true });
  };

  onExportCustomFormatModalClose = () => {
    this.setState({ isExportCustomFormatModalOpen: false });
  };

  onDeleteCustomFormatPress = () => {
    this.setState({
      isEditCustomFormatModalOpen: false,
      isDeleteCustomFormatModalOpen: true
    });
  };

  onDeleteCustomFormatModalClose = () => {
    this.setState({ isDeleteCustomFormatModalOpen: false });
  };

  onConfirmDeleteCustomFormat = () => {
    this.props.onConfirmDeleteCustomFormat(this.props.id);
  };

  onCloneCustomFormatPress = () => {
    const {
      id,
      onCloneCustomFormatPress
    } = this.props;

    onCloneCustomFormatPress(id);
  };

  //
  // Render

  render() {
    const {
      id,
      name,
      specifications,
      isDeleting
    } = this.props;

    return (
      <Box sx={sxCustomFormat}>
<Card
        overlayContent={true}
        onPress={this.onEditCustomFormatPress}
      >
        <Box sx={sxNameContainer}>
          <Box sx={sxName}>
            {name}
          </Box>

          <Box sx={sxButtons}>
            <IconButton
              title={translate('CloneCustomFormat')}
              name={icons.CLONE}
              onPress={this.onCloneCustomFormatPress}
             sx={sxCloneButton} />

            <IconButton
              title={translate('ExportCustomFormat')}
              name={icons.EXPORT}
              onPress={this.onExportCustomFormatPress}
             sx={sxCloneButton} />
          </Box>
        </Box>

        <div>
          {
            specifications.map((item, index) => {
              if (!item) {
                return null;
              }

              let kind = kinds.DEFAULT;
              if (item.required) {
                kind = kinds.SUCCESS;
              }
              if (item.negate) {
                kind = kinds.DANGER;
              }

              return (
                <Box sx={sxLabel}>
<Label
                  key={index}
                  kind={kind}
                >
                  {item.name}
                </Label>
</Box>
              );
            })
          }
        </div>

        <EditCustomFormatModalConnector
          id={id}
          isOpen={this.state.isEditCustomFormatModalOpen}
          onModalClose={this.onEditCustomFormatModalClose}
          onDeleteCustomFormatPress={this.onDeleteCustomFormatPress}
        />

        <ExportCustomFormatModal
          id={id}
          isOpen={this.state.isExportCustomFormatModalOpen}
          onModalClose={this.onExportCustomFormatModalClose}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteCustomFormatModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteCustomFormat')}
          message={translate('DeleteCustomFormatMessageText', { customFormatName: name })}
          confirmLabel={translate('Delete')}
          isSpinning={isDeleting}
          onConfirm={this.onConfirmDeleteCustomFormat}
          onCancel={this.onDeleteCustomFormatModalClose}
        />
      </Card>
</Box>
    );
  }
}

CustomFormat.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  specifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDeleting: PropTypes.bool.isRequired,
  onConfirmDeleteCustomFormat: PropTypes.func.isRequired,
  onCloneCustomFormatPress: PropTypes.func.isRequired
};

export default CustomFormat;
