import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import {
  cloneAutoTaggingSpecification,
  deleteAutoTaggingSpecification,
  fetchAutoTaggingSpecifications,
  saveAutoTagging,
  setAutoTaggingValue
} from 'Store/Actions/settingsActions';
import { createProviderSettingsSelectorHook } from 'Store/Selectors/createProviderSettingsSelector';
import translate from 'Utilities/String/translate';
import AddSpecificationModal from './Specifications/AddSpecificationModal';
import EditSpecificationModal from './Specifications/EditSpecificationModal';
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

const sxAutoTaggings = {
  display: 'flex',
  flexWrap: 'wrap'
};

export default function EditAutoTaggingModalContent(props) {
  const {
    id,
    tagsFromId,
    onModalClose,
    onDeleteAutoTaggingPress
  } = props;

  const {
    error,
    item,
    isFetching,
    isSaving,
    saveError,
    validationErrors,
    validationWarnings
  } = useSelector(createProviderSettingsSelectorHook('autoTaggings', id));

  const {
    isPopulated: specificationsPopulated,
    items: specifications
  } = useSelector((state) => state.settings.autoTaggingSpecifications);

  const dispatch = useDispatch();
  const [isAddSpecificationModalOpen, setIsAddSpecificationModalOpen] = useState(false);
  const [isEditSpecificationModalOpen, setIsEditSpecificationModalOpen] = useState(false);
  // const [isImportAutoTaggingModalOpen, setIsImportAutoTaggingModalOpen] = useState(false);

  const onAddSpecificationPress = useCallback(() => {
    setIsAddSpecificationModalOpen(true);
  }, [setIsAddSpecificationModalOpen]);

  const onAddSpecificationModalClose = useCallback(({ specificationSelected = false } = {}) => {
    setIsAddSpecificationModalOpen(false);
    setIsEditSpecificationModalOpen(specificationSelected);
  }, [setIsAddSpecificationModalOpen]);

  const onEditSpecificationModalClose = useCallback(() => {
    setIsEditSpecificationModalOpen(false);
  }, [setIsEditSpecificationModalOpen]);

  const onInputChange = useCallback(({ name, value }) => {
    dispatch(setAutoTaggingValue({ name, value }));
  }, [dispatch]);

  const onSavePress = useCallback(() => {
    dispatch(saveAutoTagging({ id }));
  }, [dispatch, id]);

  const onCloneSpecificationPress = useCallback((specId) => {
    dispatch(cloneAutoTaggingSpecification({ id: specId }));
  }, [dispatch]);

  const onConfirmDeleteSpecification = useCallback((specId) => {
    dispatch(deleteAutoTaggingSpecification({ id: specId }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAutoTaggingSpecifications({ id: tagsFromId || id }));
  }, [id, tagsFromId, dispatch]);

  const isSavingRef = useRef();

  useEffect(() => {
    if (isSavingRef.current && !isSaving && !saveError) {
      onModalClose();
    }

    isSavingRef.current = isSaving;
  }, [isSaving, saveError, onModalClose]);

  const {
    name,
    removeTagsAutomatically,
    tags
  } = item;

  return (
    <ModalContent onModalClose={onModalClose}>

      <ModalHeader>
        {id ? translate('EditAutoTag') : translate('AddAutoTag')}
      </ModalHeader>

      <ModalBody>
        <div>
          {
            isFetching ? <LoadingIndicator />: null
          }

          {
            !isFetching && !!error ?
              <div>
                {translate('AddAutoTagError')}
              </div> :
              null
          }

          {
            !isFetching && !error && specificationsPopulated ?
              <div>
                <Form
                  validationErrors={validationErrors}
                  validationWarnings={validationWarnings}
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
                    <FormLabel>{translate('RemoveTagsAutomatically')}</FormLabel>

                    <FormInputGroup
                      type={inputTypes.CHECK}
                      name="removeTagsAutomatically"
                      helpText={translate('RemoveTagsAutomaticallyHelpText')}
                      {...removeTagsAutomatically}
                      onChange={onInputChange}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>{translate('Tags')}</FormLabel>

                    <FormInputGroup
                      type={inputTypes.TAG}
                      name="tags"
                      onChange={onInputChange}
                      {...tags}
                    />
                  </FormGroup>
                </Form>

                <FieldSet legend={translate('Conditions')}>
                  <Box sx={sxAutoTaggings}>
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
                        onPress={onAddSpecificationPress}
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
                  onModalClose={onAddSpecificationModalClose}
                />

                <EditSpecificationModal
                  isOpen={isEditSpecificationModalOpen}
                  onModalClose={onEditSpecificationModalClose}
                />

                {/* <ImportAutoTaggingModal
                    isOpen={isImportAutoTaggingModalOpen}
                    onModalClose={onImportAutoTaggingModalClose}
                  /> */}

              </div> :
              null
          }
        </div>
      </ModalBody>
      <ModalFooter>
        <Box sx={sxRightButtons}>
          {
            id ?
              <Box sx={sxDeleteButton}>
<Button
                kind={kinds.DANGER}
                onPress={onDeleteAutoTaggingPress}
              >
                {translate('Delete')}
              </Button>
</Box> :
              null
          }

          {/* <Box sx={sxDeleteButton}>
<Button
            onPress={onImportPress}
          >
            Import
          </Button>
</Box> */}
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

EditAutoTaggingModalContent.propTypes = {
  id: PropTypes.number,
  tagsFromId: PropTypes.number,
  onModalClose: PropTypes.func.isRequired,
  onDeleteAutoTaggingPress: PropTypes.func
};
