import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditMetadataModalConnector from './EditMetadataModalConnector';

const sxMetadata = (theme) => ({
  width: 290,
  m: theme.spacing(1.25)
});

const sxName = (theme) => ({
  mb: theme.spacing(2.5),
  fontWeight: 300,
  fontSize: 24
});

const sxSection = (theme) => ({
  mt: theme.spacing(1.25)
});

class Metadata extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditMetadataModalOpen: false
    };
  }

  //
  // Listeners

  onEditMetadataPress = () => {
    this.setState({ isEditMetadataModalOpen: true });
  };

  onEditMetadataModalClose = () => {
    this.setState({ isEditMetadataModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      id,
      name,
      enable,
      fields
    } = this.props;

    const metadataFields = [];
    const imageFields = [];

    fields.forEach((field) => {
      if (field.section === 'metadata') {
        metadataFields.push(field);
      } else {
        imageFields.push(field);
      }
    });

    return (
      <Box sx={sxMetadata}>
<Card
        overlayContent={true}
        onPress={this.onEditMetadataPress}
      >
        <Box sx={sxName}>
          {name}
        </Box>

        <div>
          {
            enable ?
              <Label kind={kinds.SUCCESS}>
                {translate('Enabled')}
              </Label> :
              <Label
                kind={kinds.DISABLED}
                outline={true}
              >
                {translate('Disabled')}
              </Label>
          }
        </div>

        {
          enable && !!metadataFields.length &&
            <div>
              <Box sx={sxSection}>
                {translate('Metadata')}
              </Box>

              {
                metadataFields.map((field) => {
                  if (!field.value) {
                    return null;
                  }

                  return (
                    <Label
                      key={field.label}
                      kind={kinds.SUCCESS}
                    >
                      {field.label}
                    </Label>
                  );
                })
              }
            </div>
        }

        {
          enable && !!imageFields.length &&
            <div>
              <Box sx={sxSection}>
                {translate('Images')}
              </Box>

              {
                imageFields.map((field) => {
                  if (!field.value) {
                    return null;
                  }

                  return (
                    <Label
                      key={field.label}
                      kind={kinds.SUCCESS}
                    >
                      {field.label}
                    </Label>
                  );
                })
              }
            </div>
        }

        <EditMetadataModalConnector
          id={id}
          isOpen={this.state.isEditMetadataModalOpen}
          onModalClose={this.onEditMetadataModalClose}
        />
      </Card>
</Box>
    );
  }
}

Metadata.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  enable: PropTypes.bool.isRequired,
  fields: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default Metadata;
