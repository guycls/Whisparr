import Box from '@mui/material/Box';
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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

export function getStashPreviewUrl(episodeId?: number, episodeFileId?: number) {
  if (!episodeId || !episodeFileId || !window.Whisparr?.apiKey) {
    return undefined;
  }

  const urlBase = window.Whisparr.urlBase || '';

  return `${urlBase}/api/v3/episode/${episodeId}/stashPreview?apikey=${encodeURIComponent(
    window.Whisparr.apiKey
  )}`;
}

interface EpisodeScreenshotProps {
  className?: string;
  style?: CSSProperties;
  images?: Image[];
  blur?: boolean;
  previewUrl?: string;
  onPreviewActiveChange?: (active: boolean) => void;
}

function EpisodeScreenshot(props: EpisodeScreenshotProps) {
  const {
    className,
    style,
    images,
    blur = false,
    previewUrl,
    onPreviewActiveChange,
  } = props;

  const screenshot = useMemo(() => findScreenshot(images), [images]);
  const remoteUrl = screenshot?.remoteUrl;
  const proxyUrl = screenshot?.url;
  const preferredUrl = remoteUrl || proxyUrl || null;

  const [useProxy, setUseProxy] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    setUseProxy(false);
    setHasError(false);
  }, [preferredUrl]);

  useEffect(() => {
    setIsHovering(false);
    setPreviewFailed(false);
    setPreviewReady(false);
  }, [previewUrl]);

  const url = useProxy && proxyUrl ? proxyUrl : preferredUrl;

  const handleError = useCallback(() => {
    if (remoteUrl && proxyUrl && !useProxy && url === remoteUrl) {
      setUseProxy(true);
      return;
    }

    setHasError(true);
  }, [remoteUrl, proxyUrl, useProxy, url]);

  const showPlaceholder = hasError || !url;
  const showVideo = !!previewUrl && isHovering && !previewFailed;
  const previewActive = showVideo && previewReady;

  useEffect(() => {
    onPreviewActiveChange?.(previewActive);
  }, [previewActive, onPreviewActiveChange]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setPreviewReady(false);
  }, []);

  const handlePreviewReady = useCallback(() => {
    setPreviewReady(true);
  }, []);

  const handlePreviewError = useCallback(() => {
    setPreviewFailed(true);
    setPreviewReady(false);
  }, []);

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

  const image = (
    <Box
      component="img"
      className={previewUrl ? undefined : className}
      src={url}
      alt=""
      referrerPolicy="no-referrer"
      onError={handleError}
      sx={{
        ...style,
        ...(blur ? { filter: 'blur(40px)' } : null),
        ...(previewActive ? { visibility: 'hidden' } : null),
      }}
    />
  );

  if (!previewUrl) {
    return image;
  }

  return (
    <Box
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {image}
      {showVideo ? (
        <video
          src={previewUrl}
          muted={true}
          loop={true}
          autoPlay={true}
          playsInline={true}
          onCanPlay={handlePreviewReady}
          onError={handlePreviewError}
          style={{
            ...style,
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: style?.objectFit ?? 'cover',
            ...(blur ? { filter: 'blur(40px)' } : null),
            opacity: previewReady ? 1 : 0,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </Box>
  );
}

export default EpisodeScreenshot;
