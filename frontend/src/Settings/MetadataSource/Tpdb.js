import PropTypes from 'prop-types';
import React from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputButton from 'Components/Form/FormInputButton';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import { inputTypes, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './Tpdb.css';

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
    <div className={styles.container}>
      <img
        className={styles.image}
        src={`${window.Whisparr.urlBase}/Content/Images/Tpdb.png`}
      />

      <div className={styles.info}>
        <div className={styles.title}>
          {translate('TheTpdb')}
        </div>

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
      </div>
    </div>
  );
}

Tpdb.propTypes = {
  settings: PropTypes.object,
  onInputChange: PropTypes.func,
  onClearTpdbApiKeyPress: PropTypes.func
};

export default Tpdb;
