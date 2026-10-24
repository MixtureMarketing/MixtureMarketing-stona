import React from 'react';
import { RESPONSIVE_WIDTHS } from '@/config/responsiveImages';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  isSanity?: boolean;
  /** Atrybut `sizes` dla srcset (szerokość slotu w layoucie). */
  sizes?: string;
}

// Obrazy z public/assets/images (płaska struktura) mają warianty szerokości generowane
// przez scripts/convert-images.js: <nazwa>-<w>.avif / .webp dla RESPONSIVE_WIDTHS.
const RESPONSIVE_SRC = /^\/assets\/images\/[^/]+\.(jpe?g|png)$/i;

/** Domyślny `sizes`: znana szerokość slotu → tyle px (ale ≤ 100vw); inaczej pół ekranu. */
const defaultSizes = (width?: number | string) =>
  typeof width === 'number'
    ? `(max-width: ${width}px) 100vw, ${width}px`
    : '(max-width: 768px) 100vw, 50vw';

/**
 * A reusable Image component that implements the <picture> pattern
 * and Sanity image optimization for multiple resolutions.
 */
const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className = '',
  loading,
  decoding = 'async',
  width,
  height,
  priority = false,
  isSanity = false,
  sizes,
  ...props
}) => {
  if (!alt) {
    console.warn(`Image with src "${src}" is missing an alt attribute.`);
  }

  const effectiveLoading = priority ? undefined : loading || 'lazy';
  const fetchPriority = priority ? 'high' : 'auto';

  // Sanity Image Optimization
  let srcSet: string | undefined = undefined;
  let finalSrc = src;

  if (isSanity && src.includes('cdn.sanity.io')) {
    const baseUrl = src.split('?')[0];
    const widths = [320, 640, 768, 1024, 1280, 1536];
    srcSet = widths.map((w) => `${baseUrl}?w=${w}&auto=format&q=75 ${w}w`).join(', ');
    finalSrc = `${baseUrl}?w=${width || 800}&auto=format&q=80`;
  }

  // Check if we can serve multiple formats (Local Images)
  const isEnhanceable = !isSanity && src.startsWith('/') && /\.(jpe?g|png)$/i.test(src);

  // CLS Optimization: Calculate aspect ratio to reserve space
  const style =
    width && height
      ? ({
          aspectRatio: `${width} / ${height}`,
          width: '100%',
          height: 'auto',
        } as React.CSSProperties)
      : undefined;

  const imgElement = (
    <img
      src={finalSrc}
      srcSet={srcSet}
      sizes={srcSet ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : sizes}
      alt={alt}
      className={className}
      loading={effectiveLoading}
      decoding={decoding}
      width={width}
      height={height}
      fetchPriority={fetchPriority}
      style={{ ...style, ...props.style }}
      {...props}
    />
  );

  if (isEnhanceable) {
    const basePath = src.substring(0, src.lastIndexOf('.'));
    // Warianty szerokości (480/960/1600) zamiast źródła 2752 px; inne lokalne obrazy
    // (bez wariantów) dostają jak dotąd pojedynczy plik .avif/.webp.
    const responsive = RESPONSIVE_SRC.test(src);
    const set = (ext: string) =>
      responsive
        ? RESPONSIVE_WIDTHS.map((w) => `${basePath}-${w}.${ext} ${w}w`).join(', ')
        : `${basePath}.${ext}`;
    const sizesAttr = responsive ? (sizes ?? defaultSizes(width)) : undefined;
    return (
      <picture className="block w-full h-full" style={style}>
        <source srcSet={set('avif')} sizes={sizesAttr} type="image/avif" />
        <source srcSet={set('webp')} sizes={sizesAttr} type="image/webp" />
        {React.cloneElement(
          imgElement as React.ReactElement<React.ImgHTMLAttributes<HTMLImageElement>>,
          {
            style: { ...props.style, width: '100%', height: '100%', objectFit: 'cover' }, // Reset style for inner img
          },
        )}
      </picture>
    );
  }

  return imgElement;
};

export default Image;
