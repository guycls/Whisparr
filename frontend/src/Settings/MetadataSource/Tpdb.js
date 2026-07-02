import PropTypes from 'prop-types';
import React from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import { inputTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './Tpdb.css';

function Tpdb(props) {
  const {
    settings,
    onInputChange
  } = props;

  const tpdbApiKey = settings?.tpdbApiKey;
  const hasTpdbApiKey = settings?.hasTpdbApiKey;

  const helpText = tpdbApiKey && !tpdbApiKey.value && hasTpdbApiKey?.value ?
    translate('TpdbApiKeyConfigured') :
    translate('TpdbApiKeyHelpText');

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
                {...tpdbApiKey}
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
  onInputChange: PropTypes.func
};

export default Tpdb;
