import _ from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import { SiteRipRelease } from 'App/State/SiteRipAppState';
import Alert from 'Components/Alert';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRow from 'Components/Table/TableRow';
import { icons, kinds, sortDirections } from 'Helpers/Props';
import {
  fetchSiteRipReleases,
  setSiteRipRelease,
  setSiteRipSort,
} from 'Store/Actions/siteRipActions';
import formatAge from 'Utilities/Number/formatAge';
import formatBytes from 'Utilities/Number/formatBytes';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';

const columns = [
  {
    name: 'indexer',
    label: () => translate('Indexer'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'age',
    label: () => translate('Age'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'title',
    label: () => translate('Title'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'size',
    label: () => translate('Size'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'peers',
    label: () => translate('Peers'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'rejections',
    label: React.createElement(Icon, {
      name: icons.DANGER,
      title: () => translate('Rejections'),
    }),
    isSortable: true,
    fixedSortDirection: sortDirections.ASCENDING,
    isVisible: true,
  },
  {
    name: 'actions',
    label: () => translate('MatchFiles'),
    isVisible: true,
  },
];

function getSortClause(
  sortKey: string,
  sortPredicates?: Record<string, (item: SiteRipRelease) => number | string>
) {
  if (
    sortPredicates &&
    Object.prototype.hasOwnProperty.call(sortPredicates, sortKey)
  ) {
    return (item: SiteRipRelease) => sortPredicates[sortKey](item);
  }

  return (item: SiteRipRelease) =>
    item[sortKey as keyof SiteRipRelease] as string | number;
}

interface SiteRipSearchViewProps {
  seriesId: number;
}

function SiteRipSearchView(props: SiteRipSearchViewProps) {
  const { seriesId } = props;
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');

  const {
    isFetching,
    isPopulated,
    error,
    items,
    searchStatusMessage,
    sortKey,
    sortDirection,
    sortPredicates,
  } = useSelector((state: AppState) => state.siteRip);

  useEffect(() => {
    if (isPopulated || isFetching) {
      return;
    }

    dispatch(fetchSiteRipReleases({ seriesId }));
  }, [dispatch, seriesId, isPopulated, isFetching]);

  const onFilterChange = useCallback(({ value }: { value: string }) => {
    setFilter(value.toLowerCase());
  }, []);

  const filteredItems = useMemo(() => {
    const textFiltered = !filter
      ? items
      : items.filter((item: SiteRipRelease) =>
          item.title.toLowerCase().includes(filter)
        );

    const order = sortDirection === sortDirections.ASCENDING ? 'asc' : 'desc';

    return _.orderBy(
      textFiltered,
      [getSortClause(sortKey, sortPredicates)],
      [order]
    );
  }, [items, filter, sortKey, sortDirection, sortPredicates]);

  const onSortPress = useCallback(
    (name: string, nextSortDirection?: string) => {
      dispatch(
        setSiteRipSort({
          sortKey: name,
          sortDirection:
            nextSortDirection ||
            (sortKey === name && sortDirection === sortDirections.ASCENDING
              ? sortDirections.DESCENDING
              : sortDirections.ASCENDING),
        })
      );
    },
    [dispatch, sortKey, sortDirection]
  );

  const onMatchFilesPress = useCallback(
    (release: SiteRipRelease) => {
      dispatch(setSiteRipRelease(release));
    },
    [dispatch]
  );

  const errorMessage = getErrorMessage(error as never);

  return (
    <div>
      <TextInput
        placeholder={translate('FilterReleasesPlaceholder')}
        name="filter"
        value={filter}
        onChange={onFilterChange}
      />

      {isFetching ? (
        <div>
          <LoadingIndicator />
          {searchStatusMessage ? <div>{searchStatusMessage}</div> : null}
        </div>
      ) : null}

      {!isFetching && error ? (
        <div>{errorMessage || translate('EpisodeSearchResultsLoadError')}</div>
      ) : null}

      {!isFetching && isPopulated && !filteredItems.length ? (
        <Alert kind={kinds.INFO}>{translate('NoResultsFound')}</Alert>
      ) : null}

      {!isFetching && filteredItems.length ? (
        <Table
          columns={columns}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortPress={onSortPress}
        >
          <TableBody>
            {filteredItems.map((release: SiteRipRelease) => (
              <TableRow key={release.guid}>
                <TableRowCell>{release.indexer}</TableRowCell>
                <TableRowCell>
                  {formatAge(release.age, release.ageHours, release.ageMinutes)}
                </TableRowCell>
                <TableRowCell>
                  {release.infoUrl ? (
                    <Link to={release.infoUrl}>{release.title}</Link>
                  ) : (
                    release.title
                  )}
                </TableRowCell>
                <TableRowCell>{formatBytes(release.size)}</TableRowCell>
                <TableRowCell>
                  {release.seeders ?? 0} / {release.leechers ?? 0}
                </TableRowCell>
                <TableRowCell>
                  {release.rejections?.length ? (
                    <Icon
                      name={icons.DANGER}
                      kind={kinds.DANGER}
                      title={release.rejections.join('\n')}
                    />
                  ) : null}
                </TableRowCell>
                <TableRowCell>
                  <Button onPress={() => onMatchFilesPress(release)}>
                    {translate('MatchFiles')}
                  </Button>
                </TableRowCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  );
}

export default SiteRipSearchView;
