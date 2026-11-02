import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DragLayer } from 'react-dnd';
import DragPreviewLayer from 'Components/DragPreviewLayer';
import { QUALITY_PROFILE_ITEM } from 'Helpers/dragTypes';
import QualityProfileItem from './QualityProfileItem';

const sxDragPreview = {
  width: 380,
  opacity: 0.75
};

const formGroupExtraSmallWidth = parseInt('550px');
const formLabelSmallWidth = parseInt('150px');
const formLabelRightMarginWidth = parseInt('20px');
const dragHandleWidth = parseInt('40px');

function collectDragLayer(monitor) {
  return {
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset()
  };
}

class QualityProfileItemDragPreview extends Component {

  //
  // Render

  render() {
    const {
      item,
      itemType,
      currentOffset
    } = this.props;

    if (!currentOffset || itemType !== QUALITY_PROFILE_ITEM) {
      return null;
    }

    // The offset is shifted because the drag handle is on the right edge of the
    // list item and the preview is wider than the drag handle.

    const { x, y } = currentOffset;
    const handleOffset = formGroupExtraSmallWidth - formLabelSmallWidth - formLabelRightMarginWidth - dragHandleWidth;
    const transform = `translate3d(${x - handleOffset}px, ${y}px, 0)`;

    const style = {
      position: 'absolute',
      WebkitTransform: transform,
      msTransform: transform,
      transform
    };

    const {
      editGroups,
      groupId,
      qualityId,
      name,
      allowed
    } = item;

    // TODO: Show a different preview for groups

    return (
      <DragPreviewLayer>
        <Box
          style={style}
         sx={sxDragPreview}>
          <QualityProfileItem
            editGroups={editGroups}
            isPreview={true}
            qualityId={groupId || qualityId}
            name={name}
            allowed={allowed}
            isDragging={false}
          />
        </Box>
      </DragPreviewLayer>
    );
  }
}

QualityProfileItemDragPreview.propTypes = {
  item: PropTypes.object,
  itemType: PropTypes.string,
  currentOffset: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  })
};

export default DragLayer(collectDragLayer)(QualityProfileItemDragPreview);
