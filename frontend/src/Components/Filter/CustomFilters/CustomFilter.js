import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import IconButton from 'Components/Link/IconButton';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

class CustomFilter extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isDeleting: false
    };
  }

  componentDidUpdate(prevProps) {
    const {
      isDeleting,
      deleteError
    } = this.props;

    if (prevProps.isDeleting && !isDeleting && this.state.isDeleting && deleteError) {
      this.setState({ isDeleting: false });
    }
  }

  componentWillUnmount() {
    const {
      id,
      selectedFilterKey,
      dispatchSetFilter
    } = this.props;

    // Assume that delete and then unmounting means the deletion was successful.
    // Moving this check to an ancestor would be more accurate, but would have
    // more boilerplate.
    if (this.state.isDeleting && id === selectedFilterKey) {
      dispatchSetFilter({ selectedFilterKey: 'all' });
    }
  }

  //
  // Listeners

  onEditPress = () => {
    const {
      id,
      onEditPress
    } = this.props;

    onEditPress(id);
  };

  onRemovePress = () => {
    const {
      id,
      dispatchDeleteCustomFilter
    } = this.props;

    this.setState({ isDeleting: true }, () => {
      dispatchDeleteCustomFilter({ id });
    });

  };

  //
  // Render

  render() {
    const {
      label
    } = this.props;

    return (
      <Box
        sx={{
          display: 'flex',
          mb: '5px',
          p: '5px',
          '&:hover': {
            backgroundColor: 'var(--tableRowHoverBackgroundColor)'
          }
        }}
      >
        <Box sx={{ flex: '0 1 300px' }}>
          {label}
        </Box>

        <Box sx={{ flex: '0 0 60px' }}>
          <IconButton
            name={icons.EDIT}
            onPress={this.onEditPress}
          />

          <SpinnerIconButton
            title={translate('RemoveFilter')}
            name={icons.REMOVE}
            isSpinning={this.state.isDeleting}
            onPress={this.onRemovePress}
          />
        </Box>
      </Box>
    );
  }
}

CustomFilter.propTypes = {
  id: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  selectedFilterKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDeleting: PropTypes.bool.isRequired,
  deleteError: PropTypes.object,
  dispatchSetFilter: PropTypes.func.isRequired,
  onEditPress: PropTypes.func.isRequired,
  dispatchDeleteCustomFilter: PropTypes.func.isRequired
};

export default CustomFilter;
