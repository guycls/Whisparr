import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import FilterMenuContent from './FilterMenuContent';
import Menu from './Menu';
import ToolbarMenuButton from './ToolbarMenuButton';

class FilterMenu extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isFilterModalOpen: false
    };
  }

  //
  // Listeners

  onCustomFiltersPress = () => {
    this.setState({ isFilterModalOpen: true });
  };

  onFiltersModalClose = () => {
    this.setState({ isFilterModalOpen: false });
  };

  //
  // Render

  render(props) {
    const {
      className,
      isDisabled,
      selectedFilterKey,
      filters,
      customFilters,
      buttonComponent: ButtonComponent,
      filterModalConnectorComponent: FilterModalConnectorComponent,
      filterModalConnectorComponentProps,
      onFilterSelect,
      ...otherProps
    } = this.props;

    const showCustomFilters = !!FilterModalConnectorComponent;

    return (
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          height: '100%',
          '@media (max-width: 768px)': {
            mr: '10px'
          }
        }}
      >
        <Menu
          className={className}
          openOnHover={true}
          {...otherProps}
        >
          <ButtonComponent
            iconName={icons.FILTER}
            showIndicator={selectedFilterKey !== 'all'}
            text={translate('Filter')}
            isDisabled={isDisabled}
          />

          <FilterMenuContent
            selectedFilterKey={selectedFilterKey}
            filters={filters}
            customFilters={customFilters}
            showCustomFilters={showCustomFilters}
            onFilterSelect={onFilterSelect}
            onCustomFiltersPress={this.onCustomFiltersPress}
          />

        </Menu>

        {
          showCustomFilters &&
            <FilterModalConnectorComponent
              {...filterModalConnectorComponentProps}
              isOpen={this.state.isFilterModalOpen}
              selectedFilterKey={selectedFilterKey}
              filters={filters}
              customFilters={customFilters}
              onFilterSelect={onFilterSelect}
              onModalClose={this.onFiltersModalClose}
            />
        }
      </Box>
    );
  }
}

FilterMenu.propTypes = {
  className: PropTypes.string,
  isDisabled: PropTypes.bool.isRequired,
  selectedFilterKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  filters: PropTypes.arrayOf(PropTypes.object).isRequired,
  customFilters: PropTypes.arrayOf(PropTypes.object).isRequired,
  buttonComponent: PropTypes.elementType.isRequired,
  filterModalConnectorComponent: PropTypes.elementType,
  filterModalConnectorComponentProps: PropTypes.object,
  onFilterSelect: PropTypes.func.isRequired
};

FilterMenu.defaultProps = {
  isDisabled: false,
  buttonComponent: ToolbarMenuButton
};

export default FilterMenu;
