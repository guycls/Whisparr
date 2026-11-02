import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import React from 'react';
import { ParseModel } from 'App/State/ParseAppState';
import FieldSet from 'Components/FieldSet';
import EpisodeFormats from 'Episode/EpisodeFormats';
import SeriesTitleLink from 'Series/SeriesTitleLink';
import translate from 'Utilities/String/translate';
import ParseResultItem from './ParseResultItem';

interface ParseResultProps {
  item: ParseModel;
}

function ParseResult(props: ParseResultProps) {
  const { item } = props;
  const {
    customFormats,
    customFormatScore,
    episodes,
    languages,
    parsedEpisodeInfo,
    series,
  } = item;

  const {
    releaseTitle,
    seriesTitle,
    seriesTitleInfo,
    releaseGroup,
    releaseHash,
    special,
    airDate,
    quality,
  } = parsedEpisodeInfo;

  const finalLanguages = languages ?? parsedEpisodeInfo.languages;

  return (
    <div>
      <FieldSet legend={translate('Release')}>
        <ParseResultItem
          title={translate('ReleaseTitle')}
          data={releaseTitle}
        />

        <ParseResultItem title={translate('SiteTitle')} data={seriesTitle} />

        <ParseResultItem
          title={translate('Year')}
          data={seriesTitleInfo.year > 0 ? seriesTitleInfo.year : '-'}
        />

        <ParseResultItem
          title={translate('AllTitles')}
          data={
            seriesTitleInfo.allTitles?.length > 0
              ? seriesTitleInfo.allTitles.join(', ')
              : '-'
          }
        />

        <ParseResultItem
          title={translate('ReleaseGroup')}
          data={releaseGroup ?? '-'}
        />

        <ParseResultItem
          title={translate('ReleaseHash')}
          data={releaseHash ? releaseHash : '-'}
        />
      </FieldSet>

      <FieldSet legend={translate('EpisodeInfo')}>
        <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
          <Box sx={{ flex: '0 0 50%' }}>
            <ParseResultItem
              title={translate('AirDate')}
              data={airDate ?? '-'}
            />
          </Box>

          <Box sx={{ flex: '0 0 50%' }}>
            <ParseResultItem
              title={translate('Special')}
              data={special ? translate('True') : translate('False')}
            />
          </Box>
        </Stack>
      </FieldSet>

      <FieldSet legend={translate('Quality')}>
        <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
          <Box sx={{ flex: '0 0 50%' }}>
            <ParseResultItem
              title={translate('Quality')}
              data={quality.quality.name}
            />
            <ParseResultItem
              title={translate('Proper')}
              data={
                quality.revision.version > 1 && !quality.revision.isRepack
                  ? translate('True')
                  : '-'
              }
            />

            <ParseResultItem
              title={translate('Repack')}
              data={quality.revision.isRepack ? translate('True') : '-'}
            />
          </Box>

          <Box sx={{ flex: '0 0 50%' }}>
            <ParseResultItem
              title={translate('Version')}
              data={
                quality.revision.version > 1 ? quality.revision.version : '-'
              }
            />

            <ParseResultItem
              title={translate('Real')}
              data={quality.revision.real ? translate('True') : '-'}
            />
          </Box>
        </Stack>
      </FieldSet>

      <FieldSet legend={translate('Languages')}>
        <ParseResultItem
          title={translate('Languages')}
          data={finalLanguages.map((l) => l.name).join(', ')}
        />
      </FieldSet>

      <FieldSet legend={translate('Details')}>
        <ParseResultItem
          title={translate('MatchedToSite')}
          data={
            series ? (
              <SeriesTitleLink
                titleSlug={series.titleSlug}
                title={series.title}
              />
            ) : (
              '-'
            )
          }
        />

        <ParseResultItem
          title={translate('MatchedToEpisodes')}
          data={
            episodes.length ? (
              <div>
                {episodes.map((e) => {
                  return (
                    <div key={e.id}>
                      {e.releaseDate}
                      {` - ${e.title}`}
                    </div>
                  );
                })}
              </div>
            ) : (
              '-'
            )
          }
        />

        <ParseResultItem
          title={translate('CustomFormats')}
          data={
            customFormats?.length ? (
              <EpisodeFormats formats={customFormats} />
            ) : (
              '-'
            )
          }
        />

        <ParseResultItem
          title={translate('CustomFormatScore')}
          data={customFormatScore}
        />
      </FieldSet>
    </div>
  );
}

export default ParseResult;
