import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { addRootFolder } from 'Store/Actions/rootFolderActions';
import createRootFoldersSelector from 'Store/Selectors/createRootFoldersSelector';
import translate from 'Utilities/String/translate';
import RootFolderSelectInput from './RootFolderSelectInput';

const ADD_NEW_KEY = 'addNew';

function pathsEqual(left, right) {
  if (!left || !right || typeof left !== 'string' || typeof right !== 'string') {
    return false;
  }

  const normalize = (path) => path.replace(/[\\/]+$/, '').toLowerCase();

  return normalize(left) === normalize(right);
}

function createMapStateToProps() {
  return createSelector(
    createRootFoldersSelector(),
    (state, { value }) => value,
    (state, { includeMissingValue }) => includeMissingValue,
    (state, { includeNoChange }) => includeNoChange,
    (state, { includeNoChangeDisabled }) => includeNoChangeDisabled,
    (rootFolders, value, includeMissingValue, includeNoChange, includeNoChangeDisabled = true) => {
      const values = rootFolders.items.map((rootFolder) => {
        return {
          key: rootFolder.path,
          value: rootFolder.path,
          freeSpace: rootFolder.freeSpace,
          isMissing: false
        };
      });

      if (includeNoChange) {
        values.unshift({
          key: 'noChange',
          get value() {
            return translate('NoChange');
          },
          isDisabled: includeNoChangeDisabled,
          isMissing: false
        });
      }

      if (!values.length) {
        values.push({
          key: '',
          value: '',
          isDisabled: true,
          isHidden: true
        });
      }

      if (includeMissingValue && !values.find((v) => v.key === value)) {
        values.push({
          key: value,
          value,
          isMissing: true,
          isDisabled: true
        });
      }

      values.push({
        key: ADD_NEW_KEY,
        value: translate('AddANewPath')
      });

      return {
        values,
        isPopulated: rootFolders.isPopulated,
        isSaving: rootFolders.isSaving,
        saveError: rootFolders.saveError
      };
    }
  );
}

function createMapDispatchToProps(dispatch, props) {
  return {
    dispatchAddRootFolder(path) {
      dispatch(addRootFolder({ path }));
    }
  };
}

class RootFolderSelectInputConnector extends Component {

  //
  // Lifecycle

  componentWillMount() {
    const {
      name,
      value,
      values,
      onChange
    } = this.props;

    if (value == null && values[0].key === '') {
      onChange({ name, value: '' });
    }
  }

  componentDidMount() {
    if (!this.props.isPopulated) {
      return;
    }

    const {
      name,
      value,
      values,
      onChange
    } = this.props;

    if (!value || !values.some((v) => v.key === value) || value === ADD_NEW_KEY) {
      const defaultValue = values[0];

      if (defaultValue.key === ADD_NEW_KEY) {
        onChange({ name, value: '' });
      } else {
        onChange({ name, value: defaultValue.key });
      }
    }
  }

  componentDidUpdate(prevProps) {
    const {
      name,
      value,
      values,
      onChange
    } = this.props;

    if (prevProps.values === values || !this.props.isPopulated) {
      return;
    }

    if (!value && values.length && values.some((v) => !!v.key && v.key !== ADD_NEW_KEY)) {
      const defaultValue = values[0];

      if (defaultValue.key !== ADD_NEW_KEY) {
        onChange({ name, value: defaultValue.key });
      }
    }
  }

  //
  // Listeners

  onNewRootFolderSelect = (path) => {
    const existing = this.props.values.find((option) => pathsEqual(option.key, path));

    if (existing) {
      this.props.onChange({
        name: this.props.name,
        value: existing.key
      });

      return false;
    }

    this.props.dispatchAddRootFolder(path);
    return true;
  };

  //
  // Render

  render() {
    const {
      dispatchAddRootFolder,
      isPopulated,
      ...otherProps
    } = this.props;

    return (
      <RootFolderSelectInput
        {...otherProps}
        onNewRootFolderSelect={this.onNewRootFolderSelect}
      />
    );
  }
}

RootFolderSelectInputConnector.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  isPopulated: PropTypes.bool.isRequired,
  includeNoChange: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  dispatchAddRootFolder: PropTypes.func.isRequired
};

RootFolderSelectInputConnector.defaultProps = {
  includeNoChange: false
};

export default connect(createMapStateToProps, createMapDispatchToProps)(RootFolderSelectInputConnector);
