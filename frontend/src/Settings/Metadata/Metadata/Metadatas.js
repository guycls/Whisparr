import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import FieldSet from 'Components/FieldSet';
import PageSectionContent from 'Components/Page/PageSectionContent';
import translate from 'Utilities/String/translate';
import Metadata from './Metadata';

const sxMetadatas = {
  display: 'flex',
  flexWrap: 'wrap'
};

function Metadatas(props) {
  const {
    items,
    ...otherProps
  } = props;

  return (
    <FieldSet legend={translate('Metadata')}>
      <PageSectionContent
        errorMessage={translate('MetadataLoadError')}
        {...otherProps}
      >
        <Box sx={sxMetadatas}>
          {
            items.map((item) => {
              return (
                <Metadata
                  key={item.id}
                  {...item}
                />
              );
            })
          }
        </Box>
      </PageSectionContent>
    </FieldSet>
  );
}

Metadatas.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Metadatas;
