import React, { useCallback } from 'react';
import Link from 'Components/Link/Link';
import translate from 'Utilities/String/translate';

interface SelectSeasonRowProps {
  id: number;
  name: string;
  priority: number;
  onDownloadClientSelect(downloadClientId: number): unknown;
}

function SelectDownloadClientRow(props: SelectSeasonRowProps) {
  const { id, name, priority, onDownloadClientSelect } = props;

  const onSeasonSelectWrapper = useCallback(() => {
    onDownloadClientSelect(id);
  }, [id, onDownloadClientSelect]);

  return (
    <Link
      component="div"
      onPress={onSeasonSelectWrapper}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        p: '8px',
        borderBottom: '1px solid var(--borderColor)',
      }}
    >
      <div>{name}</div>
      <div>{translate('PrioritySettings', { priority })}</div>
    </Link>
  );
}

export default SelectDownloadClientRow;
