import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';
import SelectInput from 'Components/Form/SelectInput';
import TextInput from 'Components/Form/TextInput';
import Scroller from 'Components/Scroller/Scroller';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableRowButton from 'Components/Table/TableRowButton';
import Episode from 'Episode/Episode';
import { scrollDirections } from 'Helpers/Props';
import useSeries from 'Series/useSeries';
import translate from 'Utilities/String/translate';
import { useSiteRipSeriesEpisodes } from './useSiteRipSeriesEpisodes';
import styles from './SiteRipMatchingView.css';

const episodeColumns = [
  {
    name: 'title',
    label: () => translate('Title'),
    isVisible: true,
  },
  {
    name: 'actors',
    label: () => translate('Performers'),
    isVisible: true,
  },
  {
    name: 'releaseDate',
    label: () => translate('ReleaseDate'),
    isVisible: true,
  },
];

function formatPerformers(actors: Episode['actors']) {
  return actors
    .map((actor) => actor.character || actor.name)
    .filter(Boolean)
    .slice(0, 4)
    .join(', ');
}

interface SiteRipScenePickerProps {
  seriesId: number;
  activeFileIndex: number | null;
  selectedEpisodeId?: number;
  episodeFilterYear: string;
  episodeFilterTitle: string;
  episodeFilterPerformer: string;
  onEpisodeFilterYearChange(value: string): void;
  onEpisodeFilterTitleChange(value: string): void;
  onEpisodeFilterPerformerChange(value: string): void;
  onEpisodeSelect(episodeId: number): void;
}

function SiteRipScenePicker(props: SiteRipScenePickerProps) {
  const {
    seriesId,
    activeFileIndex,
    selectedEpisodeId,
    episodeFilterYear,
    episodeFilterTitle,
    episodeFilterPerformer,
    onEpisodeFilterYearChange,
    onEpisodeFilterTitleChange,
    onEpisodeFilterPerformerChange,
    onEpisodeSelect,
  } = props;

  const { episodes: seriesEpisodes } = useSiteRipSeriesEpisodes(seriesId);
  const series = useSeries(seriesId);

  const yearOptions = useMemo(() => {
    const years = [
      ...new Set(seriesEpisodes.map((episode) => episode.seasonNumber)),
    ]
      .sort((a, b) => b - a)
      .map((seasonNumber) => ({
        key: seasonNumber,
        value: String(seasonNumber),
      }));

    return [{ key: '', value: translate('SiteRipAllYears') }, ...years];
  }, [seriesEpisodes]);

  const filteredEpisodes = useMemo(() => {
    const titleFilter = episodeFilterTitle.toLowerCase();
    const performerFilter = episodeFilterPerformer.toLowerCase();
    const yearFilter = episodeFilterYear ? Number(episodeFilterYear) : null;

    return seriesEpisodes.filter((episode) => {
      if (yearFilter != null && episode.seasonNumber !== yearFilter) {
        return false;
      }

      if (titleFilter && !episode.title.toLowerCase().includes(titleFilter)) {
        return false;
      }

      if (performerFilter) {
        const performers = episode.actors
          .map((actor) => `${actor.character} ${actor.name}`.toLowerCase())
          .join(' ');

        if (!performers.includes(performerFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [
    seriesEpisodes,
    episodeFilterTitle,
    episodeFilterPerformer,
    episodeFilterYear,
  ]);

  const handleYearChange = useCallback(
    ({ value }: { name: string; value: string | number }) => {
      onEpisodeFilterYearChange(String(value));
    },
    [onEpisodeFilterYearChange]
  );

  const handleTitleChange = useCallback(
    ({ value }: { value: string }) => {
      onEpisodeFilterTitleChange(value);
    },
    [onEpisodeFilterTitleChange]
  );

  const handlePerformerChange = useCallback(
    ({ value }: { value: string }) => {
      onEpisodeFilterPerformerChange(value);
    },
    [onEpisodeFilterPerformerChange]
  );

  if (activeFileIndex == null) {
    return (
      <div className={styles.scenePicker}>
        <div className={styles.metadataPlaceholder}>
          {translate('SiteRipSelectFileHint')}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.scenePicker}>
      <div className={styles.scenePickerFilters}>
        <div className={styles.studioLabel}>
          <span className={styles.filterLabel}>{translate('Site')}</span>
          <span>{series?.title}</span>
        </div>

        <div className={styles.scenePickerFilterRow}>
          <SelectInput
            className={styles.yearFilter}
            name="episodeYearFilter"
            value={episodeFilterYear}
            values={yearOptions}
            onChange={handleYearChange}
          />

          <TextInput
            className={styles.titleFilter}
            name="episodeTitleFilter"
            placeholder={translate('Title')}
            value={episodeFilterTitle}
            onChange={handleTitleChange}
          />

          <TextInput
            className={styles.performerFilter}
            name="episodePerformerFilter"
            placeholder={translate('Performers')}
            value={episodeFilterPerformer}
            onChange={handlePerformerChange}
          />
        </div>
      </div>

      <Scroller
        className={styles.episodeListScroller}
        scrollDirection={scrollDirections.VERTICAL}
      >
        <Table columns={episodeColumns}>
          <TableBody>
            {filteredEpisodes.map((episode) => {
              const performers = formatPerformers(episode.actors);
              const isSelected = selectedEpisodeId === episode.id;

              return (
                <TableRowButton
                  key={episode.id}
                  className={classNames(
                    isSelected && styles.episodeRowSelected
                  )}
                  onPress={() => onEpisodeSelect(episode.id)}
                >
                  <TableRowCell>{episode.title}</TableRowCell>
                  <TableRowCell>
                    <span title={performers}>{performers}</span>
                  </TableRowCell>
                  <TableRowCell>{episode.releaseDate}</TableRowCell>
                </TableRowButton>
              );
            })}
          </TableBody>
        </Table>
      </Scroller>
    </div>
  );
}

export default SiteRipScenePicker;
