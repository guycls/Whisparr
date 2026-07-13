import React from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { scrollDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import SiteRipMatchingModalFooter from './SiteRipMatchingModalFooter';
import SiteRipMatchingView from './SiteRipMatchingView';
import SiteRipSearchView from './SiteRipSearchView';

interface SiteRipSearchModalContentProps {
  seriesId: number;
  seriesTitle: string;
  onModalClose(): void;
}

function SiteRipSearchModalContent(props: SiteRipSearchModalContentProps) {
  const { seriesId, seriesTitle, onModalClose } = props;
  const view = useSelector((state: AppState) => state.siteRip.view);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {view === 'matching' ?
          translate('MatchFiles') :
          translate('SiteRipSearch')}
        {seriesTitle ? ` - ${seriesTitle}` : null}
      </ModalHeader>

      <ModalBody scrollDirection={scrollDirections.BOTH}>
        {
          view === 'matching' ?
            <SiteRipMatchingView
              seriesId={seriesId}
            /> :
            <SiteRipSearchView
              seriesId={seriesId}
            />
        }
      </ModalBody>

      {
        view === 'search' ?
          <ModalFooter>
            <Button onPress={onModalClose}>{translate('Close')}</Button>
          </ModalFooter> :
          <SiteRipMatchingModalFooter
            seriesId={seriesId}
            onModalClose={onModalClose}
          />
      }
    </ModalContent>
  );
}

export default SiteRipSearchModalContent;
