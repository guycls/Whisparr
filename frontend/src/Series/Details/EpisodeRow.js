import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import Popover from 'Components/Tooltip/Popover';
import Tooltip from 'Components/Tooltip/Tooltip';
import EpisodeFormats from 'Episode/EpisodeFormats';
import EpisodeSearchCell from 'Episode/EpisodeSearchCell';
import EpisodeStatus from 'Episode/EpisodeStatus';
import EpisodeTitleLink from 'Episode/EpisodeTitleLink';
import IndexerFlags from 'Episode/IndexerFlags';
import EpisodeFileLanguageConnector from 'EpisodeFile/EpisodeFileLanguageConnector';
import MediaInfoConnector from 'EpisodeFile/MediaInfoConnector';
import * as mediaInfoTypes from 'EpisodeFile/mediaInfoTypes';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import formatBytes from 'Utilities/Number/formatBytes';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import formatRuntime from 'Utilities/Number/formatRuntime';
import translate from 'Utilities/String/translate';
import EpisodeSelectCell from './EpisodeSelectCell';

const episodeCellSx = {
  p: 1,
  lineHeight: 1.52857143,
  whiteSpace: { xs: 'nowrap', md: 'normal' }
};

function episodeColumnSx(width) {
  return {
    ...episodeCellSx,
    width
  };
}

class EpisodeRow extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isDetailsModalOpen: false
    };
  }

  //
  // Listeners

  onManualSearchPress = () => {
    this.setState({ isDetailsModalOpen: true });
  };

  onDetailsModalClose = () => {
    this.setState({ isDetailsModalOpen: false });
  };

  onMonitorEpisodePress = (monitored, options) => {
    this.props.onMonitorEpisodePress(this.props.id, monitored, options);
  };

  //
  // Render

  render() {
    const {
      id,
      seriesId,
      episodeFileId,
      monitored,
      actors,
      releaseDate,
      runtime,
      title,
      isSaving,
      seriesMonitored,
      episodeFilePath,
      episodeFileRelativePath,
      episodeFileSize,
      releaseGroup,
      customFormats,
      customFormatScore,
      indexerFlags,
      columns,
      isSelectMode
    } = this.props;

    return (
      <TableRow>
        {
          isSelectMode ?
            <EpisodeSelectCell id={id} /> :
            null
        }
        {
          columns.map((column) => {
            const {
              name,
              isVisible
            } = column;

            if (!isVisible) {
              return null;
            }

            if (name === 'monitored') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(42)}
                >
                  <MonitorToggleButton
                    monitored={monitored}
                    isDisabled={!seriesMonitored}
                    isSaving={isSaving}
                    onPress={this.onMonitorEpisodePress}
                  />
                </TableRowCell>
              );
            }

            if (name === 'releaseDate') {
              return (
                <RelativeDateCell
                  key={name}
                  date={releaseDate}
                />
              );
            }

            if (name === 'title') {
              return (
                <TableRowCell
                  key={name}
                  sx={{ ...episodeCellSx, whiteSpace: 'nowrap' }}
                >
                  <EpisodeTitleLink
                    episodeId={id}
                    seriesId={seriesId}
                    episodeTitle={title}
                    episodeEntity="episodes"
                    showOpenSeriesButton={false}
                  />
                </TableRowCell>
              );
            }

            if (name === 'actors') {
              const joinedPerformers = actors.map((a) => a.character).slice(0, 4).join(', ');

              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(400)}
                >
                  <span title={joinedPerformers}>
                    {joinedPerformers}
                  </span>
                </TableRowCell>
              );
            }

            if (name === 'path') {
              return (
                <TableRowCell key={name}>
                  {
                    episodeFilePath
                  }
                </TableRowCell>
              );
            }

            if (name === 'relativePath') {
              return (
                <TableRowCell key={name}>
                  {
                    episodeFileRelativePath
                  }
                </TableRowCell>
              );
            }

            if (name === 'airDateUtc') {
              return (
                <RelativeDateCell
                  key={name}
                  date={releaseDate}
                />
              );
            }

            if (name === 'runtime') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(80)}
                >
                  { formatRuntime(runtime) }
                </TableRowCell>
              );
            }

            if (name === 'customFormats') {
              return (
                <TableRowCell key={name}>
                  <EpisodeFormats
                    formats={customFormats}
                  />
                </TableRowCell>
              );
            }

            if (name === 'customFormatScore') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(55)}
                >
                  <Tooltip
                    anchor={formatCustomFormatScore(
                      customFormatScore,
                      customFormats.length
                    )}
                    tooltip={<EpisodeFormats formats={customFormats} />}
                    position={tooltipPositions.LEFT}
                  />
                </TableRowCell>
              );
            }

            if (name === 'languages') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(100)}
                >
                  <EpisodeFileLanguageConnector
                    episodeFileId={episodeFileId}
                  />
                </TableRowCell>
              );
            }

            if (name === 'audioInfo') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(100)}
                >
                  <MediaInfoConnector
                    type={mediaInfoTypes.AUDIO}
                    episodeFileId={episodeFileId}
                  />
                </TableRowCell>
              );
            }

            if (name === 'audioLanguages') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(165)}
                >
                  <MediaInfoConnector
                    type={mediaInfoTypes.AUDIO_LANGUAGES}
                    episodeFileId={episodeFileId}
                  />
                </TableRowCell>
              );
            }

            if (name === 'subtitleLanguages') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(165)}
                >
                  <MediaInfoConnector
                    type={mediaInfoTypes.SUBTITLES}
                    episodeFileId={episodeFileId}
                  />
                </TableRowCell>
              );
            }

            if (name === 'videoCodec') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(100)}
                >
                  <MediaInfoConnector
                    type={mediaInfoTypes.VIDEO}
                    episodeFileId={episodeFileId}
                  />
                </TableRowCell>
              );
            }

            if (name === 'videoDynamicRangeType') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(165)}
                >
                  <MediaInfoConnector
                    type={mediaInfoTypes.VIDEO_DYNAMIC_RANGE_TYPE}
                    episodeFileId={episodeFileId}
                  />
                </TableRowCell>
              );
            }

            if (name === 'size') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(100)}
                >
                  {!!episodeFileSize && formatBytes(episodeFileSize)}
                </TableRowCell>
              );
            }

            if (name === 'releaseGroup') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(120)}
                >
                  {releaseGroup}
                </TableRowCell>
              );
            }

            if (name === 'indexerFlags') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(50)}
                >
                  {indexerFlags ? (
                    <Popover
                      anchor={<Icon name={icons.FLAG} kind={kinds.PRIMARY} />}
                      title={translate('IndexerFlags')}
                      body={<IndexerFlags indexerFlags={indexerFlags} />}
                      position={tooltipPositions.LEFT}
                    />
                  ) : null}
                </TableRowCell>
              );
            }

            if (name === 'status') {
              return (
                <TableRowCell
                  key={name}
                  sx={episodeColumnSx(100)}
                >
                  <EpisodeStatus
                    episodeId={id}
                    episodeFileId={episodeFileId}
                  />
                </TableRowCell>
              );
            }

            if (name === 'actions') {
              return (
                <EpisodeSearchCell
                  key={name}
                  episodeId={id}
                  episodeEntity='episodes'
                  seriesId={seriesId}
                  episodeTitle={title}
                />
              );
            }

            return null;
          })
        }
      </TableRow>
    );
  }
}

EpisodeRow.propTypes = {
  id: PropTypes.number.isRequired,
  seriesId: PropTypes.number.isRequired,
  episodeFileId: PropTypes.number,
  monitored: PropTypes.bool.isRequired,
  seasonNumber: PropTypes.number.isRequired,
  sceneSeasonNumber: PropTypes.number,
  sceneEpisodeNumber: PropTypes.number,
  sceneAbsoluteEpisodeNumber: PropTypes.number,
  actors: PropTypes.arrayOf(PropTypes.object),
  joinedPerformers: PropTypes.string,
  releaseDate: PropTypes.string,
  runtime: PropTypes.number,
  title: PropTypes.string.isRequired,
  isSaving: PropTypes.bool,
  useSceneNumbering: PropTypes.bool,
  unverifiedSceneNumbering: PropTypes.bool,
  seriesMonitored: PropTypes.bool.isRequired,
  episodeFilePath: PropTypes.string,
  episodeFileRelativePath: PropTypes.string,
  episodeFileSize: PropTypes.number,
  releaseGroup: PropTypes.string,
  customFormats: PropTypes.arrayOf(PropTypes.object),
  customFormatScore: PropTypes.number.isRequired,
  indexerFlags: PropTypes.number.isRequired,
  mediaInfo: PropTypes.object,
  alternateTitles: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSelectMode: PropTypes.bool,
  onMonitorEpisodePress: PropTypes.func.isRequired
};

EpisodeRow.defaultProps = {
  customFormats: [],
  actors: [],
  indexerFlags: 0
};

export default EpisodeRow;
