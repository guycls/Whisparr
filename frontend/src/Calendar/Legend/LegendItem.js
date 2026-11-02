import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import calendarStatusSx from 'Calendar/calendarStatusSx';
import titleCase from 'Utilities/String/titleCase';

function LegendItem(props) {
  const {
    name,
    status,
    tooltip,
    isAgendaView,
    fullColorEvents,
    colorImpairedMode
  } = props;

  return (
    <Box
      title={tooltip}
      sx={{
        my: '3px',
        mr: '6px',
        pl: '5px',
        width: 150,
        borderLeftWidth: 4,
        borderLeftStyle: 'solid',
        cursor: 'default',
        ...calendarStatusSx(
          status,
          fullColorEvents && !isAgendaView,
          colorImpairedMode
        )
      }}
    >
      {name ? name : titleCase(status)}
    </Box>
  );
}

LegendItem.propTypes = {
  name: PropTypes.string,
  status: PropTypes.string.isRequired,
  tooltip: PropTypes.string.isRequired,
  isAgendaView: PropTypes.bool.isRequired,
  fullColorEvents: PropTypes.bool.isRequired,
  colorImpairedMode: PropTypes.bool.isRequired
};

export default LegendItem;
