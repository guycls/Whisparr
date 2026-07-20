import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'Components/Modal/Modal';
import { sizes } from 'Helpers/Props';
import {
  cancelFetchSiteRipReleases,
  clearSiteRip,
} from 'Store/Actions/siteRipActions';
import SiteRipSearchModalContent from './SiteRipSearchModalContent';

interface SiteRipSearchModalProps {
  isOpen: boolean;
  seriesId: number;
  seriesTitle: string;
  onModalClose(): void;
}

function SiteRipSearchModal(props: SiteRipSearchModalProps) {
  const { isOpen, seriesId, seriesTitle, onModalClose } = props;
  const dispatch = useDispatch();

  const handleModalClose = useCallback(() => {
    dispatch(cancelFetchSiteRipReleases());
    dispatch(clearSiteRip());
    onModalClose();
  }, [dispatch, onModalClose]);

  useEffect(() => {
    return () => {
      dispatch(cancelFetchSiteRipReleases());
      dispatch(clearSiteRip());
    };
  }, [dispatch]);

  return (
    <Modal
      isOpen={isOpen}
      size={sizes.EXTRA_EXTRA_LARGE}
      closeOnBackgroundClick={false}
      onModalClose={handleModalClose}
    >
      <SiteRipSearchModalContent
        seriesId={seriesId}
        seriesTitle={seriesTitle}
        onModalClose={handleModalClose}
      />
    </Modal>
  );
}

export default SiteRipSearchModal;
