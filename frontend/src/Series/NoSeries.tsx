import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';
import Button from 'Components/Link/Button';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface NoSeriesProps {
  totalItems: number;
  seriesType?: string;
}

function NoSeries(props: NoSeriesProps) {
  const { totalItems, seriesType } = props;

  const addNewPath = seriesType === 'jav' ? '/jav/add/new' : '/add/new';

  if (totalItems > 0) {
    return (
      <Box>
        <Typography
          sx={{ mt: '10px', mb: '30px', textAlign: 'center', fontSize: 20 }}
        >
          {translate('AllSitesAreHiddenByTheAppliedFilter')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        sx={{ mt: '10px', mb: '30px', textAlign: 'center', fontSize: 20 }}
      >
        {translate('NoSitesFoundImportOrAdd')}
      </Typography>

      {seriesType !== 'jav' && (
        <Box sx={{ mt: '20px', textAlign: 'center' }}>
          <Button to="/add/import" kind={kinds.PRIMARY}>
            {translate('ImportExistingSites')}
          </Button>
        </Box>
      )}

      <Box sx={{ mt: '20px', textAlign: 'center' }}>
        <Button to={addNewPath} kind={kinds.PRIMARY}>
          {translate('AddNewSite')}
        </Button>
      </Box>
    </Box>
  );
}

export default NoSeries;
