import Box from '@mui/material/Box';
import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import { Image } from 'Series/Series';


function findScreenshot(images?: Image[]) {
  return images?.find((image) => image.coverType === 'screenshot');
}

export function getEpisodeScreenshotUrl(images?: Image[]) {
  const screenshot = findScreenshot(images);

  return screenshot?.remoteUrl || screenshot?.url || null;
}

export function hasEpisodeScreenshot(images?: Image[]) {
  return !!getEpisodeScreenshotUrl(images);
}

interface EpisodeScreenshotProps {
  className?: string;
  style?: CSSProperties;
  images?: Image[];
  blur?: boolean;
}

function EpisodeScreenshot(props: EpisodeScreenshotProps) {
  const { className, style, images, blur = false } = props;

  const screenshot = useMemo(() => findScreenshot(images), [images]);
  const remoteUrl = screenshot?.remoteUrl;
  const proxyUrl = screenshot?.url;
  const preferredUrl = remoteUrl || proxyUrl || null;

  const [useProxy, setUseProxy] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setUseProxy(false);
    setHasError(false);
  }, [preferredUrl]);

  const url = useProxy && proxyUrl ? proxyUrl : preferredUrl;

  const handleError = useCallback(() => {
    if (remoteUrl && proxyUrl && !useProxy && url === remoteUrl) {
      setUseProxy(true);
      return;
    }

    setHasError(true);
  }, [remoteUrl, proxyUrl, useProxy, url]);

  const showPlaceholder = hasError || !url;

  if (showPlaceholder) {
    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          color: 'text.disabled',
          ...style,
        }}
      >
        <Icon name={icons.SERIES_CONTINUING} size={28} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      className={className}
      src={url}
      alt=""
      referrerPolicy="no-referrer"
      onError={handleError}
      sx={{
        ...style,
        ...(blur ? { filter: 'blur(40px)' } : null),
      }}
    />
  );
}

export default EpisodeScreenshot;
