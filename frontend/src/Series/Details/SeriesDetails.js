import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TextTruncate from 'react-text-truncate';
import HeartRating from 'Components/HeartRating';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Measure from 'Components/Measure';
import MetadataAttribution from 'Components/MetadataAttribution';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import Popover from 'Components/Tooltip/Popover';
import Tooltip from 'Components/Tooltip/Tooltip';
import { align, icons, kinds, sizes, sortDirections, tooltipPositions } from 'Helpers/Props';
import InteractiveImportModal from 'InteractiveImport/InteractiveImportModal';
import OrganizePreviewModalConnector from 'Organize/OrganizePreviewModalConnector';
import DeleteSeriesModal from 'Series/Delete/DeleteSeriesModal';
import EditSeriesModalConnector from 'Series/Edit/EditSeriesModalConnector';
import SeriesHistoryModal from 'Series/History/SeriesHistoryModal';
import MonitoringOptionsModal from 'Series/MonitoringOptions/MonitoringOptionsModal';
import SeriesPoster from 'Series/SeriesPoster';
import { getSeriesStatusDetails } from 'Series/SeriesStatus';
import SiteRipSearchModal from 'Series/SiteRip/SiteRipSearchModal';
import QualityProfileNameConnector from 'Settings/Profiles/Quality/QualityProfileNameConnector';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import selectAll from 'Utilities/Table/selectAll';
import toggleSelected from 'Utilities/Table/toggleSelected';
import SeriesDetailsQualityFilterMenu from './Menus/SeriesDetailsQualityFilterMenu';
import SeriesDetailsRuntimeFilterMenu from './Menus/SeriesDetailsRuntimeFilterMenu';
import SeriesDetailsSortMenu from './Menus/SeriesDetailsSortMenu';
import SeriesDetailsStatusMenu from './Menus/SeriesDetailsStatusMenu';
import SeriesDetailsViewMenu from './Menus/SeriesDetailsViewMenu';
import SeriesAlternateTitles from './SeriesAlternateTitles';
import SeriesDetailsLinks from './SeriesDetailsLinks';
import SeriesDetailsSeasonConnector from './SeriesDetailsSeasonConnector';
import SeriesDetailsUnifiedGridConnector from './SeriesDetailsUnifiedGridConnector';
import SeriesGenres from './SeriesGenres';
import SeriesTagsConnector from './SeriesTagsConnector';

const detailValueSx = {
  ml: 1,
  fontWeight: 300,
  fontSize: 17
};

const defaultFontSize = parseInt('14px');
const lineHeight = parseFloat('1.528571429');

function getFanartUrl(images) {
  return _.find(images, { coverType: 'fanart' })?.url;
}

function getExpandedState(newState) {
  return {
    allExpanded: newState.allSelected,
    allCollapsed: newState.allUnselected,
    expandedState: newState.selectedState
  };
}

function getDateYear(date) {
  const dateDate = moment(date);

  return dateDate.format('YYYY');
}

class SeriesDetails extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isOrganizeModalOpen: false,
      isManageEpisodesOpen: false,
      isEditSeriesModalOpen: false,
      isDeleteSeriesModalOpen: false,
      isSeriesHistoryModalOpen: false,
      isMonitorOptionsModalOpen: false,
      isSiteRipModalOpen: false,
      allExpanded: false,
      allCollapsed: false,
      expandedState: {},
      overviewHeight: 0
    };
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

  onEditSeriesPress = () => {
    this.setState({ isEditSeriesModalOpen: true });
  };

  onEditSeriesModalClose = () => {
    this.setState({ isEditSeriesModalOpen: false });
  };

  onDeleteSeriesPress = () => {
    this.setState({
      isEditSeriesModalOpen: false,
      isDeleteSeriesModalOpen: true
    });
  };

  onDeleteSeriesModalClose = () => {
    this.setState({ isDeleteSeriesModalOpen: false });
  };

  onSeriesHistoryPress = () => {
    this.setState({ isSeriesHistoryModalOpen: true });
  };

  onSeriesHistoryModalClose = () => {
    this.setState({ isSeriesHistoryModalOpen: false });
  };

  onMonitorOptionsPress = () => {
    this.setState({ isMonitorOptionsModalOpen: true });
  };

  onMonitorOptionsClose = () => {
    this.setState({ isMonitorOptionsModalOpen: false });
  };

  onSiteRipPress = () => {
    this.setState({ isSiteRipModalOpen: true });
  };

  onSiteRipModalClose = () => {
    this.setState({ isSiteRipModalOpen: false });
  };

  onExpandAllPress = () => {
    const {
      allExpanded,
      expandedState
    } = this.state;

    this.setState(getExpandedState(selectAll(expandedState, !allExpanded)));
  };

  onExpandPress = (seasonNumber, isExpanded) => {
    this.setState((state) => {
      const convertedState = {
        allSelected: state.allExpanded,
        allUnselected: state.allCollapsed,
        selectedState: state.expandedState
      };

      const newState = toggleSelected(convertedState, [], seasonNumber, isExpanded, false);

      return getExpandedState(newState);
    });
  };

  onMeasure = ({ height }) => {
    this.setState({ overviewHeight: height });
  };

  //
  // Render

  render() {
    const {
      id,
      tvdbId,
      title,
      runtime,
      path,
      statistics,
      qualityProfileId,
      monitored,
      status,
      network,
      overview,
      images,
      seasons,
      alternateTitles,
      genres,
      ratings,
      tags,
      year,
      previousAiring,
      isSaving,
      isRefreshing,
      isSearching,
      isFetching,
      isPopulated,
      episodesError,
      episodeFilesError,
      hasEpisodes,
      hasMonitoredEpisodes,
      hasEpisodeFiles,
      hasQBittorrent,
      previousSeries,
      nextSeries,
      onMonitorTogglePress,
      onRefreshPress,
      onSearchPress,
      safeForWorkMode,
      view,
      monitorStatusFilter,
      qualityFilter,
      runtimeFilter,
      maxEpisodeRuntime,
      sortKey,
      sortDirection,
      onViewSelect,
      onStatusSelect,
      onQualityFilterChange,
      onRuntimeFilterChange,
      onSortSelect
    } = this.props;

    const {
      episodeFileCount = 0,
      sizeOnDisk = 0
    } = statistics;

    const {
      isOrganizeModalOpen,
      isManageEpisodesOpen,
      isEditSeriesModalOpen,
      isDeleteSeriesModalOpen,
      isSeriesHistoryModalOpen,
      isMonitorOptionsModalOpen,
      isSiteRipModalOpen,
      allExpanded,
      allCollapsed,
      expandedState,
      overviewHeight
    } = this.state;

    const statusDetails = getSeriesStatusDetails(status);
    const runningYears = statusDetails.title === translate('Ended') ? `${year}-${getDateYear(previousAiring)}` : `${year}-`;

    const elementStyle = {
      width: '100%',
      height: 'auto',
      objectFit: 'contain'
    };

    let episodeFilesCountMessage = translate('SiteDetailsNoEpisodeFiles');

    if (episodeFileCount === 1) {
      episodeFilesCountMessage = translate('SiteDetailsOneEpisodeFile');
    } else if (episodeFileCount > 1) {
      episodeFilesCountMessage = translate('SiteDetailsCountEpisodeFiles', { episodeFileCount });
    }

    let expandIcon = icons.EXPAND_INDETERMINATE;

    if (allExpanded) {
      expandIcon = icons.COLLAPSE;
    } else if (allCollapsed) {
      expandIcon = icons.EXPAND;
    }

    const isUnifiedGridView = view === 'unifiedGrid';

    const fanartUrl = getFanartUrl(images);

    return (
      <PageContent title={title}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('RefreshAndScan')}
              iconName={icons.REFRESH}
              spinningName={icons.REFRESH}
              title={translate('RefreshAndScanTooltip')}
              isSpinning={isRefreshing}
              onPress={onRefreshPress}
            />

            <PageToolbarButton
              label={translate('SearchMonitored')}
              iconName={icons.SEARCH}
              isDisabled={!monitored || !hasMonitoredEpisodes || !hasEpisodes}
              isSpinning={isSearching}
              title={hasMonitoredEpisodes ? undefined : translate('NoMonitoredEpisodes')}
              onPress={onSearchPress}
            />

            {
              hasQBittorrent ?
                <PageToolbarButton
                  label={translate('SiteRipSearch')}
                  iconName={icons.INTERACTIVE}
                  isDisabled={!hasEpisodes}
                  onPress={this.onSiteRipPress}
                /> :
                null
            }

            <PageToolbarSeparator />

            <PageToolbarButton
              label={translate('PreviewRename')}
              iconName={icons.ORGANIZE}
              isDisabled={!hasEpisodeFiles}
              onPress={this.onOrganizePress}
            />

            <PageToolbarButton
              label={translate('ManageEpisodes')}
              iconName={icons.EPISODE_FILE}
              onPress={this.onManageEpisodesPress}
            />

            <PageToolbarButton
              label={translate('History')}
              iconName={icons.HISTORY}
              isDisabled={!hasEpisodes}
              onPress={this.onSeriesHistoryPress}
            />

            <PageToolbarSeparator />

            <PageToolbarButton
              label={translate('SiteMonitoring')}
              iconName={icons.MONITORED}
              onPress={this.onMonitorOptionsPress}
            />

            <PageToolbarButton
              label={translate('Edit')}
              iconName={icons.EDIT}
              onPress={this.onEditSeriesPress}
            />

            <PageToolbarButton
              label={translate('Delete')}
              iconName={icons.DELETE}
              onPress={this.onDeleteSeriesPress}
            />

          </PageToolbarSection>

          <PageToolbarSection alignContent={align.RIGHT}>
            <SeriesDetailsRuntimeFilterMenu
              runtimeFilter={runtimeFilter}
              seriesMaxRuntime={maxEpisodeRuntime}
              onRuntimeFilterChange={onRuntimeFilterChange}
            />

            <PageToolbarSeparator />

            <SeriesDetailsQualityFilterMenu
              qualityFilter={qualityFilter}
              onQualityFilterChange={onQualityFilterChange}
            />

            <PageToolbarSeparator />

            <SeriesDetailsStatusMenu
              monitorStatusFilter={monitorStatusFilter}
              onStatusSelect={onStatusSelect}
            />

            <PageToolbarSeparator />

            <SeriesDetailsViewMenu
              view={view}
              onViewSelect={onViewSelect}
            />

            <SeriesDetailsSortMenu
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSortSelect={onSortSelect}
            />

            <PageToolbarSeparator />

            {
              !isUnifiedGridView &&
                <PageToolbarButton
                  label={allExpanded ? translate('CollapseAll') : translate('ExpandAll')}
                  iconName={expandIcon}
                  onPress={this.onExpandAllPress}
                />
            }
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody>
          <Box sx={{ m: { xs: '-10px', md: '-20px' } }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: 290,
                bgcolor: 'background.paper',
                backgroundImage: (theme) =>
                  `linear-gradient(145deg, ${theme.palette.action.selected} 0%, ${theme.palette.background.default} 70%)`
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  zIndex: -1,
                  width: '100%',
                  height: '100%',
                  backgroundSize: 'cover'
                }}
                style={
                  fanartUrl ?
                    { backgroundImage: `url(${fanartUrl})` } :
                    null
                }
              >
                <Box
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    bgcolor: 'common.black',
                    opacity: 0.7
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  p: { xs: '15px', md: '30px' },
                  width: '100%',
                  height: '100%',
                  color: 'common.white'
                }}
              >
                <Box
                  sx={{
                    flexShrink: 0,
                    mr: '35px',
                    maxWidth: 250,
                    display: { xs: 'none', xl: 'block' }
                  }}
                >
                  <SeriesPoster
                    style={elementStyle}
                    images={images}
                    blur={safeForWorkMode}
                    size={500}
                    lazy={false}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'space-between',
                      flex: '0 0 auto'
                    }}
                  >
                    <Box sx={{ display: 'flex', mb: '5px' }}>
                      <Box sx={{ alignSelf: 'center', mr: '10px' }}>
                        <MonitorToggleButton
                          sx={{
                            width: 40,
                            '&:hover': { color: 'text.secondary' }
                          }}
                          monitored={monitored}
                          isSaving={isSaving}
                          size={40}
                          onPress={onMonitorTogglePress}
                        />
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 300,
                          fontSize: { xs: 30, md: 50 },
                          lineHeight: { xs: '30px', md: '50px' }
                        }}
                      >
                        {title}
                      </Typography>

                      {
                        !!alternateTitles.length &&
                          <Box sx={{ alignSelf: 'flex-end', ml: '20px' }}>
                            <Popover
                              anchor={
                                <Icon
                                  name={icons.ALTERNATE_TITLES}
                                  size={20}
                                />
                              }
                              title={translate('AlternateTitles')}
                              body={<SeriesAlternateTitles alternateTitles={alternateTitles} />}
                              position={tooltipPositions.BOTTOM}
                            />
                          </Box>
                      }
                    </Box>

                    <Box sx={{ position: 'absolute', right: 0, whiteSpace: 'nowrap' }}>
                      <IconButton
                        sx={{
                          ml: '5px',
                          width: 30,
                          color: '#e1e2e3',
                          whiteSpace: 'nowrap',
                          '&:hover': { color: 'text.secondary' }
                        }}
                        name={icons.ARROW_LEFT}
                        size={30}
                        title={translate('SiteDetailsGoTo', { title: previousSeries.title })}
                        to={`/site/${previousSeries.titleSlug}`}
                      />

                      <IconButton
                        sx={{
                          ml: '5px',
                          width: 30,
                          color: '#e1e2e3',
                          whiteSpace: 'nowrap',
                          '&:hover': { color: 'text.secondary' }
                        }}
                        name={icons.ARROW_RIGHT}
                        size={30}
                        title={translate('SiteDetailsGoTo', { title: nextSeries.title })}
                        to={`/site/${nextSeries.titleSlug}`}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1, fontWeight: 300, fontSize: 20 }}>
                    <div>
                      {
                        !!runtime &&
                          <Box component="span" sx={{ mr: '15px' }}>
                            {translate('SiteDetailsRuntime', { runtime })}
                          </Box>
                      }

                      {
                        ratings.value ?
                          <HeartRating
                            rating={ratings.value}
                            iconSize={20}
                          /> :
                          null
                      }

                      <SeriesGenres genres={genres} />

                      <span>
                        {runningYears}
                      </span>
                    </div>
                  </Box>

                  <Box sx={{ '& .MuiChip-root': { m: '5px 10px 5px 0' } }}>
                    <Label
                      size={sizes.LARGE}
                    >

                      <div>
                        <Icon
                          name={icons.FOLDER}
                          size={17}
                        />
                        <Box component="span" sx={detailValueSx}>
                          {path}
                        </Box>
                      </div>
                    </Label>

                    <Tooltip
                      anchor={
                        <Label
                          size={sizes.LARGE}
                        >

                          <div>
                            <Icon
                              name={icons.DRIVE}
                              size={17}
                            />

                            <Box component="span" sx={detailValueSx}>
                              {formatBytes(sizeOnDisk)}
                            </Box>
                          </div>
                        </Label>
                      }
                      tooltip={
                        <span>
                          {episodeFilesCountMessage}
                        </span>
                      }
                      kind={kinds.INVERSE}
                      position={tooltipPositions.BOTTOM}
                    />

                    <Label
                      title={translate('QualityProfile')}
                      size={sizes.LARGE}
                    >

                      <div>
                        <Icon
                          name={icons.PROFILE}
                          size={17}
                        />
                        <Box component="span" sx={detailValueSx}>
                          {
                            <QualityProfileNameConnector
                              qualityProfileId={qualityProfileId}
                            />
                          }
                        </Box>
                      </div>
                    </Label>

                    <Label
                      size={sizes.LARGE}
                    >

                      <div>
                        <Icon
                          name={monitored ? icons.MONITORED : icons.UNMONITORED}
                          size={17}
                        />
                        <Box component="span" sx={detailValueSx}>
                          {monitored ? translate('Monitored') : translate('Unmonitored')}
                        </Box>
                      </div>
                    </Label>

                    <Label
                      title={statusDetails.message}
                      size={sizes.LARGE}
                      kind={status === 'deleted' ? kinds.INVERSE : undefined}
                    >

                      <div>
                        <Icon
                          name={statusDetails.icon}
                          size={17}
                        />
                        <Box component="span" sx={detailValueSx}>
                          {statusDetails.title}
                        </Box>
                      </div>
                    </Label>

                    {
                      !!network &&
                        <Label
                          title={translate('Network')}
                          size={sizes.LARGE}
                        >

                          <div>
                            <Icon
                              name={icons.NETWORK}
                              size={17}
                            />
                            <Box component="span" sx={detailValueSx}>
                              {network}
                            </Box>
                          </div>
                        </Label>
                    }

                    {
                      !!tvdbId && (
                        <Label
                          title={translate('TPDB ID')}
                          size={sizes.LARGE}
                        >
                          <Icon
                            name={icons.NETWORK}
                            size={17}
                          />
                          <Box component="span" sx={detailValueSx}>
                            {tvdbId}
                          </Box>
                        </Label>
                      )
                    }

                    <Tooltip
                      anchor={
                        <Label
                          size={sizes.LARGE}
                        >

                          <div>
                            <Icon
                              name={icons.EXTERNAL_LINK}
                              size={17}
                            />
                            <Box component="span" sx={detailValueSx}>
                              {translate('Links')}
                            </Box>
                          </div>
                        </Label>
                      }

                      tooltip={
                        <SeriesDetailsLinks
                          tvdbId={tvdbId}
                        />
                      }
                      kind={kinds.INVERSE}
                      position={tooltipPositions.BOTTOM}
                    />

                    {
                      !!tags.length &&
                        <Tooltip
                          anchor={
                            <Label
                              size={sizes.LARGE}
                            >
                              <Icon
                                name={icons.TAGS}
                                size={17}
                              />

                              <Box component="span" sx={detailValueSx}>
                                {translate('Tags')}
                              </Box>
                            </Label>
                          }
                          tooltip={<SeriesTagsConnector seriesId={id} />}
                          kind={kinds.INVERSE}
                          position={tooltipPositions.BOTTOM}
                        />

                    }
                  </Box>

                  <Measure onMeasure={this.onMeasure}>
                    <Box
                      sx={{
                        flex: '1 0 0',
                        mt: 1,
                        minHeight: 0,
                        fontSize: 15
                      }}
                    >
                      <TextTruncate
                        line={Math.floor(overviewHeight / (defaultFontSize * lineHeight)) - 1}
                        text={overview}
                      />
                    </Box>
                  </Measure>

                  <MetadataAttribution />
                </Box>
              </Box>
            </Box>

            <Box sx={{ p: { xs: '20px 0', md: '20px' } }}>
              {
                !isPopulated && !isUnifiedGridView && !episodesError && !episodeFilesError &&
                  <LoadingIndicator />
              }

              {
                !isFetching && !isUnifiedGridView && episodesError &&
                  <div>{translate('EpisodesLoadError')}</div>
              }

              {
                !isFetching && !isUnifiedGridView && episodeFilesError &&
                  <div>{translate('EpisodeFilesLoadError')}</div>
              }

              {
                isUnifiedGridView &&
                  <SeriesDetailsUnifiedGridConnector
                    seriesId={id}
                  />
              }

              {
                isPopulated && !isUnifiedGridView && !!seasons.length &&
                  <div>
                    {
                      seasons.slice(0).reverse().map((season) => {
                        return (
                          <SeriesDetailsSeasonConnector
                            key={season.seasonNumber}
                            seriesId={id}
                            view={view}
                            monitorStatusFilter={monitorStatusFilter}
                            qualityFilter={qualityFilter}
                            runtimeFilter={runtimeFilter}
                            maxEpisodeRuntime={maxEpisodeRuntime}
                            {...season}
                            isExpanded={expandedState[season.seasonNumber]}
                            onExpandPress={this.onExpandPress}
                          />
                        );
                      })
                    }
                  </div>
              }

              {
                isPopulated && !isUnifiedGridView && !seasons.length &&
                  <div>
                    {translate('NoEpisodeInformation')}
                  </div>
              }

            </Box>
          </Box>

          <OrganizePreviewModalConnector
            isOpen={isOrganizeModalOpen}
            seriesId={id}
            onModalClose={this.onOrganizeModalClose}
          />

          <InteractiveImportModal
            isOpen={isManageEpisodesOpen}
            seriesId={id}
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
            isOpen={isSeriesHistoryModalOpen}
            seriesId={id}
            onModalClose={this.onSeriesHistoryModalClose}
          />

          <EditSeriesModalConnector
            isOpen={isEditSeriesModalOpen}
            seriesId={id}
            onModalClose={this.onEditSeriesModalClose}
            onDeleteSeriesPress={this.onDeleteSeriesPress}
          />

          <DeleteSeriesModal
            isOpen={isDeleteSeriesModalOpen}
            seriesId={id}
            onModalClose={this.onDeleteSeriesModalClose}
          />

          <MonitoringOptionsModal
            isOpen={isMonitorOptionsModalOpen}
            seriesId={id}
            onModalClose={this.onMonitorOptionsClose}
          />

          <SiteRipSearchModal
            isOpen={isSiteRipModalOpen}
            seriesId={id}
            seriesTitle={title}
            onModalClose={this.onSiteRipModalClose}
          />
        </PageContentBody>
      </PageContent>
    );
  }
}

SeriesDetails.propTypes = {
  id: PropTypes.number.isRequired,
  tvdbId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  runtime: PropTypes.number.isRequired,
  path: PropTypes.string.isRequired,
  statistics: PropTypes.object.isRequired,
  qualityProfileId: PropTypes.number.isRequired,
  monitored: PropTypes.bool.isRequired,
  monitor: PropTypes.string,
  status: PropTypes.string.isRequired,
  network: PropTypes.string,
  overview: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  seasons: PropTypes.arrayOf(PropTypes.object).isRequired,
  alternateTitles: PropTypes.arrayOf(PropTypes.object).isRequired,
  genres: PropTypes.arrayOf(PropTypes.string).isRequired,
  ratings: PropTypes.object.isRequired,
  tags: PropTypes.arrayOf(PropTypes.number).isRequired,
  year: PropTypes.number.isRequired,
  previousAiring: PropTypes.string,
  isSaving: PropTypes.bool.isRequired,
  saveError: PropTypes.object,
  isRefreshing: PropTypes.bool.isRequired,
  isSearching: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  episodesError: PropTypes.object,
  episodeFilesError: PropTypes.object,
  hasEpisodes: PropTypes.bool.isRequired,
  hasMonitoredEpisodes: PropTypes.bool.isRequired,
  hasEpisodeFiles: PropTypes.bool.isRequired,
  hasQBittorrent: PropTypes.bool.isRequired,
  previousSeries: PropTypes.object.isRequired,
  nextSeries: PropTypes.object.isRequired,
  onMonitorTogglePress: PropTypes.func.isRequired,
  onRefreshPress: PropTypes.func.isRequired,
  onSearchPress: PropTypes.func.isRequired,
  onViewSelect: PropTypes.func.isRequired,
  onStatusSelect: PropTypes.func.isRequired,
  onQualityFilterChange: PropTypes.func.isRequired,
  onRuntimeFilterChange: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  monitorStatusFilter: PropTypes.string.isRequired,
  qualityFilter: PropTypes.object.isRequired,
  runtimeFilter: PropTypes.object.isRequired,
  maxEpisodeRuntime: PropTypes.number.isRequired,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.string,
  safeForWorkMode: PropTypes.bool,
  onSortSelect: PropTypes.func.isRequired
};

SeriesDetails.defaultProps = {
  statistics: {},
  tags: [],
  isSaving: false
};

export default SeriesDetails;
