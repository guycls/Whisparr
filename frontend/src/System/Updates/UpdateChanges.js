import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';

class UpdateChanges extends Component {

  //
  // Render

  render() {
    const {
      title,
      changes
    } = this.props;

    if (changes.length === 0) {
      return null;
    }

    return (
      <div>
        <Typography sx={{ mt: '10px', fontSize: 16 }}>{title}</Typography>
        <ul>
          {
            changes.map((change, index) => {
              return (
                <li key={index}>
                  <InlineMarkdown data={change} />
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }

}

UpdateChanges.propTypes = {
  title: PropTypes.string.isRequired,
  changes: PropTypes.arrayOf(PropTypes.string)
};

export default UpdateChanges;
