import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import TagInputTag from 'Components/Form/TagInputTag';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function FilterBuilderRowValueTag(props) {
  return (
    <Box sx={{ display: 'flex' }}>
      <TagInputTag
        kind={kinds.DEFAULT}
        {...props}
      />

      {
        props.isLastTag ?
          null :
          <Box
            sx={{
              mx: '3px',
              color: 'var(--themeDarkColor)',
              lineHeight: '31px'
            }}
          >
            {translate('Or')}
          </Box>
      }
    </Box>
  );
}

FilterBuilderRowValueTag.propTypes = {
  isLastTag: PropTypes.bool.isRequired
};

export default FilterBuilderRowValueTag;
