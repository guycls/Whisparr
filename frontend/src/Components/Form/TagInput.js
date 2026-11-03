import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { kinds } from 'Helpers/Props';
import tagShape from 'Helpers/Props/Shapes/tagShape';

function tagName(option) {
  if (typeof option === 'string') {
    return option;
  }

  return option.name;
}

class TagInput extends Component {

  constructor(props, context) {
    super(props, context);

    this.addTag = _.debounce((tag) => {
      this.props.onTagAdd(tag);
    }, 250, { leading: true, trailing: false });
  }

  componentWillUnmount() {
    this.addTag.cancel();
  }

  onChange = (event, nextValue, reason) => {
    const {
      tags,
      allowNew,
      onTagDelete
    } = this.props;

    if (reason === 'removeOption' || reason === 'clear') {
      const removed = tags.filter((tag) => {
        return !nextValue.some((option) => tagName(option) === tag.name);
      });

      removed.forEach((tag) => {
        const index = tags.findIndex((item) => item.id === tag.id);
        onTagDelete({ index, id: tag.id });
      });

      return;
    }

    const added = nextValue[nextValue.length - 1];

    if (!added) {
      return;
    }

    if (typeof added === 'string') {
      if (allowNew) {
        this.addTag({ name: added });
      }

      return;
    }

    this.addTag(added);
  };

  render() {
    const {
      tags,
      tagList,
      allowNew,
      kind,
      placeholder,
      minQueryLength,
      hasError,
      hasWarning,
      onTagDelete
    } = this.props;

    const options = tagList.filter((tag) => {
      return !tags.some((selected) => selected.id === tag.id);
    });

    return (
      <Autocomplete
        multiple={true}
        freeSolo={allowNew}
        fullWidth={true}
        size="small"
        options={options}
        value={tags}
        filterSelectedOptions={true}
        getOptionLabel={tagName}
        isOptionEqualToValue={(option, selected) => {
          if (!option || !selected || typeof option === 'string' || typeof selected === 'string') {
            return tagName(option) === tagName(selected);
          }

          return option.id === selected.id;
        }}
        filterOptions={(candidates, state) => {
          const query = state.inputValue.toLowerCase();

          if (query.length < minQueryLength) {
            return [];
          }

          return candidates.filter((tag) => tag.name.toLowerCase().includes(query));
        }}
        onChange={this.onChange}
        renderTags={(value, getTagProps) => {
          return value.map((tag, index) => {
            const tagProps = getTagProps({ index });

            return (
              <Chip
                {...tagProps}
                key={tag.id || tag.name}
                label={tag.name}
                size="small"
                color={kind === kinds.DEFAULT ? 'default' : 'primary'}
                onDelete={() => onTagDelete({ index, id: tag.id })}
              />
            );
          });
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              placeholder={placeholder}
              error={!!hasError}
              color={hasWarning ? 'warning' : 'primary'}
            />
          );
        }}
      />
    );
  }
}

TagInput.propTypes = {
  className: PropTypes.string,
  inputContainerClassName: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.shape(tagShape)).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.shape(tagShape)).isRequired,
  allowNew: PropTypes.bool.isRequired,
  kind: PropTypes.oneOf(kinds.all).isRequired,
  placeholder: PropTypes.string.isRequired,
  delimiters: PropTypes.arrayOf(PropTypes.string).isRequired,
  minQueryLength: PropTypes.number.isRequired,
  canEdit: PropTypes.bool,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  tagComponent: PropTypes.elementType,
  onTagAdd: PropTypes.func.isRequired,
  onTagDelete: PropTypes.func.isRequired,
  onTagReplace: PropTypes.func
};

TagInput.defaultProps = {
  allowNew: true,
  kind: kinds.INFO,
  placeholder: '',
  delimiters: ['Tab', 'Enter', ' ', ','],
  minQueryLength: 1,
  canEdit: false
};

export default TagInput;
