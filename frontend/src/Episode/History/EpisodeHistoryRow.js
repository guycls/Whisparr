import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import HistoryDetails from 'Activity/History/Details/HistoryDetails';
import {
  getIconKind,
  getIconName,
  getTooltip
} from 'Activity/History/HistoryEventTypeCell';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import Tooltip from 'Components/Tooltip/Tooltip';
import EpisodeFormats from 'Episode/EpisodeFormats';
import EpisodeLanguages from 'Episode/EpisodeLanguages';
import EpisodeQuality from 'Episode/EpisodeQuality';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import translate from 'Utilities/String/translate';

function getTitle(eventType) {
  switch (eventType) {
    case 'grabbed':
      return 'Grabbed';
    case 'seriesFolderImported':
      return 'Site Folder Imported';
    case 'downloadFolderImported':
      return 'Download Folder Imported';
    case 'downloadFailed':
      return 'Download Failed';
    case 'episodeFileDeleted':
      return 'Episode File Deleted';
    case 'episodeFileRenamed':
      return 'Episode File Renamed';
    case 'downloadIgnored':
      return 'Download Ignored';
    default:
      return 'Unknown';
  }
}

class EpisodeHistoryRow extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isMarkAsFailedModalOpen: false
    };
  }

  //
  // Listeners

  onMarkAsFailedPress = () => {
    this.setState({ isMarkAsFailedModalOpen: true });
  };

  onConfirmMarkAsFailed = () => {
    this.props.onMarkAsFailedPress(this.props.id);
    this.setState({ isMarkAsFailedModalOpen: false });
  };

  onMarkAsFailedModalClose = () => {
    this.setState({ isMarkAsFailedModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      eventType,
      sourceTitle,
      languages,
      quality,
      qualityCutoffNotMet,
      customFormats = [],
      customFormatScore,
      date,
      data,
      downloadId
    } = this.props;

    const {
      isMarkAsFailedModalOpen
    } = this.state;

    const score = formatCustomFormatScore(customFormatScore, customFormats.length);

    return (
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 1.5
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1
          }}
        >
          <Box sx={{ flexShrink: 0, pt: '2px' }}>
            <Icon
              name={getIconName(eventType, data)}
              kind={getIconKind(eventType)}
              title={getTooltip(eventType, data)}
            />
          </Box>

          <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
            <Typography variant="subtitle2">
              {getTitle(eventType)}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                overflowWrap: 'anywhere',
                wordBreak: 'break-word'
              }}
            >
              {sourceTitle}
            </Typography>
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              color: 'text.secondary',
              fontSize: 12,
              whiteSpace: 'nowrap'
            }}
          >
            <RelativeDateCell
              date={date}
              component="span"
              includeSeconds={true}
              includeTime={true}
            />
          </Box>

          {
            eventType === 'grabbed' &&
              <Box sx={{ flexShrink: 0 }}>
                <IconButton
                  title={translate('MarkAsFailed')}
                  name={icons.REMOVE}
                  onPress={this.onMarkAsFailedPress}
                />
              </Box>
          }
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 0.5,
            mt: 1
          }}
        >
          <EpisodeLanguages languages={languages} />

          <EpisodeQuality
            quality={quality}
            isCutoffNotMet={qualityCutoffNotMet}
          />

          {
            score ?
              <Tooltip
                anchor={score}
                tooltip={<EpisodeFormats formats={customFormats} />}
                position={tooltipPositions.BOTTOM}
              /> :
              null
          }

          {
            customFormats.length ?
              <EpisodeFormats formats={customFormats} /> :
              null
          }
        </Box>

        <Box sx={{ mt: 1 }}>
          <HistoryDetails
            eventType={eventType}
            sourceTitle={sourceTitle}
            data={data}
            downloadId={downloadId}
          />
        </Box>

        <ConfirmModal
          isOpen={isMarkAsFailedModalOpen}
          kind={kinds.DANGER}
          title={translate('MarkAsFailed')}
          message={translate('MarkAsFailedConfirmation', { sourceTitle })}
          confirmLabel={translate('MarkAsFailed')}
          onConfirm={this.onConfirmMarkAsFailed}
          onCancel={this.onMarkAsFailedModalClose}
        />
      </Box>
    );
  }
}

EpisodeHistoryRow.propTypes = {
  id: PropTypes.number.isRequired,
  eventType: PropTypes.string.isRequired,
  sourceTitle: PropTypes.string.isRequired,
  languages: PropTypes.arrayOf(PropTypes.object).isRequired,
  quality: PropTypes.object.isRequired,
  qualityCutoffNotMet: PropTypes.bool.isRequired,
  customFormats: PropTypes.arrayOf(PropTypes.object),
  customFormatScore: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  downloadId: PropTypes.string,
  onMarkAsFailedPress: PropTypes.func.isRequired
};

export default EpisodeHistoryRow;
