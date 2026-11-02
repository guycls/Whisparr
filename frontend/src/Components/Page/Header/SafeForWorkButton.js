import PropTypes from 'prop-types';
import React from 'react';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function SafeForWorkButton(props) {
  const {
    safeForWorkMode,
    onSafeForWorkModePress
  } = props;

  return (
    <IconButton
      title={safeForWorkMode ? translate('HiddenClickToShow') : translate('ShownClickToHide')}
      name={safeForWorkMode ? icons.SFW : icons.NSFW}
      size={18}
      onPress={onSafeForWorkModePress}
    />
  );
}

SafeForWorkButton.propTypes = {
  safeForWorkMode: PropTypes.bool,
  onSafeForWorkModePress: PropTypes.func.isRequired
};

export default SafeForWorkButton;
