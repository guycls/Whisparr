import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SelectInput from 'Components/Form/SelectInput';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import translate from 'Utilities/String/translate';

class TablePager extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isShowingPageSelect: false
    };
  }

  //
  // Listeners

  onOpenPageSelectClick = () => {
    this.setState({ isShowingPageSelect: true });
  };

  onPageSelect = ({ value: page }) => {
    this.setState({ isShowingPageSelect: false });
    this.props.onPageSelect(parseInt(page));
  };

  onPageSelectBlur = () => {
    this.setState({ isShowingPageSelect: false });
  };

  onPaginationChange = (event, newPage) => {
    const {
      page,
      totalPages,
      onFirstPagePress,
      onPreviousPagePress,
      onNextPagePress,
      onLastPagePress,
      onPageSelect
    } = this.props;

    if (newPage === page) {
      return;
    }

    if (newPage === 1 && page > 2) {
      onFirstPagePress();
      return;
    }

    if (newPage === totalPages && page < totalPages - 1) {
      onLastPagePress();
      return;
    }

    if (newPage === page - 1) {
      onPreviousPagePress();
      return;
    }

    if (newPage === page + 1) {
      onNextPagePress();
      return;
    }

    onPageSelect(newPage);
  };

  //
  // Render

  render() {
    const {
      page,
      totalPages,
      totalRecords,
      isFetching
    } = this.props;

    const isShowingPageSelect = this.state.isShowingPageSelect;
    const pages = Array.from(new Array(totalPages), (x, i) => {
      const pageNumber = i + 1;

      return {
        key: pageNumber,
        value: pageNumber
      };
    });

    if (!page) {
      return null;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '@media (max-width: 768px)': {
            flexWrap: 'wrap'
          }
        }}
      >
        <Box
          sx={{
            flex: '0 1 33%',
            '@media (max-width: 768px)': {
              flex: '0 1 50%'
            }
          }}
        >
          {
            isFetching &&
              <Box sx={{ m: 0, ml: '5px', textAlign: 'left' }}>
                <LoadingIndicator
                  size={20}
                />
              </Box>
          }
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flex: '0 1 33%',
            '@media (max-width: 768px)': {
              flex: '0 1 100%',
              order: -1
            }
          }}
        >
          <Pagination
            count={totalPages}
            page={page}
            size="small"
            showFirstButton={true}
            showLastButton={true}
            onChange={this.onPaginationChange}
          />

          {
            totalPages > 1 && !isShowingPageSelect &&
              <Typography
                variant="body2"
                component="button"
                type="button"
                onClick={this.onOpenPageSelectClick}
                sx={{
                  border: 0,
                  background: 'none',
                  cursor: 'pointer',
                  color: 'primary.main',
                  whiteSpace: 'nowrap'
                }}
              >
                {page} / {totalPages}
              </Typography>
          }

          {
            totalPages > 1 && isShowingPageSelect &&
              <Box sx={{ minWidth: 72 }}>
                <SelectInput
                  name="pageSelect"
                  value={page}
                  values={pages}
                  autoFocus={true}
                  onChange={this.onPageSelect}
                  onBlur={this.onPageSelectBlur}
                />
              </Box>
          }
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            flex: '0 1 33%',
            '@media (max-width: 768px)': {
              flex: '0 1 50%'
            }
          }}
        >
          <Typography variant="body2" color="text.disabled">
            {translate('TotalRecords', { totalRecords })}
          </Typography>
        </Box>
      </Box>
    );
  }

}

TablePager.propTypes = {
  page: PropTypes.number,
  totalPages: PropTypes.number,
  totalRecords: PropTypes.number,
  isFetching: PropTypes.bool,
  onFirstPagePress: PropTypes.func.isRequired,
  onPreviousPagePress: PropTypes.func.isRequired,
  onNextPagePress: PropTypes.func.isRequired,
  onLastPagePress: PropTypes.func.isRequired,
  onPageSelect: PropTypes.func.isRequired
};

export default TablePager;
