import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BeginnersGuide from '../components/BeginnersGuide';
import Navigation from '../components/Navigation';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  
  // Only using MobileNetV1 for now
  const currentModelInfo = {
    name: "MobileNetV1",
    description: "The original MobileNet architecture that introduced depthwise separable convolutions for efficient deep learning on mobile devices.",
    features: [
      { label: "Architecture", value: "28 layers including depthwise and pointwise convolutions" },
      { label: "Parameters", value: "~4.2 million parameters" },
      { label: "Input Size", value: "224×224 RGB images" },
      { label: "Output", value: "1000-class classification (ImageNet)" },
      { label: "Key Feature", value: "First model to use depthwise separable convolutions for mobile" }
    ]
  };

  return (
    <div className="home-page">
      {/* Add Navigation bar */}
      <Navigation />
      
      {showGuide && <BeginnersGuide onClose={() => setShowGuide(false)} />}
      
      <div className="hero-section">
        <h1>WhyteBox: Neural Network Visualizer</h1>
        <p className="tagline">Explore and understand Convolutional Neural Networks through interactive 3D visualization</p>
        
        <div className="hero-buttons">
          <button 
            className="view-model-btn" 
            onClick={() => navigate('/layer-visualizer')}
          >
            View Model
            <span className="btn-icon">→</span>
          </button>
          
          <button 
            className="guide-btn" 
            onClick={() => setShowGuide(true)}
          >
            Beginners Guide
            <span className="btn-icon">?</span>
          </button>
        </div>
      </div>
      
      <div className="model-info-panel">
        <h2>About {currentModelInfo.name}</h2>
        <p>{currentModelInfo.description}</p>
        <ul className="model-features">
          {currentModelInfo.features.map((feature, index) => (
            <li key={index}><strong>{feature.label}:</strong> {feature.value}</li>
          ))}
        </ul>
      </div>
      
      <div className="project-details">
        <div className="detail-section">
          <h2>About This Project</h2>
          <p>WhyteBox is an interactive tool designed to demystify Convolutional Neural Networks (CNNs). 
             By visualizing the architecture and internal workings of CNNs in 3D, we aim to make 
             deep learning more accessible and understandable.</p>
        </div>
        
        <div className="detail-section">
          <h2>Key Features</h2>
          <ul className="feature-list">
            <li>
              <span className="feature-icon">🔍</span>
              <div>
                <h3>3D Model Visualization</h3>
                <p>Explore CNN architecture in an interactive 3D environment</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🧠</span>
              <div>
                <h3>Layer Inspection</h3>
                <p>View and understand different layers and their functions</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🔄</span>
              <div>
                <h3>Real-time Processing</h3>
                <p>See how images are processed through the network</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">💡</span>
              <div>
                <h3>Explainable AI</h3>
                <p>Understand how and why the model makes specific predictions</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="detail-section">
          <h2>How to Use</h2>
          <ol className="steps-list">
            <li>Click the "View Model" button to load the 3D CNN visualization</li>
            <li>Use your mouse to rotate and explore the model from different angles</li>
            <li>Click on specific layers to see detailed information</li>
            <li>Toggle different visualization options to understand model behavior</li>
          </ol>
        </div>
        
        <div className="detail-section">
          <h2>About the Team</h2>
          <p>This project was developed as part of the KTU S6 Data Science Mini Project.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;