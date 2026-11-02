import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { icons, kinds } from 'Helpers/Props';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import AddNewSeriesSearchResultConnector from './AddNewSeriesSearchResultConnector';

class AddNewSeries extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      term: props.term || '',
      isFetching: false
    };
  }

  componentDidMount() {
    const term = this.state.term;

    if (term) {
      this.props.onSeriesLookupChange(term);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      term,
      isFetching
    } = this.props;

    if (term && term !== prevProps.term) {
      this.setState({
        term,
        isFetching: true
      });
      this.props.onSeriesLookupChange(term);
    } else if (isFetching !== prevProps.isFetching) {
      this.setState({
        isFetching
      });
    }
  }

  //
  // Listeners

  onSearchInputChange = ({ value }) => {
    const hasValue = !!value.trim();

    this.setState({ term: value, isFetching: hasValue }, () => {
      if (hasValue) {
        this.props.onSeriesLookupChange(value);
      } else {
        this.props.onClearSeriesLookup();
      }
    });
  };

  onClearSeriesLookupPress = () => {
    this.setState({ term: '' });
    this.props.onClearSeriesLookup();
  };

  //
  // Render

  render() {
    const {
      error,
      items,
      hasExistingSeries
    } = this.props;

    const term = this.state.term;
    const isFetching = this.state.isFetching;

    return (
      <PageContent title={translate('AddNewSite')}>
        <PageContentBody>
          <Box sx={{ display: 'flex', mb: '10px' }}>
            <Box
              sx={{
                width: 58,
                height: 46,
                border: '1px solid var(--inputBorderColor)',
                borderRight: 'none',
                borderRadius: '4px 0 0 4px',
                backgroundColor: 'var(--searchIconContainerBackgroundColor)',
                textAlign: 'center',
                lineHeight: '46px'
              }}
            >
              <Icon
                name={icons.SEARCH}
                size={20}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                '& .MuiInputBase-root': {
                  height: 46,
                  borderRadius: 0,
                  fontSize: 18
                }
              }}
            >
              <TextInput
                name="seriesLookup"
                value={term}
                placeholder="eg. Brazzers, tpdb:####"
                autoFocus={true}
                onChange={this.onSearchInputChange}
              />
            </Box>

            <Box
              sx={{
                '& .MuiButton-root': {
                  border: '1px solid var(--inputBorderColor)',
                  borderLeft: 'none',
                  borderRadius: '0 4px 4px 0',
                  boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)'
                }
              }}
            >
              <Button
                onPress={this.onClearSeriesLookupPress}
              >
                <Icon
                  name={icons.REMOVE}
                  size={20}
                />
              </Button>
            </Box>
          </Box>

          {
            isFetching &&
              <LoadingIndicator />
          }

          {
            !isFetching && !!error ?
              <Box sx={{ mt: '30px', textAlign: 'center', fontWeight: 300, fontSize: 16 }}>
                <Typography sx={{ mb: '10px', fontSize: 24, fontWeight: 300 }}>
                  {translate('AddNewSeriesError')}
                </Typography>
                <div>{getErrorMessage(error)}</div>
              </Box> : null
          }

          {
            !isFetching && !error && !!items.length &&
              <Box sx={{ mt: '30px' }}>
                {
                  items.map((item) => {
                    return (
                      <AddNewSeriesSearchResultConnector
                        key={item.tvdbId}
                        {...item}
                      />
                    );
                  })
                }
              </Box>
          }

          {
            !isFetching && !error && !items.length && !!term &&
              <Box sx={{ mt: '30px', textAlign: 'center', fontWeight: 300, fontSize: 16 }}>
                <Typography sx={{ mb: '10px', fontWeight: 300, fontSize: 30 }}>
                  {translate('CouldNotFindResults', { term })}
                </Typography>
                <div>{translate('SearchByTpdbId')}</div>
                <div>
                  <Link to="https://wiki.servarr.com/whisparr/faq#why-cant-i-add-a-new-site-when-i-know-the-tpdb-id">
                    {translate('WhyCantIFindMySite')}
                  </Link>
                </div>
              </Box>
          }

          {
            term ?
              null :
              <Box sx={{ mt: '30px', textAlign: 'center', fontWeight: 300, fontSize: 16 }}>
                <Typography sx={{ mb: '10px', fontSize: 24, fontWeight: 300 }}>
                  {translate('AddNewSeriesHelpText')}
                </Typography>
                <div>{translate('SearchByTpdbId')}</div>
              </Box>
          }

          {
            !term && !hasExistingSeries ?
              <Box sx={{ mt: '30px', textAlign: 'center', fontWeight: 300, fontSize: 16 }}>
                <Box sx={{ mt: '80px', mb: '20px' }}>
                  {translate('NoSitesHaveBeenAdded')}
                </Box>
                <div>
                  <Button
                    to="/add/import"
                    kind={kinds.PRIMARY}
                  >
                    {translate('ImportExistingSites')}
                  </Button>
                </div>
              </Box> :
              null
          }

          <div />
        </PageContentBody>
      </PageContent>
    );
  }
}

AddNewSeries.propTypes = {
  term: PropTypes.string,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  isAdding: PropTypes.bool.isRequired,
  addError: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  hasExistingSeries: PropTypes.bool.isRequired,
  onSeriesLookupChange: PropTypes.func.isRequired,
  onClearSeriesLookup: PropTypes.func.isRequired
};

export default AddNewSeries;
