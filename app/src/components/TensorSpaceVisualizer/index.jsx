import React, { useEffect, useState, useRef } from "react";
import * as TSP from "tensorspace";
import SidebarPanel from "./components/SidebarPanel";
import LoadingOverlay from "./components/LoadingOverlay";
import PredictionBar from "./components/PredictionBar";
// Import our new EnhancedImagePanel component
import EnhancedImagePanel from "./components/EnhancedImagePanel";

const TensorSpaceVisualizer = () => {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [topPrediction, setTopPrediction] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Set leftSidebarOpen to true by default to make it visible initially
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'list'
  const initCalled = useRef(false);
  const modelRef = useRef(null);
  const outputLabels = window.result 
    ? window.result
    : Array.from({ length: 1000 }, (_, i) => `label${i + 1}`);

  // Enhanced layer click handler with better property extraction
  const handleLayerClick = (layer) => {
    console.log("Layer clicked:", layer);

    // Safely extract meaningful properties
    const layerInfo = {
      name: layer.config?.layerName || "Unknown Layer",
      type: layer.layerType || "Unknown",
      filters: layer.filters || "N/A",
      kernelSize: layer.kernelSize
        ? `${layer.kernelSize[0]}x${layer.kernelSize[1]}`
        : "N/A",
      inputShape: layer.inputShape
        ? layer.inputShape.join(" x ")
        : "N/A",
      outputShape: layer.outputShape
        ? layer.outputShape.join(" x ")
        : "N/A",
      strides: layer.strides
        ? `${layer.strides[0]}x${layer.strides[1]}`
        : "N/A",
      activation: layer.config?.activation || "N/A",
      depth: layer.depth || "N/A",
      height: layer.height || "N/A",
      width: layer.width || "N/A",
      // Store reference to original layer for identification
      originalLayer: layer
    };

    console.log("Extracted layer info:", layerInfo);

    // Open the sidebar if it's closed
    if (!sidebarOpen) {
      setSidebarOpen(true);
    }
    
    // Switch to details tab when a layer is selected
    setActiveTab('details');

    // Update the selected layer state
    setSelectedLayer(layerInfo);
  };

  // Function to manually bind click events to layer elements
  const bindLayerClickEvents = () => {
    if (!modelRef.current) return;

    setTimeout(() => {
      try {
        const container = document.getElementById("container");
        if (!container) {
          console.error("Container element not found.");
          return;
        }

        // Find layer elements
        let layerElements = container.querySelectorAll('div[class*="layer"]');
        console.log(`Found ${layerElements.length} layer elements`);

        layerElements.forEach((element, index) => {
          const layerData =
            modelRef.current.layers && index < modelRef.current.layers.length
              ? modelRef.current.layers[index]
              : { layerName: `Layer ${index}`, type: "Unknown" };

          element.addEventListener("click", (e) => {
            e.preventDefault();
            console.log(`Manual click on layer ${index}:`, layerData);
            handleLayerClick(layerData);
          });

          // Add visual cue that layers are clickable
          element.style.cursor = "pointer";
        });
      } catch (error) {
        console.error("Error binding layer click events:", error);
      }
    }, 3000); // Delay to ensure DOM is ready
  };

  // Function to toggle the right sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    console.log("Right sidebar state:", !sidebarOpen);
  };

  // Function to toggle the left sidebar
  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
    console.log("Left sidebar state:", !leftSidebarOpen);
  };

  // Modified image selection handler to accept data directly
  const handleImageSelect = async (image, imageData) => {
    console.log("Selected image:", image.name, "with data:", imageData);
    
    if (!modelRef.current) return;
    
    setLoading(true);
    setPrediction(`Processing ${image.name}...`);
    
    try {
      // Use the provided data directly
      modelRef.current.predict(imageData, function (result) {
        console.log("New prediction completed:", result);
        
        if (result instanceof Float32Array || Array.isArray(result)) {
          // Map probabilities to labels
          const predictionsWithLabels = Array.from(result)
            .map((value, index) => ({ value, label: outputLabels[index] || `Class ${index}` }))
            .sort((a, b) => b.value - a.value);
          
          // Get top prediction for sidebar
          if (predictionsWithLabels.length > 0) {
            const top = predictionsWithLabels[0];
            setTopPrediction({
              label: top.label,
              confidence: (top.value).toFixed(2)
            });
          }
          
          // Format top 5 for prediction bar
          const top5 = predictionsWithLabels
            .slice(0, 5)
            .map(item => `${item.label}: ${(item.value).toFixed(2)}%`)
            .join(", ");
          
          setPrediction(`${image.name}: ${top5}`);
        } else {
          setPrediction(`Processed ${image.name} - check visualization`);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Error processing image:", error);
      setPrediction("Error processing image: " + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;
  
    async function init() {
      // Get the container element (make sure the div below has id "container")
      const container = document.getElementById("container");
      if (!container) {
        console.error("Container element not found.");
        return;
      }

      // Initialize the TensorSpace model with statistics enabled
      let model = new TSP.models.Sequential(container, { 
        stats: true,
        // Both ways to register click handlers
        layerClick: handleLayerClick,
        onClick: handleLayerClick
      });
      
      // Store the model reference
      modelRef.current = model;

      // Define the network layers with enhanced properties
      model.add(new TSP.layers.RGBInput({ 
        layerName: "RGB Input",
        tooltip: "Input: 224x224x3 RGB Image"
      }));
      
      // Add Conv2d layers with descriptive names and tooltips
      model.add(
        new TSP.layers.Conv2d({
          initStatus: "open",
          layerName: "Conv2D-1",
          tooltip: "Filters: 32, Kernel Size: 3x3",
        })
      );
      
      // ...existing code for all layer definitions...
      
      // Load the model from the pre-converted format
      model.load({
        type: "keras",
        url: "/assets/models/mobilenetv1/model.json",
      });

      // Initialize the model and then load the sample input for prediction
      model.init(async function () {
        try {
          console.log("Model initialized successfully!");
          
          // After initialization, bind click events
          bindLayerClickEvents();
          
          const response = await fetch("/assets/data/image_topology.json");
          if (!response.ok) {
            throw new Error(`Failed to fetch image data: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          console.log("Sample data loaded:", data);
          
          // Fix the predict method call - TensorSpace expects a direct callback function
          model.predict(data, function (result) {
            console.log("Prediction completed:", result);
          
            // Check if result is a Float32Array or similar
            if (result instanceof Float32Array || Array.isArray(result)) {
              // Map probabilities to labels
              const predictionsWithLabels = Array.from(result)
                .map((value, index) => ({ value, label: outputLabels[index] || `Class ${index}` }))
                .sort((a, b) => b.value - a.value); // Sort by confidence
              
              // Get top prediction for sidebar
              if (predictionsWithLabels.length > 0) {
                const top = predictionsWithLabels[0];
                setTopPrediction({
                  label: top.label,
                  confidence: (top.value).toFixed(2)
                });
              }
              
              // Format top 5 for prediction bar
              const top5 = predictionsWithLabels
                .slice(0, 5) // Get top 5 predictions
                .map(item => `${item.label}: ${(item.value).toFixed(2)}%`) // Format as "Label: Confidence%"
                .join(", ");
          
              setPrediction(`Top 5 predictions: ${top5}`);
            } else {
              setPrediction("Prediction complete! Check visualization.");
            }
          });
          
          // Set animation options separately if needed
          if (model.setAnimationTimeRatio) {
            model.setAnimationTimeRatio(0.8);
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Error fetching sample input:", error);
          setPrediction("Error loading prediction data: " + error.message);
          setLoading(false);
        }
      });

      model.layers.forEach((layer) => {
        // Save the original handleClick function
        const originalHandleClick = layer.handleClick;

        // Extend the handleClick function
        layer.handleClick = function (clickedElement) {
          // Call the original handleClick function with the correct context
          if (originalHandleClick) {
            try {
              originalHandleClick.call(this, clickedElement); // Ensure the correct `this` context
            } catch (error) {
              console.error("Error in original handleClick:", error);
            }
          }

          // Add your custom behavior here
          console.log("Extended Layer clicked:", clickedElement);

          // Example: Update the sidebar with layer details
          handleLayerClick(layer);
        };
      });
    }

    init();
  }, []);

  return (
    <div className="visualizer-container" style={{ 
      position: "relative", 
      width: "100vw", 
      height: "100vh", 
      overflow: "hidden",
      backgroundColor: "#121212",
      fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif"
    }}>
      {/* Main canvas - positioned between sidebars */}
      <div id="container" style={{ 
        width: "100%", 
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        paddingLeft: leftSidebarOpen ? "320px" : "0", // Adjusted for panel width
        paddingRight: sidebarOpen ? "350px" : "0",
        transition: "padding 0.3s ease"
      }}></div>
      
      {/* Left sidebar toggle button */}
      <button 
        onClick={toggleLeftSidebar}
        style={{
          position: "absolute",
          top: "20px",
          left: leftSidebarOpen ? "330px" : "20px", // Adjusted for panel width
          backgroundColor: "rgba(66, 133, 244, 0.9)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          zIndex: 25, // Higher z-index to remain above panel
          transition: "left 0.3s ease",
          fontSize: "20px"
        }}
      >
        {leftSidebarOpen ? "←" : "→"}
      </button>
      
      {/* Right sidebar toggle button */}
      <button 
        onClick={toggleSidebar}
        style={{
          position: "absolute",
          top: "20px",
          right: sidebarOpen ? "350px" : "20px",
          backgroundColor: "rgba(66, 133, 244, 0.9)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          zIndex: 10,
          transition: "right 0.3s ease",
          fontSize: "20px"
        }}
      >
        {sidebarOpen ? "→" : "←"}
      </button>
      
      {/* Use our new EnhancedImagePanel instead of ImageSelectorPanel */}
      <EnhancedImagePanel 
        isOpen={leftSidebarOpen} // Ensure this is true to make the panel visible
        onSelectImage={handleImageSelect} 
      />

      {/* Sidebar Component with top prediction (Right) */}
      <SidebarPanel 
        sidebarOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedLayer={selectedLayer}
        modelRef={modelRef}
        handleLayerClick={handleLayerClick}
        bindLayerClickEvents={bindLayerClickEvents}
        topPrediction={topPrediction}
      />

      {/* Loading overlay */}
      <LoadingOverlay loading={loading} />

      {/* Prediction output bar */}
      <PredictionBar prediction={prediction} />

      {/* Add global styles for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes loadingBar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
          
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(66,133,244,0.5) !important;
          }
          
          button:active {
            transform: translateY(0);
          }
        `
      }} />
    </div>
  );
};

export default TensorSpaceVisualizer;
