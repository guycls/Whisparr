import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditSpecificationModal from './EditSpecificationModal';

const sxAutoTagging = (theme) => ({
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

export default function Specification(props) {
  const {
    id,
    implementationName,
    name,
    required,
    negate,
    onConfirmDeleteSpecification,
    onCloneSpecificationPress
  } = props;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onEditPress = useCallback(() => {
    setIsEditModalOpen(true);
  }, [setIsEditModalOpen]);

  const onEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, [setIsEditModalOpen]);

  const onDeletePress = useCallback(() => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(true);
  }, [setIsEditModalOpen, setIsDeleteModalOpen]);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, [setIsDeleteModalOpen]);

  const onConfirmDelete = useCallback(() => {
    onConfirmDeleteSpecification(id);
  }, [id, onConfirmDeleteSpecification]);

  const onClonePress = useCallback(() => {
    onCloneSpecificationPress(id);
  }, [id, onCloneSpecificationPress]);

  return (
    <Box sx={sxAutoTagging}>
<Card
      overlayContent={true}
      onPress={onEditPress}
    >
      <Box sx={sxNameContainer}>
        <Box sx={sxName}>
          {name}
        </Box>

        <IconButton
          title={translate('Clone')}
          name={icons.CLONE}
          onPress={onClonePress}
         sx={sxCloneButton} />
      </Box>

      <Box sx={sxLabels}>
        <Label kind={kinds.DEFAULT}>
          {implementationName}
        </Label>

        {
          negate ?
            <Label kind={kinds.DANGER}>
              {translate('Negated')}
            </Label> :
            null
        }

        {
          required ?
            <Label kind={kinds.SUCCESS}>
              {translate('Required')}
            </Label> :
            null
        }
      </Box>

      <EditSpecificationModal
        id={id}
        isOpen={isEditModalOpen}
        onModalClose={onEditModalClose}
        onDeleteSpecificationPress={onDeletePress}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteSpecification')}
        message={translate('DeleteSpecificationHelpText', { name })}
        confirmLabel={translate('Delete')}
        onConfirm={onConfirmDelete}
        onCancel={onDeleteModalClose}
      />
    </Card>
</Box>
  );
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
