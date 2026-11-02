import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Label from 'Components/Label';
import VirtualTableRowCell from 'Components/Table/Cells/VirtualTableRowCell';

const cellSx = {
  display: 'flex',
  alignItems: 'center'
};

class SelectSeriesRow extends Component {

  //
  // Listeners

  onPress = () => {
    this.props.onSeriesSelect(this.props.id);
  };

  //
  // Render

  render() {
    return (
      <>
        <VirtualTableRowCell sx={{ ...cellSx, flex: '4 0 140px' }}>
          {this.props.title}
        </VirtualTableRowCell>

        <VirtualTableRowCell sx={{ ...cellSx, flex: '0 0 70px' }}>
          {this.props.year}
        </VirtualTableRowCell>

        <VirtualTableRowCell sx={{ ...cellSx, flex: '0 0 110px' }}>
          <Label>{this.props.tvdbId}</Label>
        </VirtualTableRowCell>
      </>
    );
  }
}

SelectSeriesRow.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  tvdbId: PropTypes.number.isRequired,
  year: PropTypes.number.isRequired,
  onSeriesSelect: PropTypes.func.isRequired
};

export default SelectSeriesRow;
