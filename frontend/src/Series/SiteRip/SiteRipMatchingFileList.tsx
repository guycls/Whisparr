import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';
import CheckInput from 'Components/Form/CheckInput';
import SelectInput from 'Components/Form/SelectInput';
import TextInput from 'Components/Form/TextInput';
import Label from 'Components/Label';
import Scroller from 'Components/Scroller/Scroller';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRowButton from 'Components/Table/TableRowButton';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Episode from 'Episode/Episode';
import EpisodeQuality from 'Episode/EpisodeQuality';
import { EpisodeFile } from 'EpisodeFile/EpisodeFile';
import { kinds, scrollDirections, sizes } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { SiteRipMatch, SiteRipSelection } from 'App/State/SiteRipAppState';
import { CheckInputChanged } from 'typings/inputs';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import { formatTorrentFilePaths } from './formatTorrentFilePaths';
import { getEpisodeDownloadedSummary } from './getEpisodeDownloadedSummary';
import { getSiteRipFileRowState } from './getSiteRipFileRowState';
import { SiteRipFileMatchFilter } from './siteRipFileMatchFilter';
import styles from './SiteRipMatchingView.css';

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
    className: styles.titleColumn,
    isSortable: true,
    isVisible: true
  },
  {
    name: 'totalSize',
    label: () => translate('Size'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'monitored',
    label: () => translate('Monitored'),
    isSortable: true,
    isVisible: true
  },
  {
    name: 'downloaded',
    label: () => translate('Downloaded'),
    isSortable: true,
    isVisible: true
  }
];

const matchFilterOptions = [
  { key: '', value: () => translate('All') },
  { key: 'matched', value: () => translate('SiteRipFilterMatched') },
  { key: 'unmatched', value: () => translate('SiteRipFilterUnmatched') },
  { key: 'monitored', value: () => translate('Monitored') },
  { key: 'missing', value: () => translate('Missing') },
  { key: 'toGrab', value: () => translate('SiteRipFilterToGrab') }
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
    onSelectionChange
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

    const selectedCount = items.filter(({ index }) => selections[index]?.selected).length;

    return {
      allSelected: selectedCount === items.length,
      allUnselected: selectedCount === 0
    };
  }, [items, selections]);

  const handleFilterChange = useCallback(({ value }: { value: string }) => {
    onFilterChange(value);
  }, [onFilterChange]);

  const handleMatchFilterChange = useCallback(({ value }: { name: string; value: string | number }) => {
    onMatchFilterChange(String(value) as SiteRipFileMatchFilter);
  }, [onMatchFilterChange]);

  const stopCheckboxPropagation = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <div className={styles.leftPane}>
      <div className={styles.fileToolbar}>
        <TextInput
          className={styles.filterInput}
          placeholder={translate('Filter')}
          name="fileFilter"
          value={filter}
          onChange={handleFilterChange}
        />

        <SelectInput
          className={styles.matchFilterSelect}
          name="fileMatchFilter"
          value={matchFilter}
          values={matchFilterOptions}
          onChange={handleMatchFilterChange}
        />
      </div>

      <div className={styles.fileTable}>
        <Scroller
          className={styles.fileListScroller}
          scrollDirection={scrollDirections.VERTICAL}
        >
          <Table
            className={styles.matchingTable}
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
            {
              items.map(({ match, index }) => {
                const selection = selections[index];
                const episodeId = selection?.episodeId;
                const episode = episodeId ? episodeMap[episodeId] : undefined;
                const downloadedSummary = getEpisodeDownloadedSummary(episode, episodeFiles);
                const rowState = getSiteRipFileRowState(selection);
                const torrentPath = formatTorrentFilePaths(match.filePaths);

                return (
                  <TableRowButton
                    key={index}
                    className={classNames(
                      styles.fileRow,
                      rowState === 'matchedSelected' && styles.fileRowMatchedSelected,
                      rowState === 'matchedUnselected' && styles.fileRowMatchedUnselected,
                      rowState === 'unmatched' && styles.fileRowUnmatched,
                      activeFileIndex === index && styles.fileRowActive
                    )}
                    onPress={() => onRowPress(index)}
                  >
                    <TableRowCell
                      className={styles.checkboxColumn}
                      onClick={stopCheckboxPropagation}
                    >
                      <CheckInput
                        containerClassName={styles.checkboxContainer}
                        className={styles.checkboxInput}
                        name={`file-${index}`}
                        value={selection?.selected ?? false}
                        onChange={(change: CheckInputChanged) => onSelectionChange(index, change.value)}
                      />
                    </TableRowCell>

                    <TableRowCell className={styles.fileNameCell}>
                      <div className={styles.fileName} title={match.displayName}>
                        {match.displayName}
                      </div>
                      {
                        torrentPath ?
                          <div className={styles.filePath} title={match.filePaths.join('\n')}>
                            {torrentPath}
                          </div> :
                          null
                      }
                      {
                        match.partNumber ?
                          <div className={styles.partLabel}>
                            {translate('Scene')} {match.partNumber}{match.partTotal ? `/${match.partTotal}` : ''}
                          </div> :
                          null
                      }
                    </TableRowCell>

                    <TableRowCell className={styles.sizeCell}>
                      {formatBytes(match.totalSize)}
                    </TableRowCell>

                    <TableRowCell className={styles.monitoredCell}>
                      {
                        episode ?
                          <Label
                            kind={episode.monitored ? kinds.SUCCESS : kinds.DISABLED}
                            size={sizes.SMALL}
                          >
                            {episode.monitored ? translate('Monitored') : translate('Unmonitored')}
                          </Label> :
                          <span className={styles.emptyCell}>-</span>
                      }
                    </TableRowCell>

                    <TableRowCell className={styles.downloadedCell}>
                      {
                        downloadedSummary ?
                          <div className={styles.downloadedSummary}>
                            <EpisodeQuality
                              quality={downloadedSummary.quality}
                              size={downloadedSummary.totalSize}
                            />
                            {
                              downloadedSummary.partCount > 1 ?
                                <span className={styles.partCount}>
                                  {` (${downloadedSummary.partCount} parts)`}
                                </span> :
                                null
                            }
                          </div> :
                          <span className={styles.emptyCell}>-</span>
                      }
                    </TableRowCell>
                  </TableRowButton>
                );
              })
            }
          </TableBody>
        </Table>
        </Scroller>
      </div>
    </div>
  );
}

export default SiteRipMatchingFileList;
