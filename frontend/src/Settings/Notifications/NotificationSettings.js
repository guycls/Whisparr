import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, tooltipPositions } from 'Helpers/Props';
import SettingsToolbarConnector from 'Settings/SettingsToolbarConnector';
import translate from 'Utilities/String/translate';
import NotificationsConnector from './Notifications/NotificationsConnector';

function NotificationSettings(props) {
  const {
    hasStashConnection,
    isFullImportingFromStash,
    dispatchFullImportFromStash
  } = props;

  return (
    <PageContent title={translate('ConnectSettings')}>
      <SettingsToolbarConnector
        showSave={false}
        additionalButtons={
          hasStashConnection ?
            <Fragment>
              <PageToolbarSeparator />

              <Tooltip
                anchor={
                  <PageToolbarButton
                    label={translate('FullImportFromStash')}
                    iconName={icons.DOWNLOAD}
                    isSpinning={isFullImportingFromStash}
                    isDisabled={isFullImportingFromStash}
                    onPress={dispatchFullImportFromStash}
                  />
                }
                tooltip={translate('FullImportFromStashHelpText')}
                position={tooltipPositions.BOTTOM}
                canFlip={true}
              />
            </Fragment> :
            null
        }
      />

      <PageContentBody>
        <NotificationsConnector />
      </PageContentBody>
    </PageContent>
  );
}

NotificationSettings.propTypes = {
  hasStashConnection: PropTypes.bool.isRequired,
  isFullImportingFromStash: PropTypes.bool.isRequired,
  dispatchFullImportFromStash: PropTypes.func.isRequired
};

export default NotificationSettings;
