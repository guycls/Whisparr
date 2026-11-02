import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import TagConnector from './TagConnector';

const sxTags = {
  display: 'flex',
  flexWrap: 'wrap'
};

function Tags(props) {
  const {
    items,
    ...otherProps
  } = props;

  if (!items.length) {
    return (
      <Alert kind={kinds.INFO}>
        {translate('NoTagsHaveBeenAddedYet')}
      </Alert>
    );
  }

  return (
    <FieldSet
      legend={translate('Tags')}
    >
      <PageSectionContent
        errorMessage={translate('TagsLoadError')}
        {...otherProps}
      >
        <Box sx={sxTags}>
          {
            items.map((item) => {
              return (
                <TagConnector
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

Tags.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Tags;
