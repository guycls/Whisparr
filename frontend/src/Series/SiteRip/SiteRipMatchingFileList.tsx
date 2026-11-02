import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { SiteRipMatch, SiteRipSelection } from 'App/State/SiteRipAppState';
import CheckInput from 'Components/Form/CheckInput';
import SelectInput from 'Components/Form/SelectInput';
import TextInput from 'Components/Form/TextInput';
import Label from 'Components/Label';
import Scroller from 'Components/Scroller/Scroller';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRowButton from 'Components/Table/TableRowButton';
import Episode from 'Episode/Episode';
import EpisodeQuality from 'Episode/EpisodeQuality';
import { EpisodeFile } from 'EpisodeFile/EpisodeFile';
import { kinds, scrollDirections, sizes } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { CheckInputChanged } from 'typings/inputs';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import { formatTorrentFilePaths } from './formatTorrentFilePaths';
import { getEpisodeDownloadedSummary } from './getEpisodeDownloadedSummary';
import { getSiteRipFileRowState } from './getSiteRipFileRowState';
import { SiteRipFileMatchFilter } from './siteRipFileMatchFilter';

export type SiteRipFileSortKey =
  | 'displayName'
  | 'totalSize'
  | 'monitored'
  | 'downloaded';

export interface SiteRipFileListItem {
  match: SiteRipMatch;
  index: number;
}

const columns = [
  {
    name: 'displayName',
    label: () => translate('Title'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'totalSize',
    label: () => translate('Size'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'monitored',
    label: () => translate('Monitored'),
    isSortable: true,
    isVisible: true,
  },
  {
    name: 'downloaded',
    label: () => translate('Downloaded'),
    isSortable: true,
    isVisible: true,
  },
];

const matchFilterOptions = [
  { key: '', value: () => translate('All') },
  { key: 'matched', value: () => translate('SiteRipFilterMatched') },
  { key: 'unmatched', value: () => translate('SiteRipFilterUnmatched') },
  { key: 'monitored', value: () => translate('Monitored') },
  { key: 'missing', value: () => translate('Missing') },
  { key: 'toGrab', value: () => translate('SiteRipFilterToGrab') },
];

interface SiteRipMatchingFileListProps {
  items: SiteRipFileListItem[];
  selections: Record<number, SiteRipSelection>;
  episodes: Episode[];
  episodeFiles: EpisodeFile[];
  filter: string;
  matchFilter: SiteRipFileMatchFilter;
  sortKey: SiteRipFileSortKey;
  sortDirection: SortDirection;
  activeFileIndex: number | null;
  onFilterChange(value: string): void;
  onMatchFilterChange(value: SiteRipFileMatchFilter): void;
  onSortPress(sortKey: string, sortDirection?: string): void;
  onSelectAllChange(change: CheckInputChanged): void;
  onRowPress(index: number): void;
  onSelectionChange(index: number, selected: boolean): void;
}

function SiteRipMatchingFileList(props: SiteRipMatchingFileListProps) {
  const {
    items,
    selections,
    episodes,
    episodeFiles,
    filter,
    matchFilter,
    sortKey,
    sortDirection,
    activeFileIndex,
    onFilterChange,
    onMatchFilterChange,
    onSortPress,
    onSelectAllChange,
    onRowPress,
    onSelectionChange,
  } = props;

  const episodeMap = useMemo(() => {
    return episodes.reduce<Record<number, Episode>>((acc, episode) => {
      acc[episode.id] = episode;
      return acc;
    }, {});
  }, [episodes]);

  const { allSelected, allUnselected } = useMemo(() => {
    if (!items.length) {
      return { allSelected: false, allUnselected: true };
    }

    const selectedCount = items.filter(
      ({ index }) => selections[index]?.selected
    ).length;

    return {
      allSelected: selectedCount === items.length,
      allUnselected: selectedCount === 0,
    };
  }, [items, selections]);

  const handleFilterChange = useCallback(
    ({ value }: { value: string }) => {
      onFilterChange(value);
    },
    [onFilterChange]
  );

  const handleMatchFilterChange = useCallback(
    ({ value }: { name: string; value: string | number }) => {
      onMatchFilterChange(String(value) as SiteRipFileMatchFilter);
    },
    [onMatchFilterChange]
  );

  const stopCheckboxPropagation = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        height: '100%',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: '10px',
          alignItems: 'center',
          mb: '12px',
          '& .site-rip-match-filter': { minWidth: 140 },
        }}
      >
        <TextInput
          placeholder={translate('Filter')}
          name="fileFilter"
          value={filter}
          onChange={handleFilterChange}
        />

        <Box className="site-rip-match-filter">
          <SelectInput
            name="fileMatchFilter"
            value={matchFilter}
            values={matchFilterOptions}
            onChange={handleMatchFilterChange}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          flex: 1,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          '& > div': { flex: '1 1 auto', minHeight: 0, height: '100%' },
          '& table': { width: '100%', tableLayout: 'fixed' },
          '& th:first-of-type': { width: 40 },
          '& th:nth-of-type(2)': { width: '60%', maxWidth: '60%' },
          '& .site-rip-file-row': { cursor: 'pointer' },
          '& .site-rip-file-row:hover': { filter: 'brightness(1.05)' },
          '& .site-rip-matched-selected': {
            bgcolor: 'rgba(72, 187, 120, 0.18)',
          },
          '& .site-rip-matched-unselected': {
            bgcolor: 'rgba(93, 156, 236, 0.18)',
          },
          '& .site-rip-unmatched': { bgcolor: 'rgba(246, 224, 94, 0.14)' },
          '& .site-rip-active': {
            outline: '1px solid',
            outlineColor: 'primary.main',
            outlineOffset: '-1px',
          },
        }}
      >
        <Scroller scrollDirection={scrollDirections.VERTICAL}>
          <Table
            horizontalScroll={false}
            selectAll={true}
            allSelected={allSelected}
            allUnselected={allUnselected}
            columns={columns}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortPress={onSortPress}
            onSelectAllChange={onSelectAllChange}
          >
            <TableBody>
              {items.map(({ match, index }) => {
                const selection = selections[index];
                const episodeId = selection?.episodeId;
                const episode = episodeId ? episodeMap[episodeId] : undefined;
                const downloadedSummary = getEpisodeDownloadedSummary(
                  episode,
                  episodeFiles
                );
                const rowState = getSiteRipFileRowState(selection);
                const torrentPath = formatTorrentFilePaths(match.filePaths);

                return (
                  <TableRowButton
                    key={index}
                    className={classNames(
                      'site-rip-file-row',
                      rowState === 'matchedSelected' &&
                        'site-rip-matched-selected',
                      rowState === 'matchedUnselected' &&
                        'site-rip-matched-unselected',
                      rowState === 'unmatched' && 'site-rip-unmatched',
                      activeFileIndex === index && 'site-rip-active'
                    )}
                    onPress={() => onRowPress(index)}
                  >
                    <TableRowCell
                      sx={{
                        width: 40,
                        textAlign: 'center',
                        verticalAlign: 'middle',
                      }}
                      onClick={stopCheckboxPropagation}
                    >
                      <CheckInput
                        name={`file-${index}`}
                        value={selection?.selected ?? false}
                        onChange={(change: CheckInputChanged) =>
                          onSelectionChange(index, change.value)
                        }
                      />
                    </TableRowCell>

                    <TableRowCell sx={{ width: '60%', maxWidth: '60%' }}>
                      <Box
                        title={match.displayName}
                        sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
                      >
                        {match.displayName}
                      </Box>
                      {torrentPath ? (
                        <Typography
                          title={match.filePaths.join('\n')}
                          sx={{
                            color: 'text.secondary',
                            fontSize: 12,
                            mt: '2px',
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {torrentPath}
                        </Typography>
                      ) : null}
                      {match.partNumber ? (
                        <Typography
                          sx={{
                            color: 'text.secondary',
                            fontSize: 12,
                            mt: '2px',
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {translate('Scene')} {match.partNumber}
                          {match.partTotal ? `/${match.partTotal}` : ''}
                        </Typography>
                      ) : null}
                    </TableRowCell>

                    <TableRowCell
                      sx={{
                        color: 'text.secondary',
                        fontSize: 13,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatBytes(match.totalSize)}
                    </TableRowCell>

                    <TableRowCell sx={{ whiteSpace: 'nowrap' }}>
                      {episode ? (
                        <Label
                          kind={
                            episode.monitored ? kinds.SUCCESS : kinds.DISABLED
                          }
                          size={sizes.SMALL}
                        >
                          {episode.monitored
                            ? translate('Monitored')
                            : translate('Unmonitored')}
                        </Label>
                      ) : (
                        <Box component="span" sx={{ color: 'text.secondary' }}>
                          -
                        </Box>
                      )}
                    </TableRowCell>

                    <TableRowCell sx={{ whiteSpace: 'nowrap' }}>
                      {downloadedSummary ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '4px',
                          }}
                        >
                          <EpisodeQuality
                            quality={downloadedSummary.quality}
                            size={downloadedSummary.totalSize}
                          />
                          {downloadedSummary.partCount > 1 ? (
                            <Typography
                              component="span"
                              sx={{ color: 'text.secondary', fontSize: 12 }}
                            >
                              {` (${downloadedSummary.partCount} parts)`}
                            </Typography>
                          ) : null}
                        </Box>
                      ) : (
                        <Box component="span" sx={{ color: 'text.secondary' }}>
                          -
                        </Box>
                      )}
                    </TableRowCell>
                  </TableRowButton>
                );
              })}
            </TableBody>
          </Table>
        </Scroller>
      </Box>
    </Box>
  );
}

export default SiteRipMatchingFileList;
