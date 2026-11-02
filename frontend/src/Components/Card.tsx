import MuiCard from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import React from 'react';
import Link, { LinkProps } from 'Components/Link/Link';

interface CardProps extends Pick<LinkProps, 'onPress'> {
  className?: string;
  overlayClassName?: string;
  overlayContent?: boolean;
  children: React.ReactNode;
}

function Card(props: CardProps) {
  const { className, overlayContent = false, children, onPress } = props;

  if (overlayContent) {
    return (
      <MuiCard className={className} sx={{ position: 'relative' }}>
        <Link
          onPress={onPress}
          sx={{ position: 'absolute', inset: 0 }}
        />
        {children}
      </MuiCard>
    );
  }

  return (
    <MuiCard className={className}>
      <CardActionArea onClick={onPress}>{children}</CardActionArea>
    </MuiCard>
  );
}

export default Card;
