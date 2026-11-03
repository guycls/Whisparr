import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Button from 'Components/Link/Button';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import Episode from 'Episode/Episode';
import EpisodeDetailsTab from 'Episode/EpisodeDetailsTab';
import episodeEntities from 'Episode/episodeEntities';
import EpisodeSceneDetails from 'Episode/EpisodeSceneDetails';
import EpisodeScreenshot, {
  hasEpisodeScreenshot,
} from 'Episode/EpisodeScreenshot';
import useEpisode, { EpisodeEntities } from 'Episode/useEpisode';
import Series from 'Series/Series';
import useSeries from 'Series/useSeries';
import { toggleEpisodeMonitored } from 'Store/Actions/episodeActions';
import { set } from 'Store/Actions/baseActions';
import {
  cancelFetchReleases,
  clearReleases,
} from 'Store/Actions/releaseActions';
import translate from 'Utilities/String/translate';
import EpisodeHistoryConnector from './History/EpisodeHistoryConnector';
import EpisodeSearchConnector from './Search/EpisodeSearchConnector';

type SceneModalTab = 'history' | 'search';

const TABS: SceneModalTab[] = ['history', 'search'];
const MIN_PANE_PERCENT = 25;
const MAX_PANE_PERCENT = 75;

function clampPanePercent(value: number) {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.min(MAX_PANE_PERCENT, Math.max(MIN_PANE_PERCENT, value));
}

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

function resolveInitialTab(
  selectedTab: EpisodeDetailsTab | undefined,
  startInteractiveSearch: boolean
): SceneModalTab {
  if (selectedTab === 'search' || startInteractiveSearch) {
    return 'search';
  }

  return 'history';
}

function EpisodeDetailsModalContent(props: EpisodeDetailsModalContentProps) {
  const {
    episodeId,
    episodeEntity = episodeEntities.EPISODES,
    seriesId,
    isSaving = false,
    showOpenSeriesButton = false,
    startInteractiveSearch = false,
    selectedTab,
    onTabChange,
    onModalClose,
  } = props;

  const dispatch = useDispatch();
  const splitRef = useRef<HTMLDivElement>(null);
  const panePercentRef = useRef(50);
  const persistedPanePercent = useSelector(
    (state: AppState) => state.seriesDetails.sceneModalPanePercent
  );
  const [currentlySelectedTab, setCurrentlySelectedTab] = useState<SceneModalTab>(
    resolveInitialTab(selectedTab, startInteractiveSearch)
  );
  const [leftPanePercent, setLeftPanePercent] = useState(() => {
    const initialPercent = clampPanePercent(persistedPanePercent);
    panePercentRef.current = initialPercent;
    return initialPercent;
  });

  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const {
    titleSlug,
    monitored: seriesMonitored,
  } = useSeries(seriesId) as Series;

  const {
    monitored,
    images,
  } = useEpisode(episodeId, episodeEntity) as Episode;

  const hasScreenshot = hasEpisodeScreenshot(images);
  const monitorDisabled = !seriesMonitored || isSaving;

  const handleTabSelect = useCallback(
    (event: React.SyntheticEvent, tab: SceneModalTab) => {
      void event;
      onTabChange(tab === 'search');
      setCurrentlySelectedTab(tab);
    },
    [onTabChange]
  );

  const handleMonitorEpisodePress = useCallback(() => {
    dispatch(
      toggleEpisodeMonitored({
        episodeEntity,
        episodeId,
        monitored: !monitored,
      })
    );
  }, [episodeEntity, episodeId, monitored, dispatch]);

  const updatePaneSize = useCallback((clientX: number) => {
    const bounds = splitRef.current?.getBoundingClientRect();

    if (!bounds || bounds.width <= 0) {
      return;
    }

    const nextPercent = clampPanePercent(
      ((clientX - bounds.left) / bounds.width) * 100
    );
    panePercentRef.current = nextPercent;
    setLeftPanePercent(nextPercent);
  }, []);

  const handleDividerPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      updatePaneSize(event.clientX);
    },
    [updatePaneSize]
  );

  const handleDividerPointerUp = useCallback(() => {
    dispatch(set({
      section: 'seriesDetails',
      sceneModalPanePercent: panePercentRef.current
    }));
  }, [dispatch]);

  const handleDividerPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        return;
      }

      updatePaneSize(event.clientX);
    },
    [updatePaneSize]
  );

  useEffect(() => {
    return () => {
      dispatch(cancelFetchReleases());
      dispatch(clearReleases());
    };
  }, [dispatch]);

  const seriesLink = `/site/${titleSlug}`;
  const monitorTitle = !seriesMonitored
    ? translate('ToggleMonitoredSeriesUnmonitored')
    : monitored
      ? translate('ToggleMonitoredToUnmonitored')
      : translate('ToggleUnmonitoredToMonitored');

  return (
    <ModalContent showCloseButton={false} onModalClose={onModalClose}>
      <Box
        ref={splitRef}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: { xs: '0 0 auto', md: `0 0 ${leftPanePercent}%` },
            minWidth: 0,
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          {hasScreenshot ? (
            <Box
              sx={(theme) => ({
                pt: `${theme.shape.borderRadius}px`,
                px: `${theme.shape.borderRadius}px`,
              })}
            >
              <Box sx={{ borderRadius: 1, overflow: 'hidden', lineHeight: 0 }}>
                <EpisodeScreenshot
                  images={images}
                  blur={safeForWorkMode}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              </Box>
            </Box>
          ) : null}

          <EpisodeSceneDetails
            seriesId={seriesId}
            episodeId={episodeId}
            episodeEntity={episodeEntity}
            showHeader={false}
            showScreenshot={false}
            showMetadata={true}
            showDownloadedFiles={false}
            centerScreenshot={false}
            collapseMetadata={false}
            fillHeight={false}
          />
        </Box>

        <Box
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={Math.round(leftPanePercent)}
          aria-valuemin={MIN_PANE_PERCENT}
          aria-valuemax={MAX_PANE_PERCENT}
          onPointerDown={handleDividerPointerDown}
          onPointerMove={handleDividerPointerMove}
          onPointerUp={handleDividerPointerUp}
          onPointerCancel={handleDividerPointerUp}
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'stretch',
            flex: '0 0 auto',
            cursor: 'col-resize',
            px: '5px',
            touchAction: 'none',
            '&:hover .MuiDivider-root, &:focus-visible .MuiDivider-root': {
              borderColor: 'primary.main',
            },
          }}
        >
          <Divider orientation="vertical" flexItem />
        </Box>

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Tooltip title={monitorTitle}>
              <span>
                <IconButton
                  size="small"
                  aria-label={monitorTitle}
                  disabled={monitorDisabled}
                  onClick={handleMonitorEpisodePress}
                >
                  {isSaving ? (
                    <CircularProgress size={20} />
                  ) : monitored ? (
                    <BookmarkIcon fontSize="small" />
                  ) : (
                    <BookmarkBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={translate('Close')}>
              <IconButton
                size="small"
                aria-label={translate('Close')}
                onClick={onModalClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Tabs
            value={currentlySelectedTab}
            variant="fullWidth"
            onChange={handleTabSelect}
          >
            {TABS.map((tab) => {
              return (
                <Tab
                  key={tab}
                  value={tab}
                  label={translate(tab === 'history' ? 'History' : 'Search')}
                />
              );
            })}
          </Tabs>

          <Box sx={{ flex: '1 1 auto', minHeight: 0, overflow: 'auto', px: 2, py: 2 }}>
            {currentlySelectedTab === 'history' ? (
              <EpisodeHistoryConnector episodeId={episodeId} />
            ) : (
              <EpisodeSearchConnector
                episodeId={episodeId}
                seriesId={seriesId}
                startInteractiveSearch={startInteractiveSearch}
                onModalClose={onModalClose}
              />
            )}
          </Box>
        </Box>
      </Box>

      {showOpenSeriesButton ? (
        <ModalFooter>
          <Button to={seriesLink} onPress={onModalClose} sx={{ mr: 'auto' }}>
            {translate('OpenSite')}
          </Button>
        </ModalFooter>
      ) : null}
    </ModalContent>
  );
}

export default EpisodeDetailsModalContent;
