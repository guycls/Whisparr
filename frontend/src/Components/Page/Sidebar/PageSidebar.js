import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import { alpha } from '@mui/material/styles';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueueStatus from 'Activity/Queue/Status/QueueStatus';
import { icons } from 'Helpers/Props';
import locationShape from 'Helpers/Props/Shapes/locationShape';
import { set } from 'Store/Actions/baseActions';
import HealthStatus from 'System/Status/Health/HealthStatus';
import translate from 'Utilities/String/translate';
import PageSidebarItem from './PageSidebarItem';

const DEFAULT_SIDEBAR_WIDTH = 196;
const MAX_SIDEBAR_WIDTH = 480;
const BADGE_WIDTH = 44;
const HANDLE_WIDTH = 6;
const PARENT_PADDING_LEFT = 16;
const ICON_SLOT = 36;
const CHILD_PADDING_LEFT = PARENT_PADDING_LEFT + ICON_SLOT;
const PADDING_RIGHT = 16;

let measureContext;

function measureLabel(text) {
  if (!measureContext && typeof document !== 'undefined') {
    measureContext = document.createElement('canvas').getContext('2d');
  }

  if (!measureContext) {
    return text.length * 8;
  }

  measureContext.font = '16px Roboto, Helvetica, Arial, sans-serif';

  return measureContext.measureText(text).width;
}

function rowWidth(label, isChild, hasBadge) {
  return Math.ceil(
    (isChild ? CHILD_PADDING_LEFT : PARENT_PADDING_LEFT + ICON_SLOT) +
      measureLabel(label) +
      PADDING_RIGHT +
      (hasBadge ? BADGE_WIDTH : 0) +
      HANDLE_WIDTH +
      8
  );
}

function clampSidebarWidth(value, minWidth) {
  const width = Number.isFinite(value) ? value : DEFAULT_SIDEBAR_WIDTH;

  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(minWidth, Math.round(width)));
}

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

  const dispatch = useDispatch();
  const persistedSidebarWidth = useSelector((state) => state.app.sidebarWidth);
  const translationsPopulated = useSelector((state) => state.app.translations.isPopulated);
  const uiLanguage = useSelector((state) => state.settings.ui.item.uiLanguage);
  const minWidth = useMemo(() => {
    return links.reduce((widest, link) => {
      const parentShowsBadge = !!link.statusComponent ||
        _.some(link.children, (child) => !!child.statusComponent);
      const parentWidth = rowWidth(link.title(), false, parentShowsBadge);
      const childWidth = (link.children || []).reduce((childWidest, child) => {
        return Math.max(
          childWidest,
          rowWidth(child.title(), true, !!child.statusComponent)
        );
      }, 0);

      return Math.max(widest, parentWidth, childWidth);
    }, DEFAULT_SIDEBAR_WIDTH);
  }, [translationsPopulated, uiLanguage]);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return clampSidebarWidth(persistedSidebarWidth, minWidth);
  });
  const sidebarWidthRef = useRef(sidebarWidth);
  const dragStartRef = useRef(null);

  useEffect(() => {
    const nextWidth = clampSidebarWidth(persistedSidebarWidth, minWidth);
    sidebarWidthRef.current = nextWidth;
    setSidebarWidth(nextWidth);

    if (nextWidth !== persistedSidebarWidth) {
      dispatch(set({
        section: 'app',
        sidebarWidth: nextWidth
      }));
    }
  }, [persistedSidebarWidth, minWidth, dispatch]);

  const updateSidebarWidth = useCallback((clientX) => {
    const dragStart = dragStartRef.current;

    if (!dragStart) {
      return;
    }

    const nextWidth = clampSidebarWidth(
      dragStart.width + (clientX - dragStart.x),
      minWidth
    );
    sidebarWidthRef.current = nextWidth;
    setSidebarWidth(nextWidth);
    dispatch(set({
      section: 'app',
      sidebarWidth: nextWidth
    }));
  }, [minWidth, dispatch]);

  const handleResizePointerDown = useCallback((event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      x: event.clientX,
      width: sidebarWidthRef.current
    };
  }, []);

  const handleResizePointerMove = useCallback((event) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    updateSidebarWidth(event.clientX);
  }, [updateSidebarWidth]);

  const handleResizePointerUp = useCallback((event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStartRef.current = null;
    dispatch(set({
      section: 'app',
      sidebarWidth: sidebarWidthRef.current
    }));
  }, [dispatch]);

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
        width: isSmallScreen ? 0 : sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
          overflow: 'hidden',
          bgcolor: isSmallScreen ? 'background.paper' : 'transparent',
          backgroundImage: 'none'
        }
      }}
    >
      <Toolbar sx={{ flexShrink: 0, minHeight: 56 }} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minHeight: 0,
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
      </Box>

      {
        !isSmallScreen &&
          <Box
            role="separator"
            aria-orientation="vertical"
            aria-label={translate('Resize')}
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              zIndex: 2,
              width: HANDLE_WIDTH,
              height: '100%',
              cursor: 'col-resize',
              touchAction: 'none',
              '&:hover, &:active': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.45)
              }
            }}
          />
      }
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
