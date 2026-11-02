import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 220 }}>
        <Typography sx={{ color: 'text.secondary', py: 1 }}>
          {translate('SiteRipSelectFileHint')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 220 }}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: '10px' }}
      >
        <Box
          sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 0 }}
        >
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {translate('Site')}
          </Typography>
          <span>{series?.title}</span>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '15% 40% 40%',
            gap: '10px',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <SelectInput
            name="episodeYearFilter"
            value={episodeFilterYear}
            values={yearOptions}
            onChange={handleYearChange}
          />

          <TextInput
            name="episodeTitleFilter"
            placeholder={translate('Title')}
            value={episodeFilterTitle}
            onChange={handleTitleChange}
          />

          <TextInput
            name="episodePerformerFilter"
            placeholder={translate('Performers')}
            value={episodeFilterPerformer}
            onChange={handlePerformerChange}
          />
        </Box>
      </Box>

      <Box
        sx={{
          maxHeight: 200,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          '& > div': { maxHeight: 200 },
          '& .site-rip-episode-selected': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Scroller scrollDirection={scrollDirections.VERTICAL}>
          <Table columns={episodeColumns}>
            <TableBody>
              {filteredEpisodes.map((episode) => {
                const performers = formatPerformers(episode.actors);
                const isSelected = selectedEpisodeId === episode.id;

                return (
                  <TableRowButton
                    key={episode.id}
                    className={
                      isSelected ? 'site-rip-episode-selected' : undefined
                    }
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
      </Box>
    </Box>
  );
}

export default SiteRipScenePicker;
