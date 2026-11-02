import _ from 'lodash';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FormInputGroup from 'Components/Form/FormInputGroup';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContentFooter from 'Components/Page/PageContentFooter';
import Popover from 'Components/Tooltip/Popover';
import { icons, inputTypes, kinds, tooltipPositions } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
const MIXED = 'mixed';

class ImportSeriesFooter extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    const {
      defaultMonitor,
      defaultQualityProfileId
    } = props;

    this.state = {
      monitor: defaultMonitor,
      qualityProfileId: defaultQualityProfileId
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      defaultMonitor,
      defaultQualityProfileId,
      isMonitorMixed,
      isQualityProfileIdMixed
    } = this.props;

    const {
      monitor,
      qualityProfileId
    } = this.state;

    const newState = {};

    if (isMonitorMixed && monitor !== MIXED) {
      newState.monitor = MIXED;
    } else if (!isMonitorMixed && monitor !== defaultMonitor) {
      newState.monitor = defaultMonitor;
    }

    if (isQualityProfileIdMixed && qualityProfileId !== MIXED) {
      newState.qualityProfileId = MIXED;
    } else if (!isQualityProfileIdMixed && qualityProfileId !== defaultQualityProfileId) {
      newState.qualityProfileId = defaultQualityProfileId;
    }

    if (!_.isEmpty(newState)) {
      this.setState(newState);
    }
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.setState({ [name]: value });
    this.props.onInputChange({ name, value });
  };

  //
  // Render

  render() {
    const {
      selectedCount,
      isImporting,
      isLookingUpSeries,
      isMonitorMixed,
      isQualityProfileIdMixed,
      hasUnsearchedItems,
      importError,
      onImportPress,
      onLookupPress,
      onCancelLookupPress
    } = this.props;

    const {
      monitor,
      qualityProfileId
    } = this.state;

    return (
      <PageContentFooter>
        <Box
          sx={{
            mr: '20px',
            minWidth: 150,
            mt: { xs: 0, md: 0 },
            '& + &': { mt: { xs: '10px', md: 0 } }
          }}
        >
          <Box sx={{ mb: '3px', fontWeight: 'bold' }}>
            {translate('Monitor')}
          </Box>

          <FormInputGroup
            type={inputTypes.MONITOR_EPISODES_SELECT}
            name="monitor"
            value={monitor}
            isDisabled={!selectedCount}
            includeMixed={isMonitorMixed}
            onChange={this.onInputChange}
          />
        </Box>

        <Box
          sx={{
            mr: '20px',
            minWidth: 150,
            mt: { xs: '10px', md: 0 }
          }}
        >
          <Box sx={{ mb: '3px', fontWeight: 'bold' }}>
            {translate('QualityProfile')}
          </Box>

          <FormInputGroup
            type={inputTypes.QUALITY_PROFILE_SELECT}
            name="qualityProfileId"
            value={qualityProfileId}
            isDisabled={!selectedCount}
            includeMixed={isQualityProfileIdMixed}
            onChange={this.onInputChange}
          />
        </Box>

        <Box sx={{ mt: { xs: '10px', md: 0 } }}>
          <Box sx={{ mb: '3px', fontWeight: 'bold' }}>
            &nbsp;
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: { xs: '10px', md: 0 },
              '& .MuiButton-root': { height: 35 }
            }}
          >
            <SpinnerButton
              kind={kinds.PRIMARY}
              isSpinning={isImporting}
              isDisabled={!selectedCount || isLookingUpSeries}
              onPress={onImportPress}
            >
              {translate('ImportCountSites', { selectedCount })}
            </SpinnerButton>

            {
              isLookingUpSeries ?
                <Box sx={{ ml: '10px' }}>
                <Button
                  kind={kinds.WARNING}
                  onPress={onCancelLookupPress}
                >
                  {translate('CancelProcessing')}
                </Button>
                </Box> :
                null
            }

            {
              hasUnsearchedItems ?
                <Box sx={{ ml: '10px' }}>
                <Button
                  kind={kinds.SUCCESS}
                  onPress={onLookupPress}
                >
                  {translate('StartProcessing')}
                </Button>
                </Box> :
                null
            }

            {
              isLookingUpSeries ?
                <Box sx={{ m: '0 10px 0 12px', textAlign: 'left' }}>
                  <LoadingIndicator
                    size={24}
                  />
                </Box> :
                null
            }

            {
              isLookingUpSeries ?
                translate('ProcessingFolders') :
                null
            }

            {
              importError ?
                <Popover
                  anchor={
                    <Box component="span" sx={{ ml: '10px', display: 'inline-flex' }}>
                      <Icon
                        name={icons.WARNING}
                        kind={kinds.WARNING}
                      />
                    </Box>
                  }
                  title={translate('ImportErrors')}
                  body={
                    <ul>
                      {
                        Array.isArray(importError.responseJSON) ?
                          importError.responseJSON.map((error, index) => {
                            return (
                              <li key={index}>
                                {error.errorMessage}
                              </li>
                            );
                          }) :
                          <li>
                            {
                              JSON.stringify(importError.responseJSON)
                            }
                          </li>
                      }
                    </ul>
                  }
                  position={tooltipPositions.RIGHT}
                /> :
                null
            }
          </Box>
        </Box>
      </PageContentFooter>
    );
  }
}

ImportSeriesFooter.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  isImporting: PropTypes.bool.isRequired,
  isLookingUpSeries: PropTypes.bool.isRequired,
  defaultMonitor: PropTypes.string.isRequired,
  defaultQualityProfileId: PropTypes.number,
  isMonitorMixed: PropTypes.bool.isRequired,
  isQualityProfileIdMixed: PropTypes.bool.isRequired,
  hasUnsearchedItems: PropTypes.bool.isRequired,
  importError: PropTypes.object,
  onInputChange: PropTypes.func.isRequired,
  onImportPress: PropTypes.func.isRequired,
  onLookupPress: PropTypes.func.isRequired,
  onCancelLookupPress: PropTypes.func.isRequired
};

export default ImportSeriesFooter;
