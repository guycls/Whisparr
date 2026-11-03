import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import MenuButton from 'Components/Menu/MenuButton';
import { icons } from 'Helpers/Props';

function PageMenuButton(props) {
  const {
    iconName,
    showIndicator,
    text,
    sx,
    ...otherProps
  } = props;

  return (
    <MenuButton
      sx={[
        {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          '&::after': {
            marginLeft: '5px',
            content: '"\\25BE"'
          },
          '&:hover': {
            color: '#666'
          }
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      {...otherProps}
    >
      <Icon
        name={iconName}
        size={18}
      />

      {
        showIndicator ?
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: '10px',
              left: '10px'
            }}
          >
            <Icon
              name={icons.CIRCLE}
              size={9}
            />
          </Box> :
          null
      }

      <Box sx={{ ml: '5px' }}>
        {text}
      </Box>
    </MenuButton>
  );
}

PageMenuButton.propTypes = {
  iconName: PropTypes.object.isRequired,
  showIndicator: PropTypes.bool.isRequired,
  text: PropTypes.string,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func])
};

PageMenuButton.defaultProps = {
  showIndicator: false
};

export default PageMenuButton;
