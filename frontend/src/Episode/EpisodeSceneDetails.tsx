import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import Scroller from 'Components/Scroller/Scroller';
import Episode from 'Episode/Episode';
import EpisodeScreenshot, {
  hasEpisodeScreenshot,
} from 'Episode/EpisodeScreenshot';
import formatPerformers from 'Episode/formatPerformers';
import SeasonEpisodeNumber from 'Episode/SeasonEpisodeNumber';
import EpisodeAiring from 'Episode/Summary/EpisodeAiring';
import EpisodeDownloadedFiles from 'Episode/Summary/EpisodeDownloadedFiles';
import useEpisode, { EpisodeEntities } from 'Episode/useEpisode';
import { kinds, scrollDirections, sizes } from 'Helpers/Props';
import Series from 'Series/Series';
import useSeries from 'Series/useSeries';
import QualityProfileNameConnector from 'Settings/Profiles/Quality/QualityProfileNameConnector';
import formatRuntime from 'Utilities/Number/formatRuntime';
import translate from 'Utilities/String/translate';
import styles from './EpisodeSceneDetails.css';

interface EpisodeSceneDetailsProps {
  seriesId: number;
  episodeId?: number;
  episodeEntity?: EpisodeEntities;
  episodeFileId?: number;
  placeholder?: string;
  showHeader?: boolean;
  showScreenshot?: boolean;
  showMetadata?: boolean;
  centerScreenshot?: boolean;
  collapseMetadata?: boolean;
  fillHeight?: boolean;
  className?: string;
  scrollerClassName?: string;
}

function EpisodeSceneDetails(props: EpisodeSceneDetailsProps) {
  const {
    seriesId,
    episodeId,
    episodeEntity = 'episodes',
    episodeFileId: episodeFileIdProp,
    placeholder = translate('SelectEpisode'),
    showHeader = true,
    showScreenshot: showScreenshotProp = true,
    showMetadata = true,
    centerScreenshot = false,
    collapseMetadata = false,
    fillHeight = false,
    className,
    scrollerClassName,
  } = props;

  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );

  const {
    title: seriesTitle,
    network,
    seriesType,
    qualityProfileId,
    tvdbId: seriesTvdbId,
  } = useSeries(seriesId) as Series;

  const episode = useEpisode(episodeId, episodeEntity) as Episode | undefined;

  if (!episodeId || !episode) {
    return (
      <div className={className ?? styles.sceneDetails}>
        <div className={styles.metadataPlaceholder}>{placeholder}</div>
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
    actors,
    tvdbId: episodeTvdbId,
    episodeFileId: episodeFileIdFromEpisode,
  } = episode;

  const episodeFileId = episodeFileIdProp ?? episodeFileIdFromEpisode;
  const performers = formatPerformers(actors);
  const hasPerformers = !!performers;
  const hasOverview = !!overview;
  const showTpdbLinks = !!seriesTvdbId || !!episodeTvdbId;
  const hasScreenshot = hasEpisodeScreenshot(images);
  const shouldShowScreenshot = showScreenshotProp && hasScreenshot;
  const shouldRenderMetadata = showMetadata || collapseMetadata;
  const isMetadataVisible = showMetadata && !collapseMetadata;

  return (
    <div
      className={classNames(
        className ?? styles.sceneDetails,
        fillHeight && styles.sceneDetailsFillHeight
      )}
    >
      {showHeader ? (
        <div className={styles.sceneDetailsHeader}>{translate('Details')}</div>
      ) : null}

      <Scroller
        className={scrollerClassName ?? styles.sceneDetailsScroller}
        scrollDirection={scrollDirections.VERTICAL}
      >
        <div className={styles.sceneDetailsContent}>
          <div className={styles.sceneDetailsBody}>
            {shouldShowScreenshot ? (
              <div
                className={classNames(
                  styles.sceneScreenshotRegion,
                  centerScreenshot && styles.sceneScreenshotRegionExpanded
                )}
              >
                <div className={styles.sceneScreenshot}>
                  <EpisodeScreenshot
                    className={styles.screenshot}
                    images={images}
                    blur={safeForWorkMode}
                  />
                </div>
              </div>
            ) : null}

            {shouldRenderMetadata ? (
              <div
                className={classNames(
                  styles.metadataSection,
                  !isMetadataVisible && styles.metadataSectionCollapsed
                )}
              >
                <div className={styles.metadataTitle}>{title}</div>

                <div className={styles.metadataSeries}>{seriesTitle}</div>

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
                  <Label
                    kind={monitored ? kinds.SUCCESS : kinds.DISABLED}
                    size={sizes.MEDIUM}
                  >
                    {monitored
                      ? translate('Monitored')
                      : translate('Unmonitored')}
                  </Label>
                </div>

                {releaseDate || network ? (
                  <div className={styles.metadataRow}>
                    <span className={styles.metadataLabel}>
                      {translate('Airs')}
                    </span>
                    <EpisodeAiring
                      releaseDate={releaseDate}
                      network={network}
                    />
                  </div>
                ) : null}

                <div className={styles.metadataRow}>
                  <span className={styles.infoTitle}>
                    {translate('QualityProfile')}
                  </span>

                  <Label kind={kinds.PRIMARY} size={sizes.MEDIUM}>
                    <QualityProfileNameConnector
                      qualityProfileId={qualityProfileId}
                    />
                  </Label>
                </div>

                {runtime ? (
                  <div className={styles.metadataRow}>
                    <span className={styles.metadataLabel}>
                      {translate('Runtime')}
                    </span>
                    <span>{formatRuntime(runtime)}</span>
                  </div>
                ) : null}

                {showTpdbLinks ? (
                  <div className={styles.tpdbLinks}>
                    {seriesTvdbId ? (
                      <Link
                        className={styles.tpdbLink}
                        to={`https://theporndb.net/sites/${seriesTvdbId}`}
                      >
                        <Label kind={kinds.PRIMARY} size={sizes.MEDIUM}>
                          {translate('TpdbStudio')}
                        </Label>
                      </Link>
                    ) : null}

                    {episodeTvdbId ? (
                      <Link
                        className={styles.tpdbLink}
                        to={`https://theporndb.net/scenes/${episodeTvdbId}`}
                      >
                        <Label kind={kinds.PINK} size={sizes.MEDIUM}>
                          {translate('TpdbScene')}
                        </Label>
                      </Link>
                    ) : null}
                  </div>
                ) : null}

                <div className={styles.overviewPanel}>
                  {hasPerformers ? (
                    <div className={styles.performers}>{performers}</div>
                  ) : null}

                  {hasOverview ? (
                    <div className={styles.overviewText}>{overview}</div>
                  ) : null}

                  {!hasOverview && !hasPerformers ? (
                    <div className={styles.overviewText}>
                      {translate('NoEpisodeOverview')}
                    </div>
                  ) : null}
                </div>

                <EpisodeDownloadedFiles
                  episodeEntity={episodeEntity}
                  episodeFileId={episodeFileId}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Scroller>
    </div>
  );
}

export default EpisodeSceneDetails;
