import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Icon from 'Components/Icon';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import { icons } from 'Helpers/Props';
import { SeriesStatus } from 'Series/Series';
import { getSeriesStatusDetails } from 'Series/SeriesStatus';
import { toggleSeriesMonitored } from 'Store/Actions/seriesActions';
import translate from 'Utilities/String/translate';

interface SeriesStatusCellProps {
  sx?: SxProps<Theme>;
  seriesId: number;
  monitored: boolean;
  status: SeriesStatus;
  isSelectMode: boolean;
  isSaving: boolean;
}

const iconSx = {
  width: 20,
  textAlign: 'center',
};

function SeriesStatusCell(props: SeriesStatusCellProps) {
  const { sx, seriesId, monitored, status, isSelectMode, isSaving } = props;

  const statusDetails = getSeriesStatusDetails(status);
  const dispatch = useDispatch();

  const onMonitoredPress = useCallback(() => {
    dispatch(toggleSeriesMonitored({ seriesId, monitored: !monitored }));
  }, [seriesId, monitored, dispatch]);

  return (
    <Box sx={sx}>
      {isSelectMode ? (
        <Box sx={iconSx}>
          <MonitorToggleButton
            monitored={monitored}
            isSaving={isSaving}
            onPress={onMonitoredPress}
          />
        </Box>
      ) : (
        <Box sx={iconSx}>
          <Icon
            name={monitored ? icons.MONITORED : icons.UNMONITORED}
            title={
              monitored
                ? translate('SiteIsMonitored')
                : translate('SiteIsUnmonitored')
            }
          />
        </Box>
      )}

      <Box sx={iconSx}>
        <Icon
          name={statusDetails.icon}
          title={`${statusDetails.title}: ${statusDetails.message}`}
        />
      </Box>
    </Box>
  );
}

export default SeriesStatusCell;
