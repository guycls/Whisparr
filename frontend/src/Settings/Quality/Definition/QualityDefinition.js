import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TextInput from 'Components/Form/TextInput';
import NumberInput from 'Components/Form/NumberInput';
import Label from 'Components/Label';
import Popover from 'Components/Tooltip/Popover';
import { kinds, tooltipPositions } from 'Helpers/Props';
import formatBytes from 'Utilities/Number/formatBytes';
import roundNumber from 'Utilities/Number/roundNumber';
import translate from 'Utilities/String/translate';
import QualityDefinitionLimits from './QualityDefinitionLimits';

const sxQualityDefinition = (theme) => ({
  display: 'flex',
  alignContent: 'stretch',
  my: theme.spacing(0.625),
  mx: 0,
  pt: theme.spacing(0.625),
  height: 45,
  borderTop: `1px solid ${theme.palette.divider}`,
  '&:first-child': {
    borderTop: 'none'
  },
  [theme.breakpoints.down('md')]: {
    flexWrap: 'wrap',
    height: 'auto',
    borderTop: 'none'
  }
});

const sxQuality = (theme) => ({
  flex: '0 1 250px',
  pr: theme.spacing(2.5),
  lineHeight: 40,
  [theme.breakpoints.down('md')]: {
    fontWeight: 'bold',
    lineHeight: 'inherit'
  }
});

const sxTitle = (theme) => ({
  flex: '0 1 250px',
  pr: theme.spacing(2.5),
  lineHeight: 40
});

const sxSizeLimit = (theme) => ({
  flex: '0 1 500px',
  pr: theme.spacing(3.75),
  [theme.breakpoints.down('md')]: {
    mt: theme.spacing(1.25)
  }
});

const sxSlider = {
  width: '100%',
  px: 1
};

const sxSizes = {
  display: 'flex',
  justifyContent: 'space-between'
};

const sxMegabytesPerMinute = {
  display: 'flex',
  justifyContent: 'space-between',
  flex: '0 0 400px'
};

const sxSizeInput = (theme) => ({
  display: 'inline-block',
  ml: theme.spacing(0.625),
  p: theme.spacing(0.75),
  width: 75
});

const MIN = 0;
const MAX = 1000;
const MIN_DISTANCE = 1;

const slider = {
  min: MIN,
  max: roundNumber(Math.pow(MAX, 1 / 1.1)),
  step: 0.1
};

function getValue(inputValue) {
  if (inputValue < MIN) {
    return MIN;
  }

  if (inputValue > MAX) {
    return MAX;
  }

  return roundNumber(inputValue);
}

function getSliderValue(value, defaultValue) {
  const sliderValue = value ? Math.pow(value, 1 / 1.1) : defaultValue;

  return roundNumber(sliderValue);
}

class QualityDefinition extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      sliderMinSize: getSliderValue(props.minSize, slider.min),
      sliderMaxSize: getSliderValue(props.maxSize, slider.max),
      sliderPreferredSize: getSliderValue(props.preferredSize, (slider.max - 3))
    };
  }

  //
  // Listeners

  onSliderChange = ([sliderMinSize, sliderPreferredSize, sliderMaxSize]) => {
    if (
      sliderPreferredSize - sliderMinSize < 3 ||
      sliderMaxSize - sliderPreferredSize < 3
    ) {
      return;
    }
    this.setState({
      sliderMinSize,
      sliderMaxSize,
      sliderPreferredSize
    });

    this.props.onSizeChange({
      minSize: roundNumber(Math.pow(sliderMinSize, 1.1)),
      preferredSize: sliderPreferredSize === (slider.max - 3) ? null : roundNumber(Math.pow(sliderPreferredSize, 1.1)),
      maxSize: sliderMaxSize === slider.max ? null : roundNumber(Math.pow(sliderMaxSize, 1.1))
    });
  };

  onAfterSliderChange = () => {
    const {
      minSize,
      maxSize,
      preferredSize
    } = this.props;

    this.setState({
      sliderMinSize: getSliderValue(minSize, slider.min),
      sliderMaxSize: getSliderValue(maxSize, slider.max),
      sliderPreferredSize: getSliderValue(preferredSize, (slider.max - 3)) // fix
    });
  };

  onMinSizeChange = ({ value }) => {
    const minSize = getValue(value);

    this.setState({
      sliderMinSize: getSliderValue(minSize, slider.min)
    });

    this.props.onSizeChange({
      minSize,
      maxSize: this.props.maxSize,
      preferredSize: this.props.preferredSize
    });
  };

  onPreferredSizeChange = ({ value }) => {
    const preferredSize = value === (MAX - 3) ? null : getValue(value);

    this.setState({
      sliderPreferredSize: getSliderValue(preferredSize, slider.preferred)
    });

    this.props.onSizeChange({
      minSize: this.props.minSize,
      maxSize: this.props.maxSize,
      preferredSize
    });
  };

  onMaxSizeChange = ({ value }) => {
    const maxSize = value === MAX ? null : getValue(value);

    this.setState({
      sliderMaxSize: getSliderValue(maxSize, slider.max)
    });

    this.props.onSizeChange({
      minSize: this.props.minSize,
      maxSize,
      preferredSize: this.props.preferredSize
    });
  };

  //
  // Render

  render() {
    const {
      id,
      quality,
      title,
      minSize,
      maxSize,
      preferredSize,
      advancedSettings,
      onTitleChange
    } = this.props;

    const {
      sliderMinSize,
      sliderMaxSize,
      sliderPreferredSize
    } = this.state;

    const minBytes = minSize * 1024 * 1024;
    const minSixty = `${formatBytes(minBytes * 60)}/${translate('HourShorthand')}`;

    const preferredBytes = preferredSize * 1024 * 1024;
    const preferredSixty = preferredBytes ? `${formatBytes(preferredBytes * 60)}/${translate('HourShorthand')}` : translate('Unlimited');

    const maxBytes = maxSize && maxSize * 1024 * 1024;
    const maxSixty = maxBytes ? `${formatBytes(maxBytes * 60)}/${translate('HourShorthand')}` : translate('Unlimited');

    return (
      <Box sx={sxQualityDefinition}>
        <Box sx={sxQuality}>
          {quality.name}
        </Box>

        <Box sx={sxTitle}>
          <TextInput
            name={`${id}.${title}`}
            value={title}
            onChange={onTitleChange}
          />
        </Box>

        <Box sx={sxSizeLimit}>
          <Box sx={sxSlider}>
            <Slider
              min={slider.min}
              max={slider.max}
              step={slider.step}
              disableSwap={true}
              value={[sliderMinSize, sliderPreferredSize, sliderMaxSize]}
              onChange={(event, value) => {
                this.onSliderChange(value);
              }}
              onChangeCommitted={this.onAfterSliderChange}
            />
          </Box>

          <Box sx={sxSizes}>
            <div>
              <Popover
                anchor={
                  <Label kind={kinds.INFO}>{minSixty}</Label>
                }
                title={translate('MinimumLimits')}
                body={
                  <QualityDefinitionLimits
                    bytes={minBytes}
                    message={translate('NoMinimumForAnyRuntime')}
                  />
                }
                position={tooltipPositions.BOTTOM}
              />
            </div>

            <div>
              <Popover
                anchor={
                  <Label kind={kinds.SUCCESS}>{preferredSixty}</Label>
                }
                title={translate('PreferredSize')}
                body={
                  <QualityDefinitionLimits
                    bytes={preferredBytes}
                    message={translate('NoLimitForAnyRuntime')}
                  />
                }
                position={tooltipPositions.BOTTOM}
              />
            </div>

            <div>
              <Popover
                anchor={
                  <Label kind={kinds.WARNING}>{maxSixty}</Label>
                }
                title={translate('MaximumLimits')}
                body={
                  <QualityDefinitionLimits
                    bytes={maxBytes}
                    message={translate('NoLimitForAnyRuntime')}
                  />
                }
                position={tooltipPositions.BOTTOM}
              />
            </div>
          </Box>
        </Box>

        {
          advancedSettings &&
            <Box sx={sxMegabytesPerMinute}>
              <div>
                {translate('Min')}

                <Box sx={sxSizeInput}>
<NumberInput
                  name={`${id}.min`}
                  value={minSize || MIN}
                  min={MIN}
                  max={preferredSize ? preferredSize - 5 : MAX - 5}
                  step={0.1}
                  isFloat={true}
                  onChange={this.onMinSizeChange}
                />
</Box>
              </div>

              <div>
                {translate('Preferred')}

                <Box sx={sxSizeInput}>
<NumberInput
                  name={`${id}.min`}
                  value={preferredSize || MAX - 5}
                  min={MIN}
                  max={maxSize ? maxSize - 5 : MAX - 5}
                  step={0.1}
                  isFloat={true}
                  onChange={this.onPreferredSizeChange}
                />
</Box>
              </div>

              <div>
                {translate('Max')}

                <Box sx={sxSizeInput}>
<NumberInput
                  name={`${id}.max`}
                  value={maxSize || MAX}
                  min={minSize + MIN_DISTANCE}
                  max={MAX}
                  step={0.1}
                  isFloat={true}
                  onChange={this.onMaxSizeChange}
                />
</Box>
              </div>
            </Box>
        }
      </Box>
    );
  }
}

QualityDefinition.propTypes = {
  id: PropTypes.number.isRequired,
  quality: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  minSize: PropTypes.number,
  maxSize: PropTypes.number,
  preferredSize: PropTypes.number,
  advancedSettings: PropTypes.bool.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired
};

export default QualityDefinition;
