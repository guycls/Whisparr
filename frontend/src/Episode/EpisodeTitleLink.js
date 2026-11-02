import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from 'Components/Link/Link';
import EpisodeDetailsModal from 'Episode/EpisodeDetailsModal';

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
        <Box
          sx={{
            maxWidth: 800,
            '@media (min-width: 2560px)': { maxWidth: 1200 },
            '@media (min-width: 3840px)': { maxWidth: 2000 },
            '& .MuiButton-root': {
              display: 'inline-block',
              overflow: 'hidden',
              maxWidth: '100%',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              userSelect: 'text',
              '&:hover': {
                color: 'var(--linkHoverColor)',
                textDecoration: 'underline'
              }
            }
          }}
        >
          <Link
            className={className}
            title={episodeTitle}
            onPress={this.onLinkPress}
          >
          {episodeTitle}
          </Link>
        </Box>

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
