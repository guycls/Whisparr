import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CheckInput from 'Components/Form/CheckInput';
import Icon from 'Components/Icon';
import { icons, kinds } from 'Helpers/Props';

class OrganizePreviewRow extends Component {

  //
  // Lifecycle

  componentDidMount() {
    const {
      id,
      onSelectedChange
    } = this.props;

    onSelectedChange({ id, value: true });
  }

  //
  // Listeners

  onSelectedChange = ({ value, shiftKey }) => {
    const {
      id,
      onSelectedChange
    } = this.props;

    onSelectedChange({ id, value, shiftKey });
  };

  //
  // Render

  render() {
    const {
      id,
      existingPath,
      newPath,
      isSelected
    } = this.props;

    return (
      <Box
        sx={{
          display: 'flex',
          mb: '5px',
          py: '5px',
          borderBottom: '1px solid var(--borderColor)',
          '&:last-of-type': {
            mb: 0,
            pb: 0,
            borderBottom: 'none'
          }
        }}
      >
        <Box sx={{ mr: '30px' }}>
          <CheckInput
            name={id.toString()}
            value={isSelected}
            onChange={this.onSelectedChange}
          />
        </Box>

        <div>
          <div>
            <Icon
              name={icons.SUBTRACT}
              kind={kinds.DANGER}
            />

            <Box component="span" sx={{ ml: '10px' }}>
              {existingPath}
            </Box>
          </div>

          <div>
            <Icon
              name={icons.ADD}
              kind={kinds.SUCCESS}
            />

            <Box component="span" sx={{ ml: '10px' }}>
              {newPath}
            </Box>
          </div>
        </div>
      </Box>
    );
  }
}

OrganizePreviewRow.propTypes = {
  id: PropTypes.number.isRequired,
  existingPath: PropTypes.string.isRequired,
  newPath: PropTypes.string.isRequired,
  isSelected: PropTypes.bool,
  onSelectedChange: PropTypes.func.isRequired
};

export default OrganizePreviewRow;
