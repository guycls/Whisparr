import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'Components/Link/Button';
import Link from 'Components/Link/Link';
import Menu from 'Components/Menu/Menu';
import MenuContent from 'Components/Menu/MenuContent';
import { sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import AddIndexerPresetMenuItem from './AddIndexerPresetMenuItem';

class AddIndexerItem extends Component {

  //
  // Listeners

  onIndexerSelect = () => {
    const {
      implementation,
      implementationName
    } = this.props;

    this.props.onIndexerSelect({ implementation, implementationName });
  };

  //
  // Render

  render() {
    const {
      implementation,
      implementationName,
      infoLink,
      presets,
      onIndexerSelect
    } = this.props;

    const hasPresets = !!presets && !!presets.length;

    return (
      <Box
        sx={(theme) => ({
          position: 'relative',
          width: 300,
          height: 100,
          m: theme.spacing(1.25),
          borderRadius: '3px',
          bgcolor: theme.palette.background.paper,
          boxShadow: 1,
          color: theme.palette.text.primary
        })}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            '& .MuiButton-root': {
              width: '100%',
              height: '100%',
              minWidth: 0,
              p: 0,
              borderRadius: 0
            }
          }}
        >
          <Link
            onPress={this.onIndexerSelect}
          />
        </Box>

        <Box
          sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            p: theme.spacing(1.25),
            pointerEvents: 'none',
            userSelect: 'none',
            '& a, & button': {
              pointerEvents: 'all'
            }
          })}
        >
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 300,
              fontSize: 24
            }}
          >
            {implementationName}
          </Typography>

          <Box
            sx={(theme) => ({
              mt: theme.spacing(2.5),
              textAlign: 'right'
            })}
          >
            {
              hasPresets &&
                <span>
                  <Button
                    size={sizes.SMALL}
                    onPress={this.onIndexerSelect}
                  >
                    {translate('Custom')}
                  </Button>

                  <Box
                    component="span"
                    sx={(theme) => ({
                      display: 'inline-block',
                      mx: theme.spacing(0.625)
                    })}
                  >
                    <Menu>
                      <Button
                        size={sizes.SMALL}
                      >
                        {translate('Presets')}
                        <Box
                          component="span"
                          sx={(theme) => ({ ml: theme.spacing(0.625) })}
                        >
                          {'\u25BE'}
                        </Box>
                      </Button>

                    <MenuContent>
                      {
                        presets.map((preset) => {
                          return (
                            <AddIndexerPresetMenuItem
                              key={preset.name}
                              name={preset.name}
                              implementation={implementation}
                              implementationName={implementationName}
                              onPress={onIndexerSelect}
                            />
                          );
                        })
                      }
                    </MenuContent>
                    </Menu>
                  </Box>
                </span>
            }

            <Button
              to={infoLink}
              size={sizes.SMALL}
            >
              {translate('MoreInfo')}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }
}

AddIndexerItem.propTypes = {
  implementation: PropTypes.string.isRequired,
  implementationName: PropTypes.string.isRequired,
  infoLink: PropTypes.string.isRequired,
  presets: PropTypes.arrayOf(PropTypes.object),
  onIndexerSelect: PropTypes.func.isRequired
};

export default AddIndexerItem;
