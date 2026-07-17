import PropTypes from 'prop-types';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Alert from 'Components/Alert';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import FilterMenu from 'Components/Menu/FilterMenu';
import PageMenuButton from 'Components/Menu/PageMenuButton';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { align, icons, kinds, sortDirections } from 'Helpers/Props';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import InteractiveSearchFilterModalConnector from './InteractiveSearchFilterModalConnector';
import InteractiveSearchRow from './InteractiveSearchRow';
import styles from './InteractiveSearch.css';

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

  return (
    <div>
      {
        stackedTitleLayout ?
          <div className={styles.filterMenuContainerEpisode}>
            <TextInput
              className={styles.filterInput}
              placeholder={translate('FilterReleasesPlaceholder')}
              name="filter"
              value={filter}
              onChange={onFilterChange}
            />

            <div onKeyDown={onIndexerSearchKeyDown}>
              <TextInput
                className={styles.indexerSearchInput}
                placeholder={translate('IndexerSearch')}
                name="indexerSearch"
                value={indexerSearchInput}
                onChange={onIndexerSearchChange}
              />
            </div>

            <SpinnerIconButton
              className={styles.indexerSearchButton}
              name={icons.SEARCH}
              isSpinning={isFetching}
              onPress={onIndexerSearchPress}
            />

            <div className={styles.filterMenuColumn}>
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
            </div>
          </div> :
          <div className={styles.filterMenuContainer}>
            <TextInput
              className={styles.filterInput}
              placeholder={translate('FilterReleasesPlaceholder')}
              name="filter"
              value={filter}
              onChange={onFilterChange}
            />

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
          </div>
      }

      {
        isFetching ? (
          <div className={styles.loadingContainer}>
            <LoadingIndicator />
            {
              searchStatusMessage ?
                <div className={styles.statusMessage}>{searchStatusMessage}</div> :
                null
            }
          </div>
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
        isPopulated && !!textFilteredItems.length ?
          <Table
            columns={tableColumns}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortPress={onSortPress}
          >
            <TableBody>
              {
                textFilteredItems.map((item) => {
                  return (
                    <InteractiveSearchRow
                      key={`${item.indexerId}-${item.guid}`}
                      {...item}
                      searchPayload={searchPayload}
                      longDateFormat={longDateFormat}
                      timeFormat={timeFormat}
                      stackedTitleLayout={stackedTitleLayout}
                      stackedColumnCount={stackedColumnCount}
                      onGrabPress={onGrabPress}
                      onForceDownloadPress={onForceDownloadPress}
                    />
                  );
                })
              }
            </TableBody>
          </Table> :
          null
      }

      {
        totalReleasesCount !== items.length && !!items.length ?
          <div className={styles.filteredMessage}>
            {translate('SomeResultsAreHiddenByTheAppliedFilter')}
          </div> :
          null
      }

      {
        hasTextFilter && items.length !== textFilteredItems.length && !!textFilteredItems.length ?
          <div className={styles.filteredMessage}>
            {translate('SomeResultsAreHiddenByTheAppliedFilter')}
          </div> :
          null
      }
    </div>
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
