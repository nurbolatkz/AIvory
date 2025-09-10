import React, { useState } from 'react';
import { Settings, Sparkles, Image, TrendingUp, Camera, Upload, Play } from 'lucide-react';
import TrendingEffectsCarousel from './components/TrendingEffectsCarousel';
import UploadSection from './components/UploadSection';
import GenerateButton from './components/GenerateButton';
import BottomNavigation from './components/BottomNavigation';
import Header from './components/Header';
import './styles/TrendRider.css';

const TrendRider = () => {
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  // Trending effects data (would come from TikTok/Instagram API)
  const trendingEffects = [
    {
      id: 'rainbow-glow',
      name: 'Rainbow Glow',
      platform: 'TikTok',
      trending: '2.1M uses',
      preview: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=300&h=400&fit=crop&crop=face',
      type: 'photo'
    },
    {
      id: 'glitch-art',
      name: 'Glitch Art',
      platform: 'Instagram',
      trending: '850K uses',
      preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face',
      type: 'photo'
    },
    {
      id: 'cyberpunk-neon',
      name: 'Cyberpunk Neon',
      platform: 'TikTok',
      trending: '1.5M uses',
      preview: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=400&fit=crop&crop=face',
      type: 'video'
    },
    {
      id: 'aesthetic-vintage',
      name: 'Aesthetic Vintage',
      platform: 'Instagram',
      trending: '680K uses',
      preview: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face',
      type: 'photo'
    }
  ];

  const handleEffectSelect = (effect) => {
    setSelectedEffect(effect);
    setShowUploadOptions(true);
  };

  const handleMediaUpload = (type) => {
    // Simulate media upload
    setUploadedMedia({ type, url: selectedEffect.preview });
    setShowUploadOptions(false);
  };

  const handleGenerate = () => {
    if (!selectedEffect || !uploadedMedia) {
      // Replaced alert() with a custom modal/message box
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 flex items-center justify-center p-4 z-50';
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <p class="text-lg font-semibold text-gray-800">Please select an effect and upload media first!</p>
          <button class="mt-4 px-4 py-2 bg-purple-500 text-white rounded-full">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      messageBox.querySelector('button').onclick = () => messageBox.remove();
      return;
    }
    
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      // Replaced alert() with a custom modal/message box
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 flex items-center justify-center p-4 z-50';
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <p class="text-lg font-semibold text-gray-800">🎉 Your ${selectedEffect.name} content is ready to share!</p>
          <button class="mt-4 px-4 py-2 bg-purple-500 text-white rounded-full">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      messageBox.querySelector('button').onclick = () => messageBox.remove();
    }, 3000);
  };

  return (
    <div className="trendrider-container">
      <Header />
      
      {/* Main Content */}
      <div className="main-content">
        <div className="content-wrapper">
          {/* Hero Section */}
          <div className="hero-section">
            <h2 className="hero-title">
              <span className="hero-title-gradient">
                One-Click
              </span>
              <br />
              <span className="text-white">Content Creation</span>
            </h2>
            <p className="hero-subtitle">
              Jump on trends instantly. Zero effort, maximum impact.
            </p>
          </div>
          
          <TrendingEffectsCarousel 
            effects={trendingEffects} 
            selectedEffect={selectedEffect} 
            onEffectSelect={handleEffectSelect} 
          />
          
          {selectedEffect && (
            <UploadSection 
              selectedEffect={selectedEffect}
              uploadedMedia={uploadedMedia}
              showUploadOptions={showUploadOptions}
              onMediaUpload={handleMediaUpload}
              onShowUploadOptions={() => setShowUploadOptions(true)}
              onResetMedia={() => setUploadedMedia(null)}
            />
          )}
        </div>
      </div>
      
      <GenerateButton 
        generating={generating}
        selectedEffect={selectedEffect}
        uploadedMedia={uploadedMedia}
        onGenerate={handleGenerate}
      />
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

export default TrendRider;
