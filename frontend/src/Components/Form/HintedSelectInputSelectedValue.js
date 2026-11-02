import Box from '@mui/material/Box';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import Label from 'Components/Label';
import EnhancedSelectInputSelectedValue from './EnhancedSelectInputSelectedValue';

const truncateSx = {
  overflow: 'hidden',
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

function HintedSelectInputSelectedValue(props) {
  const {
    value,
    values,
    hint,
    isMultiSelect,
    includeHint,
    ...otherProps
  } = props;

  const valuesMap = isMultiSelect && _.keyBy(values, 'key');

  return (
    <EnhancedSelectInputSelectedValue
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }}
      {...otherProps}
    >
      <Box sx={{ ...truncateSx, flex: '0 0 auto' }}>
        {
          isMultiSelect ?
            value.map((key) => {
              const v = valuesMap[key];
              return (
                <Label key={key}>
                  {v ? v.value : key}
                </Label>
              );
            }) :
            null
        }

        {
          isMultiSelect ? null : value
        }
      </Box>

      {
        hint != null && includeHint ?
          <Box
            sx={{
              ...truncateSx,
              flex: '1 10 0',
              ml: '15px',
              color: 'var(--gray)',
              textAlign: 'right',
              fontSize: 12
            }}
          >
            {hint}
          </Box> :
          null
      }
    </EnhancedSelectInputSelectedValue>
  );
}

HintedSelectInputSelectedValue.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))]).isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  hint: PropTypes.string,
  isMultiSelect: PropTypes.bool.isRequired,
  includeHint: PropTypes.bool.isRequired
};

HintedSelectInputSelectedValue.defaultProps = {
  isMultiSelect: false,
  includeHint: true
};

export default HintedSelectInputSelectedValue;
