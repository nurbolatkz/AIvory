import React from 'react';
import { Settings } from 'lucide-react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="live-indicator">
        <div className="live-dot"></div>
        <span className="live-text">Live Trends</span>
      </div>
      <h1 className="app-title">TrendRider</h1>
      <button className="settings-button">
        <Settings size={22} />
      </button>
    </header>
  );
};

export default Header;
