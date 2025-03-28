import React, { useState } from 'react';

const PredictionBar = ({ prediction }) => {
  const [minimized, setMinimized] = useState(false);

  if (!prediction) return null;

  return (
    <div className={`prediction-bar ${minimized ? 'minimized' : ''}`}>
      <button 
        className="minimize-button" 
        onClick={() => setMinimized(!minimized)}
        title={minimized ? "Expand predictions" : "Minimize predictions"}
      >
        {minimized ? "+" : "−"}
      </button>
      <span className="prediction-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" 
            fill="currentColor"
          />
          <path 
            d="M16 12L10 7.5V16.5L16 12Z" 
            fill="currentColor"
          />
        </svg>
      </span>
      <p>{prediction}</p>
    </div>
  );
};

export default PredictionBar;