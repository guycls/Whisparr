import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Alert from 'Components/Alert';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import FilterMenu from 'Components/Menu/FilterMenu';
import MenuContent from 'Components/Menu/MenuContent';
import PageMenuButton from 'Components/Menu/PageMenuButton';
import SortMenu from 'Components/Menu/SortMenu';
import SortMenuItem from 'Components/Menu/SortMenuItem';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import useMeasure from 'Helpers/Hooks/useMeasure';
import { align, icons, kinds, sortDirections } from 'Helpers/Props';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import InteractiveSearchFilterModalConnector from './InteractiveSearchFilterModalConnector';
import InteractiveSearchRow from './InteractiveSearchRow';

const columns = [
  {
    name: 'protocol',
    label: () => translate('Source'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'age',
    label: () => translate('Age'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'title',
    label: () => translate('Title'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'indexer',
    label: () => translate('Indexer'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'size',
    label: () => translate('Size'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'peers',
    label: () => translate('Peers'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'languageWeight',
    label: () => translate('Languages'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'qualityWeight',
    label: () => translate('Quality'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'customFormatScore',
    label: React.createElement(Icon, {
      name: icons.SCORE,
      title: () => translate('CustomFormatScore')
    }),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'indexerFlags',
    label: React.createElement(Icon, {
      name: icons.FLAG,
      title: () => translate('IndexerFlags')
    }),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'rejections',
    label: React.createElement(Icon, {
      name: icons.DANGER,
      title: () => translate('Rejections')
    }),
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING,
    isVisible: true
  },
  {
    name: 'releaseWeight',
    label: React.createElement(Icon, { name: icons.DOWNLOAD }),
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING,
    isVisible: true
  }
];

const CARD_LAYOUT_MAX_WIDTH = 1200;

const sortColumnLabels = {
  customFormatScore: () => translate('CustomFormatScore'),
  indexerFlags: () => translate('IndexerFlags'),
  rejections: () => translate('Rejections'),
  releaseWeight: () => translate('Download')
};

function getColumnSortLabel(column) {
  if (sortColumnLabels[column.name]) {
    return sortColumnLabels[column.name]();
  }

  return typeof column.label === 'function' ? column.label() : column.label;
}

function InteractiveSearch(props) {
  const {
    searchPayload,
    isFetching,
    isPopulated,
    error,
    totalReleasesCount,
    items,
    selectedFilterKey,
    filters,
    customFilters,
    sortKey,
    sortDirection,
    type,
    longDateFormat,
    timeFormat,
    stackedTitleLayout = false,
    indexerSearchTerm = '',
    onIndexerSearchSubmit,
    onSortPress,
    onFilterSelect,
    onGrabPress,
    onForceDownloadPress,
    searchStatusMessage
  } = props;

  const [filter, setFilter] = useState('');
  const [indexerSearchInput, setIndexerSearchInput] = useState(indexerSearchTerm);
  const [measureRef, bounds] = useMeasure();
  const useCardLayout = bounds.width > 0 ?
    bounds.width < CARD_LAYOUT_MAX_WIDTH :
    !!stackedTitleLayout;

  const onCardSortSelect = useCallback((selectedSortKey) => {
    const column = columns.find((item) => item.name === selectedSortKey);

    onSortPress(selectedSortKey, column && column.fixedSortDirection);
  }, [onSortPress]);

  useEffect(() => {
    setIndexerSearchInput(indexerSearchTerm);
  }, [indexerSearchTerm]);

  const onFilterChange = useCallback(({ value }) => {
    setFilter(value.toLowerCase());
  }, []);

  const onIndexerSearchChange = useCallback(({ value }) => {
    setIndexerSearchInput(value);
  }, []);

  const onIndexerSearchPress = useCallback(() => {
    if (onIndexerSearchSubmit) {
      onIndexerSearchSubmit(indexerSearchInput.trim());
    }
  }, [indexerSearchInput, onIndexerSearchSubmit]);

  const onIndexerSearchKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      onIndexerSearchPress();
    }
  }, [onIndexerSearchPress]);

  const textFilteredItems = useMemo(() => {
    if (!filter) {
      return items;
    }

    return items.filter((item) => item.title.toLowerCase().includes(filter));
  }, [items, filter]);

  const errorMessage = getErrorMessage(error);
  const visibleColumns = columns.filter((column) => column.isVisible);
  const tableColumns = stackedTitleLayout ?
    visibleColumns.filter((column) => column.name !== 'title') :
    visibleColumns;
  const stackedColumnCount = tableColumns.length;
  const hasTextFilter = !!filter;
  const hasHiddenByTextFilter = hasTextFilter && items.length > 0 && !textFilteredItems.length;
  const resultRows = textFilteredItems.map((item) => {
    return (
      <InteractiveSearchRow
        key={`${item.indexerId}-${item.guid}`}
        {...item}
        searchPayload={searchPayload}
        longDateFormat={longDateFormat}
        timeFormat={timeFormat}
        stackedTitleLayout={stackedTitleLayout}
        stackedColumnCount={stackedColumnCount}
        cardLayout={useCardLayout}
        onGrabPress={onGrabPress}
        onForceDownloadPress={onForceDownloadPress}
      />
    );
  });

  const sortMenu = useCardLayout ?
    (
      <SortMenu alignMenu={align.RIGHT}>
        <MenuContent>
          {
            columns.filter((column) => column.isSortable).map((column) => {
              return (
                <SortMenuItem
                  key={column.name}
                  name={column.name}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onPress={onCardSortSelect}
                >
                  {getColumnSortLabel(column)}
                </SortMenuItem>
              );
            })
          }
        </MenuContent>
      </SortMenu>
    ) :
    null;

  return (
    <Box ref={measureRef} sx={{ minWidth: 0, maxWidth: '100%' }}>
      {
        stackedTitleLayout ?
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1,
              mb: '10px'
            }}
          >
            <Box sx={{ flex: '1 1 180px', minWidth: 0, maxWidth: 400 }}>
              <TextInput
                placeholder={translate('FilterReleasesPlaceholder')}
                name="filter"
                value={filter}
                onChange={onFilterChange}
              />
            </Box>

            <Box sx={{ flex: '1 1 180px', minWidth: 0 }} onKeyDown={onIndexerSearchKeyDown}>
              <TextInput
                placeholder={translate('IndexerSearch')}
                name="indexerSearch"
                value={indexerSearchInput}
                onChange={onIndexerSearchChange}
              />
            </Box>

            <SpinnerIconButton
              name={icons.SEARCH}
              isSpinning={isFetching}
              onPress={onIndexerSearchPress}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              {sortMenu}

              <FilterMenu
                alignMenu={align.RIGHT}
                selectedFilterKey={selectedFilterKey}
                filters={filters}
                customFilters={customFilters}
                buttonComponent={PageMenuButton}
                filterModalConnectorComponent={InteractiveSearchFilterModalConnector}
                filterModalConnectorComponentProps={{ type }}
                onFilterSelect={onFilterSelect}
              />
            </Box>
          </Box> :
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              mb: '10px'
            }}
          >
            <Box sx={{ width: '100%', minWidth: 0, flex: '1 1 180px', maxWidth: 400 }}>
              <TextInput
                placeholder={translate('FilterReleasesPlaceholder')}
                name="filter"
                value={filter}
                onChange={onFilterChange}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {sortMenu}

              <FilterMenu
                alignMenu={align.RIGHT}
                selectedFilterKey={selectedFilterKey}
                filters={filters}
                customFilters={customFilters}
                buttonComponent={PageMenuButton}
                filterModalConnectorComponent={InteractiveSearchFilterModalConnector}
                filterModalConnectorComponentProps={{ type }}
                onFilterSelect={onFilterSelect}
              />
            </Box>
          </Box>
      }

      {
        isFetching ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: '10px'
            }}
          >
            <LoadingIndicator />
            {
              searchStatusMessage ?
                <Box sx={{ mt: '10px', color: 'var(--dimColor)', textAlign: 'center' }}>{searchStatusMessage}</Box> :
                null
            }
          </Box>
        ) : null
      }

      {
        !isFetching && error ?
          <div>
            {
              errorMessage ?
                <Fragment>
                  {translate('InteractiveSearchResultsFailedErrorMessage', { message: errorMessage.charAt(0).toLowerCase() + errorMessage.slice(1) })}
                </Fragment> :
                translate('EpisodeSearchResultsLoadError')
            }
          </div> :
          null
      }

      {
        !isFetching && isPopulated && !totalReleasesCount ?
          <Alert kind={kinds.INFO}>
            {translate('NoResultsFound')}
          </Alert> :
          null
      }

      {
        !!totalReleasesCount && isPopulated && !items.length ?
          <Alert kind={kinds.WARNING}>
            {translate('AllResultsAreHiddenByTheAppliedFilter')}
          </Alert> :
          null
      }

      {
        hasHiddenByTextFilter ?
          <Alert kind={kinds.WARNING}>
            {translate('AllResultsAreHiddenByTheAppliedFilter')}
          </Alert> :
          null
      }

      {
        isPopulated && !!textFilteredItems.length && useCardLayout ?
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {resultRows}
          </Box> :
          null
      }

      {
        isPopulated && !!textFilteredItems.length && !useCardLayout ?
          <Table
            columns={tableColumns}
            minWidth={CARD_LAYOUT_MAX_WIDTH}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortPress={onSortPress}
          >
            <TableBody>
              {resultRows}
            </TableBody>
          </Table> :
          null
      }

      {
        totalReleasesCount !== items.length && !!items.length ?
          <Box sx={{ mt: '10px' }}>
            {translate('SomeResultsAreHiddenByTheAppliedFilter')}
          </Box> :
          null
      }

      {
        hasTextFilter && items.length !== textFilteredItems.length && !!textFilteredItems.length ?
          <Box sx={{ mt: '10px' }}>
            {translate('SomeResultsAreHiddenByTheAppliedFilter')}
          </Box> :
          null
      }
    </Box>
  );
}

InteractiveSearch.propTypes = {
  searchPayload: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  totalReleasesCount: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedFilterKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  filters: PropTypes.arrayOf(PropTypes.object).isRequired,
  customFilters: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.string,
  type: PropTypes.string.isRequired,
  longDateFormat: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  stackedTitleLayout: PropTypes.bool,
  indexerSearchTerm: PropTypes.string,
  onIndexerSearchSubmit: PropTypes.func,
  onSortPress: PropTypes.func.isRequired,
  onFilterSelect: PropTypes.func.isRequired,
  onGrabPress: PropTypes.func.isRequired,
  onForceDownloadPress: PropTypes.func,
  searchStatusMessage: PropTypes.string
};

export default InteractiveSearch;
