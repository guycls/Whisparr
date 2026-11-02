import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Alert from 'Components/Alert';
import { kinds } from 'Helpers/Props';

function Form(props) {
  const {
    children,
    validationErrors,
    validationWarnings,
    // eslint-disable-next-line no-unused-vars
    ...otherProps
  } = props;

  return (
    <div>
      {
        validationErrors.length || validationWarnings.length ?
          <Box sx={{ mb: '20px' }}>
            {
              validationErrors.map((error, index) => {
                return (
                  <Alert
                    key={index}
                    kind={kinds.DANGER}
                  >
                    {error.errorMessage}
                  </Alert>
                );
              })
            }

            {
              validationWarnings.map((warning, index) => {
                return (
                  <Alert
                    key={index}
                    kind={kinds.WARNING}
                  >
                    {warning.errorMessage}
                  </Alert>
                );
              })
            }
          </Box> :
          null
      }

      {children}
    </div>
  );
}

Form.propTypes = {
  children: PropTypes.node.isRequired,
  validationErrors: PropTypes.arrayOf(PropTypes.object).isRequired,
  validationWarnings: PropTypes.arrayOf(PropTypes.object).isRequired
};

Form.defaultProps = {
  validationErrors: [],
  validationWarnings: []
};

export default Form;
