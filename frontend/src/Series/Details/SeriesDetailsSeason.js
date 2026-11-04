import Box from '@mui/material/Box';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import Menu from 'Components/Menu/Menu';
import MenuButton from 'Components/Menu/MenuButton';
import MenuContent from 'Components/Menu/MenuContent';
import MenuItem from 'Components/Menu/MenuItem';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import SpinnerIcon from 'Components/SpinnerIcon';
import TableBody from 'Components/Table/TableBody';
import Popover from 'Components/Tooltip/Popover';
import { align, icons, sortDirections, tooltipPositions } from 'Helpers/Props';
import InteractiveImportModal from 'InteractiveImport/InteractiveImportModal';
import OrganizePreviewModalConnector from 'Organize/OrganizePreviewModalConnector';
import SeriesHistoryModal from 'Series/History/SeriesHistoryModal';
import SeasonInteractiveSearchModal from 'Series/Search/SeasonInteractiveSearchModal';
import isAfter from 'Utilities/Date/isAfter';
import isBefore from 'Utilities/Date/isBefore';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import getToggledRange from 'Utilities/Table/getToggledRange';
import EpisodeRowConnector from './EpisodeRowConnector';
import SeasonInfo from './SeasonInfo';
import SeasonProgressLabel from './SeasonProgressLabel';
import SeriesDetailsEpisodeGrid from './SeriesDetailsEpisodeGrid';
import SeriesDetailsEpisodeTable from './SeriesDetailsEpisodeTable';

function getSeasonStatistics(episodes) {
  let episodeCount = 0;
  let episodeFileCount = 0;
  let totalEpisodeCount = 0;
  let monitoredEpisodeCount = 0;
  let hasMonitoredEpisodes = false;
  const sizeOnDisk = 0;

  episodes.forEach((episode) => {
    if (episode.episodeFileId || (episode.monitored && isBefore(episode.releaseDate))) {
      episodeCount++;
    }

    if (episode.episodeFileId) {
      episodeFileCount++;
    }

    if (episode.monitored) {
      monitoredEpisodeCount++;
      hasMonitoredEpisodes = true;
    }

    totalEpisodeCount++;
  });

  return {
    episodeCount,
    episodeFileCount,
    totalEpisodeCount,
    monitoredEpisodeCount,
    hasMonitoredEpisodes,
    sizeOnDisk
  };
}

function scrollElementToTop(element, isSmallScreen) {
  if (!element) {
    return;
  }

  if (isSmallScreen) {
    window.scrollTo(0, window.scrollY + element.getBoundingClientRect().top);
    return;
  }

  let scroller = element.parentElement;

  while (scroller) {
    const { overflowY } = window.getComputedStyle(scroller);

    if (overflowY === 'auto' || overflowY === 'scroll') {
      const elementRect = element.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();

      scroller.scrollTop += elementRect.top - scrollerRect.top;
      return;
    }

    scroller = scroller.parentElement;
  }
}

class SeriesDetailsSeason extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._headerRef = React.createRef();
    this._scrollOnToggle = false;

    this.state = {
      isOrganizeModalOpen: false,
      isManageEpisodesOpen: false,
      isHistoryModalOpen: false,
      isInteractiveSearchModalOpen: false,
      lastToggledEpisode: null
    };
  }

  componentDidMount() {
    this._expandByDefault();
  }

  componentDidUpdate(prevProps) {
    const {
      seriesId,
      allItems
    } = this.props;

    if (prevProps.seriesId !== seriesId) {
      this._expandByDefault();
      return;
    }

    if (
      getSeasonStatistics(prevProps.allItems).episodeFileCount > 0 &&
      getSeasonStatistics(allItems).episodeFileCount === 0
    ) {
      this.setState({
        isOrganizeModalOpen: false,
        isManageEpisodesOpen: false
      });
    }

    if (
      this._scrollOnToggle &&
      prevProps.isExpanded !== this.props.isExpanded
    ) {
      scrollElementToTop(this._headerRef.current, this.props.isSmallScreen);
      this._scrollOnToggle = false;
    }
  }

  //
  // Control

  _expandByDefault() {
    const {
      seasonNumber,
      onExpandPress,
      allItems
    } = this.props;

    const expand = _.some(allItems, (item) => {
      return isAfter(item.releaseDate) ||
             isAfter(item.releaseDate, { days: -30 });
    });

    onExpandPress(seasonNumber, expand && seasonNumber > 0);
  }

  //
  // Listeners

  onOrganizePress = () => {
    this.setState({ isOrganizeModalOpen: true });
  };

  onOrganizeModalClose = () => {
    this.setState({ isOrganizeModalOpen: false });
  };

  onManageEpisodesPress = () => {
    this.setState({ isManageEpisodesOpen: true });
  };

  onManageEpisodesModalClose = () => {
    this.setState({ isManageEpisodesOpen: false });
  };

  onHistoryPress = () => {
    this.setState({ isHistoryModalOpen: true });
  };

  onHistoryModalClose = () => {
    this.setState({ isHistoryModalOpen: false });
  };

  onInteractiveSearchPress = () => {
    this.setState({ isInteractiveSearchModalOpen: true });
  };

  onInteractiveSearchModalClose = () => {
    this.setState({ isInteractiveSearchModalOpen: false });
  };

  onExpandPress = () => {
    const {
      seasonNumber,
      isExpanded
    } = this.props;

    this._scrollOnToggle = true;
    this.props.onExpandPress(seasonNumber, !isExpanded);
  };

  onMonitorEpisodePress = (episodeId, monitored, { shiftKey }) => {
    const lastToggled = this.state.lastToggledEpisode;
    const episodeIds = [episodeId];

    if (shiftKey && lastToggled) {
      const { lower, upper } = getToggledRange(this.props.items, episodeId, lastToggled);
      const items = this.props.items;

      for (let i = lower; i < upper; i++) {
        episodeIds.push(items[i].id);
      }
    }

    this.setState({ lastToggledEpisode: episodeId });

    this.props.onMonitorEpisodePress(_.uniq(episodeIds), monitored);
  };

  renderEpisodes() {
    const {
      items,
      columns,
      sortKey,
      sortDirection,
      isSmallScreen,
      view,
      isSelectMode,
      onSortPress,
      onTableOptionChange
    } = this.props;

    if (!items.length) {
      return (
        <Box sx={{ mb: '15px', textAlign: 'center' }}>
          {translate('NoEpisodesInThisYear')}
        </Box>
      );
    }

    if (view === 'grid') {
      return (
        <SeriesDetailsEpisodeGrid
          items={items}
          isSmallScreen={isSmallScreen}
          isSelectMode={isSelectMode}
          onMonitorEpisodePress={this.onMonitorEpisodePress}
        />
      );
    }

    return (
      <SeriesDetailsEpisodeTable
        items={items}
        columns={columns}
        sortKey={sortKey}
        sortDirection={sortDirection}
        isSelectMode={isSelectMode}
        onSortPress={onSortPress}
        onTableOptionChange={onTableOptionChange}
      >
        <TableBody>
          {
            items.map((item) => {
              return (
                <EpisodeRowConnector
                  key={item.id}
                  columns={columns}
                  {...item}
                  isSelectMode={isSelectMode}
                  onMonitorEpisodePress={this.onMonitorEpisodePress}
                />
              );
            })
          }
        </TableBody>
      </SeriesDetailsEpisodeTable>
    );
  }

  //
  // Render

  render() {
    const {
      seriesId,
      path,
      monitored,
      seasonNumber,
      allItems,
      statistics,
      isSaving,
      isExpanded,
      isSearching,
      seriesMonitored,
      isSmallScreen,
      onMonitorSeasonPress,
      onSearchPress
    } = this.props;

    const {
      sizeOnDisk = 0
    } = statistics;

    const {
      episodeCount,
      episodeFileCount,
      totalEpisodeCount,
      monitoredEpisodeCount,
      hasMonitoredEpisodes
    } = getSeasonStatistics(allItems);

    const {
      isOrganizeModalOpen,
      isManageEpisodesOpen,
      isHistoryModalOpen,
      isInteractiveSearchModalOpen
    } = this.state;

    const title = seasonNumber === 0 ? translate('Specials') : translate('SeasonNumberToken', { seasonNumber });

    return (
      <Box
        sx={(theme) => ({
          mb: '20px',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
          '&:last-of-type': { mb: 0 },
          [theme.breakpoints.down('md')]: {
            borderRight: 0,
            borderLeft: 0,
            borderRadius: 0
          }
        })}
      >
        <Box
          ref={this._headerRef}
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            fontSize: 24
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flex: '0 1 350px',
              py: '15px',
              px: '10px',
              '& .episode-count-tooltip': { display: 'flex' }
            }}
          >
            <MonitorToggleButton
              monitored={monitored}
              isDisabled={!seriesMonitored}
              isSaving={isSaving}
              size={24}
              onPress={onMonitorSeasonPress}
            />

            <Box component="span" sx={{ mr: '10px', ml: '5px' }}>
              {title}
            </Box>

            <Popover
              className="episode-count-tooltip"
              canFlip={true}
              anchor={
                <SeasonProgressLabel
                  seriesId={seriesId}
                  seasonNumber={seasonNumber}
                  monitored={monitored}
                  episodeCount={episodeCount}
                  episodeFileCount={episodeFileCount}
                  totalEpisodeCount={totalEpisodeCount}
                />
              }
              title={translate('SeasonInformation')}
              body={
                <div>
                  <SeasonInfo
                    totalEpisodeCount={totalEpisodeCount}
                    monitoredEpisodeCount={monitoredEpisodeCount}
                    episodeFileCount={episodeFileCount}
                    sizeOnDisk={sizeOnDisk}
                  />
                </div>
              }
              position={tooltipPositions.BOTTOM}
            />

            {
              sizeOnDisk ?
                <Box
                  sx={{
                    ml: '10px',
                    color: 'text.secondary',
                    fontSize: 14,
                    display: { xs: 'none', md: 'block' }
                  }}
                >
                  {formatBytes(sizeOnDisk)}
                </Box> :
                null
            }
          </Box>

          <Box sx={{ flexGrow: 1, mx: '20px', textAlign: 'center' }}>
            <Link
              onPress={this.onExpandPress}
            >
              <Box
                sx={{
                  width: 30,
                  position: { xs: 'static', md: 'absolute' },
                  top: { md: '50%' },
                  left: { md: '50%' },
                  mt: { xs: 0, md: '-12px' },
                  ml: { xs: 0, md: '-12px' }
                }}
              >
                <Icon
                  name={isExpanded ? icons.COLLAPSE : icons.EXPAND}
                  title={isExpanded ? translate('HideEpisodes') : translate('ShowEpisodes')}
                  size={24}
                />
              </Box>
              {
                !isSmallScreen &&
                  <span>&nbsp;</span>
              }
            </Link>
          </Box>

          {
            isSmallScreen ?
              <Box sx={{ flex: '0 0 45px', '& svg': { mr: 1 } }}>
                <Menu
                  alignMenu={align.RIGHT}
                  enforceMaxHeight={false}
                >
                  <MenuButton>
                    <Icon
                      name={icons.ACTIONS}
                      size={22}
                    />
                  </MenuButton>

                  <MenuContent>
                    <MenuItem
                      isDisabled={isSearching || !hasMonitoredEpisodes || !seriesMonitored}
                      onPress={onSearchPress}
                    >
                      <SpinnerIcon
                        name={icons.SEARCH}
                        isSpinning={isSearching}
                      />

                      {translate('Search')}
                    </MenuItem>

                    <MenuItem
                      onPress={this.onInteractiveSearchPress}
                      isDisabled={!totalEpisodeCount}
                    >
                      <Icon
                        name={icons.INTERACTIVE}
                      />

                      {translate('InteractiveSearch')}
                    </MenuItem>

                    <MenuItem
                      onPress={this.onOrganizePress}
                      isDisabled={!episodeFileCount}
                    >
                      <Icon
                        name={icons.ORGANIZE}
                      />

                      {translate('PreviewRename')}
                    </MenuItem>

                    <MenuItem
                      onPress={this.onManageEpisodesPress}
                      isDisabled={!episodeFileCount}
                    >
                      <Icon
                        name={icons.EPISODE_FILE}
                      />

                      {translate('ManageEpisodes')}
                    </MenuItem>

                    <MenuItem
                      onPress={this.onHistoryPress}
                      isDisabled={!totalEpisodeCount}
                    >
                      <Icon
                        name={icons.HISTORY}
                      />

                      {translate('History')}
                    </MenuItem>
                  </MenuContent>
                </Menu>
              </Box> :

              <Box sx={{ py: '15px', px: '10px' }}>
                <SpinnerIconButton
                  sx={{ width: 30 }}
                  name={icons.SEARCH}
                  title={hasMonitoredEpisodes && seriesMonitored ? translate('SearchForMonitoredEpisodesSeason') : translate('NoMonitoredEpisodesSeason')}
                  size={24}
                  isSpinning={isSearching}
                  isDisabled={isSearching || !hasMonitoredEpisodes || !seriesMonitored}
                  onPress={onSearchPress}
                />

                <IconButton
                  sx={{ width: 30 }}
                  name={icons.INTERACTIVE}
                  title={translate('InteractiveSearchSeason')}
                  size={24}
                  isDisabled={!totalEpisodeCount}
                  onPress={this.onInteractiveSearchPress}
                />

                <IconButton
                  sx={{ width: 30 }}
                  name={icons.ORGANIZE}
                  title={translate('PreviewRenameSeason')}
                  size={24}
                  isDisabled={!episodeFileCount}
                  onPress={this.onOrganizePress}
                />

                <IconButton
                  sx={{ width: 30 }}
                  name={icons.EPISODE_FILE}
                  title={translate('ManageEpisodesSeason')}
                  size={24}
                  isDisabled={!episodeFileCount}
                  onPress={this.onManageEpisodesPress}
                />

                <IconButton
                  sx={{ width: 30 }}
                  name={icons.HISTORY}
                  title={translate('HistorySeason')}
                  size={24}
                  isDisabled={!totalEpisodeCount}
                  onPress={this.onHistoryPress}
                />
              </Box>
          }

        </Box>

        <div>
          {
            isExpanded &&
              <Box sx={{ pt: '15px', borderTop: 1, borderColor: 'divider' }}>
                {this.renderEpisodes()}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: '10px',
                    px: '15px',
                    width: '100%',
                    borderTop: 1,
                    borderColor: 'divider',
                    borderBottomRightRadius: 4,
                    borderBottomLeftRadius: 4,
                    bgcolor: 'background.default',
                    '& svg': { mb: '-4px' }
                  }}
                >
                  <IconButton
                    name={icons.COLLAPSE}
                    size={20}
                    title={translate('HideEpisodes')}
                    onPress={this.onExpandPress}
                  />
                </Box>
              </Box>
          }
        </div>

        <OrganizePreviewModalConnector
          isOpen={isOrganizeModalOpen}
          seriesId={seriesId}
          seasonNumber={seasonNumber}
          onModalClose={this.onOrganizeModalClose}
        />

        <InteractiveImportModal
          isOpen={isManageEpisodesOpen}
          seriesId={seriesId}
          seasonNumber={seasonNumber}
          title={title}
          folder={path}
          initialSortKey="relativePath"
          initialSortDirection={sortDirections.DESCENDING}
          showSeries={false}
          allowSeriesChange={false}
          showDelete={true}
          showImportMode={false}
          modalTitle={translate('ManageEpisodes')}
          onModalClose={this.onManageEpisodesModalClose}
        />

        <SeriesHistoryModal
          isOpen={isHistoryModalOpen}
          seriesId={seriesId}
          seasonNumber={seasonNumber}
          onModalClose={this.onHistoryModalClose}
        />

        <SeasonInteractiveSearchModal
          isOpen={isInteractiveSearchModalOpen}
          seriesId={seriesId}
          seasonNumber={seasonNumber}
          onModalClose={this.onInteractiveSearchModalClose}
        />
      </Box>
    );
  }
}

SeriesDetailsSeason.propTypes = {
  seriesId: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  monitored: PropTypes.bool.isRequired,
  seasonNumber: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  allItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortKey: PropTypes.string.isRequired,
  sortDirection: PropTypes.oneOf(sortDirections.all),
  statistics: PropTypes.object.isRequired,
  isSaving: PropTypes.bool,
  isExpanded: PropTypes.bool,
  isSearching: PropTypes.bool.isRequired,
  seriesMonitored: PropTypes.bool.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  view: PropTypes.string.isRequired,
  isSelectMode: PropTypes.bool,
  onTableOptionChange: PropTypes.func.isRequired,
  onSortPress: PropTypes.func.isRequired,
  onMonitorSeasonPress: PropTypes.func.isRequired,
  onExpandPress: PropTypes.func.isRequired,
  onMonitorEpisodePress: PropTypes.func.isRequired,
  onSearchPress: PropTypes.func.isRequired
};

SeriesDetailsSeason.defaultProps = {
  statistics: {}
};

export default SeriesDetailsSeason;
