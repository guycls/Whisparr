import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import QueueStatus from 'Activity/Queue/Status/QueueStatus';
import { icons } from 'Helpers/Props';
import locationShape from 'Helpers/Props/Shapes/locationShape';
import HealthStatus from 'System/Status/Health/HealthStatus';
import translate from 'Utilities/String/translate';
import MessagesConnector from './Messages/MessagesConnector';
import PageSidebarItem from './PageSidebarItem';

const SIDEBAR_WIDTH = 196;

const links = [
  {
    iconName: icons.SERIES_CONTINUING,
    title: () => translate('Sites'),
    to: '/',
    alias: '/series',
    children: [
      {
        title: () => translate('AddNew'),
        to: '/add/new'
      },
      {
        title: () => translate('LibraryImport'),
        to: '/add/import'
      }
    ]
  },

  {
    iconName: icons.SERIES_CONTINUING,
    title: () => translate('JAV'),
    to: '/jav',
    children: [
      {
        title: () => translate('AddNew'),
        to: '/jav/add/new'
      }
    ]
  },

  {
    iconName: icons.CALENDAR,
    title: () => translate('Calendar'),
    to: '/calendar'
  },

  {
    iconName: icons.ACTIVITY,
    title: () => translate('Activity'),
    to: '/activity/queue',
    children: [
      {
        title: () => translate('Queue'),
        to: '/activity/queue',
        statusComponent: QueueStatus
      },
      {
        title: () => translate('History'),
        to: '/activity/history'
      },
      {
        title: () => translate('Blocklist'),
        to: '/activity/blocklist'
      }
    ]
  },

  {
    iconName: icons.WARNING,
    title: () => translate('Wanted'),
    to: '/wanted/missing',
    children: [
      {
        title: () => translate('Missing'),
        to: '/wanted/missing'
      },
      {
        title: () => translate('CutoffUnmet'),
        to: '/wanted/cutoffunmet'
      }
    ]
  },

  {
    iconName: icons.SETTINGS,
    title: () => translate('Settings'),
    to: '/settings',
    children: [
      {
        title: () => translate('MediaManagement'),
        to: '/settings/mediamanagement'
      },
      {
        title: () => translate('Profiles'),
        to: '/settings/profiles'
      },
      {
        title: () => translate('Quality'),
        to: '/settings/quality'
      },
      {
        title: () => translate('CustomFormats'),
        to: '/settings/customformats'
      },
      {
        title: () => translate('Indexers'),
        to: '/settings/indexers'
      },
      {
        title: () => translate('DownloadClients'),
        to: '/settings/downloadclients'
      },
      {
        title: () => translate('ImportLists'),
        to: '/settings/importlists'
      },
      {
        title: () => translate('Connect'),
        to: '/settings/connect'
      },
      {
        title: () => translate('Metadata'),
        to: '/settings/metadata'
      },
      {
        title: () => translate('MetadataSource'),
        to: '/settings/metadatasource'
      },
      {
        title: () => translate('Tags'),
        to: '/settings/tags'
      },
      {
        title: () => translate('General'),
        to: '/settings/general'
      },
      {
        title: () => translate('Ui'),
        to: '/settings/ui'
      }
    ]
  },

  {
    iconName: icons.SYSTEM,
    title: () => translate('System'),
    to: '/system/status',
    children: [
      {
        title: () => translate('Status'),
        to: '/system/status',
        statusComponent: HealthStatus
      },
      {
        title: () => translate('Tasks'),
        to: '/system/tasks'
      },
      {
        title: () => translate('Backup'),
        to: '/system/backup'
      },
      {
        title: () => translate('Updates'),
        to: '/system/updates'
      },
      {
        title: () => translate('Events'),
        to: '/system/events'
      },
      {
        title: () => translate('LogFiles'),
        to: '/system/logs/files'
      }
    ]
  }
];

function getActiveParent(pathname) {
  let activeParent = links[0].to;

  links.forEach((link) => {
    if (link.to && link.to === pathname) {
      activeParent = link.to;

      return false;
    }

    const children = link.children;

    if (children) {
      children.forEach((childLink) => {
        if (pathname.startsWith(childLink.to)) {
          activeParent = link.to;

          return false;
        }
      });
    }

    if (
      (link.to !== '/' && pathname.startsWith(link.to)) ||
      (link.alias && pathname.startsWith(link.alias))
    ) {
      activeParent = link.to;

      return false;
    }
  });

  return activeParent;
}

function hasActiveChildLink(link, pathname) {
  const children = link.children;

  if (!children || !children.length) {
    return false;
  }

  return _.some(children, (child) => {
    return child.to === pathname;
  });
}

function PageSidebar(props) {
  const {
    location,
    isSmallScreen,
    isSidebarVisible,
    onSidebarVisibleChange
  } = props;

  const urlBase = window.Whisparr.urlBase;
  const pathname = urlBase ? location.pathname.substr(urlBase.length) || '/' : location.pathname;
  const activeParent = getActiveParent(pathname);

  const onItemPress = () => {
    if (isSmallScreen) {
      onSidebarVisibleChange(false);
    }
  };

  return (
    <Drawer
      variant={isSmallScreen ? 'temporary' : 'permanent'}
      open={isSmallScreen ? isSidebarVisible : true}
      onClose={() => onSidebarVisibleChange(false)}
      sx={{
        width: isSmallScreen ? 0 : SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          ...(isSmallScreen ? {} : { position: 'relative' })
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'auto'
        }}
      >
        <List sx={{ py: 1 }}>
          {
            links.map((link) => {
              const childWithStatusComponent = _.find(link.children, (child) => {
                return !!child.statusComponent;
              });

              const childStatusComponent = childWithStatusComponent ?
                childWithStatusComponent.statusComponent :
                null;

              const isActiveParent = activeParent === link.to;
              const hasActiveChild = hasActiveChildLink(link, pathname);

              return (
                <PageSidebarItem
                  key={link.to}
                  iconName={link.iconName}
                  title={link.title}
                  to={link.to}
                  statusComponent={isActiveParent || !childStatusComponent ? link.statusComponent : childStatusComponent}
                  isActive={pathname === link.to && !hasActiveChild}
                  isActiveParent={isActiveParent}
                  isParentItem={!!link.children}
                  onPress={onItemPress}
                >
                  {
                    link.children && link.to === activeParent &&
                      link.children.map((child) => {
                        return (
                          <PageSidebarItem
                            key={child.to}
                            title={child.title}
                            to={child.to}
                            isActive={pathname === child.to}
                            isParentItem={false}
                            isChildItem={true}
                            statusComponent={child.statusComponent}
                            onPress={onItemPress}
                          />
                        );
                      })
                  }
                </PageSidebarItem>
              );
            })
          }
        </List>

        <MessagesConnector />
      </Box>
    </Drawer>
  );
}

PageSidebar.propTypes = {
  location: locationShape.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  isSidebarVisible: PropTypes.bool.isRequired,
  onSidebarVisibleChange: PropTypes.func.isRequired
};

export default PageSidebar;
