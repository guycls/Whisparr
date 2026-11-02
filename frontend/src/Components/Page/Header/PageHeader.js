import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import keyboardShortcuts, { shortcuts } from 'Components/keyboardShortcuts';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import PageHeaderActionsMenuConnector from './PageHeaderActionsMenuConnector';
import SafeForWorkButtonConnector from './SafeForWorkButtonConnector';
import SeriesSearchInputConnector from './SeriesSearchInputConnector';

class PageHeader extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props);

    this.state = {
      isKeyboardShortcutsModalOpen: false
    };
  }

  componentDidMount() {
    this.props.bindShortcut(shortcuts.OPEN_KEYBOARD_SHORTCUTS_MODAL.key, this.onOpenKeyboardShortcutsModal);
  }

  //
  // Control

  onOpenKeyboardShortcutsModal = () => {
    this.setState({ isKeyboardShortcutsModalOpen: true });
  };

  //
  // Listeners

  onKeyboardShortcutsModalClose = () => {
    this.setState({ isKeyboardShortcutsModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      isSmallScreen,
      onSidebarToggle
    } = this.props;

    return (
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar
          disableGutters={true}
          sx={{ px: { xs: '10px', md: '12px' }, minHeight: 56, gap: 1 }}
        >
          <Link
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            <img
              src={`${window.Whisparr.urlBase}/Content/Images/logo.svg`}
              alt="Whisparr Logo"
              style={{ width: 32, height: 32 }}
            />
          </Link>

          {
            isSmallScreen &&
              <IconButton
                id="sidebar-toggle-button"
                name={icons.NAVBAR_COLLAPSE}
                onPress={onSidebarToggle}
              />
          }

          <SeriesSearchInputConnector />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              gap: 0.5,
              ml: 'auto'
            }}
          >
            <SafeForWorkButtonConnector />
            <IconButton
              name={icons.HEART}
              aria-label={translate('Donate')}
              to="https://whisparr.com/donate.html"
              size={18}
              title={translate('Donate')}
              sx={{ display: { xs: 'none', md: 'inline-flex' }, width: 40, height: 40 }}
            />
            <PageHeaderActionsMenuConnector
              onKeyboardShortcutsPress={this.onOpenKeyboardShortcutsModal}
            />
          </Box>
        </Toolbar>

        <KeyboardShortcutsModal
          isOpen={this.state.isKeyboardShortcutsModalOpen}
          onModalClose={this.onKeyboardShortcutsModalClose}
        />
      </AppBar>
    );
  }
}

PageHeader.propTypes = {
  isSmallScreen: PropTypes.bool.isRequired,
  onSidebarToggle: PropTypes.func.isRequired,
  bindShortcut: PropTypes.func.isRequired
};

export default keyboardShortcuts(PageHeader);
