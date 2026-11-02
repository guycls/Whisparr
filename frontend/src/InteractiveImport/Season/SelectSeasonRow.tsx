import React, { useCallback } from 'react';
import Link from 'Components/Link/Link';
import translate from 'Utilities/String/translate';

interface SelectSeasonRowProps {
  seasonNumber: number;
  onSeasonSelect(season: number): unknown;
}

function SelectSeasonRow(props: SelectSeasonRowProps) {
  const { seasonNumber, onSeasonSelect } = props;

  const onSeasonSelectWrapper = useCallback(() => {
    onSeasonSelect(seasonNumber);
  }, [seasonNumber, onSeasonSelect]);

  return (
    <Link
      component="div"
      onPress={onSeasonSelectWrapper}
      sx={{
        p: '8px',
        borderBottom: '1px solid var(--borderColor)',
      }}
    >
      {seasonNumber === 0 ? translate('Specials') : `${seasonNumber}`}
    </Link>
  );
}

export default SelectSeasonRow;
