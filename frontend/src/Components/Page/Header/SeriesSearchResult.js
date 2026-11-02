import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import Label from 'Components/Label';
import { kinds } from 'Helpers/Props';
import SeriesPoster from 'Series/SeriesPoster';

function SeriesSearchResult(props) {
  const {
    match,
    title,
    images,
    alternateTitles,
    tags,
    safeForWorkMode
  } = props;

  let alternateTitle = null;
  let tag = null;

  if (match.key === 'alternateTitles.title') {
    alternateTitle = alternateTitles[match.arrayIndex];
  } else if (match.key === 'tags.label') {
    tag = tags[match.arrayIndex];
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
      <SeriesPoster
        images={images}
        blur={safeForWorkMode}
        size={250}
        lazy={false}
        overflow={true}
        style={{ width: 80, height: 35, objectFit: 'contain' }}
      />

      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap={true}>
          {title}
        </Typography>

        {
          alternateTitle ?
            <Typography variant="body2" color="text.secondary" noWrap={true}>
              {alternateTitle.title}
            </Typography> :
            null
        }

        {
          tag ?
            <Label
              key={tag.id}
              kind={kinds.INFO}
            >
              {tag.label}
            </Label> :
            null
        }
      </Box>
    </Box>
  );
}

SeriesSearchResult.propTypes = {
  title: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  alternateTitles: PropTypes.arrayOf(PropTypes.object).isRequired,
  tags: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  safeForWorkMode: PropTypes.bool
};

export default SeriesSearchResult;
