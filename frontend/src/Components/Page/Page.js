import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import AppUpdatedModal from 'App/AppUpdatedModal';
import ColorImpairedContext from 'App/ColorImpairedContext';
import ConnectionLostModal from 'App/ConnectionLostModal';
import SignalRConnector from 'Components/SignalRConnector';
import AuthenticationRequiredModal from 'FirstRun/AuthenticationRequiredModal';
import locationShape from 'Helpers/Props/Shapes/locationShape';
import PageHeader from './Header/PageHeader';
import MessagesConnector from './Sidebar/Messages/MessagesConnector';
import PageSidebar from './Sidebar/PageSidebar';

class Page extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isUpdatedModalOpen: false,
      isConnectionLostModalOpen: false
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentDidUpdate(prevProps) {
    const {
      isDisconnected,
      isUpdated
    } = this.props;

    if (!prevProps.isUpdated && isUpdated) {
      this.setState({ isUpdatedModalOpen: true });
    }

    if (prevProps.isDisconnected !== isDisconnected) {
      this.setState({ isConnectionLostModalOpen: isDisconnected });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  //
  // Listeners

  onResize = () => {
    this.props.onResize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  onUpdatedModalClose = () => {
    this.setState({ isUpdatedModalOpen: false });
  };

  onConnectionLostModalClose = () => {
    this.setState({ isConnectionLostModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      className,
      location,
      children,
      isSmallScreen,
      isSidebarVisible,
      enableColorImpairedMode,
      authenticationEnabled,
      onSidebarToggle,
      onSidebarVisibleChange
    } = this.props;

    return (
      <ColorImpairedContext.Provider value={enableColorImpairedMode}>
        <Box
          className={className}
          sx={{
            display: 'flex',
            height: '100%',
            bgcolor: 'background.default',
            backgroundImage: (theme) =>
              `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0)} 0%, ${alpha(theme.palette.primary.main, 0.55)} 100%)`
          }}
        >
          <SignalRConnector />
          <MessagesConnector />

          <PageHeader
            isSmallScreen={isSmallScreen}
            onSidebarToggle={onSidebarToggle}
          />

          <PageSidebar
            location={location}
            isSmallScreen={isSmallScreen}
            isSidebarVisible={isSidebarVisible}
            onSidebarVisibleChange={onSidebarVisibleChange}
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              minWidth: 0,
              pt: '56px'
            }}
          >
            <Box
              component="main"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              {children}
            </Box>
          </Box>

          <AppUpdatedModal
            isOpen={this.state.isUpdatedModalOpen}
            onModalClose={this.onUpdatedModalClose}
          />

          <ConnectionLostModal
            isOpen={this.state.isConnectionLostModalOpen}
            onModalClose={this.onConnectionLostModalClose}
          />

          <AuthenticationRequiredModal
            isOpen={!authenticationEnabled}
          />
        </Box>
      </ColorImpairedContext.Provider>
    );
  }
}

Page.propTypes = {
  className: PropTypes.string,
  location: locationShape.isRequired,
  children: PropTypes.node.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  isSidebarVisible: PropTypes.bool.isRequired,
  isUpdated: PropTypes.bool.isRequired,
  isDisconnected: PropTypes.bool.isRequired,
  enableColorImpairedMode: PropTypes.bool.isRequired,
  authenticationEnabled: PropTypes.bool.isRequired,
  onResize: PropTypes.func.isRequired,
  onSidebarToggle: PropTypes.func.isRequired,
  onSidebarVisibleChange: PropTypes.func.isRequired
};

Page.defaultProps = {
  className: undefined
};

export default Page;
