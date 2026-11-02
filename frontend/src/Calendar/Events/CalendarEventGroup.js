import Box from '@mui/material/Box';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CalendarEventConnector from 'Calendar/Events/CalendarEventConnector';
import calendarStatusSx from 'Calendar/calendarStatusSx';
import getStatusStyle from 'Calendar/getStatusStyle';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function getEventsInfo(series, events) {
  let files = 0;
  let queued = 0;
  let monitored = 0;
  let absoluteEpisodeNumbers = 0;

  events.forEach((event) => {
    if (event.episodeFileId) {
      files++;
    }

    if (event.queued) {
      queued++;
    }

    if (series.monitored && event.monitored) {
      monitored++;
    }

    if (event.absoluteEpisodeNumber) {
      absoluteEpisodeNumbers++;
    }
  });

  return {
    allDownloaded: files === events.length,
    anyQueued: queued > 0,
    anyMonitored: monitored > 0,
    allAbsoluteEpisodeNumbers: absoluteEpisodeNumbers === events.length
  };
}

class CalendarEventGroup extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isExpanded: false
    };
  }

  //
  // Listeners

  onExpandPress = () => {
    this.setState({ isExpanded: !this.state.isExpanded });
  };

  //
  // Render

  render() {
    const {
      series,
      events,
      isDownloading,
      showEpisodeInformation,
      fullColorEvents,
      colorImpairedMode,
      onEventModalOpenToggle
    } = this.props;

    const { isExpanded } = this.state;
    const {
      allDownloaded,
      anyQueued,
      anyMonitored
    } = getEventsInfo(series, events);
    const anyDownloading = isDownloading || anyQueued;
    const firstEpisode = events[0];
    const lastEpisode = events[events.length -1];
    const releaseDate = firstEpisode.releaseDate;
    const startTime = moment(releaseDate);
    const endTime = moment(lastEpisode.releaseDate).add(series.runtime, 'minutes');
    const seasonNumber = firstEpisode.seasonNumber;
    const statusStyle = getStatusStyle(allDownloaded, anyDownloading, startTime, endTime, anyMonitored);

    if (isExpanded) {
      return (
        <div>
          {
            events.map((event) => {
              if (event.isGroup) {
                return null;
              }

              return (
                <CalendarEventConnector
                  key={event.id}
                  episodeId={event.id}
                  {...event}
                  onEventModalOpenToggle={onEventModalOpenToggle}
                />
              );
            })
          }

          <Link
            component="div"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 5
            }}
            onPress={this.onExpandPress}
          >
            <Icon
              name={icons.COLLAPSE}
            />
          </Link>
        </div>
      );
    }

    return (
      <Box
        sx={{
          overflowX: 'hidden',
          m: '4px 2px',
          p: '5px',
          borderBottom: '1px solid var(--borderColor)',
          borderLeft: '4px solid var(--borderColor)',
          fontSize: 12,
          ...calendarStatusSx(statusStyle, fullColorEvents, colorImpairedMode)
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

          {
            anyDownloading &&
              <Box sx={{ ml: '3px' }}>
                <Icon
                  name={icons.DOWNLOADING}
                  title={translate('AnEpisodeIsDownloading')}
                />
              </Box>
          }
        </Box>

        <Box sx={{ display: 'flex' }}>
          {
            showEpisodeInformation ?
              <Box sx={{ ml: '10px', color: 'var(--calendarTextDim)' }}>
                {seasonNumber}
              </Box> :
              <Link
                component="div"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  flex: '1 0 20px'
                }}
                onPress={this.onExpandPress}
              >
                <Icon
                  name={icons.EXPAND}
                />
              </Link>
          }
        </Box>

        {
          showEpisodeInformation ?
            <Link
              component="div"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onPress={this.onExpandPress}
            >
              &nbsp;
              <Icon
                name={icons.EXPAND}
              />
              &nbsp;
            </Link> :
            null
        }
      </Box>
    );
  }
}

CalendarEventGroup.propTypes = {
  // Most of these props come from the connector and are required, but TS is confused.
  series: PropTypes.object,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDownloading: PropTypes.bool,
  showEpisodeInformation: PropTypes.bool,
  showFinaleIcon: PropTypes.bool,
  fullColorEvents: PropTypes.bool,
  timeFormat: PropTypes.string,
  colorImpairedMode: PropTypes.bool,
  onEventModalOpenToggle: PropTypes.func.isRequired
};

export default CalendarEventGroup;
