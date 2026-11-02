import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import { kinds } from 'Helpers/Props';
import sortByProp from 'Utilities/Array/sortByProp';
import Label from './Label';

function TagList({ tags, tagList }) {
  const sortedTags = tags
    .map((tagId) => tagList.find((tag) => tag.id === tagId))
    .filter((tag) => !!tag)
    .sort(sortByProp('label'));

  return (
    <Box sx={{ flex: '1 0 auto' }}>
      {
        sortedTags.map((tag) => {
          return (
            <Label
              key={tag.id}
              kind={kinds.INFO}
            >
              {tag.label}
            </Label>
          );
        })
      }
    </Box>
  );
}

TagList.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.number).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default TagList;
