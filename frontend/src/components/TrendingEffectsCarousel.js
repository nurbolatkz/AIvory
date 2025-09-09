import React from 'react';
import { Play, Camera } from 'lucide-react';
import '../styles/TrendingEffectsCarousel.css';

const TrendingEffectsCarousel = ({ effects, selectedEffect, onEffectSelect }) => {
  return (
    <div className="trending-section">
      <div className="trending-header">
        <h3 className="trending-title">🔥 Trending Now</h3>
        <span className="trending-update">Updated 2min ago</span>
      </div>
      
      <div className="effects-carousel scrollbar-hide">
        {effects.map((effect) => (
          <div 
            key={effect.id}
            className={`effect-card ${selectedEffect?.id === effect.id ? 'effect-card-selected' : ''}`}
            onClick={() => onEffectSelect(effect)}
          >
            <div className="effect-image-container">
              <img 
                src={effect.preview}
                alt={effect.name}
                className="effect-image"
              />
              <div className="effect-gradient-overlay"></div>
              
              {/* Platform badge */}
              <div className="platform-badge">
                <span className={`platform-badge-text ${
                  effect.platform === 'TikTok' 
                    ? 'platform-badge-tiktok' 
                    : 'platform-badge-instagram'
                }`}>
                  {effect.platform}
                </span>
              </div>
              
              {/* Media type indicator */}
              <div className="media-type-indicator">
                {effect.type === 'video' ? (
                  <Play size={16} className="text-white" fill="white" />
                ) : (
                  <Camera size={16} className="text-white" />
                )}
              </div>
              
              {/* Selection indicator */}
              {selectedEffect?.id === effect.id && (
                <div className="selection-indicator"></div>
              )}
              
              {/* Effect info */}
              <div className="effect-info">
                <h4 className="effect-name">
                  {effect.name}
                </h4>
                <p className="effect-trending">
                  {effect.trending}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingEffectsCarousel;