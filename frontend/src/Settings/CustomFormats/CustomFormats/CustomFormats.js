import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import CustomFormat from './CustomFormat';
import EditCustomFormatModalConnector from './EditCustomFormatModalConnector';

const sxCustomFormats = {
  display: 'flex',
  flexWrap: 'wrap'
};

const sxAddCustomFormat = (theme) => ({
  width: 300,
  m: theme.spacing(1.25)
});

const sxAddCustomFormatContent = (theme) => ({
  p: theme.spacing(1.25),
  bgcolor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
  textAlign: 'center',
  fontSize: 45
});

const sxCenter = (theme) => ({
  display: 'inline-block',
  pt: theme.spacing(0.625),
  px: theme.spacing(2.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 1,
  bgcolor: theme.palette.background.paper
});

class CustomFormats extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isCustomFormatModalOpen: false,
      tagsFromId: undefined
    };
  }

  //
  // Listeners

  onCloneCustomFormatPress = (id) => {
    this.props.onCloneCustomFormatPress(id);
    this.setState({
      isCustomFormatModalOpen: true,
      tagsFromId: id
    });
  };

  onEditCustomFormatPress = () => {
    this.setState({ isCustomFormatModalOpen: true });
  };

  onModalClose = () => {
    this.setState({
      isCustomFormatModalOpen: false,
      tagsFromId: undefined
    });
  };

  //
  // Render

  render() {
    const {
      items,
      isDeleting,
      onConfirmDeleteCustomFormat,
      onCloneCustomFormatPress,
      ...otherProps
    } = this.props;

    return (
      <FieldSet legend={translate('CustomFormats')}>
        <PageSectionContent
          errorMessage={translate('CustomFormatsLoadError')}
          {...otherProps}c={true}
        >
          <Box sx={sxCustomFormats}>
            {
              items.map((item) => {
                return (
                  <CustomFormat
                    key={item.id}
                    {...item}
                    isDeleting={isDeleting}
                    onConfirmDeleteCustomFormat={onConfirmDeleteCustomFormat}
                    onCloneCustomFormatPress={this.onCloneCustomFormatPress}
                  />
                );
              })
            }

            <Box sx={sxAddCustomFormat}>
              <Card
                onPress={this.onEditCustomFormatPress}
              >
                <Box sx={sxAddCustomFormatContent}>
                  <Box sx={sxCenter}>
                    <Icon
                      name={icons.ADD}
                      size={45}
                    />
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>

          <EditCustomFormatModalConnector
            isOpen={this.state.isCustomFormatModalOpen}
            tagsFromId={this.state.tagsFromId}
            onModalClose={this.onModalClose}
          />

        </PageSectionContent>
      </FieldSet>
    );
  }
}

CustomFormats.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  isDeleting: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteCustomFormat: PropTypes.func.isRequired,
  onCloneCustomFormatPress: PropTypes.func.isRequired
};

export default CustomFormats;
