import classNames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import AppState from 'App/State/AppState';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import Episode from 'Episode/Episode';
import EpisodeDetailsTab from 'Episode/EpisodeDetailsTab';
import episodeEntities from 'Episode/episodeEntities';
import EpisodeSceneDetails from 'Episode/EpisodeSceneDetails';
import { hasEpisodeScreenshot } from 'Episode/EpisodeScreenshot';
import useEpisode, { EpisodeEntities } from 'Episode/useEpisode';
import useMeasure from 'Helpers/Hooks/useMeasure';
import { scrollDirections } from 'Helpers/Props';
import Series from 'Series/Series';
import useSeries from 'Series/useSeries';
import { toggleEpisodeMonitored } from 'Store/Actions/episodeActions';
import {
  cancelFetchReleases,
  clearReleases,
} from 'Store/Actions/releaseActions';
import translate from 'Utilities/String/translate';
import EpisodeHistoryConnector from './History/EpisodeHistoryConnector';
import EpisodeSearchConnector from './Search/EpisodeSearchConnector';
import SeasonEpisodeNumber from './SeasonEpisodeNumber';
import styles from './EpisodeDetailsModalContent.css';

const TABS: EpisodeDetailsTab[] = ['details', 'search', 'history'];
export interface EpisodeDetailsModalContentProps {
  episodeId: number;
  episodeEntity: EpisodeEntities;
  seriesId: number;
  episodeTitle: string;
  isSaving?: boolean;
  showOpenSeriesButton?: boolean;
  selectedTab?: EpisodeDetailsTab;
  startInteractiveSearch?: boolean;
  onTabChange(isSearch: boolean): void;
  onModalClose(): void;
}

function EpisodeDetailsModalContent(props: EpisodeDetailsModalContentProps) {
  const {
    episodeId,
    episodeEntity = episodeEntities.EPISODES,
    seriesId,
    episodeTitle,
    isSaving = false,
    showOpenSeriesButton = false,
    startInteractiveSearch = false,
    selectedTab = startInteractiveSearch ? 'search' : 'details',
    onTabChange,
    onModalClose,
  } = props;

  const dispatch = useDispatch();

  const isMediumScreen = useSelector(
    (state: AppState) => state.app.dimensions.isMediumScreen
  );

  const [currentlySelectedTab, setCurrentlySelectedTab] = useState(selectedTab);
  const [isLeftPaneMetadataMounted, setIsLeftPaneMetadataMounted] = useState(
    selectedTab !== 'details'
  );
  const [bodyMeasureRef, bodyBounds] = useMeasure();
  const bodyElementRef = useRef<HTMLDivElement | null>(null);
  const wasLeftPaneMetadataMountedRef = useRef(selectedTab !== 'details');
  const [isBodyAnimating, setIsBodyAnimating] = useState(false);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>();

  const setBodyLayoutRef = useCallback(
    (node: HTMLDivElement | null) => {
      bodyElementRef.current = node;
      bodyMeasureRef(node);
    },
    [bodyMeasureRef]
  );

  const {
    title: seriesTitle,
    titleSlug,
    monitored: seriesMonitored,
    seriesType,
  } = useSeries(seriesId) as Series;

  const {
    seasonNumber,
    episodeNumber,
    absoluteEpisodeNumber,
    releaseDate,
    monitored,
    images,
  } = useEpisode(episodeId, episodeEntity) as Episode;

  const hasScreenshot = hasEpisodeScreenshot(images);
  const isDetailsTab = currentlySelectedTab === 'details';
  const isLeftPaneDetailsLayout = isDetailsTab && !isLeftPaneMetadataMounted;
  const showLeftPane = !isDetailsTab || hasScreenshot;
  const stackedFullTabs = showLeftPane && !isDetailsTab && isMediumScreen;

  const handleMetadataMountChange = useCallback(
    (mounted: boolean) => {
      const wasMounted = wasLeftPaneMetadataMountedRef.current;
      wasLeftPaneMetadataMountedRef.current = mounted;

      setIsLeftPaneMetadataMounted(mounted);

      if (
        wasMounted &&
        !mounted &&
        !isMediumScreen &&
        bodyElementRef.current &&
        currentlySelectedTab === 'details'
      ) {
        const startHeight =
          bodyElementRef.current.getBoundingClientRect().height;

        setBodyHeight(startHeight);
        setIsBodyAnimating(true);
      }
    },
    [currentlySelectedTab, isMediumScreen]
  );

  useEffect(() => {
    if (!isDetailsTab) {
      wasLeftPaneMetadataMountedRef.current = true;
      setIsLeftPaneMetadataMounted(true);
    }
  }, [isDetailsTab]);

  const handleTabSelect = useCallback(
    (selectedIndex: number) => {
      const tab = TABS[selectedIndex];

      onTabChange(tab === 'search');
      setCurrentlySelectedTab(tab);
    },
    [onTabChange]
  );

  useLayoutEffect(() => {
    if (!isBodyAnimating || isMediumScreen) {
      return;
    }

    const element = bodyElementRef.current;

    if (!element) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const endHeight = element.scrollHeight;

      if (endHeight === bodyHeight) {
        setIsBodyAnimating(false);
        setBodyHeight(undefined);
        return;
      }

      setBodyHeight(endHeight);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isBodyAnimating, isMediumScreen, currentlySelectedTab, bodyBounds.height, bodyHeight]);

  const handleBodyTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== 'height') {
        return;
      }

      setIsBodyAnimating(false);
      setBodyHeight(undefined);
    },
    []
  );

  const handleMonitorEpisodePress = useCallback(
    (monitored: boolean) => {
      dispatch(
        toggleEpisodeMonitored({
          episodeEntity,
          episodeId,
          monitored,
        })
      );
    },
    [episodeEntity, episodeId, dispatch]
  );

  useEffect(() => {
    return () => {
      // Clear pending releases here, so we can reshow the search
      // results even after switching tabs.
      dispatch(cancelFetchReleases());
      dispatch(clearReleases());
    };
  }, [dispatch]);

  const seriesLink = `/site/${titleSlug}`;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        <MonitorToggleButton
          monitored={monitored}
          size={18}
          isDisabled={!seriesMonitored}
          isSaving={isSaving}
          onPress={handleMonitorEpisodePress}
        />

        <span className={styles.seriesTitle}>{seriesTitle}</span>

        <span className={styles.separator}>-</span>

        <SeasonEpisodeNumber
          seasonNumber={seasonNumber}
          episodeNumber={episodeNumber}
          absoluteEpisodeNumber={absoluteEpisodeNumber}
          releaseDate={releaseDate}
          seriesType={seriesType}
        />

        <span className={styles.separator}>-</span>

        {episodeTitle}
      </ModalHeader>

      <div
        ref={setBodyLayoutRef}
        className={classNames(
          styles.bodyLayout,
          showLeftPane && styles.hasLeftPane,
          stackedFullTabs && styles.bodyLayoutStackedFullTabs,
          isBodyAnimating && styles.bodyLayoutAnimating
        )}
        style={bodyHeight == null ? undefined : { height: bodyHeight }}
        onTransitionEnd={handleBodyTransitionEnd}
      >
        {showLeftPane ? (
          <div
            className={classNames(
              styles.episodeDetailsPane,
              isLeftPaneDetailsLayout && styles.episodeDetailsPaneScreenshotOnly
            )}
          >
            <EpisodeSceneDetails
              seriesId={seriesId}
              episodeId={episodeId}
              episodeEntity={episodeEntity}
              showHeader={false}
              showScreenshot={true}
              showMetadata={true}
              centerScreenshot={isDetailsTab}
              collapseMetadata={isDetailsTab}
              fillHeight={isLeftPaneDetailsLayout}
              onMetadataMountChange={handleMetadataMountChange}
            />
          </div>
        ) : null}

        <ModalBody
          className={styles.tabsColumn}
          innerClassName={styles.tabsColumnInner}
          scrollDirection={
            stackedFullTabs ? scrollDirections.NONE : scrollDirections.VERTICAL
          }
        >
          <Tabs
            className={styles.tabs}
            selectedIndex={TABS.indexOf(currentlySelectedTab)}
            onSelect={handleTabSelect}
          >
            <TabList className={styles.tabList}>
              <Tab
                className={styles.tab}
                selectedClassName={styles.selectedTab}
              >
                {translate('Details')}
              </Tab>

              <Tab
                className={styles.tab}
                selectedClassName={styles.selectedTab}
              >
                {translate('Search')}
              </Tab>

              <Tab
                className={styles.tab}
                selectedClassName={styles.selectedTab}
              >
                {translate('History')}
              </Tab>
            </TabList>

            <TabPanel>
              <div className={styles.tabContent}>
                <EpisodeSceneDetails
                  seriesId={seriesId}
                  episodeId={episodeId}
                  episodeEntity={episodeEntity}
                  showHeader={false}
                  showScreenshot={false}
                  showMetadata={true}
                />
              </div>
            </TabPanel>

            <TabPanel>
              <EpisodeSearchConnector
                episodeId={episodeId}
                seriesId={seriesId}
                startInteractiveSearch={startInteractiveSearch}
                onModalClose={onModalClose}
              />
            </TabPanel>

            <TabPanel>
              <div className={styles.tabContent}>
                <EpisodeHistoryConnector episodeId={episodeId} />
              </div>
            </TabPanel>
          </Tabs>
        </ModalBody>
      </div>

      <ModalFooter>
        {showOpenSeriesButton && (
          <Button
            className={styles.openSeriesButton}
            to={seriesLink}
            onPress={onModalClose}
          >
            {translate('OpenSite')}
          </Button>
        )}

        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default EpisodeDetailsModalContent;
