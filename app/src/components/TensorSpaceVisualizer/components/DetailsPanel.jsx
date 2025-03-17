import React from 'react';
import '../../../styles/TensorVisualizer.css';

const DetailsPanel = ({ selectedLayer, bindLayerClickEvents }) => {
  return (
    <div className="layer-details-container">
      <h3 className="visualizer-section-title">
        {selectedLayer ? `Layer: ${selectedLayer.name}` : 'Layer Information'}
      </h3>
      
      {selectedLayer ? (
        <div className="fade-in">
          <div style={{ 
            marginBottom: "20px", 
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            border: "1px solid #e8eaed"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <h4 style={{ margin: "0", color: "#202124", fontWeight: "600" }}>{selectedLayer.name}</h4>
              <span className="visualizer-badge" style={{ 
                backgroundColor: getLayerTypeColor(selectedLayer.type),
                fontSize: "0.75rem"
              }}>
                {selectedLayer.type}
              </span>
            </div>
            
            <div style={{ height: "1px", backgroundColor: "#e8eaed", margin: "15px 0" }}></div>
            
            <div className="layer-properties">
              {selectedLayer.filters !== "N/A" && (
                <div className="detail-item">
                  <div className="detail-label">Filters:</div>
                  <div className="detail-value">{selectedLayer.filters}</div>
                </div>
              )}
              {selectedLayer.kernelSize !== "N/A" && (
                <div className="detail-item">
                  <div className="detail-label">Kernel Size:</div>
                  <div className="detail-value">{selectedLayer.kernelSize}</div>
                </div>
              )}
              {selectedLayer.outputShape !== "N/A" && (
                <div className="detail-item">
                  <div className="detail-label">Output Shape:</div>
                  <div className="detail-value">{selectedLayer.outputShape}</div>
                </div>
              )}
              {selectedLayer.strides !== "N/A" && (
                <div className="detail-item">
                  <div className="detail-label">Stride:</div>
                  <div className="detail-value">{selectedLayer.strides}</div>
                </div>
              )}
              {selectedLayer.activation !== "N/A" && (
                <div className="detail-item">
                  <div className="detail-label">Activation:</div>
                  <div className="detail-value">
                    <span style={{ 
                      padding: "3px 8px",
                      backgroundColor: getActivationColor(selectedLayer.activation),
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "0.8rem"
                    }}>
                      {selectedLayer.activation}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: "#f1f8ff", 
            padding: "15px", 
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #d0e3ff"
          }}>
            <h4 style={{ 
              margin: "0 0 10px", 
              fontSize: "0.95rem", 
              color: "#4285f4",
              display: "flex",
              alignItems: "center"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: "6px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="#4285f4"/>
              </svg>
              Layer Function
            </h4>
            <p style={{ margin: "0", fontSize: "0.9rem", color: "#5f6368" }}>
              {getLayerDescription(selectedLayer.type)}
            </p>
          </div>
          
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button 
              className="visualizer-button"
              onClick={bindLayerClickEvents}
              style={{ margin: "0 auto" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: "8px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="white"/>
              </svg>
              Refresh Layer Interactions
            </button>
          </div>
        </div>
      ) : (
        <div style={{ 
          color: "#5f6368", 
          textAlign: "center",
          backgroundColor: "white",
          padding: "30px 20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          marginTop: "20px"
        }} className="fade-in">
          <div style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            backgroundColor: "#f1f3f4",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2ZM18 11.09C18 15.09 15.45 18.79 12 19.92C8.55 18.79 6 15.1 6 11.09V6.39L12 4.14L18 6.39V11.09Z" fill="#5f6368"/>
              <path d="M13 10H11V16H13V10ZM13 7H11V9H13V7Z" fill="#5f6368"/>
            </svg>
          </div>
          <h4 style={{ color: "#202124", margin: "0 0 10px" }}>No Layer Selected</h4>
          <p style={{ margin: "0 0 20px" }}>Select a layer from the visualization to view its details</p>
          <button 
            className="visualizer-button"
            onClick={bindLayerClickEvents}
          >
            Enable Layer Interactions
          </button>
        </div>
      )}
    </div>
  );
};

// Helper functions to provide colors and descriptions based on layer types
const getLayerTypeColor = (type) => {
  const colors = {
    'Conv2D': '#4285f4',
    'MaxPooling2D': '#34a853',
    'Dense': '#ea4335',
    'Flatten': '#fbbc05',
    'Dropout': '#9aa0a6',
    'Input': '#673ab7',
    'BatchNormalization': '#ff6d00'
  };
  
  return colors[type] || '#5f6368';
};

const getActivationColor = (activation) => {
  const colors = {
    'relu': '#0f9d58',
    'softmax': '#4285f4',
    'tanh': '#ea4335',
    'sigmoid': '#fbbc05'
  };
  
  return colors[activation] || '#5f6368';
};

const getLayerDescription = (type) => {
  const descriptions = {
    'Conv2D': 'Applies a 2D convolution over the input, extracting features through filters.',
    'MaxPooling2D': 'Downsamples the input by taking the maximum value over a window.',
    'Dense': 'A fully connected layer where each neuron connects to all neurons in the previous layer.',
    'Flatten': 'Converts multidimensional input to a 1D tensor for feeding into Dense layers.',
    'Dropout': 'Randomly sets input units to 0 during training to prevent overfitting.',
    'Input': 'Defines the input shape for the neural network.',
    'BatchNormalization': 'Normalizes activations of the previous layer for each batch.'
  };
  
  return descriptions[type] || 'Processes input data and contributes to the neural network computation.';
};

export default React.memo(DetailsPanel);
