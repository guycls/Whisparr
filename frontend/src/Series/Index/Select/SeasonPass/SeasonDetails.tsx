import Box from '@mui/material/Box';
import React, { useMemo } from 'react';
import { Season } from 'Series/Series';
import translate from 'Utilities/String/translate';
import SeasonPassSeason from './SeasonPassSeason';

interface SeasonDetailsProps {
  seriesId: number;
  seasons: Season[];
}

function SeasonDetails(props: SeasonDetailsProps) {
  const { seriesId, seasons } = props;

  const latestSeasons = useMemo(() => {
    return seasons.slice(Math.max(seasons.length - 25, 0));
  }, [seasons]);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {latestSeasons.map((season) => {
        const {
          seasonNumber,
          monitored,
          statistics,
          isSaving = false,
        } = season;

        return (
          <SeasonPassSeason
            key={seasonNumber}
            seriesId={seriesId}
            seasonNumber={seasonNumber}
            monitored={monitored}
            statistics={statistics}
            isSaving={isSaving}
          />
        );
      })}

      {latestSeasons.length < seasons.length ? (
        <Box
          sx={{ alignSelf: 'center', flex: '0 0 100%', py: '4px', px: '6px' }}
        >
          {translate('SeasonPassTruncated')}
        </Box>
      ) : null}
    </Box>
  );
}

export default SeasonDetails;
