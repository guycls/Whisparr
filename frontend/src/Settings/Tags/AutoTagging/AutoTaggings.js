import Box from '@mui/material/Box';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import { fetchRootFolders } from 'Store/Actions/rootFolderActions';
import { cloneAutoTagging, deleteAutoTagging, fetchAutoTaggings } from 'Store/Actions/settingsActions';
import createSortedSectionSelector from 'Store/Selectors/createSortedSectionSelector';
import createTagsSelector from 'Store/Selectors/createTagsSelector';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import AutoTagging from './AutoTagging';
import EditAutoTaggingModal from './EditAutoTaggingModal';

const sxAutoTaggings = {
  display: 'flex',
  flexWrap: 'wrap'
};

const sxAddAutoTagging = (theme) => ({
  width: 300,
  m: theme.spacing(1.25)
});

const sxAddAutoTaggingContent = (theme) => ({
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

export default function AutoTaggings() {
  const {
    error,
    items,
    isDeleting,
    isFetching,
    isPopulated
  } = useSelector(
    createSortedSectionSelector('settings.autoTaggings', sortByProp('name'))
  );

  const tagList = useSelector(createTagsSelector());
  const dispatch = useDispatch();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tagsFromId, setTagsFromId] = useState(undefined);

  const onClonePress = useCallback((id) => {
    dispatch(cloneAutoTagging({ id }));

    setTagsFromId(id);
    setIsEditModalOpen(true);
  }, [dispatch, setIsEditModalOpen]);

  const onEditPress = useCallback(() => {
    setIsEditModalOpen(true);
  }, [setIsEditModalOpen]);

  const onEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, [setIsEditModalOpen]);

  const onConfirmDelete = useCallback((id) => {
    dispatch(deleteAutoTagging({ id }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAutoTaggings());
    dispatch(fetchRootFolders());
  }, [dispatch]);

  return (
    <FieldSet legend={translate('AutoTagging')}>
      <PageSectionContent
        errorMessage={translate('AutoTaggingLoadError')}
        error={error}
        isFetching={isFetching}
        isPopulated={isPopulated}
      >
        <Box sx={sxAutoTaggings}>
          {
            items.map((item) => {
              return (
                <AutoTagging
                  key={item.id}
                  {...item}
                  isDeleting={isDeleting}
                  tagList={tagList}
                  onConfirmDeleteAutoTagging={onConfirmDelete}
                  onCloneAutoTaggingPress={onClonePress}
                />
              );
            })
          }

          <Box sx={sxAddAutoTagging}>
            <Card
              onPress={onEditPress}
            >
              <Box sx={sxAddAutoTaggingContent}>
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

        <EditAutoTaggingModal
          isOpen={isEditModalOpen}
          tagsFromId={tagsFromId}
          onModalClose={onEditModalClose}
        />

      </PageSectionContent>
    </FieldSet>
  );
}
