import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import SpinnerErrorButton from 'Components/Link/SpinnerErrorButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { icons, inputTypes, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import ImportCustomFormatModal from './ImportCustomFormatModal';
import AddSpecificationModal from './Specifications/AddSpecificationModal';
import EditSpecificationModalConnector from './Specifications/EditSpecificationModalConnector';
import Specification from './Specifications/Specification';

const sxDeleteButton = {
  mr: 'auto'
};

const sxRightButtons = {
  justifyContent: 'flex-end',
  mr: 'auto'
};

const sxAddSpecification = (theme) => ({
  width: 300,
  m: theme.spacing(1.25)
});

const sxAddSpecificationContent = (theme) => ({
  p: theme.spacing(1.25),
  bgcolor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
  textAlign: 'center',
  fontSize: 45
});

const sxCenter = (theme) => ({
  display: 'inline-block',
  pt: theme.spacing(0.625),
  px: theme.spacing(2.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 1,
  bgcolor: theme.palette.background.paper
});

const sxCustomFormats = {
  display: 'flex',
  flexWrap: 'wrap'
};

class EditCustomFormatModalContent extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddSpecificationModalOpen: false,
      isEditSpecificationModalOpen: false,
      isImportCustomFormatModalOpen: false
    };
  }

  //
  // Listeners

  onAddSpecificationPress = () => {
    this.setState({ isAddSpecificationModalOpen: true });
  };

  onAddSpecificationModalClose = ({ specificationSelected = false } = {}) => {
    this.setState({
      isAddSpecificationModalOpen: false,
      isEditSpecificationModalOpen: specificationSelected
    });
  };

  onEditSpecificationModalClose = () => {
    this.setState({ isEditSpecificationModalOpen: false });
  };

  onImportPress = () => {
    this.setState({ isImportCustomFormatModalOpen: true });
  };

  onImportCustomFormatModalClose = () => {
    this.setState({ isImportCustomFormatModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      isFetching,
      error,
      isSaving,
      saveError,
      item,
      specificationsPopulated,
      specifications,
      onInputChange,
      onSavePress,
      onModalClose,
      onDeleteCustomFormatPress,
      onCloneSpecificationPress,
      onConfirmDeleteSpecification,
      ...otherProps
    } = this.props;

    const {
      isAddSpecificationModalOpen,
      isEditSpecificationModalOpen,
      isImportCustomFormatModalOpen
    } = this.state;

    const {
      id,
      name,
      includeCustomFormatWhenRenaming
    } = item;

    return (
      <ModalContent onModalClose={onModalClose}>

        <ModalHeader>
          {id ? translate('EditCustomFormat') : translate('AddCustomFormat')}
        </ModalHeader>

        <ModalBody>
          <div>
            {
              isFetching &&
                <LoadingIndicator />
            }

            {
              !isFetching && !!error &&
                <div>
                  {translate('AddCustomFormatError')}
                </div>
            }

            {
              !isFetching && !error && specificationsPopulated &&
                <div>
                  <Form
                    {...otherProps}
                  >
                    <FormGroup>
                      <FormLabel>
                        {translate('Name')}
                      </FormLabel>

                      <FormInputGroup
                        type={inputTypes.TEXT}
                        name="name"
                        {...name}
                        onChange={onInputChange}
                      />
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>{translate('IncludeCustomFormatWhenRenaming')}</FormLabel>

                      <FormInputGroup
                        type={inputTypes.CHECK}
                        name="includeCustomFormatWhenRenaming"
                        helpText={translate('IncludeCustomFormatWhenRenamingHelpText')}
                        {...includeCustomFormatWhenRenaming}
                        onChange={onInputChange}
                      />
                    </FormGroup>
                  </Form>

                  <FieldSet legend={translate('Conditions')}>
                    <Alert kind={kinds.INFO}>
                      <div>
                        {translate('CustomFormatsSettingsTriggerInfo')}
                      </div>
                    </Alert>
                    <Box sx={sxCustomFormats}>
                      {
                        specifications.map((tag) => {
                          return (
                            <Specification
                              key={tag.id}
                              {...tag}
                              onCloneSpecificationPress={onCloneSpecificationPress}
                              onConfirmDeleteSpecification={onConfirmDeleteSpecification}
                            />
                          );
                        })
                      }

                      <Box sx={sxAddSpecification}>
                        <Card
                          onPress={this.onAddSpecificationPress}
                        >
                          <Box sx={sxAddSpecificationContent}>
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
                  </FieldSet>

                  <AddSpecificationModal
                    isOpen={isAddSpecificationModalOpen}
                    onModalClose={this.onAddSpecificationModalClose}
                  />

                  <EditSpecificationModalConnector
                    isOpen={isEditSpecificationModalOpen}
                    onModalClose={this.onEditSpecificationModalClose}
                  />

                  <ImportCustomFormatModal
                    isOpen={isImportCustomFormatModalOpen}
                    onModalClose={this.onImportCustomFormatModalClose}
                  />

                </div>
            }
          </div>
        </ModalBody>
        <ModalFooter>
          <Box sx={sxRightButtons}>
            {
              id &&
                <Box sx={sxDeleteButton}>
<Button
                  kind={kinds.DANGER}
                  onPress={onDeleteCustomFormatPress}
                >
                  {translate('Delete')}
                </Button>
</Box>
            }

            <Box sx={sxDeleteButton}>
<Button
              onPress={this.onImportPress}
            >
              {translate('Import')}
            </Button>
</Box>
          </Box>

          <Button
            onPress={onModalClose}
          >
            {translate('Cancel')}
          </Button>

          <SpinnerErrorButton
            isSpinning={isSaving}
            error={saveError}
            onPress={onSavePress}
          >
            {translate('Save')}
          </SpinnerErrorButton>
        </ModalFooter>
      </ModalContent>
    );
  }
}

EditCustomFormatModalContent.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  isSaving: PropTypes.bool.isRequired,
  saveError: PropTypes.object,
  item: PropTypes.object.isRequired,
  specificationsPopulated: PropTypes.bool.isRequired,
  specifications: PropTypes.arrayOf(PropTypes.object),
  onInputChange: PropTypes.func.isRequired,
  onSavePress: PropTypes.func.isRequired,
  onContentHeightChange: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onDeleteCustomFormatPress: PropTypes.func,
  onCloneSpecificationPress: PropTypes.func.isRequired,
  onConfirmDeleteSpecification: PropTypes.func.isRequired
};

export default EditCustomFormatModalContent;
