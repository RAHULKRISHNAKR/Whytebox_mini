import React from "react";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <img src="/assets/loading.gif" alt="Loading..." className="loading-gif" />
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
      <p>Initializing neural network visualization...</p>
    </div>
  );
};

export default LoadingOverlay;