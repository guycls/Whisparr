import PropTypes from 'prop-types';
import React, { Component } from 'react';
import IconButton from 'Components/Link/IconButton';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRowButton from 'Components/Table/TableRowButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

class RecentFolderRow extends Component {

  //
  // Listeners

  onPress = () => {
    this.props.onPress(this.props.folder);
  };

  onRemovePress = (event) => {
    event.stopPropagation();

    const {
      folder,
      onRemoveRecentFolderPress
    } = this.props;

    onRemoveRecentFolderPress(folder);
  };

  //
  // Render

  render() {
    const {
      folder,
      lastUsed
    } = this.props;

    return (
      <TableRowButton onPress={this.onPress}>
        <TableRowCell>{folder}</TableRowCell>

        <RelativeDateCell date={lastUsed} />

        <TableRowCell sx={{ width: 40 }}>
          <IconButton
            title={translate('Remove')}
            name={icons.REMOVE}
            onPress={this.onRemovePress}
          />
        </TableRowCell>
      </TableRowButton>
    );
  }
}

RecentFolderRow.propTypes = {
  folder: PropTypes.string.isRequired,
  lastUsed: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  onRemoveRecentFolderPress: PropTypes.func.isRequired
};

export default RecentFolderRow;
