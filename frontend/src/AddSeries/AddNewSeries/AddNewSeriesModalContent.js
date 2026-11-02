import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SeriesMonitoringOptionsPopoverContent from 'AddSeries/SeriesMonitoringOptionsPopoverContent';
import SeriesTypePopoverContent from 'AddSeries/SeriesTypePopoverContent';
import CheckInput from 'Components/Form/CheckInput';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Icon from 'Components/Icon';
import SpinnerButton from 'Components/Link/SpinnerButton';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Popover from 'Components/Tooltip/Popover';
import { icons, inputTypes, kinds, tooltipPositions } from 'Helpers/Props';
import SeriesPoster from 'Series/SeriesPoster';
import translate from 'Utilities/String/translate';

class AddNewSeriesModalContent extends Component {

  //
  // Listeners

  onQualityProfileIdChange = ({ value }) => {
    this.props.onInputChange({ name: 'qualityProfileId', value: parseInt(value) });
  };

  onAddSeriesPress = () => {
    this.props.onAddSeriesPress();
  };

  //
  // Render

  render() {
    const {
      title,
      year,
      overview,
      images,
      isAdding,
      rootFolderPath,
      monitor,
      seriesType,
      qualityProfileId,
      searchForMissingEpisodes,
      searchForCutoffUnmetEpisodes,
      folder,
      tags,
      isSmallScreen,
      isWindows,
      onModalClose,
      onInputChange,
      safeForWorkMode,
      ...otherProps
    } = this.props;

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {title}

          {
            !title.contains(year) && !!year &&
              <Box component="span" sx={{ ml: '5px', color: 'var(--disabledColor)' }}>({year})</Box>
          }
        </ModalHeader>

        <ModalBody>
          <Box sx={{ display: 'flex' }}>
            {
              isSmallScreen ?
                null :
                <Box
                  sx={{
                    flex: '0 0 170px',
                    mr: '20px',
                    maxWidth: 250,
                    maxHeight: 250,
                    '& img': {
                      objectFit: 'contain',
                      maxWidth: 250,
                      maxHeight: 250
                    }
                  }}
                >
                  <SeriesPoster
                    blur={safeForWorkMode}
                    images={images}
                    size={250}
                  />
                </Box>
            }

            <Box sx={{ flexGrow: 1 }}>
              {
                overview ?
                  <Box sx={{ mb: '30px' }}>
                    {overview}
                  </Box> :
                  null
              }

              <Form {...otherProps}>
                <FormGroup>
                  <FormLabel>{translate('RootFolder')}</FormLabel>

                  <FormInputGroup
                    type={inputTypes.ROOT_FOLDER_SELECT}
                    name="rootFolderPath"
                    valueOptions={{
                      seriesFolder: folder,
                      isWindows
                    }}
                    selectedValueOptions={{
                      seriesFolder: folder,
                      isWindows
                    }}
                    helpText={translate('AddNewSiteRootFolderHelpText', { folder })}
                    onChange={onInputChange}
                    {...rootFolderPath}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>
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
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.MONITOR_EPISODES_SELECT}
                    name="monitor"
                    onChange={onInputChange}
                    {...monitor}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>
                    {translate('SeriesType')}

                    <Popover
                      anchor={
                        <Box component="span" sx={{ ml: '8px', display: 'inline-flex' }}>
                          <Icon
                            name={icons.INFO}
                          />
                        </Box>
                      }
                      title={translate('SeriesTypes')}
                      body={<SeriesTypePopoverContent />}
                      position={tooltipPositions.RIGHT}
                    />
                  </FormLabel>

                  <FormInputGroup
                    type={inputTypes.SERIES_TYPE_SELECT}
                    name="seriesType"
                    onChange={onInputChange}
                    {...seriesType}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>{translate('QualityProfile')}</FormLabel>

                  <FormInputGroup
                    type={inputTypes.QUALITY_PROFILE_SELECT}
                    name="qualityProfileId"
                    onChange={this.onQualityProfileIdChange}
                    {...qualityProfileId}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel>{translate('Tags')}</FormLabel>

                  <FormInputGroup
                    type={inputTypes.TAG}
                    name="tags"
                    onChange={onInputChange}
                    {...tags}
                  />
                </FormGroup>
              </Form>
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter
          sx={{
            display: { xs: 'block', md: 'flex' },
            textAlign: { xs: 'center', md: 'right' }
          }}
        >
          <div>
            <Box
              component="label"
              sx={{ display: 'flex', justifyContent: 'flex-end', mt: '2px' }}
            >
              <Box component="span" sx={{ mr: '8px', fontWeight: 'normal' }}>
                {translate('AddNewSiteSearchForMissingEpisodes')}
              </Box>

              <Box sx={{ flex: '0 1 0' }}>
                <CheckInput
                  name="searchForMissingEpisodes"
                  onChange={onInputChange}
                  {...searchForMissingEpisodes}
                />
              </Box>
            </Box>

            <Box
              component="label"
              sx={{ display: 'flex', justifyContent: 'flex-end', mt: '2px' }}
            >
              <Box component="span" sx={{ mr: '8px', fontWeight: 'normal' }}>
                {translate('AddNewSiteSearchForCutoffUnmetEpisodes')}
              </Box>

              <Box sx={{ flex: '0 1 0' }}>
                <CheckInput
                  name="searchForCutoffUnmetEpisodes"
                  onChange={onInputChange}
                  {...searchForCutoffUnmetEpisodes}
                />
              </Box>
            </Box>
          </div>

          <Box
            sx={{
              mt: { xs: '10px', md: 0 },
              '& .MuiButton-root': {
                overflow: 'hidden',
                maxWidth: '100%',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }
            }}
          >
            <SpinnerButton
              kind={kinds.SUCCESS}
              isSpinning={isAdding}
              onPress={this.onAddSeriesPress}
            >
              {translate('AddSiteWithTitle', { title })}
            </SpinnerButton>
          </Box>
        </ModalFooter>
      </ModalContent>
    );
  }
}

AddNewSeriesModalContent.propTypes = {
  title: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  overview: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  isAdding: PropTypes.bool.isRequired,
  addError: PropTypes.object,
  rootFolderPath: PropTypes.object,
  monitor: PropTypes.object.isRequired,
  seriesType: PropTypes.object.isRequired,
  qualityProfileId: PropTypes.object,
  searchForMissingEpisodes: PropTypes.object.isRequired,
  searchForCutoffUnmetEpisodes: PropTypes.object.isRequired,
  folder: PropTypes.string.isRequired,
  tags: PropTypes.object.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  isWindows: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onAddSeriesPress: PropTypes.func.isRequired,
  safeForWorkMode: PropTypes.bool
};

export default AddNewSeriesModalContent;
