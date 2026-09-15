import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FALLBACK_IMG = '/store/assets/products/mossglow-lamp-1.jpg';

const ProductImages = ({ images, video, selectedImg, setSelectedImg, showVideo, setShowVideo, name }) => {
  const currentImage = images[selectedImg] || images[0];
  const [mainLoaded, setMainLoaded] = useState(false);
  const [mainError, setMainError] = useState(false);
  const displayImage = mainError ? FALLBACK_IMG : currentImage;

  const handleMainLoad = () => setMainLoaded(true);
  const handleMainError = () => {
    if (!mainError) {
      setMainError(true);
      setMainLoaded(false);
    }
  };

  // Reset states when image selection changes
  const handleSelect = (i) => {
    setSelectedImg(i);
    setShowVideo(false);
    setMainLoaded(false);
    setMainError(false);
  };

  return (
    <div>
      <motion.div
        key={showVideo ? 'video' : selectedImg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="aspect-square rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] mb-4 relative"
      >
        {showVideo && video ? (
          <video src={video} controls autoPlay className="w-full h-full object-cover" />
        ) : (
          <>
            {!mainLoaded && (
              <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}
            <img
              src={displayImage}
              alt={name}
              decoding="async"
              onLoad={handleMainLoad}
              onError={handleMainError}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                mainLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
              selectedImg === i && !showVideo ? 'border-violet-500' : 'border-white/10 hover:border-white/30'
            }`}
          >
            <img
              src={img}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = FALLBACK_IMG; }}
            />
          </button>
        ))}
        {video && (
          <button
            onClick={() => setShowVideo(true)}
            className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 flex items-center justify-center bg-white/5 ${
              showVideo ? 'border-violet-500' : 'border-white/10 hover:border-white/30'
            }`}
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductImages;
