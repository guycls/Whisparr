import PropTypes from 'prop-types';
import React from 'react';
import FormInputGroup from 'Components/Form/FormInputGroup';
import VirtualTableRowCell from 'Components/Table/Cells/VirtualTableRowCell';
import VirtualTableSelectCell from 'Components/Table/Cells/VirtualTableSelectCell';
import { inputTypes } from 'Helpers/Props';
import ImportSeriesSelectSeriesConnector from './SelectSeries/ImportSeriesSelectSeriesConnector';

function ImportSeriesRow(props) {
  const {
    id,
    relativePath,
    monitor,
    qualityProfileId,
    selectedSeries,
    isExistingSeries,
    isSelected,
    onSelectedChange,
    onInputChange
  } = props;

  return (
    <>
      <VirtualTableSelectCell
        id={id}
        isSelected={isSelected}
        isDisabled={!selectedSeries || isExistingSeries}
        onSelectedChange={onSelectedChange}
      />

      <VirtualTableRowCell sx={{ flex: '1 0 200px', lineHeight: '36px' }}>
        {relativePath}
      </VirtualTableRowCell>

      <VirtualTableRowCell sx={{ flex: '0 1 200px', minWidth: 185 }}>
        <FormInputGroup
          type={inputTypes.MONITOR_EPISODES_SELECT}
          name="monitor"
          value={monitor}
          onChange={onInputChange}
        />
      </VirtualTableRowCell>

      <VirtualTableRowCell sx={{ flex: '0 1 250px', minWidth: 170 }}>
        <FormInputGroup
          type={inputTypes.QUALITY_PROFILE_SELECT}
          name="qualityProfileId"
          value={qualityProfileId}
          onChange={onInputChange}
        />
      </VirtualTableRowCell>

      <VirtualTableRowCell sx={{ flex: '0 1 400px', minWidth: 300 }}>
        <ImportSeriesSelectSeriesConnector
          id={id}
          isExistingSeries={isExistingSeries}
          onInputChange={onInputChange}
        />
      </VirtualTableRowCell>
    </>
  );
}

ImportSeriesRow.propTypes = {
  id: PropTypes.string.isRequired,
  relativePath: PropTypes.string.isRequired,
  monitor: PropTypes.string.isRequired,
  qualityProfileId: PropTypes.number.isRequired,
  selectedSeries: PropTypes.object,
  isExistingSeries: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSelected: PropTypes.bool,
  onSelectedChange: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired
};

ImportSeriesRow.defaultsProps = {
  items: []
};

export default ImportSeriesRow;
