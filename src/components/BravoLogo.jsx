import React, { useState } from 'react';

function BravoLogo({ onLoginClick, activeTab, onTabChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="/Logo.png" 
            alt="Bravo.bet" 
            className="h-16 sm:h-20 md:h-24 filter drop-shadow-[0_0_10px_rgba(255,0,0,0.5)] hover:drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] transition-all duration-500 hover:scale-105 animate-float"
            loading="lazy"
            width="120"
            height="120"
            decoding="async"
          />
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => onTabChange('classification')}
            className={`text-red-500 hover:text-red-400 transition-colors font-medium ${activeTab === 'classification' ? 'border-b-2 border-red-500' : ''}`}
          >
            CLASSIFICAÇÃO
          </button>
          <button 
            onClick={() => onTabChange('rules')}
            className={`text-red-500 hover:text-red-400 transition-colors font-medium ${activeTab === 'rules' ? 'border-b-2 border-red-500' : ''}`}
          >
            REGRAS
          </button>
          <button 
            onClick={() => onTabChange('app')}
            className={`text-red-500 hover:text-red-400 transition-colors font-medium ${activeTab === 'app' ? 'border-b-2 border-red-500' : ''}`}
          >
            APP
          </button>
          <button 
            onClick={onLoginClick}
            className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded hover:from-red-500 hover:to-red-400 transition-all duration-300 font-medium shadow-[0_0_15px_rgba(255,0,0,0.3)] hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]"
          >
            ENTRADA
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-red-500 hover:text-red-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-4">
          <button 
            onClick={() => {
              onTabChange('classification');
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left text-red-500 hover:text-red-400 transition-colors font-medium ${activeTab === 'classification' ? 'border-l-2 border-red-500 pl-2' : ''}`}
          >
            CLASSIFICAÇÃO
          </button>
          <button 
            onClick={() => {
              onTabChange('rules');
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left text-red-500 hover:text-red-400 transition-colors font-medium ${activeTab === 'rules' ? 'border-l-2 border-red-500 pl-2' : ''}`}
          >
            REGRAS
          </button>
          <button 
            onClick={() => {
              onTabChange('app');
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left text-red-500 hover:text-red-400 transition-colors font-medium ${activeTab === 'app' ? 'border-l-2 border-red-500 pl-2' : ''}`}
          >
            APP
          </button>
          <button 
            onClick={() => {
              onLoginClick();
              setIsMenuOpen(false);
            }}
            className="block w-full text-left px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded hover:from-red-500 hover:to-red-400 transition-all duration-300"
          >
            ENTRADA
          </button>
        </div>
      )}
    </div>
  );
}

export default BravoLogo; 