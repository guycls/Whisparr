import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditReleaseProfileModalConnector from './EditReleaseProfileModalConnector';
import ReleaseProfile from './ReleaseProfile';

const sxReleaseProfiles = {
  display: 'flex',
  flexWrap: 'wrap'
};

const sxAddReleaseProfile = (theme) => ({
  width: 290,
  m: theme.spacing(1.25)
});

const sxAddReleaseProfileContent = (theme) => ({
  p: theme.spacing(1.25),
  bgcolor: theme.palette.action.hover,
  color: theme.palette.text.secondary,
  textAlign: 'center'
});

const sxCenter = (theme) => ({
  display: 'inline-block',
  pt: theme.spacing(0.625),
  px: theme.spacing(2.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 1,
  bgcolor: theme.palette.background.paper
});

class ReleaseProfiles extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddReleaseProfileModalOpen: false
    };
  }

  //
  // Listeners

  onAddReleaseProfilePress = () => {
    this.setState({ isAddReleaseProfileModalOpen: true });
  };

  onAddReleaseProfileModalClose = () => {
    this.setState({ isAddReleaseProfileModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      items,
      tagList,
      indexerList,
      onConfirmDeleteReleaseProfile,
      ...otherProps
    } = this.props;

    return (
      <FieldSet legend={translate('ReleaseProfiles')}>
        <PageSectionContent
          errorMessage={translate('ReleaseProfilesLoadError')}
          {...otherProps}
        >
          <Box sx={sxReleaseProfiles}>
            <Box sx={sxAddReleaseProfile}>
              <Card
                onPress={this.onAddReleaseProfilePress}
              >
                <Box sx={sxAddReleaseProfileContent}>
                  <Box sx={sxCenter}>
                    <Icon
                      name={icons.ADD}
                      size={45}
                    />
                  </Box>
                </Box>
              </Card>
            </Box>

            {
              items.map((item) => {
                return (
                  <ReleaseProfile
                    key={item.id}
                    tagList={tagList}
                    indexerList={indexerList}
                    {...item}
                    onConfirmDeleteReleaseProfile={onConfirmDeleteReleaseProfile}
                  />
                );
              })
            }
          </Box>

          <EditReleaseProfileModalConnector
            isOpen={this.state.isAddReleaseProfileModalOpen}
            onModalClose={this.onAddReleaseProfileModalClose}
          />
        </PageSectionContent>
      </FieldSet>
    );
  }
}

ReleaseProfiles.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  indexerList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteReleaseProfile: PropTypes.func.isRequired
};

export default ReleaseProfiles;
