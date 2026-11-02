import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons, sizes } from 'Helpers/Props';

const sxOption = (theme) => ({
  display: 'flex',
  alignItems: 'stretch',
  flexWrap: 'wrap',
  m: theme.spacing(0.375),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover .naming-token': {
    bgcolor: theme.palette.action.hover
  },
  '&:hover .naming-example': {
    bgcolor: theme.palette.action.selected
  }
});

const sxSmall = (theme) => ({
  width: 480,
  [theme.breakpoints.down('md')]: {
    width: '100%'
  }
});

const sxLarge = {
  width: '100%'
};

const sxToken = (theme) => ({
  flex: '0 0 50%',
  padding: theme.spacing(0.75, 2),
  bgcolor: theme.palette.action.selected,
  fontFamily: '"Ubuntu Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
  [theme.breakpoints.down('sm')]: {
    flex: '1 0 auto'
  }
});

const sxExample = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: '0 0 50%',
  padding: theme.spacing(0.75, 2),
  bgcolor: theme.palette.background.default,
  [theme.breakpoints.down('sm')]: {
    flex: '1 0 auto'
  }
});

const sxLower = {
  textTransform: 'lowercase'
};

const sxUpper = {
  textTransform: 'uppercase'
};

const sxFullFilename = {
  '& .naming-token, & .naming-example': {
    flex: '1 0 auto'
  }
};

class NamingOption extends Component {

  //
  // Listeners

  onPress = () => {
    const {
      token,
      tokenSeparator,
      tokenCase,
      isFullFilename,
      onPress
    } = this.props;

    let tokenValue = token;

    tokenValue = tokenValue.replace(/ /g, tokenSeparator);

    if (tokenCase === 'lower') {
      tokenValue = token.toLowerCase();
    } else if (tokenCase === 'upper') {
      tokenValue = token.toUpperCase();
    }

    onPress({ isFullFilename, tokenValue });
  };

  //
  // Render
  render() {
    const {
      token,
      tokenSeparator,
      example,
      footNote,
      tokenCase,
      isFullFilename,
      size
    } = this.props;

    return (
      <Link
        onPress={this.onPress}
      >
        <Box
          sx={[
            sxOption,
            size === sizes.LARGE ? sxLarge : sxSmall,
            tokenCase === 'lower' && sxLower,
            tokenCase === 'upper' && sxUpper,
            isFullFilename && sxFullFilename
          ]}
        >
          <Box
            className="naming-token"
            sx={sxToken}
          >
            {token.replace(/ /g, tokenSeparator)}
          </Box>

          <Box
            className="naming-example"
            sx={sxExample}
          >
            {example.replace(/ /g, tokenSeparator)}

            {
              footNote !== 0 &&
                <Box
                  component="span"
                  sx={(theme) => ({
                    p: '2px',
                    color: theme.palette.text.disabled
                  })}
                >
                  <Icon name={icons.FOOTNOTE} />
                </Box>
            }
          </Box>
        </Box>
      </Link>
    );
  }
}

NamingOption.propTypes = {
  token: PropTypes.string.isRequired,
  example: PropTypes.string.isRequired,
  footNote: PropTypes.number.isRequired,
  tokenSeparator: PropTypes.string.isRequired,
  tokenCase: PropTypes.string.isRequired,
  isFullFilename: PropTypes.bool.isRequired,
  size: PropTypes.oneOf([sizes.SMALL, sizes.LARGE]),
  onPress: PropTypes.func.isRequired
};

NamingOption.defaultProps = {
  footNote: 0,
  size: sizes.SMALL,
  isFullFilename: false
};

export default NamingOption;
