import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import SeriesMonitoringOptionsPopoverContent from 'AddSeries/SeriesMonitoringOptionsPopoverContent';
import Icon from 'Components/Icon';
import VirtualTableHeader from 'Components/Table/VirtualTableHeader';
import VirtualTableHeaderCell from 'Components/Table/VirtualTableHeaderCell';
import VirtualTableSelectAllHeaderCell from 'Components/Table/VirtualTableSelectAllHeaderCell';
import Popover from 'Components/Tooltip/Popover';
import { icons, tooltipPositions } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function ImportSeriesHeader(props) {
  const {
    allSelected,
    allUnselected,
    onSelectAllChange
  } = props;

  return (
    <VirtualTableHeader>
      <VirtualTableSelectAllHeaderCell
        allSelected={allSelected}
        allUnselected={allUnselected}
        onSelectAllChange={onSelectAllChange}
      />

      <VirtualTableHeaderCell
        sx={{ flex: '1 0 200px' }}
        name="folder"
      >
        {translate('Folder')}
      </VirtualTableHeaderCell>

      <VirtualTableHeaderCell
        sx={{ flex: '0 1 200px', minWidth: 185 }}
        name="monitor"
      >
        {translate('Monitor')}

        <Popover
          anchor={
            <Box component="span" sx={{ ml: '8px', display: 'inline-flex' }}>
              <Icon
                name={icons.INFO}
              />
            </Box>
          }
          title={translate('MonitoringOptions')}
          body={<SeriesMonitoringOptionsPopoverContent />}
          position={tooltipPositions.RIGHT}
        />
      </VirtualTableHeaderCell>

      <VirtualTableHeaderCell
        sx={{ flex: '0 1 250px', minWidth: 170 }}
        name="qualityProfileId"
      >
        {translate('QualityProfile')}
      </VirtualTableHeaderCell>

      <VirtualTableHeaderCell
        sx={{ flex: '0 1 400px', minWidth: 300 }}
        name="series"
      >
        {translate('Sites')}
      </VirtualTableHeaderCell>
    </VirtualTableHeader>
  );
}

ImportSeriesHeader.propTypes = {
  allSelected: PropTypes.bool.isRequired,
  allUnselected: PropTypes.bool.isRequired,
  onSelectAllChange: PropTypes.func.isRequired
};

export default ImportSeriesHeader;
