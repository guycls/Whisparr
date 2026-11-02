import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FieldSet from 'Components/FieldSet';
import PageSectionContent from 'Components/Page/PageSectionContent';
import translate from 'Utilities/String/translate';
import QualityDefinitionConnector from './QualityDefinitionConnector';

const sxHeader = (theme) => ({
  display: 'flex',
  fontWeight: 'bold',
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
});

const sxQuality = {
  flex: '0 1 250px'
};

const sxTitle = {
  flex: '0 1 250px'
};

const sxSizeLimit = {
  flex: '0 1 500px'
};

const sxMegabytesPerMinute = {
  flex: '0 0 250px'
};

const sxSizeLimitHelpTextContainer = (theme) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  mt: theme.spacing(2.5),
  maxWidth: 1000
});

const sxSizeLimitHelpText = (theme) => ({
  maxWidth: 500,
  color: theme.palette.text.secondary
});

const sxDefinitions = {
  '&:first-child': {
    borderTop: 'none'
  }
};

class QualityDefinitions extends Component {

  //
  // Render

  render() {
    const {
      items,
      advancedSettings,
      ...otherProps
    } = this.props;

    return (
      <FieldSet legend={translate('QualityDefinitions')}>
        <PageSectionContent
          errorMessage={translate('QualityDefinitionsLoadError')}
          {...otherProps}
        >
          <Box sx={sxHeader}>
            <Box sx={sxQuality}>
              {translate('Quality')}
            </Box>
            <Box sx={sxTitle}>
              {translate('Title')}
            </Box>
            <Box sx={sxSizeLimit}>
              {translate('SizeLimit')}
            </Box>

            {
              advancedSettings ?
                <Box sx={sxMegabytesPerMinute}>
                  {translate('MegabytesPerMinute')}
                </Box> :
                null
            }
          </Box>

          <Box sx={sxDefinitions}>
            {
              items.map((item) => {
                return (
                  <QualityDefinitionConnector
                    key={item.id}
                    {...item}
                    advancedSettings={advancedSettings}
                  />
                );
              })
            }
          </Box>

          <Box sx={sxSizeLimitHelpTextContainer}>
            <Box sx={sxSizeLimitHelpText}>
              {translate('QualityLimitsHelpText')}
            </Box>
          </Box>
        </PageSectionContent>
      </FieldSet>
    );
  }
}

QualityDefinitions.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  defaultProfile: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  advancedSettings: PropTypes.bool.isRequired
};

export default QualityDefinitions;
