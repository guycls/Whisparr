import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CheckInput from 'Components/Form/CheckInput';
import VirtualTableRowCell from './VirtualTableRowCell';

export function virtualTableSelectCellRenderer(cellProps) {
  const {
    cellKey,
    rowData,
    columnData,
    ...otherProps
  } = cellProps;

  return (
    // eslint-disable-next-line no-use-before-define
    <VirtualTableSelectCell
      key={cellKey}
      id={rowData.name}
      isSelected={rowData.isSelected}
      {...columnData}
      {...otherProps}
    />
  );
}

class VirtualTableSelectCell extends Component {

  //
  // Listeners

  onChange = ({ value, shiftKey }) => {
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
      inputClassName,
      id,
      isSelected,
      isDisabled,
      ...otherProps
    } = this.props;

    return (
      <VirtualTableRowCell
        sx={{ flex: '0 0 36px' }}
        {...otherProps}
      >
        <CheckInput
          className={inputClassName}
          name={id.toString()}
          value={isSelected}
          isDisabled={isDisabled}
          onChange={this.onChange}
        />
      </VirtualTableRowCell>
    );
  }
}

VirtualTableSelectCell.propTypes = {
  inputClassName: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isSelected: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  onSelectedChange: PropTypes.func.isRequired
};

VirtualTableSelectCell.defaultProps = {
  isSelected: false
};

export default VirtualTableSelectCell;
