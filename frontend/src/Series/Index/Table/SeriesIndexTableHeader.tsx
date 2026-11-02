import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelect } from 'App/SelectContext';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import Column from 'Components/Table/Column';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import VirtualTableHeader from 'Components/Table/VirtualTableHeader';
import VirtualTableSelectAllHeaderCell from 'Components/Table/VirtualTableSelectAllHeaderCell';
import { icons, sortDirections } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import {
  setSeriesSort,
  setSeriesTableOption,
} from 'Store/Actions/seriesIndexActions';
import { CheckInputChanged } from 'typings/inputs';
import hasGrowableColumns from './hasGrowableColumns';
import SeriesIndexTableOptions from './SeriesIndexTableOptions';

interface SeriesIndexTableHeaderProps {
  showBanners: boolean;
  columns: Column[];
  sortKey?: string;
  sortDirection?: SortDirection;
  isSelectMode: boolean;
}

const headerFlex: Record<string, string> = {
  status: '0 0 60px',
  sortTitle: '4 0 110px',
  network: '2 0 90px',
  originalLanguage: '1 0 125px',
  qualityProfileId: '1 0 125px',
  releaseGroups: '0 0 180px',
  nextAiring: '0 0 180px',
  previousAiring: '0 0 180px',
  added: '0 0 180px',
  genres: '0 0 180px',
  seasonCount: '0 0 100px',
  certification: '0 0 100px',
  seasonFolder: '0 0 150px',
  episodeProgress: '0 0 150px',
  latestSeason: '0 0 150px',
  episodeCount: '0 0 130px',
  year: '0 0 80px',
  path: '1 0 150px',
  sizeOnDisk: '0 0 120px',
  tags: '1 0 60px',
  useSceneNumbering: '0 0 145px',
  actions: '0 1 90px',
};

function headerCellSx(name: string, banner = false, grow = false) {
  return {
    display: 'flex',
    alignItems: 'center',
    flex: name === 'sortTitle' && banner ? '0 0 379px' : headerFlex[name],
    flexGrow: name === 'sortTitle' && banner && grow ? 1 : undefined,
    p: 1,
    border: 'none',
    textAlign: 'left',
    fontWeight: 'bold',
    whiteSpace: { xs: 'nowrap', md: 'normal' },
    minWidth: 0,
    cursor: 'default',
  };
}

interface SeriesIndexHeaderCellProps {
  name: string;
  sx: ReturnType<typeof headerCellSx>;
  isSortable?: boolean;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortPress?: (name: string) => void;
  children?: React.ReactNode;
}

function SeriesIndexHeaderCell({
  name,
  sx,
  isSortable,
  sortKey,
  sortDirection,
  onSortPress,
  children,
}: SeriesIndexHeaderCellProps) {
  const isSorting = !!isSortable && sortKey === name;
  const sortIcon =
    sortDirection === sortDirections.ASCENDING
      ? icons.SORT_ASCENDING
      : icons.SORT_DESCENDING;

  return (
    <Box
      sx={
        [sx, { cursor: isSortable ? 'pointer' : 'default' }] as SxProps<Theme>
      }
      onClick={
        isSortable
          ? () => {
              onSortPress?.(name);
            }
          : undefined
      }
    >
      {children}
      {isSorting ? (
        <Box component="span" sx={{ ml: '10px', display: 'inline-flex' }}>
          <Icon name={sortIcon} />
        </Box>
      ) : null}
    </Box>
  );
}

function SeriesIndexTableHeader(props: SeriesIndexTableHeaderProps) {
  const { showBanners, columns, sortKey, sortDirection, isSelectMode } = props;
  const dispatch = useDispatch();
  const [selectState, selectDispatch] = useSelect();

  const onSortPress = useCallback(
    (value: string) => {
      dispatch(setSeriesSort({ sortKey: value }));
    },
    [dispatch]
  );

  const onTableOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setSeriesTableOption(payload));
    },
    [dispatch]
  );

  const onSelectAllChange = useCallback(
    ({ value }: CheckInputChanged) => {
      selectDispatch({
        type: value ? 'selectAll' : 'unselectAll',
      });
    },
    [selectDispatch]
  );

  return (
    <VirtualTableHeader>
      {isSelectMode ? (
        <VirtualTableSelectAllHeaderCell
          allSelected={selectState.allSelected}
          allUnselected={selectState.allUnselected}
          onSelectAllChange={onSelectAllChange}
        />
      ) : null}

      {columns.map((column) => {
        const { name, label, isSortable, isVisible } = column;

        if (!isVisible) {
          return null;
        }

        const sx = headerCellSx(
          name,
          name === 'sortTitle' && showBanners,
          name === 'sortTitle' && showBanners && !hasGrowableColumns(columns)
        );

        if (name === 'actions') {
          return (
            <SeriesIndexHeaderCell key={name} name={name} sx={sx}>
              <TableOptionsModalWrapper
                columns={columns}
                optionsComponent={SeriesIndexTableOptions}
                onTableOptionChange={onTableOptionChange}
              >
                <IconButton name={icons.ADVANCED_SETTINGS} />
              </TableOptionsModalWrapper>
            </SeriesIndexHeaderCell>
          );
        }

        return (
          <SeriesIndexHeaderCell
            key={name}
            name={name}
            sx={sx}
            isSortable={isSortable}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortPress={onSortPress}
          >
            {typeof label === 'function' ? label() : label}
          </SeriesIndexHeaderCell>
        );
      })}
    </VirtualTableHeader>
  );
}

export default SeriesIndexTableHeader;
