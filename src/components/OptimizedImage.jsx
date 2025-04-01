import React, { useState } from 'react';

const OptimizedImage = ({ src, alt, className, fallbackText }) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className={`${className} bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/30 flex items-center justify-center`}>
        <span className="text-red-400 font-medium">{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/30 animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default OptimizedImage; 