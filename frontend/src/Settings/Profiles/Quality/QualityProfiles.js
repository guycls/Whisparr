import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditQualityProfileModalConnector from './EditQualityProfileModalConnector';
import QualityProfile from './QualityProfile';

const sxQualityProfiles = {
  display: 'flex',
  flexWrap: 'wrap'
};

const sxAddQualityProfile = (theme) => ({
  width: 300,
  m: theme.spacing(1.25)
});

const sxAddQualityProfileContent = (theme) => ({
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

class QualityProfiles extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isQualityProfileModalOpen: false
    };
  }

  //
  // Listeners

  onCloneQualityProfilePress = (id) => {
    this.props.onCloneQualityProfilePress(id);
    this.setState({ isQualityProfileModalOpen: true });
  };

  onEditQualityProfilePress = () => {
    this.setState({ isQualityProfileModalOpen: true });
  };

  onModalClose = () => {
    this.setState({ isQualityProfileModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      items,
      isDeleting,
      onConfirmDeleteQualityProfile,
      onCloneQualityProfilePress,
      ...otherProps
    } = this.props;

    return (
      <FieldSet legend={translate('QualityProfiles')}>
        <PageSectionContent
          errorMessage={translate('QualityProfilesLoadError')}
          {...otherProps}c={true}
        >
          <Box sx={sxQualityProfiles}>
            {
              items.map((item) => {
                return (
                  <QualityProfile
                    key={item.id}
                    {...item}
                    isDeleting={isDeleting}
                    onConfirmDeleteQualityProfile={onConfirmDeleteQualityProfile}
                    onCloneQualityProfilePress={this.onCloneQualityProfilePress}
                  />
                );
              })
            }

            <Box sx={sxAddQualityProfile}>
              <Card
                onPress={this.onEditQualityProfilePress}
              >
                <Box sx={sxAddQualityProfileContent}>
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

          <EditQualityProfileModalConnector
            isOpen={this.state.isQualityProfileModalOpen}
            onModalClose={this.onModalClose}
          />
        </PageSectionContent>
      </FieldSet>
    );
  }
}

QualityProfiles.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  isDeleting: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteQualityProfile: PropTypes.func.isRequired,
  onCloneQualityProfilePress: PropTypes.func.isRequired
};

export default QualityProfiles;
