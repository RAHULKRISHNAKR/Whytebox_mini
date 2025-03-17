import React from 'react';
import DetailsPanel from './DetailsPanel';
import LayerListPanel from './LayerListPanel';
import '../../../styles/TensorVisualizer.css';

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
        backgroundColor: "rgba(255, 255, 255, 0.97)", 
        borderLeft: "1px solid #ddd",
        overflow: "hidden",
        boxShadow: "-2px 0 20px rgba(0,0,0,0.15)",
        zIndex: 5,
        transition: "right 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Top prediction display with enhanced styling */}
      {topPrediction && (
        <div style={{
          padding: "15px",
          background: "linear-gradient(135deg, #4285f4, #34a853)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ 
            position: "absolute",
            width: "120%",
            height: "100%",
            top: 0,
            left: "-10%",
            background: "radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 70%)",
            zIndex: 0
          }}></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: "0.8em", marginBottom: "5px", opacity: 0.9 }}>Top Prediction</div>
            <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>{topPrediction.label}</div>
            <div style={{ 
              marginTop: "5px",
              background: "rgba(255,255,255,0.2)",
              padding: "2px 10px",
              borderRadius: "12px",
              fontSize: "0.9em"
            }}>
              {topPrediction.confidence}% confidence
            </div>
          </div>
        </div>
      )}
      
      {/* Tab navigation with improved styling */}
      <div className="visualizer-tabs">
        <div 
          onClick={() => setActiveTab('details')}
          className={`visualizer-tab ${activeTab === 'details' ? 'visualizer-tab-active' : ''}`}
        >
          Layer Details
        </div>
        <div 
          onClick={() => setActiveTab('list')}
          className={`visualizer-tab ${activeTab === 'list' ? 'visualizer-tab-active' : ''}`}
        >
          All Layers
        </div>
      </div>
      
      {/* Tab content area with smooth transition */}
      <div 
        className="fade-in"
        style={{
          padding: "20px",
          overflowY: "auto",
          height: "calc(100% - 50px)", // Adjust for tab height and prediction area
          backgroundColor: "#f8f9fa"
        }}
      >
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
