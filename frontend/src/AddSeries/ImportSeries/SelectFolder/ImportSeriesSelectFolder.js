import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import FileBrowserModal from 'Components/FileBrowser/FileBrowserModal';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { icons, kinds, sizes } from 'Helpers/Props';
import RootFolders from 'RootFolder/RootFolders';
import translate from 'Utilities/String/translate';

class ImportSeriesSelectFolder extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddNewRootFolderModalOpen: false
    };
  }

  //
  // Lifecycle

  onAddNewRootFolderPress = () => {
    this.setState({ isAddNewRootFolderModalOpen: true });
  };

  onNewRootFolderSelect = ({ value }) => {
    this.props.onNewRootFolderSelect(value);
  };

  onAddRootFolderModalClose = () => {
    this.setState({ isAddNewRootFolderModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      isWindows,
      isFetching,
      isPopulated,
      isSaving,
      error,
      saveError,
      items
    } = this.props;

    const hasRootFolders = items.length > 0;
    const goodFolderExample = (isWindows) ? 'C:\\tv shows' : '/tv shows';
    const badFolderExample = (isWindows) ? 'C:\\tv shows\\the simpsons' : '/tv shows/the simpsons';

    return (
      <PageContent title={translate('ImportSites')}>
        <PageContentBody>
          {
            isFetching && !isPopulated ?
              <LoadingIndicator /> :
              null
          }

          {
            !isFetching && error ?
              <Alert kind={kinds.DANGER}>{translate('RootFoldersLoadError')}</Alert> :
              null
          }

          {
            !error && isPopulated &&
              <div>
                <Typography
                  sx={{ mb: '40px', textAlign: 'center', fontWeight: 300, fontSize: 36 }}
                >
                  {translate('LibraryImportHeader')}
                </Typography>

                <Box sx={{ fontSize: 20 }}>
                  {translate('LibraryImportTips')}
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={<InlineMarkdown data={translate('LibraryImportTipsQualityInFilename')} />}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={<InlineMarkdown data={translate('LibraryImportTipsUseRootFolder', { goodFolderExample, badFolderExample })} />}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary={translate('LibraryImportTipsDontUseDownloadsFolder')} />
                    </ListItem>
                  </List>
                </Box>

                {
                  hasRootFolders ?
                    <Box sx={{ mt: '40px' }}>
                      <FieldSet legend={translate('RootFolders')}>
                        <RootFolders
                          isFetching={isFetching}
                          isPopulated={isPopulated}
                          error={error}
                          items={items}
                        />
                      </FieldSet>
                    </Box> :
                    null
                }

                {
                  !isSaving && saveError ?
                    <Box sx={{ my: '20px' }}>
                    <Alert
                      kind={kinds.DANGER}
                    >
                      {translate('AddRootFolderError')}

                      <List>
                        {
                          Array.isArray(saveError.responseJSON) ?
                            saveError.responseJSON.map((e, index) => {
                              return (
                                <ListItem key={index}>
                                  <ListItemText primary={e.errorMessage} />
                                </ListItem>
                              );
                            }) :
                            <ListItem>
                              <ListItemText primary={JSON.stringify(saveError.responseJSON)} />
                            </ListItem>
                        }
                      </List>
                    </Alert>
                    </Box> :
                    null
                }

                <Box sx={hasRootFolders ? undefined : { mt: '40px', textAlign: 'center' }}>
                  <Button
                    kind={kinds.PRIMARY}
                    size={sizes.LARGE}
                    onPress={this.onAddNewRootFolderPress}
                  >
                    <Box component="span" sx={{ mr: '8px', display: 'inline-flex' }}>
                      <Icon
                        name={icons.DRIVE}
                      />
                    </Box>
                    {
                      hasRootFolders ?
                        translate('ChooseAnotherFolder') :
                        translate('StartImport')
                    }
                  </Button>
                </Box>

                <FileBrowserModal
                  isOpen={this.state.isAddNewRootFolderModalOpen}
                  name="rootFolderPath"
                  value=""
                  onChange={this.onNewRootFolderSelect}
                  onModalClose={this.onAddRootFolderModalClose}
                />
              </div>
          }
        </PageContentBody>
      </PageContent>
    );
  }
}

ImportSeriesSelectFolder.propTypes = {
  isWindows: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  error: PropTypes.object,
  saveError: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onNewRootFolderSelect: PropTypes.func.isRequired
};

export default ImportSeriesSelectFolder;
