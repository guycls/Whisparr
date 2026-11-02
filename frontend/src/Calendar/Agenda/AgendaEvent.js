import Box from '@mui/material/Box';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CalendarEventQueueDetails from 'Calendar/Events/CalendarEventQueueDetails';
import calendarStatusSx from 'Calendar/calendarStatusSx';
import getStatusStyle from 'Calendar/getStatusStyle';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import EpisodeDetailsModal from 'Episode/EpisodeDetailsModal';
import episodeEntities from 'Episode/episodeEntities';
import { icons, kinds } from 'Helpers/Props';
import formatTime from 'Utilities/Date/formatTime';
import translate from 'Utilities/String/translate';

class AgendaEvent extends Component {
  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isDetailsModalOpen: false
    };
  }

  //
  // Listeners

  onPress = () => {
    this.setState({ isDetailsModalOpen: true });
  };

  onDetailsModalClose = () => {
    this.setState({ isDetailsModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      id,
      series,
      episodeFile,
      title,
      seasonNumber,
      absoluteEpisodeNumber,
      releaseDate,
      monitored,
      unverifiedSceneNumbering,
      hasFile,
      grabbed,
      queueItem,
      showDate,
      showEpisodeInformation,
      showCutoffUnmetIcon,
      timeFormat,
      longDateFormat,
      colorImpairedMode
    } = this.props;

    const startTime = moment(releaseDate);
    const endTime = moment(releaseDate).add(series.runtime, 'minutes');
    const downloading = !!(queueItem || grabbed);
    const isMonitored = series.monitored && monitored;
    const statusStyle = getStatusStyle(hasFile, downloading, startTime, endTime, isMonitored);

    const statusIconStyle = {
      marginLeft: 3,
      cursor: 'default',
      pointerEvents: 'all'
    };
    const truncateSx = {
      overflow: 'hidden',
      maxWidth: '100%',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };

    return (
      <Box
        sx={{
          position: 'relative',
          p: '5px',
          borderBottom: '1px solid var(--borderColor)'
        }}
      >
        <Box
          component={Link}
          onPress={this.onPress}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            p: 0,
            minWidth: 0,
            '&:hover': {
              backgroundColor: 'var(--tableRowHoverBackgroundColor)'
            }
          }}
        />

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            overflowX: 'hidden',
            fontSize: 14,
            pointerEvents: 'none',
            userSelect: 'none',
            flexDirection: { xs: 'column', md: 'row' },
            '& a, & button': {
              pointerEvents: 'all'
            }
          }}
        >
          <Box
            sx={{
              flex: { xs: '0 0 100%', md: '0 0 250px' },
              fontWeight: 'bold',
              ml: { xs: '10px', md: 0 }
            }}
          >
            {
              showDate &&
                startTime.format(longDateFormat)
            }
          </Box>

          <Box
            sx={{
              display: { xs: 'block', md: 'flex' },
              flex: { xs: '0 0 auto', md: '1 0 1px' },
              overflowX: 'hidden',
              pl: '6px',
              borderLeftWidth: 4,
              borderLeftStyle: 'solid',
              ...calendarStatusSx(statusStyle, false, colorImpairedMode)
            }}
          >
            <Box
              sx={{
                flex: { xs: '0 0 100%', md: '0 0 125px' },
                mr: '10px',
                border: 'none !important'
              }}
            >
              {formatTime(releaseDate, timeFormat)} - {formatTime(endTime.toISOString(), timeFormat, { includeMinuteZero: true })}
            </Box>

            <Box
              sx={{
                ...truncateSx,
                flex: { xs: '0 0 100%', md: '0 1 300px' },
                mr: '10px'
              }}
            >
              {series.title}
            </Box>

            {
              showEpisodeInformation &&
                <Box sx={{ flex: { xs: '0 0 auto', md: '0 0 100px' } }}>
                  {seasonNumber}x{releaseDate}

                  <Box
                    component="span"
                    sx={{
                      display: { xs: 'inline-block', md: 'none' },
                      mx: '5px'
                    }}
                  >
                    -
                  </Box>
                </Box>
            }

            <Box
              sx={{
                ...truncateSx,
                flex: '1 1 1px',
                mr: '10px'
              }}
            >
              {
                showEpisodeInformation &&
                title
              }
            </Box>

            {
              unverifiedSceneNumbering ?
                <Icon
                  style={statusIconStyle}
                  name={icons.WARNING}
                  title={translate('SceneNumberNotVerified')}
                /> :
                null
            }

            {
              !!queueItem &&
                <Box component="span" sx={statusIconStyle}>
                  <CalendarEventQueueDetails
                    seasonNumber={seasonNumber}
                    absoluteEpisodeNumber={absoluteEpisodeNumber}
                    {...queueItem}
                  />
                </Box>
            }

            {
              !queueItem && grabbed &&
                <Icon
                  style={statusIconStyle}
                  name={icons.DOWNLOADING}
                  title={translate('EpisodeIsDownloading')}
                />
            }

            {
              showCutoffUnmetIcon &&
              !!episodeFile &&
              episodeFile.qualityCutoffNotMet &&
                <Icon
                  style={statusIconStyle}
                  name={icons.EPISODE_FILE}
                  kind={kinds.WARNING}
                  title={translate('QualityCutoffNotMet')}
                />
            }
          </Box>
        </Box>

        <EpisodeDetailsModal
          isOpen={this.state.isDetailsModalOpen}
          episodeId={id}
          episodeEntity={episodeEntities.CALENDAR}
          seriesId={series.id}
          episodeTitle={title}
          showOpenSeriesButton={true}
          onModalClose={this.onDetailsModalClose}
        />
      </Box>
    );
  }
}

AgendaEvent.propTypes = {
  id: PropTypes.number.isRequired,
  series: PropTypes.object.isRequired,
  episodeFile: PropTypes.object,
  title: PropTypes.string.isRequired,
  seasonNumber: PropTypes.number.isRequired,
  absoluteEpisodeNumber: PropTypes.number,
  releaseDate: PropTypes.string.isRequired,
  monitored: PropTypes.bool.isRequired,
  unverifiedSceneNumbering: PropTypes.bool,
  hasFile: PropTypes.bool.isRequired,
  grabbed: PropTypes.bool,
  queueItem: PropTypes.object,
  showDate: PropTypes.bool.isRequired,
  showEpisodeInformation: PropTypes.bool.isRequired,
  showFinaleIcon: PropTypes.bool.isRequired,
  showSpecialIcon: PropTypes.bool.isRequired,
  showCutoffUnmetIcon: PropTypes.bool.isRequired,
  timeFormat: PropTypes.string.isRequired,
  longDateFormat: PropTypes.string.isRequired,
  colorImpairedMode: PropTypes.bool.isRequired
};

export default AgendaEvent;
