import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createSeriesSelector from 'Store/Selectors/createSeriesSelector';
import EpisodeCard from './EpisodeCard';

function createMapStateToProps() {
  return createSelector(
    createSeriesSelector(),
    (series = {}) => {
      return {
        seriesMonitored: series.monitored
      };
    }
  );
}

export default connect(createMapStateToProps)(EpisodeCard);
