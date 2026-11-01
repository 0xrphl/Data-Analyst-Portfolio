import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FALLBACK_IMG = '/store/assets/products/1/mossglow-lamp-1.jpg';

const ProductImages = ({ images, video, selectedImg, setSelectedImg, showVideo, setShowVideo, name }) => {
  const currentImage = images[selectedImg] || images[0];
  const [mainLoaded, setMainLoaded] = useState(false);
  const [mainError, setMainError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const nextImg = (e) => {
    e.stopPropagation();
    if (showVideo) {
      handleSelect(0);
    } else if (selectedImg === images.length - 1 && video) {
      setShowVideo(true);
    } else {
      handleSelect((selectedImg + 1) % images.length);
    }
  };

  const prevImg = (e) => {
    e.stopPropagation();
    if (showVideo) {
      handleSelect(images.length - 1);
    } else if (selectedImg === 0 && video) {
      setShowVideo(true);
    } else {
      handleSelect((selectedImg - 1 + images.length) % images.length);
    }
  };

  const hasMultiple = images.length + (video ? 1 : 0) > 1;

  return (
    <div>
      <motion.div
        key={showVideo ? 'video' : selectedImg}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="aspect-square rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] mb-4 relative group cursor-pointer"
        onClick={() => !showVideo && setIsFullscreen(true)}
      >
        {showVideo && video ? (
          <video src={video} controls autoPlay className="w-full h-full object-cover cursor-default" onClick={(e) => e.stopPropagation()} />
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
            {hasMultiple && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
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

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <button 
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
              onClick={() => setIsFullscreen(false)}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {showVideo && video ? (
              <video 
                src={video} 
                controls 
                autoPlay 
                className="max-w-full max-h-[90vh] object-contain" 
                onClick={(e) => e.stopPropagation()} 
              />
            ) : (
              <img 
                src={displayImage} 
                alt={name} 
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()} 
              />
            )}
            {hasMultiple && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductImages;
