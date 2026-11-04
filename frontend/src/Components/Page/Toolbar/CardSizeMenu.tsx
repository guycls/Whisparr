import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import React from 'react';
import Menu from 'Components/Menu/Menu';
import MenuContent from 'Components/Menu/MenuContent';
import ToolbarMenuButton from 'Components/Menu/ToolbarMenuButton';
import { align, icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface CardSizeMenuProps {
  cardSize: number;
  min: number;
  max: number;
  step: number;
  onCardSizeChange(cardSize: number): void;
}

function CardSizeMenu(props: CardSizeMenuProps) {
  const { cardSize, min, max, step, onCardSizeChange } = props;

  return (
    <Menu alignMenu={align.RIGHT} enforceMaxHeight={false} openOnHover={true}>
      <ToolbarMenuButton
        iconName={icons.CARD_SIZE}
        text={translate('CardSize')}
      />

      <MenuContent>
        <Box sx={{ width: 280, px: 2, pt: 1, pb: 2 }}>
          <Slider
            min={min}
            max={max}
            step={step}
            value={cardSize}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}px`}
            onChange={(_event, value) => {
              onCardSizeChange(value as number);
            }}
          />

          <Typography
            sx={{
              mt: 1,
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: 12,
            }}
          >
            {`${cardSize}px`}
          </Typography>
        </Box>
      </MenuContent>
    </Menu>
  );
}

export default CardSizeMenu;
