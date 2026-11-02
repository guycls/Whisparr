import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from 'Components/Link/Link';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import translate from 'Utilities/String/translate';
class LogFilesTableRow extends Component {

  //
  // Render

  render() {
    const {
      filename,
      lastWriteTime,
      downloadUrl
    } = this.props;

    return (
      <TableRow>
        <TableRowCell>{filename}</TableRowCell>

        <RelativeDateCell
          date={lastWriteTime}
        />

        <TableRowCell sx={{ width: 100 }}>
          <Link
            to={downloadUrl}
            target="_blank"
            noRouter={true}
          >
            {translate('Download')}
          </Link>
        </TableRowCell>
      </TableRow>
    );
  }

}

LogFilesTableRow.propTypes = {
  filename: PropTypes.string.isRequired,
  lastWriteTime: PropTypes.string.isRequired,
  downloadUrl: PropTypes.string.isRequired
};

export default LogFilesTableRow;
