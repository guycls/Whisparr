import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';

function ErrorPage(props) {
  const {
    version,
    isLocalStorageSupported,
    translationsError,
    seriesError,
    customFiltersError,
    tagsError,
    qualityProfilesError,
    uiSettingsError,
    systemStatusError
  } = props;

  let errorMessage = translate('FailedToLoadWhisparr');

  if (!isLocalStorageSupported) {
    errorMessage = translate('LocalStorageIsNotSupported');
  } else if (translationsError) {
    errorMessage = getErrorMessage(translationsError, translate('FailedToLoadTranslationsFromApi'));
  } else if (seriesError) {
    errorMessage = getErrorMessage(seriesError, translate('FailedToLoadSitesFromApi'));
  } else if (customFiltersError) {
    errorMessage = getErrorMessage(customFiltersError, translate('FailedToLoadCustomFiltersFromApi'));
  } else if (tagsError) {
    errorMessage = getErrorMessage(tagsError, translate('FailedToLoadTagsFromApi'));
  } else if (qualityProfilesError) {
    errorMessage = getErrorMessage(qualityProfilesError, translate('FailedToLoadQualityProfilesFromApi'));
  } else if (uiSettingsError) {
    errorMessage = getErrorMessage(uiSettingsError, translate('FailedToLoadUiSettingsFromApi'));
  } else if (systemStatusError) {
    errorMessage = getErrorMessage(uiSettingsError, translate('FailedToLoadSystemStatusFromApi'));
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        mt: '20px',
        textAlign: 'center',
        fontSize: 20,
        '@media (max-width: 768px)': {
          flexGrow: 1,
          height: 'initial'
        }
      }}
    >
      <div>
        {errorMessage}
      </div>

      <Box sx={{ mt: '20px', fontSize: 16 }}>
        {translate('VersionNumber', { version })}
      </Box>
    </Box>
  );
}

ErrorPage.propTypes = {
  version: PropTypes.string.isRequired,
  isLocalStorageSupported: PropTypes.bool.isRequired,
  translationsError: PropTypes.object,
  seriesError: PropTypes.object,
  customFiltersError: PropTypes.object,
  tagsError: PropTypes.object,
  qualityProfilesError: PropTypes.object,
  uiSettingsError: PropTypes.object,
  systemStatusError: PropTypes.object
};

export default ErrorPage;
