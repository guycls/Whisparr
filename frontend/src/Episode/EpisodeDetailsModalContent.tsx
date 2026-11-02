import Box from '@mui/material/Box';
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
  let bodyOverflow: 'hidden' | 'visible' | undefined = undefined;

  if (isBodyAnimating) {
    bodyOverflow = 'hidden';
  } else if (stackedFullTabs) {
    bodyOverflow = 'visible';
  }

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

        <Box component="span" sx={{ ml: '5px' }}>
          {seriesTitle}
        </Box>

        <Box component="span" sx={{ mx: '5px' }}>
          -
        </Box>

        <SeasonEpisodeNumber
          seasonNumber={seasonNumber}
          episodeNumber={episodeNumber}
          absoluteEpisodeNumber={absoluteEpisodeNumber}
          releaseDate={releaseDate}
          seriesType={seriesType}
        />

        <Box component="span" sx={{ mx: '5px' }}>
          -
        </Box>

        {episodeTitle}
      </ModalHeader>

      <Box
        ref={setBodyLayoutRef}
        style={bodyHeight == null ? undefined : { height: bodyHeight }}
        onTransitionEnd={handleBodyTransitionEnd}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: stackedFullTabs ? '0 1 auto' : '1 1 auto',
          minHeight: stackedFullTabs ? 'auto' : 0,
          overflow: bodyOverflow,
          transition: isBodyAnimating ? 'height 0.15s ease-in' : undefined,
          ...(showLeftPane
            ? {
                '@media (min-width: 992px)': {
                  flexDirection: 'row',
                  alignItems: 'stretch',
                },
              }
            : null),
        }}
      >
        {showLeftPane ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexShrink: stackedFullTabs ? 0 : undefined,
              flex: stackedFullTabs ? '0 0 auto' : undefined,
              minHeight: 0,
              width: '100%',
              maxHeight: stackedFullTabs ? 'none' : undefined,
              overflow: bodyOverflow,
              borderBottom: '1px solid var(--borderColor)',
              backgroundColor: 'var(--modalBackgroundColor)',
              '@media (min-width: 992px)': {
                flex: '0 0 50%',
                width: '50%',
                minWidth: '50%',
                maxWidth: '50%',
                alignSelf: 'stretch',
                borderBottom: 'none',
                borderRight: '1px solid var(--borderColor)',
                overflow: 'hidden',
                transition: 'max-height 0.15s ease-in',
                ...(isLeftPaneDetailsLayout
                  ? {
                      maxHeight: 'min(calc(50vh + 4em), 544px)',
                      minHeight: 0,
                    }
                  : null),
              },
            }}
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
          </Box>
        ) : null}

        <Box
          sx={{
            flex: stackedFullTabs ? '0 0 auto' : '1 1 auto',
            flexGrow: stackedFullTabs ? 0 : undefined,
            minWidth: 0,
            width: showLeftPane ? undefined : '100%',
            overflow: stackedFullTabs ? 'visible' : undefined,
            maxHeight: stackedFullTabs ? 'none' : undefined,
            ...(showLeftPane
              ? {
                  '@media (min-width: 992px)': {
                    flex: '1 1 50%',
                    width: '50%',
                    minWidth: 0,
                    maxWidth: '50%',
                  },
                }
              : null),
            '& .MuiDialogContent-root': {
              pt: 0,
            },
            '& .react-tabs__tab': {
              position: 'relative',
              bottom: -1,
              display: 'inline-block',
              padding: '6px 12px',
              border: '1px solid transparent',
              borderTop: 'none',
              listStyle: 'none',
              cursor: 'pointer',
            },
            '& .react-tabs__tab--selected': {
              borderColor: 'var(--borderColor)',
              borderRadius: '0 0 5px 5px',
              backgroundColor: 'rgba(239, 239, 239, 0.4)',
              color: 'var(--black)',
            },
          }}
        >
          <ModalBody
            scrollDirection={
              stackedFullTabs
                ? scrollDirections.NONE
                : scrollDirections.VERTICAL
            }
          >
            <Tabs
              selectedIndex={TABS.indexOf(currentlySelectedTab)}
              onSelect={handleTabSelect}
              style={{ marginTop: 0 }}
            >
              <TabList
                style={{
                  margin: 0,
                  padding: 0,
                }}
              >
                <Tab>
                  {translate('Details')}
                </Tab>

                <Tab>{translate('Search')}</Tab>

                <Tab>{translate('History')}</Tab>
              </TabList>

              <TabPanel>
                <Box sx={{ mt: '20px' }}>
                <EpisodeSceneDetails
                  seriesId={seriesId}
                  episodeId={episodeId}
                  episodeEntity={episodeEntity}
                  showHeader={false}
                  showScreenshot={false}
                  showMetadata={true}
                />
              </Box>
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
              <Box sx={{ mt: '20px' }}>
                <EpisodeHistoryConnector episodeId={episodeId} />
              </Box>
            </TabPanel>
            </Tabs>
          </ModalBody>
        </Box>
      </Box>

      <ModalFooter>
        {showOpenSeriesButton && (
          <Button to={seriesLink} onPress={onModalClose} sx={{ mr: 'auto' }}>
            {translate('OpenSite')}
          </Button>
        )}

        <Button onPress={onModalClose}>{translate('Close')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default EpisodeDetailsModalContent;
