import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import Measure from 'Components/Measure';
import PageSectionContent from 'Components/Page/PageSectionContent';
import Scroller from 'Components/Scroller/Scroller';
import { icons, scrollDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import DelayProfile from './DelayProfile';
import DelayProfileDragPreview from './DelayProfileDragPreview';
import DelayProfileDragSource from './DelayProfileDragSource';
import EditDelayProfileModalConnector from './EditDelayProfileModalConnector';

const sxHorizontalScroll = (theme) => ({
  overflowX: 'auto',
  [theme.breakpoints.down('md')]: {
    overflowY: 'hidden',
    width: '100%'
  }
});

const sxDelayProfiles = {
  userSelect: 'none'
};

const sxDelayProfilesHeader = (theme) => ({
  display: 'flex',
  mb: theme.spacing(1.25),
  fontWeight: 'bold'
});

const sxColumn = {
  flex: '0 0 200px'
};

const sxTags = {
  flex: '1 0 auto'
};

const sxAddDelayProfile = {
  display: 'flex',
  justifyContent: 'flex-end'
};

const sxAddButton = {
  width: 40,
  textAlign: 'center'
};

class DelayProfiles extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddDelayProfileModalOpen: false,
      width: 0
    };
  }

  //
  // Listeners

  onAddDelayProfilePress = () => {
    this.setState({ isAddDelayProfileModalOpen: true });
  };

  onModalClose = () => {
    this.setState({ isAddDelayProfileModalOpen: false });
  };

  onMeasure = ({ width }) => {
    this.setState({ width });
  };

  //
  // Render

  render() {
    const {
      defaultProfile,
      items,
      tagList,
      dragIndex,
      dropIndex,
      onConfirmDeleteDelayProfile,
      ...otherProps
    } = this.props;

    const {
      isAddDelayProfileModalOpen,
      width
    } = this.state;

    const isDragging = dropIndex !== null;
    const isDraggingUp = isDragging && dropIndex < dragIndex;
    const isDraggingDown = isDragging && dropIndex > dragIndex;

    return (
      <Measure onMeasure={this.onMeasure}>
        <FieldSet legend={translate('DelayProfiles')}>
          <PageSectionContent
            errorMessage={translate('DelayProfilesLoadError')}
            {...otherProps}
          >
            <Box sx={sxHorizontalScroll}>
<Scroller
              scrollDirection={
                scrollDirections.HORIZONTAL
              }
              autoFocus={false}
            >
              <div>
                <Box sx={sxDelayProfilesHeader}>
                  <Box sx={sxColumn}>
                    {translate('PreferredProtocol')}
                  </Box>
                  <Box sx={sxColumn}>
                    {translate('UsenetDelay')}
                  </Box>
                  <Box sx={sxColumn}>
                    {translate('TorrentDelay')}
                  </Box>
                  <Box sx={sxTags}>
                    {translate('Tags')}
                  </Box>
                </Box>

                <Box sx={sxDelayProfiles}>
                  {
                    items.map((item, index) => {
                      return (
                        <DelayProfileDragSource
                          key={item.id}
                          tagList={tagList}
                          {...item}
                          {...otherProps}
                          index={index}
                          isDragging={isDragging}
                          isDraggingUp={isDraggingUp}
                          isDraggingDown={isDraggingDown}
                          onConfirmDeleteDelayProfile={onConfirmDeleteDelayProfile}
                        />
                      );
                    })
                  }

                  <DelayProfileDragPreview
                    width={width}
                  />
                </Box>

                {
                  defaultProfile ?
                    <div>
                      <DelayProfile
                        tagList={tagList}
                        isDragging={false}
                        onConfirmDeleteDelayProfile={onConfirmDeleteDelayProfile}
                        {...defaultProfile}
                      />
                    </div> :
                    null
                }
              </div>
            </Scroller>
</Box>

            <Box sx={sxAddDelayProfile}>
              <Box sx={sxAddButton}>
<Link
                onPress={this.onAddDelayProfilePress}
              >
                <Icon name={icons.ADD} />
              </Link>
</Box>
            </Box>

            <EditDelayProfileModalConnector
              isOpen={isAddDelayProfileModalOpen}
              onModalClose={this.onModalClose}
            />
          </PageSectionContent>
        </FieldSet>
      </Measure>
    );
  }
}

DelayProfiles.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  defaultProfile: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  dragIndex: PropTypes.number,
  dropIndex: PropTypes.number,
  onConfirmDeleteDelayProfile: PropTypes.func.isRequired
};

export default DelayProfiles;
