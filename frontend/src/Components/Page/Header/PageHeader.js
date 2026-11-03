import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { useSelector } from 'react-redux';
import keyboardShortcuts, { shortcuts } from 'Components/keyboardShortcuts';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import PageHeaderActionsMenuConnector from './PageHeaderActionsMenuConnector';
import SeriesSearchInputConnector from './SeriesSearchInputConnector';
import ThemeMenu from './ThemeMenu';

function LogoLink() {
  return (
    <Link
      to="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 0 4px 1px rgba(0, 0, 0, 0.55), 0 0 14px 4px rgba(0, 0, 0, 0.28)'
              : '0 0 4px 1px rgba(255, 255, 255, 0.75), 0 0 14px 4px rgba(255, 255, 255, 0.32)'
        }}
      >
        <img
          src={`${window.Whisparr.urlBase}/Content/Images/logo.svg`}
          alt="Whisparr Logo"
          style={{ display: 'block', width: 32, height: 32, borderRadius: '50%' }}
        />
      </Box>
    </Link>
  );
}

function DesktopLogoSlot() {
  const sidebarWidth = useSelector((state) => state.app.sidebarWidth);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: sidebarWidth
      }}
    >
      <LogoLink />
    </Box>
  );
}

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
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%',
          bgcolor: 'transparent',
          backgroundImage: 'none'
        }}
      >
        <Toolbar
          disableGutters={true}
          sx={{
            minHeight: 56,
            gap: 1,
            pl: { xs: '10px', md: 0 },
            pr: { xs: '10px', md: '12px' }
          }}
        >
          {
            isSmallScreen ?
              <LogoLink /> :
              <DesktopLogoSlot />
          }

          {
            isSmallScreen &&
              <IconButton
                id="sidebar-toggle-button"
                name={icons.NAVBAR_COLLAPSE}
                size={22}
                title="Menu"
                onPress={onSidebarToggle}
                sx={{
                  flexShrink: 0,
                  width: 40,
                  height: 40
                }}
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
            <ThemeMenu />
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
