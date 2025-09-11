import React from 'react';
import { Sparkles } from 'lucide-react';
import '../styles/GenerateButton.css';

const GenerateButton = ({ generating, selectedEffect, uploadedMedia, onGenerate }) => {
  return (
    <div className="generate-button-container">
      <button 
        onClick={onGenerate}
        disabled={generating || !selectedEffect || !uploadedMedia}
        className="generate-button"
      >
        <div className="generate-button-content">
          <Sparkles className={`generate-icon ${generating ? 'generate-icon-spinning' : ''}`} size={28} />
          <span>{generating ? 'Creating Magic...' : 'Generate Content'}</span>
        </div>
      </button>
      
      {selectedEffect && uploadedMedia && !generating && (
        <p className="generate-ready-text">
          Ready to create {selectedEffect.name} content! 🚀
        </p>
      )}
    </div>
  );
};

export default GenerateButton;
