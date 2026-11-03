import ToggleButton from '@mui/material/ToggleButton';
import PropTypes from 'prop-types';
import React from 'react';
import * as calendarViews from 'Calendar/calendarViews';
import titleCase from 'Utilities/String/titleCase';

function CalendarHeaderViewButton(props) {
  const {
    view,
    onPress,
    children,
    selectedView,
    buttonGroupPosition,
    ...otherProps
  } = props;

  return (
    <ToggleButton
      value={view}
      {...otherProps}
      onClick={() => onPress(view)}
    >
      {children || titleCase(view)}
    </ToggleButton>
  );
}

CalendarHeaderViewButton.propTypes = {
  view: PropTypes.oneOf(calendarViews.all).isRequired,
  selectedView: PropTypes.oneOf(calendarViews.all),
  buttonGroupPosition: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  children: PropTypes.node
};

export default CalendarHeaderViewButton;
