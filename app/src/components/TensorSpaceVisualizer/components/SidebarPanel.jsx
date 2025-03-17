import React from 'react';
import DetailsPanel from './DetailsPanel';
import LayerListPanel from './LayerListPanel';

const SidebarPanel = ({ 
  sidebarOpen, 
  activeTab, 
  setActiveTab, 
  selectedLayer, 
  modelRef,
  handleLayerClick, 
  bindLayerClickEvents,
  topPrediction
}) => {
  return (
    <div 
      className="layer-details-sidebar"
      style={{ 
        position: "absolute",
        top: 0,
        right: sidebarOpen ? "0" : "-350px",
        width: "350px", 
        height: "100%",
        backgroundColor: "rgba(245, 245, 245, 0.95)", 
        borderLeft: "1px solid #ddd",
        overflow: "hidden", // Changed to hidden to prevent scrolling issues with tabs
        boxShadow: "-5px 0 15px rgba(0,0,0,0.2)",
        zIndex: 5,
        transition: "right 0.3s ease",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Top prediction display */}
      {topPrediction && (
        <div style={{
          padding: "10px 15px",
          backgroundColor: "#4285f4",
          color: "white",
          textAlign: "center",
          fontSize: "0.9em",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={{ fontSize: "0.8em", marginBottom: "2px" }}>Top Prediction</div>
          <div style={{ fontWeight: "bold" }}>{topPrediction.label}</div>
          <div style={{ fontSize: "0.9em" }}>{topPrediction.confidence}% confidence</div>
        </div>
      )}
      
      {/* Tab navigation */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid #ddd",
      }}>
        <div 
          onClick={() => setActiveTab('details')}
          style={{
            flex: 1,
            padding: "15px 0",
            textAlign: "center",
            fontWeight: activeTab === 'details' ? "500" : "normal",
            borderBottom: activeTab === 'details' ? "3px solid #4285f4" : "none",
            cursor: "pointer",
            color: activeTab === 'details' ? "#4285f4" : "#5f6368",
            transition: "all 0.2s ease"
          }}
        >
          Layer Details
        </div>
        <div 
          onClick={() => setActiveTab('list')}
          style={{
            flex: 1,
            padding: "15px 0",
            textAlign: "center",
            fontWeight: activeTab === 'list' ? "500" : "normal",
            borderBottom: activeTab === 'list' ? "3px solid #4285f4" : "none",
            cursor: "pointer",
            color: activeTab === 'list' ? "#4285f4" : "#5f6368",
            transition: "all 0.2s ease"
          }}
        >
          All Layers
        </div>
      </div>
      
      {/* Tab content area */}
      <div style={{
        padding: "20px",
        overflowY: "auto",
        height: "calc(100% - 50px)" // Adjust for tab height and prediction area
      }}>
        {activeTab === 'details' && (
          <DetailsPanel 
            selectedLayer={selectedLayer} 
            bindLayerClickEvents={bindLayerClickEvents} 
          />
        )}
        
        {activeTab === 'list' && (
          <LayerListPanel 
            modelRef={modelRef} 
            selectedLayer={selectedLayer} 
            handleLayerClick={handleLayerClick} 
          />
        )}
      </div>
    </div>
  );
};

export default SidebarPanel;
