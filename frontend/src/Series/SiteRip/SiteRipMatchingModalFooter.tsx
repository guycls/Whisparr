import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Button from 'Components/Link/Button';
import ModalFooter from 'Components/Modal/ModalFooter';
import { kinds } from 'Helpers/Props';
import { grabSiteRip, setSiteRipView } from 'Store/Actions/siteRipActions';
import translate from 'Utilities/String/translate';
import styles from './SiteRipMatchingView.css';

interface SiteRipMatchingModalFooterProps {
  seriesId: number;
  onModalClose(): void;
}

function SiteRipMatchingModalFooter(props: SiteRipMatchingModalFooterProps) {
  const { seriesId, onModalClose } = props;
  const dispatch = useDispatch();

  const {
    selectedRelease,
    matches,
    selections,
    isGrabbing,
    isGrabbed,
    grabError,
  } = useSelector((state: AppState) => state.siteRip);

  const selectedCount = Object.values(selections).filter(
    (selection) => selection.selected
  ).length;

  const onBackPress = useCallback(() => {
    dispatch(setSiteRipView('search'));
  }, [dispatch]);

  const onGrabPress = useCallback(() => {
    const grabSelections = Object.keys(selections)
      .filter(
        (key) =>
          selections[parseInt(key, 10)].selected &&
          selections[parseInt(key, 10)].episodeId
      )
      .map((key) => {
        const index = parseInt(key, 10);
        const match = matches[index];

        return {
          fileIndices: match.fileIndices,
          filePaths: match.filePaths,
          episodeId: selections[index].episodeId as number,
        };
      });

    if (!grabSelections.length || !selectedRelease) {
      return;
    }

    dispatch(
      grabSiteRip({
        guid: selectedRelease.guid,
        indexerId: selectedRelease.indexerId,
        seriesId,
        selections: grabSelections,
      })
    );
  }, [dispatch, matches, selections, selectedRelease, seriesId]);

  React.useEffect(() => {
    if (isGrabbed) {
      onModalClose();
    }
  }, [isGrabbed, onModalClose]);

  return (
    <ModalFooter>
      <Button onPress={onBackPress}>{translate('Back')}</Button>
      <Button
        kind={kinds.PRIMARY}
        isDisabled={!selectedCount || isGrabbing}
        onPress={onGrabPress}
      >
        {isGrabbing ? translate('Downloading') : translate('GrabRelease')}
      </Button>
      {grabError ? <span className={styles.grabError}>{grabError}</span> : null}
    </ModalFooter>
  );
}

export default SiteRipMatchingModalFooter;
