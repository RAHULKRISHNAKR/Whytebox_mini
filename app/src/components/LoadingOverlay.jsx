import React, { useState, useEffect } from "react";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ isLoading }) => {
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  
  // Cycle through loading status messages
  useEffect(() => {
    if (!isLoading) return;
    
    const messages = [
      "Initializing neural network...",
      "Loading model architecture...",
      "Preparing visualization components...",
      "Setting up 3D environment...",
      "Connecting layers...",
      "Almost ready..."
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      setLoadingStatus(messages[index]);
      index = (index + 1) % messages.length;
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;
  
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
      <p>Initializing neural network visualization...</p>
      <div className="loading-status">{loadingStatus}</div>
      <div className="loading-stages">
        <div className="loading-stage"></div>
        <div className="loading-stage"></div>
        <div className="loading-stage"></div>
        <div className="loading-stage"></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;