import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SelectInput from 'Components/Form/SelectInput';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { icons } from 'Helpers/Props';
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

  //
  // Render

  render() {
    const {
      page,
      totalPages,
      totalRecords,
      isFetching,
      onFirstPagePress,
      onPreviousPagePress,
      onNextPagePress,
      onLastPagePress
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

    const isFirstPage = page === 1;
    const isLastPage = page === totalPages;

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
            justifyContent: 'center',
            flex: '0 1 33%',
            '@media (max-width: 768px)': {
              flex: '0 1 100%',
              order: -1
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <Link
              isDisabled={isFirstPage}
              sx={{
                p: 0,
                width: 30,
                height: 30,
                minWidth: 30,
                lineHeight: '30px',
                color: isFirstPage ? 'var(--disabledColor)' : undefined
              }}
              onPress={onFirstPagePress}
            >
              <Icon name={icons.PAGE_FIRST} />
            </Link>

            <Link
              isDisabled={isFirstPage}
              sx={{
                p: 0,
                width: 30,
                height: 30,
                minWidth: 30,
                lineHeight: '30px',
                color: isFirstPage ? 'var(--disabledColor)' : undefined
              }}
              onPress={onPreviousPagePress}
            >
              <Icon name={icons.PAGE_PREVIOUS} />
            </Link>

            <Box sx={{ lineHeight: '30px' }}>
              {
                !isShowingPageSelect &&
                  <Link
                    isDisabled={totalPages === 1}
                    onPress={this.onOpenPageSelectClick}
                  >
                    {page} / {totalPages}
                  </Link>
              }

              {
                isShowingPageSelect &&
                  <SelectInput
                    name="pageSelect"
                    value={page}
                    values={pages}
                    autoFocus={true}
                    onChange={this.onPageSelect}
                    onBlur={this.onPageSelectBlur}
                  />
              }
            </Box>

            <Link
              isDisabled={isLastPage}
              sx={{
                p: 0,
                width: 30,
                height: 30,
                minWidth: 30,
                lineHeight: '30px',
                color: isLastPage ? 'var(--disabledColor)' : undefined
              }}
              onPress={onNextPagePress}
            >
              <Icon name={icons.PAGE_NEXT} />
            </Link>

            <Link
              isDisabled={isLastPage}
              sx={{
                p: 0,
                width: 30,
                height: 30,
                minWidth: 30,
                lineHeight: '30px',
                color: isLastPage ? 'var(--disabledColor)' : undefined
              }}
              onPress={onLastPagePress}
            >
              <Icon name={icons.PAGE_LAST} />
            </Link>
          </Box>
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
          <Box sx={{ color: 'var(--disabledColor)' }}>
            {translate('TotalRecords', { totalRecords })}
          </Box>
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
