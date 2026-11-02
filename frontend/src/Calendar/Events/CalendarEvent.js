import Box from '@mui/material/Box';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import calendarStatusSx from 'Calendar/calendarStatusSx';
import getStatusStyle from 'Calendar/getStatusStyle';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import EpisodeDetailsModal from 'Episode/EpisodeDetailsModal';
import episodeEntities from 'Episode/episodeEntities';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import CalendarEventQueueDetails from './CalendarEventQueueDetails';

class CalendarEvent extends Component {

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
    this.setState({ isDetailsModalOpen: true }, () => {
      this.props.onEventModalOpenToggle(true);
    });
  };

  onDetailsModalClose = () => {
    this.setState({ isDetailsModalOpen: false }, () => {
      this.props.onEventModalOpenToggle(false);
    });
  };

  //
  // Render

  render() {
    const {
      id,
      series,
      episodeFile,
      title,
      releaseDate,
      monitored,
      unverifiedSceneNumbering,
      hasFile,
      grabbed,
      queueItem,
      showEpisodeInformation,
      showCutoffUnmetIcon,
      fullColorEvents,
      colorImpairedMode
    } = this.props;

    if (!series) {
      return null;
    }

    const startTime = moment(releaseDate);
    const endTime = moment(releaseDate).add(series.runtime, 'minutes');
    const isDownloading = !!(queueItem || grabbed);
    const isMonitored = series.monitored && monitored;
    const statusStyle = getStatusStyle(hasFile, isDownloading, startTime, endTime, isMonitored);

    const statusIconStyle = {
      marginLeft: 3,
      cursor: 'default',
      pointerEvents: 'all'
    };

    return (
      <Box
        sx={{
          position: 'relative',
          m: '4px 2px',
          p: '5px',
          borderBottom: '1px solid var(--calendarBorderColor)',
          borderLeft: '4px solid var(--calendarBorderColor)',
          ...calendarStatusSx(statusStyle, fullColorEvents, colorImpairedMode)
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
            minWidth: 0
          }}
        />

        <Box
          sx={{
            position: 'relative',
            overflowX: 'hidden',
            fontSize: 12,
            pointerEvents: 'none',
            userSelect: 'none',
            '& a, & button': {
              pointerEvents: 'all'
            }
          }}
        >
          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{
                overflow: 'hidden',
                maxWidth: '100%',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: '1 0 1px',
                mr: '10px',
                color: 'var(--calendarTextDimAlternate)',
                fontSize: 14
              }}
            >
              {series.title}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                queueItem ?
                  <Box component="span" sx={statusIconStyle}>
                    <CalendarEventQueueDetails
                      {...queueItem}
                    />
                  </Box> :
                  null
              }

              {
                !queueItem && grabbed ?
                  <Icon
                    style={statusIconStyle}
                    name={icons.DOWNLOADING}
                    title={translate('EpisodeIsDownloading')}
                  /> :
                  null
              }

              {
                showCutoffUnmetIcon &&
                !!episodeFile &&
                episodeFile.qualityCutoffNotMet ?
                  <Icon
                    style={statusIconStyle}
                    name={icons.EPISODE_FILE}
                    kind={fullColorEvents ? kinds.DEFAULT : kinds.WARNING}
                    title={translate('QualityCutoffNotMet')}
                  /> :
                  null
              }
            </Box>
          </Box>

          {
            showEpisodeInformation ?
              <Box sx={{ display: 'flex', color: 'var(--calendarTextDim)' }}>
                <Box
                  sx={{
                    overflow: 'hidden',
                    maxWidth: '100%',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: '1 0 1px',
                    mr: '10px'
                  }}
                >
                  {title}
                </Box>

                <div>
                  {releaseDate}
                </div>
              </Box> :
              null
          }
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

CalendarEvent.propTypes = {
  id: PropTypes.number.isRequired,
  episodeId: PropTypes.number.isRequired,
  series: PropTypes.object.isRequired,
  episodeFile: PropTypes.object,
  title: PropTypes.string.isRequired,
  absoluteEpisodeNumber: PropTypes.number,
  releaseDate: PropTypes.string.isRequired,
  monitored: PropTypes.bool.isRequired,
  unverifiedSceneNumbering: PropTypes.bool,
  hasFile: PropTypes.bool.isRequired,
  grabbed: PropTypes.bool,
  queueItem: PropTypes.object,
  // These props come from the connector, not marked as required to appease TS for now.
  showEpisodeInformation: PropTypes.bool,
  showFinaleIcon: PropTypes.bool,
  showSpecialIcon: PropTypes.bool,
  showCutoffUnmetIcon: PropTypes.bool,
  fullColorEvents: PropTypes.bool,
  timeFormat: PropTypes.string,
  colorImpairedMode: PropTypes.bool,
  onEventModalOpenToggle: PropTypes.func
};

export default CalendarEvent;
