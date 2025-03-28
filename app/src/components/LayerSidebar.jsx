import React from "react";
import "./LayerSidebar.css";

const LayerSidebar = ({
  isOpen,
  activeTab,
  setActiveTab,
  selectedLayer,
  layers,
  onLayerSelect,
  getLayerExplanation,
  bindLayerClickEvents,
}) => {
  const renderLayers = () =>
    layers.map((layer, index) => {
      const isSelected =
        selectedLayer &&
        (selectedLayer.originalLayer === layer ||
          selectedLayer.name === (layer.config?.layerName || `Layer ${index}`));
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
                {getLayerExplanation && (
                  <div className="layer-explanation">
                    <h4>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
                          fill="#4285f4"
                        />
                      </svg>
                      Layer Function
                    </h4>
                    <p>{getLayerExplanation(selectedLayer.type)}</p>
                  </div>
                )}
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
                    {selectedLayer.strides !== "N/A" && (
                      <tr>
                        <td>Stride:</td>
                        <td>{selectedLayer.strides}</td>
                      </tr>
                    )}
                    {selectedLayer.activation !== "N/A" && (
                      <tr>
                        <td>Activation:</td>
                        <td>{selectedLayer.activation}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {bindLayerClickEvents && (
                  <div className="refresh-container">
                    <button
                      onClick={bindLayerClickEvents}
                      className="refresh-button"
                    >
                      Refresh Layer Interactions
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-selection">
                <div className="icon-container">
                  <span>?</span>
                </div>
                <p>Select a layer from the visualization to view its details.</p>
                <p>
                  Explore the neural network architecture by interacting with
                  the 3D visualization.
                </p>
                {bindLayerClickEvents && (
                  <button
                    onClick={bindLayerClickEvents}
                    className="enable-interactions-button"
                  >
                    Enable Layer Interactions
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {activeTab === "list" && (
          <>
            <h3>All Layers</h3>
            <div className="list-instructions">
              <p>
                Click on a layer to view its details. The selected layer will be
                highlighted.
              </p>
            </div>
            <div className="layer-list">{renderLayers()}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default LayerSidebar;