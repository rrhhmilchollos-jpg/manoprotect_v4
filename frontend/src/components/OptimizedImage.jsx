/**
 * OptimizedImage - Componente de imagen optimizado para PageSpeed
 * Implementa lazy loading nativo, WebP con fallback, y aspect-ratio
 */
import React, { useState } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  priority = false,
  placeholder = 'blur'
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate WebP source if not already webp
  const webpSrc = src.endsWith('.webp') ? src : src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const fallbackSrc = src;

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchpriority={priority ? 'high' : 'auto'}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{ 
          aspectRatio: width && height ? `${width}/${height}` : undefined,
          backgroundColor: placeholder === 'blur' ? '#f4f4f5' : 'transparent'
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </picture>
  );
};

export default OptimizedImage;
