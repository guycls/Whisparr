import Box from '@mui/material/Box';
import React, { useCallback, useState } from 'react';
import SeriesMonitoringOptionsPopoverContent from 'AddSeries/SeriesMonitoringOptionsPopoverContent';
import Form from 'Components/Form/Form';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Popover from 'Components/Tooltip/Popover';
import { icons, inputTypes, tooltipPositions } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

const NO_CHANGE = 'noChange';

interface ChangeMonitoringModalContentProps {
  seriesIds: number[];
  saveError?: object;
  onSavePress(monitor: string): void;
  onModalClose(): void;
}

function ChangeMonitoringModalContent(
  props: ChangeMonitoringModalContentProps
) {
  const { seriesIds, onSavePress, onModalClose, ...otherProps } = props;

  const [monitor, setMonitor] = useState(NO_CHANGE);

  const onInputChange = useCallback(
    ({ value }: { value: string }) => {
      setMonitor(value);
    },
    [setMonitor]
  );

  const onSavePressWrapper = useCallback(() => {
    onSavePress(monitor);
  }, [monitor, onSavePress]);

  const selectedCount = seriesIds.length;

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('MonitorSite')}</ModalHeader>

      <ModalBody>
        <Form {...otherProps}>
          <FormGroup>
            <FormLabel>
              {translate('Monitoring')}

              <Popover
                anchor={
                  <Box component="span" sx={{ ml: 1, display: 'inline-flex' }}>
                    <Icon name={icons.INFO} />
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
              value={monitor}
              includeNoChange={true}
              onChange={onInputChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter
        sx={{
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: '10px', sm: 0 },
        }}
      >
        <Box sx={{ fontWeight: 'bold' }}>
          {translate('CountSitesSelected', { count: selectedCount })}
        </Box>

        <div>
          <Button onPress={onModalClose}>{translate('Cancel')}</Button>

          <Button onPress={onSavePressWrapper}>{translate('Save')}</Button>
        </div>
      </ModalFooter>
    </ModalContent>
  );
}

export default ChangeMonitoringModalContent;
