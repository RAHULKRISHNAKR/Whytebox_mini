import React from 'react';
import ModelLayer from './ModelLayer';

const LayerListPanel = ({ modelRef, selectedLayer, handleLayerClick }) => {
  const renderSidebarLayers = () => {
    if (!modelRef.current || !modelRef.current.layers) {
      console.log("No layers available in model reference");
      return <p>No layers available</p>;
    }
  
    console.log("Rendering layers:", modelRef.current.layers.length);
    
    return modelRef.current.layers.map((layer, index) => {
      // Check if this layer is the currently selected one
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
    <>
      <h3 style={{ 
        marginTop: 0, 
        borderBottom: "2px solid #4285f4", 
        paddingBottom: "10px",
        color: "#202124",
        fontWeight: "500"
      }}>
        All Layers
      </h3>
      <div style={{ marginBottom: "15px" }}>
        <p style={{ fontSize: "0.9em", color: "#5f6368" }}>
          Click on a layer to view its details. The selected layer will be highlighted.
        </p>
      </div>
      <div style={{ maxHeight: "calc(100% - 100px)", overflowY: "auto" }}>
        {renderSidebarLayers()}
      </div>
    </>
  );
};

export default React.memo(LayerListPanel);
