/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
}

/**
 * A reusable Image component that implements the <picture> pattern
 * to serve AVIF/WebP formats automatically.
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
  ...props
}) => {
  if (!alt) {
    console.warn(`Image with src "${src}" is missing an alt attribute.`);
  }

  const effectiveLoading = priority ? undefined : loading || 'lazy';
  const fetchPriority = priority ? 'high' : 'auto';

  // Check if we can serve multiple formats
  const isEnhanceable = src.startsWith('/') && /\.(jpe?g|png)$/i.test(src);

  // CLS Optimization: Calculate aspect ratio to reserve space
  const style =
    width && height
      ? ({
          aspectRatio: `${width} / ${height}`,
          width: '100%', // Ensure it fills the container if needed, or respect width prop via attribute
          height: 'auto',
        } as React.CSSProperties)
      : undefined;

  const imgElement = (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={effectiveLoading}
      decoding={decoding}
      width={width}
      height={height}
      fetchPriority={fetchPriority}
      style={{ ...style, ...props.style }} // Apply aspect-ratio here
      {...props}
    />
  );

  if (isEnhanceable) {
    const basePath = src.substring(0, src.lastIndexOf('.'));
    return (
      <picture className="block w-full h-full" style={style}>
        <source srcSet={`${basePath}.avif`} type="image/avif" />
        <source srcSet={`${basePath}.webp`} type="image/webp" />
        {/* We don't need style on img inside picture if picture handles the ratio/layout, 
            but keeping it safe often helps. However, picture usually needs the block/ratio. 
            Let's apply style to picture primarily if it's a wrapper. */}
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
