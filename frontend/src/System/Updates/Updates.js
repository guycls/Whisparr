import _ from 'lodash';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import Alert from 'Components/Alert';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { icons, kinds } from 'Helpers/Props';
import formatDate from 'Utilities/Date/formatDate';
import formatDateTime from 'Utilities/Date/formatDateTime';
import translate from 'Utilities/String/translate';
import UpdateChanges from './UpdateChanges';

class Updates extends Component {

  //
  // Render

  render() {
    const {
      currentVersion,
      isFetching,
      isPopulated,
      updatesError,
      generalSettingsError,
      items,
      isInstallingUpdate,
      updateMechanism,
      updateMechanismMessage,
      shortDateFormat,
      longDateFormat,
      timeFormat,
      onInstallLatestPress
    } = this.props;

    const hasError = !!(updatesError || generalSettingsError);
    const hasUpdates = isPopulated && !hasError && items.length > 0;
    const noUpdates = isPopulated && !hasError && !items.length;
    const hasUpdateToInstall = hasUpdates && _.some(items, { installable: true, latest: true });
    const noUpdateToInstall = hasUpdates && !hasUpdateToInstall;

    const externalUpdaterPrefix = translate('UpdateWhisparrDirectlyLoadError');
    const externalUpdaterMessages = {
      external: translate('ExternalUpdater'),
      apt: translate('AptUpdater'),
      docker: translate('DockerUpdater')
    };

    return (
      <PageContent title={translate('Updates')}>
        <PageContentBody>
          {
            !isPopulated && !hasError &&
              <LoadingIndicator />
          }

          {
            noUpdates &&
              <Alert kind={kinds.INFO}>
                {translate('NoUpdatesAreAvailable')}
              </Alert>
          }

          {
            hasUpdateToInstall &&
              <Box sx={{ display: 'flex', mb: '20px' }}>
                {
                  updateMechanism === 'builtIn' || updateMechanism === 'script' ?
                    <SpinnerButton
                      kind={kinds.PRIMARY}
                      isSpinning={isInstallingUpdate}
                      onPress={onInstallLatestPress}
                    >
                      {translate('InstallLatest')}
                    </SpinnerButton> :

                    <Fragment>
                      <Icon
                        name={icons.WARNING}
                        kind={kinds.WARNING}
                        size={30}
                      />

                      <Typography sx={{ pl: '5px', fontSize: 18, lineHeight: '30px' }}>
                        {externalUpdaterPrefix} <InlineMarkdown data={updateMechanismMessage || externalUpdaterMessages[updateMechanism] || externalUpdaterMessages.external} />
                      </Typography>
                    </Fragment>
                }

                {
                  isFetching &&
                    <Box sx={{ mt: '5px', ml: 'auto' }}>
                      <LoadingIndicator
                        size={20}
                      />
                    </Box>
                }
              </Box>
          }

          {
            noUpdateToInstall &&
              <Box sx={{ display: 'flex', mb: '20px' }}>
                <Box component="span" sx={{ color: '#37bc9b', display: 'inline-flex' }}>
                  <Icon
                    name={icons.CHECK_CIRCLE}
                    size={30}
                  />
                </Box>
                <Typography sx={{ pl: '5px', fontSize: 18, lineHeight: '30px' }}>
                  {translate('OnLatestVersion')}
                </Typography>

                {
                  isFetching &&
                    <Box sx={{ mt: '5px', ml: 'auto' }}>
                      <LoadingIndicator
                        size={20}
                      />
                    </Box>
                }
              </Box>
          }

          {
            hasUpdates &&
              <div>
                {
                  items.map((update) => {
                    const hasChanges = !!update.changes;

                    return (
                      <Box
                        key={update.version}
                        sx={{ mt: '20px' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: '10px',
                            pb: '5px',
                            borderBottom: '1px solid #e5e5e5'
                          }}
                        >
                          <Typography sx={{ fontSize: 21 }}>{update.version}</Typography>
                          <Box sx={{ px: '5px' }}>&mdash;</Box>
                          <Typography
                            title={formatDateTime(update.releaseDate, longDateFormat, timeFormat)}
                            sx={{ fontSize: 16 }}
                          >
                            {formatDate(update.releaseDate, shortDateFormat)}
                          </Typography>

                          {
                            update.branch === 'main' ?
                              null :
                              <Box component="span" sx={{ ml: '10px', '& .MuiChip-root': { fontSize: 14 } }}>
                              <Label>
                                {update.branch}
                              </Label>
                              </Box>
                          }

                          {
                            update.version === currentVersion ?
                              <Box component="span" sx={{ ml: '10px', '& .MuiChip-root': { fontSize: 14 } }}>
                              <Label
                                kind={kinds.SUCCESS}
                                title={formatDateTime(update.installedOn, longDateFormat, timeFormat)}
                              >
                                {translate('CurrentlyInstalled')}
                              </Label>
                              </Box> :
                              null
                          }

                          {
                            update.version !== currentVersion && update.installedOn ?
                              <Box component="span" sx={{ ml: '10px', '& .MuiChip-root': { fontSize: 14 } }}>
                              <Label
                                kind={kinds.INVERSE}
                                title={formatDateTime(update.installedOn, longDateFormat, timeFormat)}
                              >
                                {translate('PreviouslyInstalled')}
                              </Label>
                              </Box> :
                              null
                          }
                        </Box>

                        {
                          !hasChanges &&
                            <div>
                              {translate('MaintenanceRelease')}
                            </div>
                        }

                        {
                          hasChanges &&
                            <div>
                              <UpdateChanges
                                title={translate('New')}
                                changes={update.changes.new}
                              />

                              <UpdateChanges
                                title={translate('Fixed')}
                                changes={update.changes.fixed}
                              />
                            </div>
                        }
                      </Box>
                    );
                  })
                }
              </div>
          }

          {
            !!updatesError &&
              <div>
                {translate('FailedToFetchUpdates')}
              </div>
          }

          {
            !!generalSettingsError &&
              <div>
                {translate('FailedToUpdateSettings')}
              </div>
          }
        </PageContentBody>
      </PageContent>
    );
  }

}

Updates.propTypes = {
  currentVersion: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  updatesError: PropTypes.object,
  generalSettingsError: PropTypes.object,
  items: PropTypes.array.isRequired,
  isInstallingUpdate: PropTypes.bool.isRequired,
  updateMechanism: PropTypes.string,
  updateMechanismMessage: PropTypes.string,
  shortDateFormat: PropTypes.string.isRequired,
  longDateFormat: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  onInstallLatestPress: PropTypes.func.isRequired
};

export default Updates;
