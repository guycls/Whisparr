import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component, useEffect, useState } from 'react';
import TextTruncate from 'react-text-truncate';
import { SelectProvider } from 'App/SelectContext';
import HeartRating from 'Components/HeartRating';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import MetadataAttribution from 'Components/MetadataAttribution';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import CardSizeMenu from 'Components/Page/Toolbar/CardSizeMenu';
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
import { getSeriesStatusDetails } from 'Series/SeriesStatus';
import SiteRipSearchModal from 'Series/SiteRip/SiteRipSearchModal';
import QualityProfileNameConnector from 'Settings/Profiles/Quality/QualityProfileNameConnector';
import {
  SERIES_DETAILS_CARD_SIZE_MAX,
  SERIES_DETAILS_CARD_SIZE_MIN,
  SERIES_DETAILS_CARD_SIZE_STEP
} from 'Store/Actions/seriesDetailsActions';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import selectAll from 'Utilities/Table/selectAll';
import toggleSelected from 'Utilities/Table/toggleSelected';
import SeriesDetailsQualityFilterMenu from './Menus/SeriesDetailsQualityFilterMenu';
import SeriesDetailsRuntimeFilterMenu from './Menus/SeriesDetailsRuntimeFilterMenu';
import SeriesDetailsSortMenu from './Menus/SeriesDetailsSortMenu';
import SeriesDetailsStatusMenu from './Menus/SeriesDetailsStatusMenu';
import SeriesDetailsViewMenu from './Menus/SeriesDetailsViewMenu';
import SeriesDetailsSelectAllButton from './Select/SeriesDetailsSelectAllButton';
import SeriesDetailsSelectAllMenuItem from './Select/SeriesDetailsSelectAllMenuItem';
import SeriesDetailsSelectFooter from './Select/SeriesDetailsSelectFooter';
import SeriesDetailsSelectModeButton from './Select/SeriesDetailsSelectModeButton';
import SeriesDetailsSelectModeMenuItem from './Select/SeriesDetailsSelectModeMenuItem';
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

function bannerLogoUrl(images) {
  const logo = Array.isArray(images) ?
    images.find((image) => image.coverType === 'logo') :
    null;

  if (!logo?.url) {
    return null;
  }

  const pixelRatio = Math.max(Math.round(window.devicePixelRatio), 1);

  return logo.url.replace('logo.jpg', `logo-${pixelRatio * 500}.jpg`);
}

function BannerSiteTitle(props) {
  const {
    images,
    title,
    blur
  } = props;
  const logoUrl = bannerLogoUrl(images);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logoUrl]);

  if (logoUrl && !failed) {
    return (
      <Box
        component="img"
        alt={title}
        src={logoUrl}
        onError={() => setFailed(true)}
        sx={{
          display: 'block',
          maxHeight: { xs: 48, md: 72 },
          maxWidth: '100%',
          objectFit: 'contain',
          objectPosition: 'left center',
          filter: blur ? 'blur(13px)' : 'none'
        }}
      />
    );
  }

  return (
    <Typography
      sx={{
        fontWeight: 300,
        fontSize: { xs: 30, md: 50 },
        lineHeight: { xs: '36px', md: '50px' },
        overflowWrap: 'anywhere'
      }}
    >
      {title}
    </Typography>
  );
}

BannerSiteTitle.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string.isRequired,
  blur: PropTypes.bool
};

const bannerNavButtonSx = {
  ml: '5px',
  width: 30,
  color: 'primary.main',
  whiteSpace: 'nowrap',
  '& .MuiSvgIcon-root': {
    color: 'primary.main'
  },
  '&:hover': {
    color: 'primary.dark',
    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12)
  },
  '&:hover .MuiSvgIcon-root': {
    color: 'primary.dark'
  }
};

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
      isSelectMode: false,
      allExpanded: false,
      allCollapsed: false,
      expandedState: {}
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

  onSelectModePress = () => {
    this.setState({ isSelectMode: !this.state.isSelectMode });
  };

  onDeleteStarted = () => {
    this.setState({ isSelectMode: false });
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
      cardSize,
      sortKey,
      sortDirection,
      onViewSelect,
      onStatusSelect,
      onQualityFilterChange,
      onRuntimeFilterChange,
      onCardSizeChange,
      onSortSelect,
      selectableItems
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
      isSelectMode,
      allExpanded,
      allCollapsed,
      expandedState
    } = this.state;

    const statusDetails = getSeriesStatusDetails(status);
    const runningYears = statusDetails.title === translate('Ended') ? `${year}-${getDateYear(previousAiring)}` : `${year}-`;

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

    return (
      <SelectProvider items={selectableItems || []}>
        <PageContent title={title}>
          <PageToolbar>
            <PageToolbarSection>
              <SeriesDetailsSelectModeButton
                label={
                  isSelectMode ?
                    translate('StopSelecting') :
                    translate('SelectScenes')
                }
                iconName={isSelectMode ? icons.SERIES_ENDED : icons.CHECK}
                isSelectMode={isSelectMode}
                overflowComponent={SeriesDetailsSelectModeMenuItem}
                onPress={this.onSelectModePress}
              />

              <SeriesDetailsSelectAllButton
                isSelectMode={isSelectMode}
                overflowComponent={SeriesDetailsSelectAllMenuItem}
              />

              <PageToolbarSeparator />
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
                iconName={icons.PAGEVIEW}
                isDisabled={!monitored || !hasMonitoredEpisodes || !hasEpisodes}
                isSpinning={isSearching}
                title={hasMonitoredEpisodes ? undefined : translate('NoMonitoredEpisodes')}
                onPress={onSearchPress}
              />

              {
                hasQBittorrent ?
                  <PageToolbarButton
                    label={translate('SiteRipSearch')}
                    iconName={icons.SITE_RIP_SEARCH}
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
                iconName={icons.LIST}
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
                iconName={icons.SERIES_EDIT}
                onPress={this.onEditSeriesPress}
              />

              <PageToolbarButton
                label={translate('Delete')}
                iconName={icons.DELETE}
                onPress={this.onDeleteSeriesPress}
              />

            </PageToolbarSection>

            <PageToolbarSection alignContent={align.RIGHT}>
              <CardSizeMenu
                cardSize={cardSize}
                min={SERIES_DETAILS_CARD_SIZE_MIN}
                max={SERIES_DETAILS_CARD_SIZE_MAX}
                step={SERIES_DETAILS_CARD_SIZE_STEP}
                onCardSizeChange={onCardSizeChange}
              />

              <PageToolbarSeparator />

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
                  minHeight: 210,
                  height: 'auto',
                  bgcolor: 'transparent'
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'stretch', md: 'flex-start' },
                    gap: { xs: 2, md: 3 },
                    p: { xs: '15px', md: '30px' },
                    width: '100%',
                    color: 'text.primary'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: '0 0 auto',
                      alignSelf: { md: 'center' },
                      minWidth: 0,
                      maxWidth: { md: '46%' }
                    }}
                  >
                    <Box sx={{ alignSelf: 'center', mr: '10px', flexShrink: 0 }}>
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

                    <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center' }}>
                      <BannerSiteTitle
                        images={images}
                        title={title}
                        blur={safeForWorkMode}
                      />

                      {
                        !!alternateTitles.length &&
                          <Box sx={{ alignSelf: 'flex-end', ml: '20px', flexShrink: 0 }}>
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

                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, ml: 2 }}>
                      <IconButton
                        sx={bannerNavButtonSx}
                        name={icons.ARROW_LEFT}
                        size={30}
                        title={translate('SiteDetailsGoTo', { title: previousSeries.title })}
                        to={`/site/${previousSeries.titleSlug}`}
                      />

                      <IconButton
                        sx={bannerNavButtonSx}
                        name={icons.ARROW_RIGHT}
                        size={30}
                        title={translate('SiteDetailsGoTo', { title: nextSeries.title })}
                        to={`/site/${nextSeries.titleSlug}`}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                    <Box sx={{ mb: 1, color: 'text.primary', fontWeight: 300, fontSize: 20 }}>
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

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        '& .MuiChip-root': {
                          m: '5px 10px 5px 0',
                          maxWidth: '100%',
                          height: 'auto',
                          '& .MuiChip-label': {
                            display: 'inline-flex',
                            alignItems: 'center',
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            '& > div': {
                              display: 'inline-flex',
                              alignItems: 'center'
                            },
                            '& .MuiSvgIcon-root': {
                              display: 'block'
                            }
                          }
                        },
                        '& .MuiChip-root.MuiChip-outlined': {
                          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.08),
                          color: 'text.primary',
                          borderColor: (theme) => alpha(theme.palette.text.primary, 0.16)
                        }
                      }}
                    >
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

                    <Box sx={{ mt: 1, fontSize: 15 }}>
                      <TextTruncate
                        line={4}
                        text={overview}
                      />
                    </Box>

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
                      isSelectMode={isSelectMode}
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
                              isSelectMode={isSelectMode}
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

          {
            isSelectMode ?
              <SeriesDetailsSelectFooter
                items={selectableItems || []}
                seriesMonitored={monitored}
                episodeEntity={isUnifiedGridView ? 'seriesDetails.unifiedGrid' : 'episodes'}
                onDeleteStarted={this.onDeleteStarted}
              /> :
              null
          }
        </PageContent>
      </SelectProvider>
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
  selectableItems: PropTypes.arrayOf(PropTypes.object),
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
  onCardSizeChange: PropTypes.func.isRequired,
  cardSize: PropTypes.number.isRequired,
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
