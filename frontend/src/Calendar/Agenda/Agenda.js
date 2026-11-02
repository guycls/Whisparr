import Box from '@mui/material/Box';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import AgendaEventConnector from './AgendaEventConnector';

function Agenda(props) {
  const {
    items
  } = props;

  return (
    <Box sx={{ mt: '10px' }}>
      {
        items.map((item, index) => {
          const momentDate = moment(item.releaseDate);
          const showDate = index === 0 ||
            !moment(items[index - 1].releaseDate).isSame(momentDate, 'day');

          return (
            <AgendaEventConnector
              key={item.id}
              episodeId={item.id}
              showDate={showDate}
              {...item}
            />
          );
        })
      }
    </Box>
  );
}

Agenda.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Agenda;
