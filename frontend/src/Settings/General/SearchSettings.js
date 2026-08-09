import PropTypes from 'prop-types';
import React from 'react';
import FieldSet from 'Components/FieldSet';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { inputTypes, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function SearchSettings(props) {
  const {
    settings,
    onInputChange
  } = props;

  const {
    cleanFileFormatWhileSearchingScene
  } = settings;

  return (
    <FieldSet legend={translate('Search')}>
      <FormGroup size={sizes.MEDIUM}>
        <FormLabel>{translate('CleanFileFormatWhileSearchingScene')}</FormLabel>

        <FormInputGroup
          type={inputTypes.CHECK}
          name="cleanFileFormatWhileSearchingScene"
          helpText={translate('CleanFileFormatWhileSearchingSceneHelpText')}
          onChange={onInputChange}
          {...cleanFileFormatWhileSearchingScene}
        />
      </FormGroup>
    </FieldSet>
  );
}

SearchSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired
};

export default SearchSettings;
