import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MiddleTruncate from 'react-middle-truncate';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import { icons, kinds } from 'Helpers/Props';
import tagShape from 'Helpers/Props/Shapes/tagShape';

class TagInputTag extends Component {

  //
  // Listeners

  onDelete = () => {
    const {
      index,
      tag,
      onDelete
    } = this.props;

    onDelete({
      index,
      id: tag.id
    });
  };

  onEdit = () => {
    const {
      index,
      tag,
      onEdit
    } = this.props;

    onEdit({
      index,
      id: tag.id,
      value: tag.name
    });
  };

  //
  // Render

  render() {
    const {
      tag,
      kind,
      canEdit
    } = this.props;

    return (
      <Box
        tabIndex={-1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          maxWidth: '100%',
          height: 31
        }}
      >
        <Label kind={kind}>
          <Link
            tabIndex={-1}
            sx={{
              maxWidth: canEdit ? 'calc(100% - 15px)' : '100%'
            }}
            onPress={this.onDelete}
          >
            <MiddleTruncate
              text={tag.name}
              start={10}
              end={10}
            />
          </Link>

          {
            canEdit ?
              <Box
                sx={{
                  display: 'inline-block',
                  ml: '4px',
                  pl: '2px',
                  borderLeft: '1px solid #eee'
                }}
              >
                <IconButton
                  name={icons.EDIT}
                  size={9}
                  sx={{ width: 9 }}
                  onPress={this.onEdit}
                />
              </Box> :
              null
          }
        </Label>
      </Box>
    );
  }
}

TagInputTag.propTypes = {
  index: PropTypes.number.isRequired,
  tag: PropTypes.shape(tagShape),
  kind: PropTypes.oneOf(kinds.all).isRequired,
  canEdit: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default TagInputTag;
