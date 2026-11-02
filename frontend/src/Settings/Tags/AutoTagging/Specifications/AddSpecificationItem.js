import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import Button from 'Components/Link/Button';
import Link from 'Components/Link/Link';
import Menu from 'Components/Menu/Menu';
import MenuContent from 'Components/Menu/MenuContent';
import { sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import AddSpecificationPresetMenuItem from './AddSpecificationPresetMenuItem';

export default function AddSpecificationItem(props) {
  const {
    implementation,
    implementationName,
    infoLink,
    presets,
    onSpecificationSelect
  } = props;

  const onWrappedSpecificationSelect = useCallback(() => {
    onSpecificationSelect({ implementation });
  }, [implementation, onSpecificationSelect]);

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
          onPress={onWrappedSpecificationSelect}
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
            hasPresets ?
              <span>
                <Button
                  size={sizes.SMALL}
                  onPress={onWrappedSpecificationSelect}
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
                        presets.map((preset, index) => {
                          return (
                            <AddSpecificationPresetMenuItem
                              key={index}
                              name={preset.name}
                              implementation={implementation}
                              onPress={onWrappedSpecificationSelect}
                            />
                          );
                        })
                      }
                    </MenuContent>
                  </Menu>
                </Box>
              </span> :
              null
          }

          {
            infoLink ?
              <Button
                to={infoLink}
                size={sizes.SMALL}
              >
                {translate('MoreInfo')}
              </Button> :
              null
          }
        </Box>
      </Box>
    </Box>
  );
}

AddSpecificationItem.propTypes = {
  implementation: PropTypes.string.isRequired,
  implementationName: PropTypes.string.isRequired,
  infoLink: PropTypes.string,
  presets: PropTypes.arrayOf(PropTypes.object),
  onSpecificationSelect: PropTypes.func.isRequired
};
