import React from 'react';

const ModelLayer = ({ layer, index, isSelected, handleLayerClick }) => {
  return (
    <div
      onClick={() => handleLayerClick(layer)}
      style={{
        padding: "10px",
        marginBottom: "5px",
        backgroundColor: isSelected ? "#e3f2fd" : "#f5f5f5",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        borderLeft: isSelected ? "4px solid #4285f4" : "none"
      }}
      onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = "#e0e0e0")}
      onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = "#f5f5f5")}
    >
      <strong>{layer.config?.layerName || `Layer ${index}`}</strong>
      <p style={{ margin: 0, fontSize: "0.8em", color: "#666" }}>
        {layer.layerType || "Unknown Type"}
      </p>
    </div>
  );
};

export default React.memo(ModelLayer);
