import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import MetadataAttribution from 'Components/MetadataAttribution';
import { icons, kinds, sizes } from 'Helpers/Props';
import SeriesPoster from 'Series/SeriesPoster';
import translate from 'Utilities/String/translate';
import AddNewSeriesModal from './AddNewSeriesModal';

class AddNewSeriesSearchResult extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isNewAddSeriesModalOpen: false
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isExistingSeries && this.props.isExistingSeries) {
      this.onAddSeriesModalClose();
    }
  }

  //
  // Listeners

  onPress = () => {
    this.setState({ isNewAddSeriesModalOpen: true });
  };

  onAddSeriesModalClose = () => {
    this.setState({ isNewAddSeriesModalOpen: false });
  };

  onTVDBLinkPress = (event) => {
    event.stopPropagation();
  };

  //
  // Render

  render() {
    const {
      tvdbId,
      title,
      titleSlug,
      year,
      network,
      status,
      overview,
      folder,
      images,
      isExistingSeries,
      isSmallScreen,
      safeForWorkMode
    } = this.props;

    const {
      isNewAddSeriesModalOpen
    } = this.state;

    const linkProps = isExistingSeries ? { to: `/site/${titleSlug}` } : { onPress: this.onPress };

    return (
      <Box sx={{ position: 'relative', my: '20px', p: '20px', width: '100%', color: 'inherit' }}>
        <Link
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--addSeriesBackgroundColor)',
            transition: 'background 500ms',
            '&:hover': {
              backgroundColor: 'var(--pageBackground)',
              boxShadow: '0 0 12px var(--black)',
              color: 'inherit',
              textDecoration: 'none',
              transition: 'all 200ms ease-in'
            }
          }}
          {...linkProps}
        />

        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            pointerEvents: 'none',
            userSelect: 'none',
            '& a, & button': {
              pointerEvents: 'all'
            }
          }}
        >
          {
            isSmallScreen ?
              null :
              <Box
                sx={{
                  flex: '0 0 170px',
                  mr: '20px',
                  maxWidth: 250,
                  maxHeight: 250,
                  '& img': {
                    objectFit: 'contain',
                    maxWidth: 250,
                    maxHeight: 250
                  }
                }}
              >
                <SeriesPoster
                  images={images}
                  blur={safeForWorkMode}
                  size={250}
                  overflow={true}
                  lazy={false}
                />
              </Box>
          }

          <Box
            sx={{
              display: 'flex',
              flex: '0 1 100%',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'space-between', lg: 'flex-start' },
                overflow: { xs: 'hidden', lg: 'visible' }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  flex: '0 1 auto'
                }}
              >
                <Box sx={{ fontWeight: 300, fontSize: 36 }}>
                  {title}
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flex: '1 0 auto',
                  height: 55
                }}
              >
                {
                  isExistingSeries ?
                    <Box
                      component="span"
                      sx={{ ml: '10px', color: '#37bc9b', pointerEvents: 'all', display: 'inline-flex' }}
                    >
                      <Icon
                        name={icons.CHECK_CIRCLE}
                        size={36}
                        title={translate('AlreadyInYourLibrary')}
                      />
                    </Box> :
                    null
                }

                <Link
                  sx={{ mt: '-4px', ml: 'auto', color: 'var(--textColor)' }}
                  to={`https://theporndb.net/sites/${tvdbId}`}
                  onPress={this.onTVDBLinkPress}
                >
                  <Box component="span" sx={{ ml: '10px', display: 'inline-flex' }}>
                    <Icon
                      name={icons.EXTERNAL_LINK}
                      size={28}
                    />
                  </Box>
                </Link>
              </Box>
            </Box>

            <div>

              {
                network ?
                  <Label size={sizes.LARGE}>
                    {network}
                  </Label> :
                  null
              }

              {
                status === 'ended' ?
                  <Label
                    kind={kinds.DANGER}
                    size={sizes.LARGE}
                  >
                    {translate('Ended')}
                  </Label> :
                  null
              }

              {
                status === 'upcoming' ?
                  <Label
                    kind={kinds.INFO}
                    size={sizes.LARGE}
                  >
                    {translate('Upcoming')}
                  </Label> :
                  null
              }
            </div>

            <Box
              sx={{
                mt: '20px',
                mb: { xs: '20px', lg: 0 }
              }}
            >
              {overview}
            </Box>

            <MetadataAttribution />
          </Box>
        </Box>

        <AddNewSeriesModal
          isOpen={isNewAddSeriesModalOpen && !isExistingSeries}
          tvdbId={tvdbId}
          title={title}
          year={year}
          overview={overview}
          folder={folder}
          images={images}
          onModalClose={this.onAddSeriesModalClose}
        />
      </Box>
    );
  }
}

AddNewSeriesSearchResult.propTypes = {
  tvdbId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  titleSlug: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  network: PropTypes.string,
  status: PropTypes.string.isRequired,
  overview: PropTypes.string,
  folder: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  isExistingSeries: PropTypes.bool.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  safeForWorkMode: PropTypes.bool
};

export default AddNewSeriesSearchResult;
