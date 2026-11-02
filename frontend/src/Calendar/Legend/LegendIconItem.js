import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';

function LegendIconItem(props) {
  const {
    name,
    icon,
    kind,
    darken,
    tooltip
  } = props;

  return (
    <Box
      title={tooltip}
      sx={{
        my: '3px',
        mr: '6px',
        width: 150,
        cursor: 'default'
      }}
    >
      <Icon
        name={icon}
        darken={darken}
        kind={kind}
        style={{ marginRight: 5 }}
      />

      {name}
    </Box>
  );
}

LegendIconItem.propTypes = {
  name: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  kind: PropTypes.string.isRequired,
  darken: PropTypes.bool.isRequired,
  tooltip: PropTypes.string.isRequired
};

LegendIconItem.defaultProps = {
  darken: false
};

export default LegendIconItem;
