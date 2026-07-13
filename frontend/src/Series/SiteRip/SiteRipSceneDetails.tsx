import React from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Label from 'Components/Label';
import Scroller from 'Components/Scroller/Scroller';
import { kinds, scrollDirections, sizes } from 'Helpers/Props';
import Episode from 'Episode/Episode';
import EpisodeScreenshot, { hasEpisodeScreenshot } from 'Episode/EpisodeScreenshot';
import useEpisode from 'Episode/useEpisode';
import SeasonEpisodeNumber from 'Episode/SeasonEpisodeNumber';
import EpisodeAiring from 'Episode/Summary/EpisodeAiring';
import useSeries from 'Series/useSeries';
import Series from 'Series/Series';
import formatRuntime from 'Utilities/Number/formatRuntime';
import translate from 'Utilities/String/translate';
import styles from './SiteRipMatchingView.css';

function formatPerformers(actors: Episode['actors']) {
  return actors
    .map((actor) => actor.character || actor.name)
    .filter(Boolean)
    .join(', ');
}

interface SiteRipSceneDetailsProps {
  seriesId: number;
  episodeId?: number;
}

function SiteRipSceneDetails(props: SiteRipSceneDetailsProps) {
  const { seriesId, episodeId } = props;

  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const {
    title: seriesTitle,
    network,
    seriesType
  } = useSeries(seriesId) as Series;

  const episode = useEpisode(episodeId, 'episodes') as Episode | undefined;

  if (!episodeId || !episode) {
    return (
      <div className={styles.sceneDetails}>
        <div className={styles.metadataPlaceholder}>
          {translate('SelectEpisode')}
        </div>
      </div>
    );
  }

  const {
    title,
    overview,
    seasonNumber,
    episodeNumber,
    absoluteEpisodeNumber,
    releaseDate,
    runtime,
    monitored,
    images,
    actors
  } = episode;

  const performers = formatPerformers(actors);
  const showScreenshot = hasEpisodeScreenshot(images);

  return (
    <div className={styles.sceneDetails}>
      <div className={styles.sceneDetailsHeader}>
        {translate('Details')}
      </div>

      <Scroller
        className={styles.sceneDetailsScroller}
        scrollDirection={scrollDirections.VERTICAL}
      >
        <div className={styles.sceneDetailsContent}>
          {
            showScreenshot ?
              <div className={styles.sceneScreenshot}>
                <EpisodeScreenshot
                  className={styles.screenshot}
                  images={images}
                  blur={safeForWorkMode}
                />
              </div> :
              null
          }

          <div className={styles.sceneDetailsBody}>
            <div className={styles.metadataTitle}>{title}</div>

            <div className={styles.metadataSeries}>
              {seriesTitle}
            </div>

            <div className={styles.metadataEpisodeNumber}>
              <SeasonEpisodeNumber
                seasonNumber={seasonNumber}
                episodeNumber={episodeNumber}
                absoluteEpisodeNumber={absoluteEpisodeNumber}
                releaseDate={releaseDate}
                seriesType={seriesType}
              />
            </div>

            <div className={styles.metadataRow}>
              <Label kind={monitored ? kinds.SUCCESS : kinds.DISABLED} size={sizes.MEDIUM}>
                {monitored ? translate('Monitored') : translate('Unmonitored')}
              </Label>
            </div>

            {
              releaseDate || network ?
                <div className={styles.metadataRow}>
                  <span className={styles.metadataLabel}>{translate('Airs')}</span>
                  <EpisodeAiring releaseDate={releaseDate} network={network} />
                </div> :
                null
            }

            {
              runtime ?
                <div className={styles.metadataRow}>
                  <span className={styles.metadataLabel}>{translate('Runtime')}</span>
                  <span>{formatRuntime(runtime)}</span>
                </div> :
                null
            }

            {
              performers ?
                <div className={styles.metadataRow}>
                  <span className={styles.metadataLabel}>{translate('Performers')}</span>
                  <span>{performers}</span>
                </div> :
                null
            }

            {
              overview ?
                <div className={styles.metadataOverview}>{overview}</div> :
                null
            }
          </div>
        </div>
      </Scroller>
    </div>
  );
}

export default SiteRipSceneDetails;
