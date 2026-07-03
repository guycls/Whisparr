import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from 'Components/Link/Link';
import EpisodeDetailsModal from 'Episode/EpisodeDetailsModal';
import styles from './EpisodeTitleLink.css';

class EpisodeTitleLink extends Component {

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

  onLinkPress = () => {
    this.setState({ isDetailsModalOpen: true });
  };

  onModalClose = () => {
    this.setState({ isDetailsModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      className,
      episodeTitle,
      ...otherProps
    } = this.props;

    return (
      <div>
        <Link
          className={classNames(styles.link, className)}
          title={episodeTitle}
          onPress={this.onLinkPress}
        >
          {episodeTitle}
        </Link>

        <EpisodeDetailsModal
          isOpen={this.state.isDetailsModalOpen}
          episodeTitle={episodeTitle}
          {...otherProps}
          onModalClose={this.onModalClose}
        />
      </div>
    );
  }
}

EpisodeTitleLink.propTypes = {
  className: PropTypes.string,
  episodeTitle: PropTypes.string.isRequired
};

EpisodeTitleLink.defaultProps = {
  showSeriesButton: false
};

export default EpisodeTitleLink;
