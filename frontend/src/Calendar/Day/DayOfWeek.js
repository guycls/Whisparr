import Box from '@mui/material/Box';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import * as calendarViews from 'Calendar/calendarViews';
import getRelativeDate from 'Utilities/Date/getRelativeDate';

class DayOfWeek extends Component {

  //
  // Render

  render() {
    const {
      date,
      view,
      isTodaysDate,
      calendarWeekColumnHeader,
      shortDateFormat,
      showRelativeDates
    } = this.props;

    const highlightToday = view !== calendarViews.MONTH && isTodaysDate;
    const momentDate = moment(date);
    let formatedDate = momentDate.format('dddd');

    if (view === calendarViews.WEEK) {
      formatedDate = momentDate.format(calendarWeekColumnHeader);
    } else if (view === calendarViews.FORECAST) {
      formatedDate = getRelativeDate(date, shortDateFormat, showRelativeDates);
    }

    return (
      <Box
        sx={{
          flex: '1 0 14.28%',
          width: view === calendarViews.DAY ? '100%' : undefined,
          backgroundColor: highlightToday ?
            'var(--calendarTodayBackgroundColor)' :
            'var(--calendarBackgroundColor)',
          textAlign: 'center'
        }}
      >
        {formatedDate}
      </Box>
    );
  }
}

DayOfWeek.propTypes = {
  date: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
  isTodaysDate: PropTypes.bool.isRequired,
  calendarWeekColumnHeader: PropTypes.string.isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  showRelativeDates: PropTypes.bool.isRequired
};

export default DayOfWeek;
