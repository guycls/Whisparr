import Box from '@mui/material/Box';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSelect } from 'App/SelectContext';
import AppState from 'App/State/AppState';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContentFooter from 'Components/Page/PageContentFooter';
import { EpisodeEntities } from 'Episode/useEpisode';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { kinds } from 'Helpers/Props';
import { toggleEpisodesMonitored } from 'Store/Actions/episodeActions';
import { deleteEpisodeFiles } from 'Store/Actions/episodeFileActions';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';

interface SelectableEpisode {
  id: number;
  monitored: boolean;
  episodeFileId?: number;
  isSaving?: boolean;
}

interface SeriesDetailsSelectFooterProps {
  items: SelectableEpisode[];
  seriesMonitored: boolean;
  episodeEntity: EpisodeEntities;
}

function SeriesDetailsSelectFooter(props: SeriesDetailsSelectFooterProps) {
  const { items, seriesMonitored, episodeEntity } = props;
  const dispatch = useDispatch();
  const isDeleting = useSelector(
    (state: AppState) => state.episodeFiles.isDeleting
  );
  const deleteError = useSelector(
    (state: AppState) => state.episodeFiles.deleteError
  );
  const previousIsDeleting = usePrevious(isDeleting);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectState, selectDispatch] = useSelect();
  const { selectedState } = selectState;

  const selectedIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedState[item.id]);
  }, [items, selectedState]);

  const selectedCount = selectedIds.length;
  const allMonitored =
    selectedItems.length > 0 && selectedItems.every((item) => item.monitored);
  const isSaving = selectedItems.some((item) => item.isSaving);
  const episodeFileIds = selectedItems
    .map((item) => item.episodeFileId)
    .filter((episodeFileId): episodeFileId is number => !!episodeFileId);

  useEffect(() => {
    if (previousIsDeleting && !isDeleting && !deleteError) {
      selectDispatch({ type: 'unselectAll' });
    }
  }, [previousIsDeleting, isDeleting, deleteError, selectDispatch]);

  const onMonitorPress = useCallback(() => {
    dispatch(
      toggleEpisodesMonitored({
        episodeIds: selectedItems.map((item) => item.id),
        monitored: !allMonitored,
        episodeEntity,
      })
    );
  }, [allMonitored, dispatch, episodeEntity, selectedItems]);

  const onDeletePress = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const onDeleteConfirmed = useCallback(() => {
    dispatch(
      deleteEpisodeFiles({
        episodeFileIds,
      })
    );
    setIsDeleteModalOpen(false);
  }, [dispatch, episodeFileIds]);

  return (
    <PageContentFooter>
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          width: '100%',
          p: '20px',
          bgcolor: 'background.paper',
          [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
            gap: '20px',
          },
        })}
      >
        <Box
          sx={{
            display: 'flex',
            gap: '10px',
          }}
        >
          <SpinnerButton
            isSpinning={isSaving}
            isDisabled={!seriesMonitored || selectedCount === 0}
            onPress={onMonitorPress}
          >
            {allMonitored ? translate('Unmonitor') : translate('Monitor')}
          </SpinnerButton>

          <SpinnerButton
            kind={kinds.DANGER}
            isSpinning={isDeleting}
            isDisabled={episodeFileIds.length === 0 || isDeleting}
            onPress={onDeletePress}
          >
            {translate('Delete')}
          </SpinnerButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            flexGrow: 1,
            fontWeight: 'bold',
          }}
        >
          {translate('CountScenesSelected', { count: selectedCount })}
        </Box>
      </Box>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteSelectedEpisodeFiles')}
        message={translate('DeleteSelectedEpisodeFilesMessage', {
          count: episodeFileIds.length,
        })}
        confirmLabel={translate('Delete')}
        cancelLabel={translate('Close')}
        onConfirm={onDeleteConfirmed}
        onCancel={onDeleteModalClose}
      />
    </PageContentFooter>
  );
}

export default SeriesDetailsSelectFooter;
