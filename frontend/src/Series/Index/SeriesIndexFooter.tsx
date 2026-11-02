import Box from '@mui/material/Box';
import React from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { ColorImpairedConsumer } from 'App/ColorImpairedContext';
import SeriesAppState from 'App/State/SeriesAppState';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createDeepEqualSelector from 'Store/Selectors/createDeepEqualSelector';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';

function LegendItem({
  label,
  color,
  impaired = false,
  angle = 90,
}: {
  label: string;
  color:
    | 'primary.main'
    | 'success.main'
    | 'error.main'
    | 'warning.main'
    | 'secondary.main';
  impaired?: boolean;
  angle?: number;
}) {
  const paletteKey = color.split('.')[0] as
    | 'primary'
    | 'success'
    | 'error'
    | 'warning'
    | 'secondary';

  return (
    <Box sx={{ display: 'flex', mb: '4px', lineHeight: '16px' }}>
      <Box
        sx={(theme) => ({
          mr: 1,
          width: 30,
          height: 16,
          borderRadius: '4px',
          bgcolor: color,
          background: impaired
            ? `repeating-linear-gradient(${angle}deg, ${theme.palette[paletteKey].dark} 0 5px, ${theme.palette[paletteKey].main} 5px 10px)`
            : undefined,
        })}
      />
      <Box>{label}</Box>
    </Box>
  );
}

function createUnoptimizedSelector() {
  return createSelector(
    createClientSideCollectionSelector('series', 'seriesIndex'),
    (series: SeriesAppState) => {
      return series.items.map((s) => {
        const { monitored, status, statistics } = s;

        return {
          monitored,
          status,
          statistics,
        };
      });
    }
  );
}

function createSeriesSelector() {
  return createDeepEqualSelector(
    createUnoptimizedSelector(),
    (series) => series
  );
}

export default function SeriesIndexFooter() {
  const series = useSelector(createSeriesSelector());
  const count = series.length;
  let episodes = 0;
  let episodeFiles = 0;
  let ended = 0;
  let continuing = 0;
  let monitored = 0;
  let totalFileSize = 0;

  series.forEach((s) => {
    const {
      statistics = { episodeCount: 0, episodeFileCount: 0, sizeOnDisk: 0 },
    } = s;

    const {
      episodeCount = 0,
      episodeFileCount = 0,
      sizeOnDisk = 0,
    } = statistics;

    episodes += episodeCount;
    episodeFiles += episodeFileCount;

    if (s.status === 'ended') {
      ended++;
    } else {
      continuing++;
    }

    if (s.monitored) {
      monitored++;
    }

    totalFileSize += sizeOnDisk;
  });

  return (
    <ColorImpairedConsumer>
      {(enableColorImpairedMode) => {
        return (
          <Box
            sx={{
              display: { xs: 'block', md: 'flex' },
              flexWrap: 'wrap',
              mt: '20px',
              fontSize: 12,
            }}
          >
            <Box>
              <LegendItem
                label={translate('SiteIndexFooterContinuing')}
                color="primary.main"
              />
              <LegendItem
                label={translate('SiteIndexFooterEnded')}
                color="success.main"
              />
              <LegendItem
                label={translate('SiteIndexFooterMissingMonitored')}
                color="error.main"
                impaired={enableColorImpairedMode}
                angle={90}
              />
              <LegendItem
                label={translate('SiteIndexFooterMissingUnmonitored')}
                color="warning.main"
                impaired={enableColorImpairedMode}
                angle={45}
              />
              <LegendItem
                label={translate('SiteIndexFooterDownloading')}
                color="secondary.main"
              />
            </Box>

            <Box
              sx={{
                display: { xs: 'flex', md: 'block', xl: 'flex' },
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                mt: { xs: '20px', md: 0 },
              }}
            >
              <DescriptionList>
                <DescriptionListItem title={translate('Sites')} data={count} />

                <DescriptionListItem title={translate('Ended')} data={ended} />

                <DescriptionListItem
                  title={translate('Continuing')}
                  data={continuing}
                />
              </DescriptionList>

              <DescriptionList>
                <DescriptionListItem
                  title={translate('Monitored')}
                  data={monitored}
                />

                <DescriptionListItem
                  title={translate('Unmonitored')}
                  data={count - monitored}
                />
              </DescriptionList>

              <DescriptionList>
                <DescriptionListItem
                  title={translate('Episodes')}
                  data={episodes}
                />

                <DescriptionListItem
                  title={translate('Files')}
                  data={episodeFiles}
                />
              </DescriptionList>

              <DescriptionList>
                <DescriptionListItem
                  title={translate('TotalFileSize')}
                  data={formatBytes(totalFileSize)}
                />
              </DescriptionList>
            </Box>
          </Box>
        );
      }}
    </ColorImpairedConsumer>
  );
}
