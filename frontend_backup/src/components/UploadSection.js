import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import '../styles/UploadSection.css';

const UploadSection = ({ 
  selectedEffect, 
  uploadedMedia, 
  showUploadOptions, 
  onMediaUpload, 
  onShowUploadOptions, 
  onResetMedia 
}) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      onMediaUpload(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="upload-section">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      <div className="upload-header">
        <h3 className="upload-title">Selected Effect</h3>
        <span className="upload-platform">{selectedEffect.platform}</span>
      </div>
      
      <div className="selected-effect">
        <div 
          className="selected-effect-image"
          style={{ backgroundImage: `url("${selectedEffect.thumbnail || selectedEffect.preview}")` }}
        ></div>
        <div className="selected-effect-info">
          <div className="effect-name">{selectedEffect.name}</div>
          <div className="effect-stats">🔥 {selectedEffect.trending}</div>
          <div className="effect-platform">{selectedEffect.category_name || selectedEffect.platform} Effect</div>
        </div>
      </div>

      {!uploadedMedia ? (
        showUploadOptions ? (
          <div className="upload-options">
            <button 
              onClick={() => onMediaUpload('camera')}
              className="upload-option-button upload-option-button-camera"
            >
              <Camera size={32} className="upload-option-icon" />
              <span className="upload-option-text">Take Photo</span>
            </button>
            <button 
              onClick={triggerFileUpload}
              className="upload-option-button upload-option-button-upload"
            >
              <Upload size={32} className="upload-option-icon" />
              <span className="upload-option-text">Upload</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={onShowUploadOptions}
            className="upload-dashed-button"
          >
            <div className="upload-dashed-content">
              <Upload className="upload-dashed-icon" size={32} />
              <p className="upload-dashed-text">Add your media</p>
            </div>
          </button>
        )
      ) : (
        <div className="media-ready">
          <div className="media-ready-content">
            <div className="media-ready-indicator">
              <span className="text-white text-lg">✓</span>
            </div>
            <span className="media-ready-text">Media ready!</span>
          </div>
          <button 
            onClick={onResetMedia}
            className="media-ready-change"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadSection;