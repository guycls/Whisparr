import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import TagList from 'Components/TagList';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditAutoTaggingModal from './EditAutoTaggingModal';

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

export default function AutoTagging(props) {
  const {
    id,
    name,
    tags,
    tagList,
    specifications,
    isDeleting,
    onConfirmDeleteAutoTagging,
    onCloneAutoTaggingPress
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
    onConfirmDeleteAutoTagging(id);
  }, [id, onConfirmDeleteAutoTagging]);

  const onClonePress = useCallback(() => {
    onCloneAutoTaggingPress(id);
  }, [id, onCloneAutoTaggingPress]);

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

        <div>
          <IconButton
            title={translate('CloneAutoTag')}
            name={icons.CLONE}
            onPress={onClonePress}
           sx={sxCloneButton} />
        </div>
      </Box>

      <TagList
        tags={tags}
        tagList={tagList}
      />

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
              <Label
                key={index}
                kind={kind}
              >
                {item.name}
              </Label>
            );
          })
        }
      </div>

      <EditAutoTaggingModal
        id={id}
        isOpen={isEditModalOpen}
        onModalClose={onEditModalClose}
        onDeleteAutoTaggingPress={onDeletePress}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteAutoTag')}
        message={translate('DeleteAutoTagHelpText', { name })}
        confirmLabel={translate('Delete')}
        isSpinning={isDeleting}
        onConfirm={onConfirmDelete}
        onCancel={onDeleteModalClose}
      />
    </Card>
</Box>
  );
}

AutoTagging.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  specifications: PropTypes.arrayOf(PropTypes.object).isRequired,
  tags: PropTypes.arrayOf(PropTypes.number).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDeleting: PropTypes.bool.isRequired,
  onConfirmDeleteAutoTagging: PropTypes.func.isRequired,
  onCloneAutoTaggingPress: PropTypes.func.isRequired
};
