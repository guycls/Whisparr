import Box from '@mui/material/Box';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as calendarViews from 'Calendar/calendarViews';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Menu from 'Components/Menu/Menu';
import MenuButton from 'Components/Menu/MenuButton';
import MenuContent from 'Components/Menu/MenuContent';
import ViewMenuItem from 'Components/Menu/ViewMenuItem';
import { align, icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import CalendarHeaderViewButton from './CalendarHeaderViewButton';

function getTitle(time, start, end, view, longDateFormat) {
  const timeMoment = moment(time);
  const startMoment = moment(start);
  const endMoment = moment(end);

  if (view === 'day') {
    return timeMoment.format(longDateFormat);
  } else if (view === 'month') {
    return timeMoment.format('MMMM YYYY');
  } else if (view === 'agenda') {
    return translate('Agenda');
  }

  let startFormat = 'MMM D YYYY';
  let endFormat = 'MMM D YYYY';

  if (startMoment.isSame(endMoment, 'month')) {
    startFormat = 'MMM D';
    endFormat = 'D YYYY';
  } else if (startMoment.isSame(endMoment, 'year')) {
    startFormat = 'MMM D';
    endFormat = 'MMM D YYYY';
  }

  return `${startMoment.format(startFormat)} \u2014 ${endMoment.format(endFormat)}`;
}

// TODO Convert to a stateful Component so we can track view internally when changed

class CalendarHeader extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      view: props.view
    };
  }

  componentDidUpdate(prevProps) {
    const view = this.props.view;

    if (prevProps.view !== view) {
      this.setState({ view });
    }
  }

  //
  // Listeners

  onViewChange = (view) => {
    this.setState({ view }, () => {
      this.props.onViewChange(view);
    });
  };

  //
  // Render

  render() {
    const {
      isFetching,
      time,
      start,
      end,
      longDateFormat,
      isSmallScreen,
      collapseViewButtons,
      onTodayPress,
      onPreviousPress,
      onNextPress
    } = this.props;

    const view = this.state.view;

    const title = getTitle(time, start, end, view, longDateFormat);

    return (
      <div>
        {
          isSmallScreen &&
            <Box
              sx={{
                mb: '5px',
                textAlign: 'center',
                fontSize: 18
              }}
            >
              {title}
            </Box>
        }

        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              flex: { xs: '1 0 50%', md: '1 1 33%' },
              textAlign: 'left'
            }}
          >
            <Button
              buttonGroupPosition={align.LEFT}
              isDisabled={view === calendarViews.AGENDA}
              onPress={onPreviousPress}
            >
              <Icon name={icons.PAGE_PREVIOUS} />
            </Button>

            <Button
              buttonGroupPosition={align.RIGHT}
              isDisabled={view === calendarViews.AGENDA}
              onPress={onNextPress}
            >
              <Icon name={icons.PAGE_NEXT} />
            </Button>

            <Box component="span" sx={{ ml: '5px' }}>
              <Button
                isDisabled={view === calendarViews.AGENDA}
                onPress={onTodayPress}
              >
                {translate('Today')}
              </Button>
            </Box>
          </Box>

          {
            !isSmallScreen &&
              <Box
                sx={{
                  textAlign: 'center',
                  fontSize: 18
                }}
              >
                {title}
              </Box>
          }

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              flex: { xs: '0 0 100px', md: '1 1 33%' }
            }}
          >
            {
              isFetching &&
                <Box sx={{ mt: '5px', mr: '10px' }}>
                  <LoadingIndicator
                    size={20}
                  />
                </Box>
            }

            {
              collapseViewButtons ?
                <Box sx={{ lineHeight: '31px' }}>
                  <Menu
                    alignMenu={align.RIGHT}
                  >
                  <MenuButton>
                    <Icon
                      name={icons.VIEW}
                      size={22}
                    />
                  </MenuButton>

                  <MenuContent>
                    {
                      isSmallScreen ?
                        null :
                        <ViewMenuItem
                          name={calendarViews.MONTH}
                          selectedView={view}
                          onPress={this.onViewChange}
                        >
                          {translate('Month')}
                        </ViewMenuItem>
                    }

                    <ViewMenuItem
                      name={calendarViews.WEEK}
                      selectedView={view}
                      onPress={this.onViewChange}
                    >
                      {translate('Week')}
                    </ViewMenuItem>

                    <ViewMenuItem
                      name={calendarViews.FORECAST}
                      selectedView={view}
                      onPress={this.onViewChange}
                    >
                      {translate('Forecast')}
                    </ViewMenuItem>

                    <ViewMenuItem
                      name={calendarViews.DAY}
                      selectedView={view}
                      onPress={this.onViewChange}
                    >
                      {translate('Day')}
                    </ViewMenuItem>

                    <ViewMenuItem
                      name={calendarViews.AGENDA}
                      selectedView={view}
                      onPress={this.onViewChange}
                    >
                      {translate('Agenda')}
                    </ViewMenuItem>
                  </MenuContent>
                  </Menu>
                </Box> :

                <ToggleButtonGroup
                  exclusive={true}
                  size="small"
                  value={view}
                  onChange={(event, nextView) => {
                    if (nextView) {
                      this.onViewChange(nextView);
                    }
                  }}
                >
                  <CalendarHeaderViewButton
                    view={calendarViews.MONTH}
                    selectedView={view}
                    onPress={this.onViewChange}
                  />

                  <CalendarHeaderViewButton
                    view={calendarViews.WEEK}
                    selectedView={view}
                    onPress={this.onViewChange}
                  />

                  <CalendarHeaderViewButton
                    view={calendarViews.FORECAST}
                    selectedView={view}
                    onPress={this.onViewChange}
                  />

                  <CalendarHeaderViewButton
                    view={calendarViews.DAY}
                    selectedView={view}
                    onPress={this.onViewChange}
                  />

                  <CalendarHeaderViewButton
                    view={calendarViews.AGENDA}
                    selectedView={view}
                    onPress={this.onViewChange}
                  />
                </ToggleButtonGroup>
            }
          </Box>
        </Box>
      </div>
    );
  }
}

CalendarHeader.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  time: PropTypes.string.isRequired,
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  view: PropTypes.oneOf(calendarViews.all).isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  collapseViewButtons: PropTypes.bool.isRequired,
  longDateFormat: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
  onTodayPress: PropTypes.func.isRequired,
  onPreviousPress: PropTypes.func.isRequired,
  onNextPress: PropTypes.func.isRequired
};

export default CalendarHeader;
