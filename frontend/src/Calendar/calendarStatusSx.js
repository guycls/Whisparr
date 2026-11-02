const FULL_COLOR_GRADIENT = 'rgba(244, 245, 246, 0.2)';

function impairedStripe(angle, fullColor) {
  if (fullColor) {
    return `repeating-linear-gradient(${angle}, ${FULL_COLOR_GRADIENT}, ${FULL_COLOR_GRADIENT} 5px, transparent 5px, transparent 10px)`;
  }

  return `repeating-linear-gradient(${angle}, var(--colorImpairedGradientDark), var(--colorImpairedGradientDark) 5px, var(--colorImpairedGradient) 5px, var(--colorImpairedGradient) 10px)`;
}

function calendarStatusSx(status, fullColor, colorImpaired) {
  const sx = {};

  switch (status) {
    case 'downloaded':
      sx.borderLeftColor = colorImpaired ?
        '#16d343 !important' :
        'var(--successColor) !important';

      if (fullColor) {
        sx.backgroundColor = 'rgba(39, 194, 76, 0.4) !important';
      }
      break;
    case 'downloading':
      sx.borderLeftColor = 'var(--purple) !important';

      if (fullColor) {
        sx.backgroundColor = 'rgba(122, 67, 182, 0.4) !important';
      }
      break;
    case 'unmonitored':
      sx.borderLeftColor = 'var(--gray) !important';

      if (fullColor && colorImpaired) {
        sx.background = impairedStripe('45deg', true);
      } else if (colorImpaired) {
        sx.background = impairedStripe('45deg', false);
      } else if (fullColor) {
        sx.backgroundColor = 'rgba(173, 173, 173, 0.5) !important';
      }
      break;
    case 'onAir':
      sx.borderLeftColor = 'var(--warningColor) !important';

      if (fullColor && colorImpaired) {
        sx.background = impairedStripe('90deg', true);
      } else if (colorImpaired) {
        sx.background = impairedStripe('90deg', false);
      } else if (fullColor) {
        sx.backgroundColor = 'rgba(255, 165, 0, 0.6) !important';
      }
      break;
    case 'missing':
      sx.borderLeftColor = colorImpaired ?
        '#fe4242 !important' :
        'var(--dangerColor) !important';

      if (fullColor && colorImpaired) {
        sx.background = impairedStripe('90deg', true);
      } else if (colorImpaired) {
        sx.background = impairedStripe('90deg', false);
      } else if (fullColor) {
        sx.backgroundColor = 'rgba(240, 80, 80, 0.6) !important';
      }
      break;
    case 'unaired':
      sx.borderLeftColor = 'var(--primaryColor) !important';

      if (fullColor && colorImpaired) {
        sx.background = impairedStripe('90deg', true);
      } else if (colorImpaired) {
        sx.background = impairedStripe('90deg', false);
      } else if (fullColor) {
        sx.backgroundColor = 'rgba(93, 156, 236, 0.4) !important';
      }
      break;
    default:
      break;
  }

  return sx;
}

export default calendarStatusSx;
