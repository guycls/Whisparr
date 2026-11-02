import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import CheckInput from 'Components/Form/CheckInput';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import QualityProfileItemDragSource from './QualityProfileItemDragSource';

const sxQualityProfileItemGroup = (theme) => ({
  width: '100%',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '4px',
  bgcolor: theme.palette.action.hover
});

const sxEditGroups = (theme) => ({
  bgcolor: theme.palette.action.hover
});

const sxQualityProfileItemGroupInfo = {
  display: 'flex',
  alignItems: 'stretch',
  width: '100%'
};

const sxCheckInputContainer = {
  display: 'flex',
  alignItems: 'center'
};

const sxNameInput = (theme) => ({
  mt: theme.spacing(0.5),
  mr: theme.spacing(1.25)
});

const sxNameContainer = {
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1
};

const sxName = {
  flexShrink: 0
};

const sxNotAllowed = (theme) => ({
  color: theme.palette.divider
});

const sxGroupQualities = (theme) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  flexGrow: 1,
  flexWrap: 'wrap',
  margin: theme.spacing(0.25, 0, 0.25, 1.25)
});

const sxQualityNameContainer = (theme) => ({
  display: 'flex',
  alignItems: 'stretch',
  flexGrow: 1,
  mb: 0,
  ml: theme.spacing(0.25),
  fontWeight: 'normal'
});

const sxQualityNameLabel = (theme) => ({
  display: 'flex',
  alignItems: 'stretch',
  flexGrow: 1,
  mb: 0,
  ml: theme.spacing(0.25),
  fontWeight: 'normal',
  cursor: 'pointer'
});

const sxDeleteGroupButton = (theme) => ({
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

const sxItems = (theme) => ({
  margin: theme.spacing(0, 6.25, 0, 4.375)
});

class QualityProfileItemGroup extends Component {

  //
  // Listeners

  onAllowedChange = ({ value }) => {
    const {
      groupId,
      onItemGroupAllowedChange
    } = this.props;

    onItemGroupAllowedChange(groupId, value);
  };

  onNameChange = ({ value }) => {
    const {
      groupId,
      onItemGroupNameChange
    } = this.props;

    onItemGroupNameChange(groupId, value);
  };

  onDeleteGroupPress = ({ value }) => {
    const {
      groupId,
      onDeleteGroupPress
    } = this.props;

    onDeleteGroupPress(groupId, value);
  };

  //
  // Render

  render() {
    const {
      editGroups,
      groupId,
      name,
      allowed,
      items,
      qualityIndex,
      isDragging,
      isDraggingUp,
      isDraggingDown,
      connectDragSource,
      onQualityProfileItemAllowedChange,
      onQualityProfileItemDragMove,
      onQualityProfileItemDragEnd
    } = this.props;

    return (
      <Box
       sx={[sxQualityProfileItemGroup, editGroups && sxEditGroups, isDragging && sxIsDragging]}>
        <Box sx={sxQualityProfileItemGroupInfo}>
          {
            editGroups &&
              <Box sx={sxQualityNameContainer}>
                <IconButton
                  name={icons.UNGROUP}
                  title={translate('Ungroup')}
                  onPress={this.onDeleteGroupPress}
                 sx={sxDeleteGroupButton} />

                <Box sx={sxNameInput}>
<TextInput
                  name="name"
                  value={name}
                  onChange={this.onNameChange}
                />
</Box>
              </Box>
          }

          {
            !editGroups &&
              <Box
               sx={sxQualityNameLabel}>
                <Box sx={sxCheckInputContainer}>
                  <CheckInput
                  name="allowed"
                  value={allowed}
                  onChange={this.onAllowedChange}
                />
                </Box>

                <Box sx={sxNameContainer}>
                  <Box
                   sx={[sxName, !allowed && sxNotAllowed]}>
                    {name}
                  </Box>

                  <Box sx={sxGroupQualities}>
                    {
                      items.map(({ quality }) => {
                        return (
                          <Label key={quality.id}>
                            {quality.name}
                          </Label>
                        );
                      }).reverse()
                    }
                  </Box>
                </Box>
              </Box>
          }

          {
            connectDragSource(
              <Box sx={sxDragHandle}>
                <Box sx={sxDragIcon}>
<Icon
                  name={icons.REORDER}
                  title={translate('Reorder')}
                />
</Box>
              </Box>
            )
          }
        </Box>

        {
          editGroups &&
            <Box sx={sxItems}>
              {
                items.map(({ quality }, index) => {
                  return (
                    <QualityProfileItemDragSource
                      key={quality.id}
                      editGroups={editGroups}
                      groupId={groupId}
                      qualityId={quality.id}
                      name={quality.name}
                      allowed={allowed}
                      items={items}
                      qualityIndex={`${qualityIndex}.${index + 1}`}
                      isDragging={isDragging}
                      isDraggingUp={isDraggingUp}
                      isDraggingDown={isDraggingDown}
                      isInGroup={true}
                      onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
                      onQualityProfileItemDragMove={onQualityProfileItemDragMove}
                      onQualityProfileItemDragEnd={onQualityProfileItemDragEnd}
                    />
                  );
                }).reverse()
              }
            </Box>
        }
      </Box>
    );
  }
}

QualityProfileItemGroup.propTypes = {
  editGroups: PropTypes.bool,
  groupId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  allowed: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  qualityIndex: PropTypes.string.isRequired,
  isDragging: PropTypes.bool.isRequired,
  isDraggingUp: PropTypes.bool.isRequired,
  isDraggingDown: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func,
  onItemGroupAllowedChange: PropTypes.func.isRequired,
  onQualityProfileItemAllowedChange: PropTypes.func.isRequired,
  onItemGroupNameChange: PropTypes.func.isRequired,
  onDeleteGroupPress: PropTypes.func.isRequired,
  onQualityProfileItemDragMove: PropTypes.func.isRequired,
  onQualityProfileItemDragEnd: PropTypes.func.isRequired
};

QualityProfileItemGroup.defaultProps = {
  // The drag preview will not connect the drag handle.
  connectDragSource: (node) => node
};

export default QualityProfileItemGroup;
