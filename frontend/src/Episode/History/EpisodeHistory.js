import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EpisodeHistoryRow from './EpisodeHistoryRow';

class EpisodeHistory extends Component {

  //
  // Render

  render() {
    const {
      isFetching,
      isPopulated,
      error,
      items,
      onMarkAsFailedPress
    } = this.props;

    const hasItems = !!items.length;

    if (isFetching) {
      return (
        <LoadingIndicator />
      );
    }

    if (!isFetching && !!error) {
      return (
        <Alert kind={kinds.DANGER}>{translate('EpisodeHistoryLoadError')}</Alert>
      );
    }

    if (isPopulated && !hasItems && !error) {
      return (
        <Alert kind={kinds.INFO}>{translate('NoEpisodeHistory')}</Alert>
      );
    }

    if (isPopulated && hasItems && !error) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {
            items.map((item) => {
              return (
                <EpisodeHistoryRow
                  key={item.id}
                  {...item}
                  onMarkAsFailedPress={onMarkAsFailedPress}
                />
              );
            })
          }
        </Box>
      );
    }

    return null;
  }
}

EpisodeHistory.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  onMarkAsFailedPress: PropTypes.func.isRequired
};

EpisodeHistory.defaultProps = {
  selectedTab: 'details'
};

export default EpisodeHistory;
