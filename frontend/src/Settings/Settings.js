import Typography from '@mui/material/Typography';
import React from 'react';
import Link from 'Components/Link/Link';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import translate from 'Utilities/String/translate';
import SettingsToolbarConnector from './SettingsToolbarConnector';

const settingsLinkSx = (theme) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  fontSize: 21,
  '&:hover': {
    color: theme.palette.text.secondary,
    textDecoration: 'none'
  }
});

const summarySx = (theme) => ({
  mt: theme.spacing(1.25),
  mb: theme.spacing(3.75),
  color: theme.palette.text.secondary
});

function Settings() {
  return (
    <PageContent title={translate('Settings')}>
      <SettingsToolbarConnector
        hasPendingChanges={false}
      />

      <PageContentBody>
        <Link
          to="/settings/mediamanagement"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('MediaManagement')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('MediaManagementSettingsSummary')}
        </Typography>

        <Link
          to="/settings/profiles"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('Profiles')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('ProfilesSettingsSummary')}
        </Typography>

        <Link
          to="/settings/quality"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('Quality')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('QualitySettingsSummary')}
        </Typography>

        <Link
          to="/settings/customformats"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('CustomFormats')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('CustomFormatsSettingsSummary')}
        </Typography>

        <Link
          to="/settings/indexers"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('Indexers')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('IndexersSettingsSummary')}
        </Typography>

        <Link
          to="/settings/downloadclients"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('DownloadClients')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('DownloadClientsSettingsSummary')}
        </Typography>

        <Link
          to="/settings/importlists"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('ImportLists')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('ImportListsSettingsSummary')}
        </Typography>

        <Link
          to="/settings/connect"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('Connect')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('ConnectSettingsSummary')}
        </Typography>

        <Link
          to="/settings/metadata"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('Metadata')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('MetadataSettingsSummary')}
        </Typography>

        <Link
          to="/settings/metadatasource"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('MetadataSource')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('MetadataSourceSettingsSummary')}
        </Typography>

        <Link
          to="/settings/tags"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('Tags')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('TagsSettingsSummary')}
        </Typography>

        <Link
          to="/settings/general"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('General')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('GeneralSettingsSummary')}
        </Typography>

        <Link
          to="/settings/ui"
          underline="none"
          sx={settingsLinkSx}
        >
          {translate('Ui')}
        </Link>

        <Typography
          component="div"
          sx={summarySx}
        >
          {translate('UiSettingsSummary')}
        </Typography>
      </PageContentBody>
    </PageContent>
  );
}

Settings.propTypes = {
};

export default Settings;
