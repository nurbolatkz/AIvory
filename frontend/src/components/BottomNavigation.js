import React from 'react';
import { Sparkles, Image, TrendingUp } from 'lucide-react';
import '../styles/BottomNavigation.css';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="bottom-navigation">
      <div className="nav-container">
        <button 
          className={`nav-button ${activeTab === 'generate' ? 'nav-button-active' : 'nav-button-inactive'}`}
          onClick={() => onTabChange('generate')}
        >
          <Sparkles size={24} className="nav-icon" />
          <span className="nav-text">Generate</span>
        </button>
        
        <button 
          className={`nav-button ${activeTab === 'creations' ? 'nav-button-active' : 'nav-button-inactive'}`}
          onClick={() => onTabChange('creations')}
        >
          <Image size={24} className="nav-icon" />
          <span className="nav-text">Creations</span>
        </button>
        
        <button 
          className={`nav-button ${activeTab === 'trends' ? 'nav-button-active' : 'nav-button-inactive'}`}
          onClick={() => onTabChange('trends')}
        >
          <TrendingUp size={24} className="nav-icon" />
          <span className="nav-text">Trends</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;