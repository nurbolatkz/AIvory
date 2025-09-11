import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Image,
  TrendingUp,
  Camera,
  Upload,
  Play
} from 'lucide-react';
import TrendingEffectsCarousel from './components/TrendingEffectsCarousel';
import UploadSection from './components/UploadSection';
import GenerateButton from './components/GenerateButton';
import BottomNavigation from './components/BottomNavigation';
import Header from './components/Header';
import { useEffects } from './hooks/useEffects';
import { useImageProcessor } from './hooks/useImageProcessor';
import './styles/TrendRider.css';

const TrendRider = () => {
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  
  const { effects: trendingEffects, loading, error } = useEffects();
  const { 
    processedImage, 
    processing, 
    error: processingError,
    uploadImage,
    applyEffect
  } = useImageProcessor();

  // Effect to update processedImageUrl when processedImage changes
  useEffect(() => {
    console.log('processedImage changed:', processedImage);
    if (processedImage?.processed_image_url) {
      console.log('Setting processedImageUrl to:', processedImage.processed_image_url);
      setProcessedImageUrl(processedImage.processed_image_url);
    }
  }, [processedImage]);

  const handleEffectSelect = (effect) => {
    setSelectedEffect(effect);
    setShowUploadOptions(true);
    setProcessedImageUrl(null); // Reset processed image when selecting new effect
  };

  const handleMediaUpload = async (file) => {
    try {
      // Log what we're receiving for debugging
      console.log('handleMediaUpload called with:', file);
      console.log('Type of file:', typeof file);
      if (file && typeof file === 'object') {
        console.log('File constructor name:', file.constructor.name);
        console.log('File keys:', Object.keys(file));
      }
      
      // Handle the case where a string is passed (e.g., 'camera')
      if (typeof file === 'string') {
        if (file === 'camera') {
          // For now, we'll just show an alert that camera is not implemented
          // In a real implementation, you would initialize the camera here
          alert('Camera capture is not implemented in this demo. Please upload an image file instead.');
          return;
        } else {
          throw new Error('Invalid upload option selected');
        }
      }
      
      // Validate that it's a File object
      if (!(file instanceof File)) {
        throw new Error('Invalid file object. Please select a valid image file.');
      }
      
      // Upload the image to get an ID
      const imageData = await uploadImage(file);
      console.log('Image uploaded successfully:', imageData);
      // Set the uploaded media with the image data
      setUploadedImage({ type: 'photo', url: imageData.original_image, id: imageData.id });
      setShowUploadOptions(false);
    } catch (err) {
      // Handle error with a custom modal/message box
      const errorMessage = err.message || 'Unknown error occurred';
      console.error('Upload error:', errorMessage);
      
      // Create a more user-friendly error message
      let userMessage = errorMessage;
      if (errorMessage.includes('Upload failed:')) {
        userMessage = errorMessage.replace('Upload failed:', '').trim();
      }
      
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 flex items-center justify-center p-4 z-50';
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <p class="text-lg font-semibold text-gray-800">Error uploading image: ${userMessage}</p>
          <button class="mt-4 px-4 py-2 bg-purple-500 text-white rounded-full">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      messageBox.querySelector('button').onclick = () => messageBox.remove();
    }
  };

  const handleGenerate = async () => {
    if (!selectedEffect || !uploadedImage) {
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
    
    try {
      // Show processing modal
      setShowProcessingModal(true);
      
      console.log('Starting applyEffect with:', {
        imageId: uploadedImage.id,
        effectId: selectedEffect.id,
        uploadedImage,
        selectedEffect
      });
      
      // Apply the selected effect to the uploaded image
      const result = await applyEffect(uploadedImage.id, selectedEffect.id);
      
      console.log('applyEffect completed with result:', result);
      
      // Hide processing modal
      setShowProcessingModal(false);
      
      // Show success message
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
      
      // Update the processed image URL
      if (result?.processed_image_url) {
        setProcessedImageUrl(result.processed_image_url);
      }
    } catch (err) {
      console.error('Error in handleGenerate:', err);
      // Hide processing modal
      setShowProcessingModal(false);
      
      // Handle error with a custom modal/message box
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 flex items-center justify-center p-4 z-50';
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-lg text-center">
          <p class="text-lg font-semibold text-gray-800">Error applying effect: ${err.message}</p>
          <button class="mt-4 px-4 py-2 bg-purple-500 text-white rounded-full">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      messageBox.querySelector('button').onclick = () => messageBox.remove();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="trendrider-container">
        <Header />
        <div className="main-content">
          <div className="content-wrapper">
            <div className="hero-section">
              <h2 className="hero-title">
                <span className="hero-title-gradient">
                  Loading...
                </span>
              </h2>
              <p className="hero-subtitle">
                Fetching trending effects
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="trendrider-container">
        <Header />
        <div className="main-content">
          <div className="content-wrapper">
            <div className="hero-section">
              <h2 className="hero-title">
                <span className="hero-title-gradient">
                  Error
                </span>
              </h2>
              <p className="hero-subtitle">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              uploadedMedia={uploadedImage}
              showUploadOptions={showUploadOptions}
              onMediaUpload={handleMediaUpload}
              onShowUploadOptions={() => setShowUploadOptions(true)}
              onResetMedia={() => setUploadedImage(null)}
            />
          )}
          
          {/* Processed Image Section */}
          {processedImageUrl && (
            <div className="processed-image-section">
              <h3 className="processed-title">Your {selectedEffect?.name} Effect</h3>
              <div className="processed-image-container">
                <img 
                  src={processedImageUrl} 
                  alt={selectedEffect?.name} 
                  className="processed-image"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    e.target.src = '/fallback-image.png'; // Add a fallback image
                  }}
                />
              </div>
              <div className="mt-4 text-center">
                <button 
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-colors"
                  onClick={() => {
                    // Reset the state for a new effect application
                    setSelectedEffect(null);
                    setUploadedImage(null);
                    setProcessedImageUrl(null);
                    // Reset the processing state
                    setProcessing(false);
                    // Refresh the page
                    window.location.reload();
                  }}
                >
                  Apply New Effect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <GenerateButton 
        generating={processing}
        selectedEffect={selectedEffect}
        uploadedMedia={uploadedImage}
        onGenerate={handleGenerate}
      />
      
      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Processing Modal */}
      {showProcessingModal && (
        <div className="processing-modal">
          <div className="processing-modal-content">
            <div className="processing-spinner"></div>
            <h3 className="processing-title">Creating Magic</h3>
            <p className="processing-description">
              Your {selectedEffect?.name} effect is being applied. This may take a few moments...
            </p>
            <div className="processing-progress">
              <div className="processing-progress-bar"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendRider;