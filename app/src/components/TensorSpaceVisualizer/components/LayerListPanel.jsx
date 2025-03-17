import React from 'react';
import ModelLayer from './ModelLayer';
import '../../../styles/TensorVisualizer.css';

const LayerListPanel = ({ modelRef, selectedLayer, handleLayerClick }) => {
  const renderSidebarLayers = () => {
    if (!modelRef.current || !modelRef.current.layers) {
      return (
        <div className="visualizer-panel" style={{ textAlign: "center", padding: "30px 15px" }}>
          <div style={{ color: "#5f6368", marginBottom: "15px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM11 6H13V14H11V6Z" fill="#5f6368"/>
            </svg>
          </div>
          <p style={{ margin: "0" }}>No layers available in the current model</p>
        </div>
      );
    }
    
    return modelRef.current.layers.map((layer, index) => {
      const isSelected = selectedLayer && 
        (selectedLayer.originalLayer === layer || 
         selectedLayer.name === (layer.config?.layerName || `Layer ${index}`));
      
      return (
        <ModelLayer
          key={index}
          layer={layer}
          index={index}
          isSelected={isSelected}
          handleLayerClick={handleLayerClick}
        />
      );
    });
  };

  return (
    <div className="layer-list-container">
      <h3 className="visualizer-section-title">
        Neural Network Layers
      </h3>
      
      <div className="layer-list-intro" style={{ 
        backgroundColor: "rgba(66, 133, 244, 0.08)", 
        borderRadius: "8px", 
        padding: "12px 15px", 
        marginBottom: "15px" 
      }}>
        <p style={{ fontSize: "0.9em", color: "#5f6368", margin: "0" }}>
          <span style={{ display: "block", fontWeight: "500", marginBottom: "5px", color: "#202124" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ verticalAlign: "text-bottom", marginRight: "5px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="#4285f4"/>
            </svg>
            Interactive Layers
          </span>
          Click on any layer below to view its details and highlight it in the 3D visualization.
        </p>
      </div>
      
      <div className="layer-list-scroll" style={{ 
        maxHeight: "calc(100% - 100px)", 
        overflowY: "auto",
        paddingRight: "5px" 
      }}>
        {renderSidebarLayers()}
      </div>
    </div>
  );
};

export default React.memo(LayerListPanel);
