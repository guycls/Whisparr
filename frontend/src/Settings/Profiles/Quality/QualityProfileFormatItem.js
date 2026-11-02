import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import NumberInput from 'Components/Form/NumberInput';

const sxQualityProfileFormatItemContainer = (theme) => ({
  display: 'flex',
  padding: theme.spacing(0.5, 0),
  width: '100%'
});

const sxQualityProfileFormatItem = (theme) => ({
  display: 'flex',
  alignItems: 'stretch',
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  bgcolor: theme.palette.action.hover
});

const sxFormatNameContainer = (theme) => ({
  display: 'flex',
  flexGrow: 1,
  mb: 0,
  ml: theme.spacing(1.75),
  width: '100%',
  fontWeight: 'normal',
  lineHeight: 30,
  cursor: 'text'
});

const sxFormatName = {
  display: 'flex',
  flexGrow: 1
};

const sxScoreContainer = {
  display: 'flex',
  flexGrow: 0
};

const sxScoreInput = {
  width: 100,
  height: 30,
  border: 'unset',
  borderRadius: 'unset',
  bgcolor: 'unset'
};

class QualityProfileFormatItem extends Component {

  //
  // Listeners

  onScoreChange = ({ value }) => {
    const {
      formatId
    } = this.props;

    this.props.onScoreChange(formatId, value);
  };

  //
  // Render

  render() {
    const {
      name,
      score
    } = this.props;

    return (
      <Box
       sx={sxQualityProfileFormatItemContainer}>
        <Box
         sx={sxQualityProfileFormatItem}>
          <Box
           sx={sxFormatNameContainer}>
            <Box sx={sxFormatName}>
              {name}
            </Box>
            <Box sx={[sxScoreContainer, sxScoreInput]}>
              <NumberInput
              name={name}
              value={score}
              onChange={this.onScoreChange}
            />
</Box>
          </Box>

        </Box>
      </Box>
    );
  }
}

QualityProfileFormatItem.propTypes = {
  formatId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  onScoreChange: PropTypes.func
};

QualityProfileFormatItem.defaultProps = {
  // To handle the case score is deleted during edit
  score: 0
};

export default QualityProfileFormatItem;
