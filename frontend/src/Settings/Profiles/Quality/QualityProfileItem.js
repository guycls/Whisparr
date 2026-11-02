import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CheckInput from 'Components/Form/CheckInput';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

const sxQualityProfileItem = (theme) => ({
  display: 'flex',
  alignItems: 'stretch',
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  bgcolor: theme.palette.action.hover
});

const sxIsInGroup = {
  borderStyle: 'dashed'
};

const sxNameInGroup = (theme) => ({
  ml: theme.spacing(1.75)
});

const sxNameInGroupPreview = (theme) => ({
  ml: theme.spacing(3.5)
});

const sxCheckInputContainer = (theme) => ({
  position: 'relative',
  mr: theme.spacing(0.5),
  mb: theme.spacing(0.625),
  ml: theme.spacing(1)
});

const sxCheckInput = (theme) => ({
  mt: theme.spacing(0.625)
});

const sxQualityNameContainer = (theme) => ({
  display: 'flex',
  flexGrow: 1,
  mb: 0,
  ml: theme.spacing(0.25),
  fontWeight: 'normal',
  lineHeight: 30,
  cursor: 'pointer'
});

const sxNotAllowed = (theme) => ({
  color: theme.palette.divider
});

const sxCreateGroupButton = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  mr: theme.spacing(0.625),
  ml: theme.spacing(1),
  width: 20
});

const sxDragHandle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  ml: 'auto',
  width: 40,
  textAlign: 'center',
  cursor: 'grab'
};

const sxDragIcon = {
  top: '0'
};

const sxIsDragging = {
  opacity: 0.25
};

class QualityProfileItem extends Component {

  //
  // Listeners

  onAllowedChange = ({ value }) => {
    const {
      qualityId,
      onQualityProfileItemAllowedChange
    } = this.props;

    onQualityProfileItemAllowedChange(qualityId, value);
  };

  onCreateGroupPress = () => {
    const {
      qualityId,
      onCreateGroupPress
    } = this.props;

    onCreateGroupPress(qualityId);
  };

  //
  // Render

  render() {
    const {
      editGroups,
      isPreview,
      groupId,
      name,
      allowed,
      isDragging,
      isOverCurrent,
      connectDragSource
    } = this.props;

    return (
      <Box
        sx={[sxQualityProfileItem, isDragging && sxIsDragging, groupId && sxIsInGroup]}
      >
        <Box
          component="label"
          sx={sxQualityNameContainer}
        >
          {
            editGroups && !groupId && !isPreview &&
              <IconButton
                name={icons.GROUP}
                title={translate('Group')}
                onPress={this.onCreateGroupPress}
               sx={sxCreateGroupButton} />
          }

          {
            !editGroups &&
              <Box sx={[sxCheckInputContainer, sxCheckInput]}>
                <CheckInput
                name={name}
                value={allowed}
                isDisabled={!!groupId}
                onChange={this.onAllowedChange}
              />
</Box>
          }

          <Box
            sx={[
              isPreview && groupId ? sxNameInGroupPreview : (isPreview || groupId) && sxNameInGroup,
              !allowed && sxNotAllowed
            ]}
          >
            {name}
          </Box>
        </Box>

        {
          connectDragSource(
            <Box sx={sxDragHandle}>
              <Box sx={sxDragIcon}>
<Icon
                title={translate('CreateGroup')}
                name={icons.REORDER}
              />
</Box>
            </Box>
          )
        }
      </Box>
    );
  }
}

QualityProfileItem.propTypes = {
  editGroups: PropTypes.bool,
  isPreview: PropTypes.bool,
  groupId: PropTypes.number,
  qualityId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  allowed: PropTypes.bool.isRequired,
  isDragging: PropTypes.bool.isRequired,
  isOverCurrent: PropTypes.bool.isRequired,
  isInGroup: PropTypes.bool,
  connectDragSource: PropTypes.func,
  onCreateGroupPress: PropTypes.func,
  onQualityProfileItemAllowedChange: PropTypes.func
};

QualityProfileItem.defaultProps = {
  isPreview: false,
  isOverCurrent: false,
  // The drag preview will not connect the drag handle.
  connectDragSource: (node) => node
};

export default QualityProfileItem;
