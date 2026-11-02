import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditQualityProfileModalConnector from './EditQualityProfileModalConnector';

const sxQualityProfile = (theme) => ({
  width: 300,
  m: theme.spacing(1.25)
});

const sxNameContainer = {
  display: 'flex',
  justifyContent: 'space-between'
};

const sxName = (theme) => ({
  mb: theme.spacing(2.5),
  fontWeight: 300,
  fontSize: 24,
  overflow: 'hidden',
  maxWidth: '100%',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

const sxCloneButton = {
  height: 36
};

const sxQualities = (theme) => ({
  display: 'flex',
  flexWrap: 'wrap',
  mt: theme.spacing(0.625),
  pointerEvents: 'all'
});

const sxTooltipLabel = {
  m: 0,
  border: 'none'
};

class QualityProfile extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditQualityProfileModalOpen: false,
      isDeleteQualityProfileModalOpen: false
    };
  }

  //
  // Listeners

  onEditQualityProfilePress = () => {
    this.setState({ isEditQualityProfileModalOpen: true });
  };

  onEditQualityProfileModalClose = () => {
    this.setState({ isEditQualityProfileModalOpen: false });
  };

  onDeleteQualityProfilePress = () => {
    this.setState({
      isEditQualityProfileModalOpen: false,
      isDeleteQualityProfileModalOpen: true
    });
  };

  onDeleteQualityProfileModalClose = () => {
    this.setState({ isDeleteQualityProfileModalOpen: false });
  };

  onConfirmDeleteQualityProfile = () => {
    this.props.onConfirmDeleteQualityProfile(this.props.id);
  };

  onCloneQualityProfilePress = () => {
    const {
      id,
      onCloneQualityProfilePress
    } = this.props;

    onCloneQualityProfilePress(id);
  };

  //
  // Render

  render() {
    const {
      id,
      name,
      upgradeAllowed,
      cutoff,
      items,
      isDeleting
    } = this.props;

    return (
      <Box sx={sxQualityProfile}>
<Card
        overlayContent={true}
        onPress={this.onEditQualityProfilePress}
      >
        <Box sx={sxNameContainer}>
          <Box sx={sxName}>
            {name}
          </Box>

          <IconButton
            title={translate('CloneProfile')}
            name={icons.CLONE}
            onPress={this.onCloneQualityProfilePress}
           sx={sxCloneButton} />
        </Box>

        <Box sx={sxQualities}>
          {
            items.map((item) => {
              if (!item.allowed) {
                return null;
              }

              if (item.quality) {
                const isCutoff = upgradeAllowed && item.quality.id === cutoff;

                return (
                  <Label
                    key={item.quality.id}
                    kind={isCutoff ? kinds.INFO : kinds.DEFAULT}
                    title={isCutoff ? translate('UpgradeUntilThisQualityIsMetOrExceeded') : null}
                  >
                    {item.quality.name}
                  </Label>
                );
              }

              const isCutoff = upgradeAllowed && item.id === cutoff;

              return (
                <Box sx={sxTooltipLabel}>
<Tooltip
                  key={item.id}
                  anchor={
                    <Label
                      kind={isCutoff ? kinds.INFO : kinds.DEFAULT}
                      title={isCutoff ? translate('Cutoff') : null}
                    >
                      {item.name}
                    </Label>
                  }
                  tooltip={
                    <div>
                      {
                        item.items.map((groupItem) => {
                          return (
                            <Label
                              key={groupItem.quality.id}
                              kind={isCutoff ? kinds.INFO : kinds.DEFAULT}
                              title={isCutoff ? translate('Cutoff') : null}
                            >
                              {groupItem.quality.name}
                            </Label>
                          );
                        })
                      }
                    </div>
                  }
                  kind={kinds.INVERSE}
                  position={tooltipPositions.TOP}
                />
</Box>
              );
            })
          }
        </Box>

        <EditQualityProfileModalConnector
          id={id}
          isOpen={this.state.isEditQualityProfileModalOpen}
          onModalClose={this.onEditQualityProfileModalClose}
          onDeleteQualityProfilePress={this.onDeleteQualityProfilePress}
        />

        <ConfirmModal
          isOpen={this.state.isDeleteQualityProfileModalOpen}
          kind={kinds.DANGER}
          title={translate('DeleteQualityProfile')}
          message={translate('DeleteQualityProfileMessageText', { name })}
          confirmLabel={translate('Delete')}
          isSpinning={isDeleting}
          onConfirm={this.onConfirmDeleteQualityProfile}
          onCancel={this.onDeleteQualityProfileModalClose}
        />
      </Card>
</Box>
    );
  }
}

QualityProfile.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  upgradeAllowed: PropTypes.bool.isRequired,
  cutoff: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDeleting: PropTypes.bool.isRequired,
  onConfirmDeleteQualityProfile: PropTypes.func.isRequired,
  onCloneQualityProfilePress: PropTypes.func.isRequired
};

export default QualityProfile;
