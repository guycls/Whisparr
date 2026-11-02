import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputButton from 'Components/Form/FormInputButton';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import { inputTypes, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

const sxContainer = {
  display: 'flex',
  flexDirection: 'column'
};

const sxInfo = (theme) => ({
  mt: theme.spacing(3.75)
});

const sxTitle = (theme) => ({
  mb: theme.spacing(2.5),
  fontWeight: 300,
  fontSize: 36
});

const sxImage = {
  width: 448,
  height: 123
};

function Tpdb(props) {
  const {
    settings,
    onInputChange,
    onClearTpdbApiKeyPress
  } = props;

  const tpdbApiKey = settings?.tpdbApiKey;
  const hasTpdbApiKey = settings?.hasTpdbApiKey;
  const tpdbRefetchThumbnails = settings?.tpdbRefetchThumbnails;

  const helpText = tpdbApiKey && !tpdbApiKey.value && hasTpdbApiKey?.value ?
    translate('TpdbApiKeyConfigured') :
    translate('TpdbApiKeyHelpText');

  const showClearApiKeyButton = hasTpdbApiKey?.value;

  return (
    <Box sx={sxContainer}>
      <Box component="img"
        src={`${window.Whisparr.urlBase}/Content/Images/Tpdb.png`}
       sx={sxImage} />

      <Box sx={sxInfo}>
        <Box sx={sxTitle}>
          {translate('TheTpdb')}
        </Box>

        <InlineMarkdown data={translate('SiteAndEpisodeInformationIsProvidedByTheTPDB')} />

        {
          tpdbApiKey ?
            <FormGroup>
              <FormLabel>{translate('TpdbApiKey')}</FormLabel>

              <FormInputGroup
                type={inputTypes.PASSWORD}
                name="tpdbApiKey"
                helpText={helpText}
                onChange={onInputChange}
                buttons={
                  showClearApiKeyButton ?
                    <FormInputButton
                      kind={kinds.DANGER}
                      onPress={onClearTpdbApiKeyPress}
                    >
                      {translate('ClearTpdbApiKey')}
                    </FormInputButton> :
                    null
                }
                {...tpdbApiKey}
              />
            </FormGroup> :
            null
        }

        {
          tpdbRefetchThumbnails ?
            <FormGroup>
              <FormLabel>{translate('TpdbRefetchThumbnails')}</FormLabel>

              <FormInputGroup
                type={inputTypes.CHECK}
                name="tpdbRefetchThumbnails"
                helpText={translate('TpdbRefetchThumbnailsHelpText')}
                onChange={onInputChange}
                {...tpdbRefetchThumbnails}
              />
            </FormGroup> :
            null
        }
      </Box>
    </Box>
  );
}

Tpdb.propTypes = {
  settings: PropTypes.object,
  onInputChange: PropTypes.func,
  onClearTpdbApiKeyPress: PropTypes.func
};

export default Tpdb;
