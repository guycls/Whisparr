import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditSpecificationModalConnector from './EditSpecificationModal';

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

const sxCloneButton = {
  height: 36
};

const sxLabels = (theme) => ({
  display: 'flex',
  flexWrap: 'wrap',
  mt: theme.spacing(0.625),
  pointerEvents: 'all'
});

class Specification extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditSpecificationModalOpen: false,
      isDeleteSpecificationModalOpen: false
    };
  }

  //
  // Listeners

  onEditSpecificationPress = () => {
    this.setState({ isEditSpecificationModalOpen: true });
  };

  onEditSpecificationModalClose = () => {
    this.setState({ isEditSpecificationModalOpen: false });
  };

  onDeleteSpecificationPress = () => {
    this.setState({
      isEditSpecificationModalOpen: false,
      isDeleteSpecificationModalOpen: true
    });
  };

  onDeleteSpecificationModalClose = () => {
    this.setState({ isDeleteSpecificationModalOpen: false });
  };

  onCloneSpecificationPress = () => {
    this.props.onCloneSpecificationPress(this.props.id);
  };

  onConfirmDeleteSpecification = () => {
    this.props.onConfirmDeleteSpecification(this.props.id);
  };

  //
  // Lifecycle

  render() {
    const {
      id,
      implementationName,
      name,
      required,
      negate
    } = this.props;

    return (
      <Box sx={sxCustomFormat}>
<Card
        overlayContent={true}
        onPress={this.onEditSpecificationPress}
      >
        <Box sx={sxNameContainer}>
          <Box sx={sxName}>
            {name}
          </Box>

          <IconButton
            title={translate('CloneCondition')}
            name={icons.CLONE}
            onPress={this.onCloneSpecificationPress}
           sx={sxCloneButton} />
        </Box>

        <Box sx={sxLabels}>
          <Label kind={kinds.DEFAULT}>
            {implementationName}
          </Label>

          {
            negate &&
              <Label kind={kinds.DANGER}>
                {translate('Negated')}
              </Label>
          }

          {
            required &&
              <Label kind={kinds.SUCCESS}>
                {translate('Required')}
              </Label>
          }
        </Box>

        <EditSpecificationModalConnector
          id={id}
          isOpen={this.state.isEditSpecificationModalOpen}
          onModalClose={this.onEditSpecificationModalClose}
          onDeleteSpecificationPress={this.onDeleteSpecificationPress}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteSpecificationModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteCondition')}
          message={translate('DeleteConditionMessageText', { name })}
          confirmLabel={translate('Delete')}
          onConfirm={this.onConfirmDeleteSpecification}
          onCancel={this.onDeleteSpecificationModalClose}
        />
      </Card>
</Box>
    );
  }
}

Specification.propTypes = {
  id: PropTypes.number.isRequired,
  implementation: PropTypes.string.isRequired,
  implementationName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  negate: PropTypes.bool.isRequired,
  required: PropTypes.bool.isRequired,
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteSpecification: PropTypes.func.isRequired,
  onCloneSpecificationPress: PropTypes.func.isRequired
};

export default Specification;
