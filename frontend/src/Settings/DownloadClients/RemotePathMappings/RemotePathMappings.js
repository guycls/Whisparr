import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditRemotePathMappingModalConnector from './EditRemotePathMappingModalConnector';
import RemotePathMapping from './RemotePathMapping';

const sxRemotePathMappingsHeader = (theme) => ({
  display: 'flex',
  mb: theme.spacing(1.25),
  fontWeight: 'bold'
});

const sxHost = {
  flex: '0 1 300px'
};

const sxPath = {
  flex: '0 1 400px'
};

const sxAddRemotePathMapping = (theme) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  pr: theme.spacing(1.25)
});

const sxAddButton = {
  textAlign: 'center'
};

class RemotePathMappings extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddRemotePathMappingModalOpen: false
    };
  }

  //
  // Listeners

  onAddRemotePathMappingPress = () => {
    this.setState({ isAddRemotePathMappingModalOpen: true });
  };

  onModalClose = () => {
    this.setState({ isAddRemotePathMappingModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      items,
      onConfirmDeleteRemotePathMapping,
      ...otherProps
    } = this.props;

    return (
      <FieldSet legend={translate('RemotePathMappings')} >
        <PageSectionContent
          errorMessage={translate('RemotePathMappingsLoadError')}
          {...otherProps}
        >

          <Alert kind={kinds.INFO}>
            <InlineMarkdown data={translate('RemotePathMappingsInfo', { app: 'Whisparr', wikiLink: 'https://wiki.servarr.com/whisparr/settings#remote-path-mappings' })} />
          </Alert>

          <Box sx={sxRemotePathMappingsHeader}>
            <Box sx={sxHost}>
              {translate('Host')}
            </Box>
            <Box sx={sxPath}>
              {translate('RemotePath')}
            </Box>
            <Box sx={sxPath}>
              {translate('LocalPath')}
            </Box>
          </Box>

          <div>
            {
              items.map((item, index) => {
                return (
                  <RemotePathMapping
                    key={item.id}
                    {...item}
                    {...otherProps}
                    index={index}
                    onConfirmDeleteRemotePathMapping={onConfirmDeleteRemotePathMapping}
                  />
                );
              })
            }
          </div>

          <Box sx={sxAddRemotePathMapping}>
            <Box sx={sxAddButton}>
<Link
              onPress={this.onAddRemotePathMappingPress}
            >
              <Icon name={icons.ADD} />
            </Link>
</Box>
          </Box>

          <EditRemotePathMappingModalConnector
            isOpen={this.state.isAddRemotePathMappingModalOpen}
            onModalClose={this.onModalClose}
          />
        </PageSectionContent>
      </FieldSet>
    );
  }
}

RemotePathMappings.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteRemotePathMapping: PropTypes.func.isRequired
};

export default RemotePathMappings;
