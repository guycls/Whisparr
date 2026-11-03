import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FileBrowserModal from 'Components/FileBrowser/FileBrowserModal';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';

class PathInput extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      value: props.value,
      isFileBrowserModalOpen: false
    };
  }

  componentDidUpdate(prevProps) {
    const { value } = this.props;

    if (prevProps.value !== value) {
      this.setState({ value });
    }
  }

  onInputChange = (event, newValue, reason) => {
    if (reason === 'reset') {
      return;
    }

    this.setState({ value: newValue });

    if (reason === 'input') {
      this.props.onFetchPaths(newValue);
    }
  };

  onChange = (event, option) => {
    if (!option) {
      return;
    }

    const path = typeof option === 'string' ? option : option.path;

    this.props.onChange({
      name: this.props.name,
      value: path
    });

    if (!option.type || option.type !== 'file') {
      this.props.onFetchPaths(path);
    }
  };

  onKeyDown = (event) => {
    if (event.key !== 'Tab') {
      return;
    }

    const path = this.props.paths[0];

    if (!path) {
      return;
    }

    event.preventDefault();

    this.props.onChange({
      name: this.props.name,
      value: path.path
    });

    if (path.type !== 'file') {
      this.props.onFetchPaths(path.path);
    }
  };

  onBlur = () => {
    this.props.onChange({
      name: this.props.name,
      value: this.state.value
    });

    this.props.onClearPaths();
  };

  onFileBrowserOpenPress = (event) => {
    event.preventDefault();
    this.setState({ isFileBrowserModalOpen: true });
  };

  onFileBrowserModalClose = () => {
    this.setState({ isFileBrowserModalOpen: false });
  };

  renderSuggestion(path, query) {
    const lastSeparatorIndex = Math.max(query.lastIndexOf('\\'), query.lastIndexOf('/'));

    if (lastSeparatorIndex === -1) {
      return path;
    }

    return (
      <span>
        <Box component="span" sx={{ fontWeight: 'bold' }}>
          {path.substr(0, lastSeparatorIndex)}
        </Box>
        {path.substr(lastSeparatorIndex)}
      </span>
    );
  }

  render() {
    const {
      className,
      name,
      paths,
      includeFiles,
      hasFileBrowser,
      onChange
    } = this.props;

    const {
      value,
      isFileBrowserModalOpen
    } = this.state;

    return (
      <div className={className}>
        <Autocomplete
          freeSolo={true}
          fullWidth={true}
          size="small"
          options={paths}
          inputValue={value || ''}
          filterOptions={(options) => options}
          getOptionLabel={(option) => typeof option === 'string' ? option : option.path}
          onInputChange={this.onInputChange}
          onChange={this.onChange}
          onBlur={this.onBlur}
          renderOption={(optionProps, option) => {
            return (
              <li {...optionProps}>
                {this.renderSuggestion(option.path, value || '')}
              </li>
            );
          }}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                name={name}
                onKeyDown={this.onKeyDown}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps?.input,
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {
                          hasFileBrowser ?
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                edge="end"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={this.onFileBrowserOpenPress}
                              >
                                <Icon name={icons.FOLDER_OPEN} />
                              </IconButton>
                            </InputAdornment> :
                            null
                        }
                        {params.InputProps ? params.InputProps.endAdornment : null}
                      </>
                    )
                  }
                }}
              />
            );
          }}
        />

        {
          hasFileBrowser &&
            <FileBrowserModal
              isOpen={isFileBrowserModalOpen}
              name={name}
              value={value}
              includeFiles={includeFiles}
              onChange={onChange}
              onModalClose={this.onFileBrowserModalClose}
            />
        }
      </div>
    );
  }
}

PathInput.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  paths: PropTypes.array.isRequired,
  includeFiles: PropTypes.bool.isRequired,
  hasFileBrowser: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onFetchPaths: PropTypes.func.isRequired,
  onClearPaths: PropTypes.func.isRequired
};

PathInput.defaultProps = {
  value: '',
  hasFileBrowser: true
};

export default PathInput;
