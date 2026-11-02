import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import { shortcuts } from 'Components/keyboardShortcuts';
import Button from 'Components/Link/Button';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import translate from 'Utilities/String/translate';

function getShortcuts() {
  const allShortcuts = [];

  Object.keys(shortcuts).forEach((key) => {
    allShortcuts.push(shortcuts[key]);
  });

  return allShortcuts;
}

function getShortcutKey(combo, isOsx) {
  const comboMatch = combo.match(/(.+?)\+(.)/);

  if (!comboMatch) {
    return combo;
  }

  const modifier = comboMatch[1];
  const key = comboMatch[2];
  let osModifier = modifier;

  if (modifier === 'mod') {
    osModifier = isOsx ? 'cmd' : 'ctrl';
  }

  return `${osModifier} + ${key}`;
}

function KeyboardShortcutsModalContent(props) {
  const {
    isOsx,
    onModalClose
  } = props;

  const allShortcuts = getShortcuts();

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>
        {translate('KeyboardShortcuts')}
      </ModalHeader>

      <ModalBody>
        {
          allShortcuts.map((shortcut) => {
            return (
              <Box
                key={shortcut.name}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '5px 20px',
                  fontSize: 18
                }}
              >
                <Box
                  sx={{
                    padding: '2px 4px',
                    borderRadius: '3px',
                    backgroundColor: 'var(--defaultColor)',
                    boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, 0.25)',
                    color: 'var(--white)',
                    fontSize: 16
                  }}
                >
                  {getShortcutKey(shortcut.key, isOsx)}
                </Box>

                <div>
                  {shortcut.name}
                </div>
              </Box>
            );
          })
        }
      </ModalBody>

      <ModalFooter>
        <Button
          onPress={onModalClose}
        >
          {translate('Close')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

KeyboardShortcutsModalContent.propTypes = {
  isOsx: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default KeyboardShortcutsModalContent;
