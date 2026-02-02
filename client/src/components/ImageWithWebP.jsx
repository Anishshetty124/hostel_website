// Optimized ImageWithWebP.jsx - New component for responsive image loading
// Place this in src/components/

import React from 'react';

export const ImageWithWebP = ({ 
  src, 
  alt, 
  width = 'auto', 
  height = 'auto',
  className = '',
  priority = false 
}) => {
  const basePath = src.split('.')[0];
  
  return (
    <picture>
      {/* WebP format (modern browsers) */}
      <source srcSet={`${basePath}.webp`} type="image/webp" />
      {/* PNG fallback (older browsers) */}
      <img
        src={`${basePath}.png`}
        alt={alt}
        width={width}
        height={height}
        className={className}
        fetchPriority={priority ? 'high' : 'auto'}
        loading={priority ? 'eager' : 'lazy'}
      />
    </picture>
  );
};

export default ImageWithWebP;
