import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import * as commandNames from 'Commands/commandNames';
import Alert from 'Components/Alert';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { icons, kinds } from 'Helpers/Props';
import { executeCommand } from 'Store/Actions/commandActions';
import { fetchGeneralSettings } from 'Store/Actions/settingsActions';
import { fetchUpdates } from 'Store/Actions/systemActions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import createSystemStatusSelector from 'Store/Selectors/createSystemStatusSelector';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import { UpdateMechanism } from 'typings/Settings/General';
import formatDate from 'Utilities/Date/formatDate';
import formatDateTime from 'Utilities/Date/formatDateTime';
import translate from 'Utilities/String/translate';
import UpdateChanges from './UpdateChanges';

const VERSION_REGEX = /\d+\.\d+\.\d+\.\d+/i;

function createUpdatesSelector() {
  return createSelector(
    (state: AppState) => state.system.updates,
    (state: AppState) => state.settings.general,
    (updates, generalSettings) => {
      const { error: updatesError, items } = updates;

      const isFetching = updates.isFetching || generalSettings.isFetching;
      const isPopulated = updates.isPopulated && generalSettings.isPopulated;

      return {
        isFetching,
        isPopulated,
        updatesError,
        generalSettingsError: generalSettings.error,
        items,
        updateMechanism: generalSettings.item.updateMechanism,
      };
    }
  );
}

function Updates() {
  const currentVersion = useSelector((state: AppState) => state.app.version);
  const { packageUpdateMechanismMessage } = useSelector(
    createSystemStatusSelector()
  );
  const { shortDateFormat, longDateFormat, timeFormat } = useSelector(
    createUISettingsSelector()
  );
  const isInstallingUpdate = useSelector(
    createCommandExecutingSelector(commandNames.APPLICATION_UPDATE)
  );

  const {
    isFetching,
    isPopulated,
    updatesError,
    generalSettingsError,
    items,
    updateMechanism,
  } = useSelector(createUpdatesSelector());

  const dispatch = useDispatch();
  const [isMajorUpdateModalOpen, setIsMajorUpdateModalOpen] = useState(false);
  const hasError = !!(updatesError || generalSettingsError);
  const hasUpdates = isPopulated && !hasError && items.length > 0;
  const noUpdates = isPopulated && !hasError && !items.length;

  const externalUpdaterPrefix = translate('UpdateSonarrDirectlyLoadError');
  const externalUpdaterMessages: Partial<Record<UpdateMechanism, string>> = {
    external: translate('ExternalUpdater'),
    apt: translate('AptUpdater'),
    docker: translate('DockerUpdater'),
  };

  const { isMajorUpdate, hasUpdateToInstall } = useMemo(() => {
    const majorVersion = parseInt(
      currentVersion.match(VERSION_REGEX)?.[0] ?? '0'
    );

    const latestVersion = items[0]?.version;
    const latestMajorVersion = parseInt(
      latestVersion?.match(VERSION_REGEX)?.[0] ?? '0'
    );

    return {
      isMajorUpdate: latestMajorVersion > majorVersion,
      hasUpdateToInstall: items.some(
        (update) => update.installable && update.latest
      ),
    };
  }, [currentVersion, items]);

  const noUpdateToInstall = hasUpdates && !hasUpdateToInstall;

  const handleInstallLatestPress = useCallback(() => {
    if (isMajorUpdate) {
      setIsMajorUpdateModalOpen(true);
    } else {
      dispatch(executeCommand({ name: commandNames.APPLICATION_UPDATE }));
    }
  }, [isMajorUpdate, setIsMajorUpdateModalOpen, dispatch]);

  const handleInstallLatestMajorVersionPress = useCallback(() => {
    setIsMajorUpdateModalOpen(false);

    dispatch(
      executeCommand({
        name: commandNames.APPLICATION_UPDATE,
        installMajorUpdate: true,
      })
    );
  }, [setIsMajorUpdateModalOpen, dispatch]);

  const handleCancelMajorVersionPress = useCallback(() => {
    setIsMajorUpdateModalOpen(false);
  }, [setIsMajorUpdateModalOpen]);

  useEffect(() => {
    dispatch(fetchUpdates());
    dispatch(fetchGeneralSettings());
  }, [dispatch]);

  return (
    <PageContent title={translate('Updates')}>
      <PageContentBody>
        {isPopulated || hasError ? null : <LoadingIndicator />}

        {noUpdates ? (
          <Alert kind={kinds.INFO}>{translate('NoUpdatesAreAvailable')}</Alert>
        ) : null}

        {hasUpdateToInstall ? (
          <Box sx={{ display: 'flex', mb: '20px' }}>
            {updateMechanism === 'builtIn' || updateMechanism === 'script' ? (
              <SpinnerButton
                kind={kinds.PRIMARY}
                isSpinning={isInstallingUpdate}
                onPress={handleInstallLatestPress}
              >
                {translate('InstallLatest')}
              </SpinnerButton>
            ) : (
              <Fragment>
                <Icon name={icons.WARNING} kind={kinds.WARNING} size={30} />

                <Typography sx={{ pl: '5px', fontSize: 18, lineHeight: '30px' }}>
                  {externalUpdaterPrefix}{' '}
                  <InlineMarkdown
                    data={
                      packageUpdateMechanismMessage ||
                      externalUpdaterMessages[updateMechanism] ||
                      externalUpdaterMessages.external
                    }
                  />
                </Typography>
              </Fragment>
            )}

            {isFetching ? (
              <Box sx={{ mt: '5px', ml: 'auto' }}>
                <LoadingIndicator size={20} />
              </Box>
            ) : null}
          </Box>
        ) : null}

        {noUpdateToInstall && (
          <Box sx={{ display: 'flex', mb: '20px' }}>
            <Box component="span" sx={{ color: '#37bc9b', display: 'inline-flex' }}>
              <Icon name={icons.CHECK_CIRCLE} size={30} />
            </Box>
            <Typography sx={{ pl: '5px', fontSize: 18, lineHeight: '30px' }}>
              {translate('OnLatestVersion')}
            </Typography>

            {isFetching && (
              <Box sx={{ mt: '5px', ml: 'auto' }}>
                <LoadingIndicator size={20} />
              </Box>
            )}
          </Box>
        )}

        {hasUpdates && (
          <div>
            {items.map((update) => {
              return (
                <Box key={update.version} sx={{ mt: '20px' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: '10px',
                      pb: '5px',
                      borderBottom: '1px solid #e5e5e5',
                    }}
                  >
                    <Typography sx={{ fontSize: 21 }}>{update.version}</Typography>
                    <Box sx={{ px: '5px' }}>&mdash;</Box>
                    <Typography
                      title={formatDateTime(
                        update.releaseDate,
                        longDateFormat,
                        timeFormat
                      )}
                      sx={{ fontSize: 16 }}
                    >
                      {formatDate(update.releaseDate, shortDateFormat)}
                    </Typography>

                    {update.branch === 'main' ? null : (
                      <Box
                        component="span"
                        sx={{ ml: '10px', '& .MuiChip-root': { fontSize: 14 } }}
                      >
                        <Label>{update.branch}</Label>
                      </Box>
                    )}

                    {update.version === currentVersion ? (
                      <Box
                        component="span"
                        sx={{ ml: '10px', '& .MuiChip-root': { fontSize: 14 } }}
                      >
                      <Label
                        kind={kinds.SUCCESS}
                        title={formatDateTime(
                          update.installedOn,
                          longDateFormat,
                          timeFormat
                        )}
                      >
                        {translate('CurrentlyInstalled')}
                      </Label>
                      </Box>
                    ) : null}

                    {update.version !== currentVersion && update.installedOn ? (
                      <Box
                        component="span"
                        sx={{ ml: '10px', '& .MuiChip-root': { fontSize: 14 } }}
                      >
                      <Label
                        kind={kinds.INVERSE}
                        title={formatDateTime(
                          update.installedOn,
                          longDateFormat,
                          timeFormat
                        )}
                      >
                        {translate('PreviouslyInstalled')}
                      </Label>
                      </Box>
                    ) : null}
                  </Box>

                  {update.changes ? (
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
                  ) : (
                    <div>{translate('MaintenanceRelease')}</div>
                  )}
                </Box>
              );
            })}
          </div>
        )}

        {updatesError ? <div>{translate('FailedToFetchUpdates')}</div> : null}

        {generalSettingsError ? (
          <div>{translate('FailedToUpdateSettings')}</div>
        ) : null}

        <ConfirmModal
          isOpen={isMajorUpdateModalOpen}
          kind={kinds.WARNING}
          title={translate('InstallMajorVersionUpdate')}
          message={
            <div>
              <div>{translate('InstallMajorVersionUpdateMessage')}</div>
              <div>
                <InlineMarkdown
                  data={translate('InstallMajorVersionUpdateMessageLink', {
                    domain: 'sonarr.tv',
                    url: 'https://sonarr.tv/#downloads',
                  })}
                />
              </div>
            </div>
          }
          confirmLabel={translate('Install')}
          onConfirm={handleInstallLatestMajorVersionPress}
          onCancel={handleCancelMajorVersionPress}
        />
      </PageContentBody>
    </PageContent>
  );
}

export default Updates;
