import React from "react";
import "./LayerSidebar.css";

const LayerSidebar = ({ isOpen, activeTab, setActiveTab, selectedLayer, layers, onLayerSelect }) => {
  const renderLayers = () =>
    layers.map((layer, index) => {
      const isSelected =
        selectedLayer && (selectedLayer.originalLayer === layer || selectedLayer.name === (layer.config?.layerName || `Layer ${index}`));
      return (
        <div
          key={index}
          onClick={() => onLayerSelect(layer)}
          className={`layer-item ${isSelected ? "selected" : ""}`}
        >
          <strong>{layer.config?.layerName || `Layer ${index}`}</strong>
          <p>{layer.layerType || "Unknown Type"}</p>
        </div>
      );
    });

  return (
    <div className={`layer-sidebar ${isOpen ? "open" : ""}`}>
      <div className="tab-nav">
        <div
          className={`tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Layer Details
        </div>
        <div
          className={`tab ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          All Layers
        </div>
      </div>
      <div className="tab-content">
        {activeTab === "details" && (
          <>
            <h3>Layer Information {selectedLayer && `- ${selectedLayer.name}`}</h3>
            {selectedLayer ? (
              <div>
                <div className="layer-header">
                  <h4>{selectedLayer.name}</h4>
                  <span>{selectedLayer.type}</span>
                </div>
                <table>
                  <tbody>
                    {selectedLayer.filters !== "N/A" && (
                      <tr>
                        <td>Filters:</td>
                        <td>{selectedLayer.filters}</td>
                      </tr>
                    )}
                    {selectedLayer.kernelSize !== "N/A" && (
                      <tr>
                        <td>Kernel Size:</td>
                        <td>{selectedLayer.kernelSize}</td>
                      </tr>
                    )}
                    {selectedLayer.outputShape !== "N/A" && (
                      <tr>
                        <td>Output Shape:</td>
                        <td>{selectedLayer.outputShape}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Select a layer from the visualization to view its details.</p>
            )}
          </>
        )}
        {activeTab === "list" && (
          <>
            <h3>All Layers</h3>
            <div className="layer-list">{renderLayers()}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default LayerSidebar;