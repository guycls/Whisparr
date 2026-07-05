import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSeparator from 'Components/Page/Toolbar/PageToolbarSeparator';
import { icons } from 'Helpers/Props';
import SettingsToolbarConnector from 'Settings/SettingsToolbarConnector';
import translate from 'Utilities/String/translate';
import NotificationsConnector from './Notifications/NotificationsConnector';

function NotificationSettings(props) {
  const {
    hasStashConnection,
    isSyncingFromStash,
    dispatchSyncFromStash
  } = props;

  return (
    <PageContent title={translate('ConnectSettings')}>
      <SettingsToolbarConnector
        showSave={false}
        additionalButtons={
          hasStashConnection ?
            <Fragment>
              <PageToolbarSeparator />

              <PageToolbarButton
                label={translate('ImportFromStash')}
                iconName={icons.REFRESH}
                isSpinning={isSyncingFromStash}
                isDisabled={isSyncingFromStash}
                onPress={dispatchSyncFromStash}
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
  isSyncingFromStash: PropTypes.bool.isRequired,
  dispatchSyncFromStash: PropTypes.func.isRequired
};

export default NotificationSettings;
