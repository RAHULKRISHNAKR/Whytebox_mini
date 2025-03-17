import React, { useEffect, useState, useRef } from "react";
import * as TSP from "tensorspace";
import EnhancedImagePanel from "./EnhancedImagePanel"; // Import the component

const TensorSpaceVisualizer = () => {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true); // Add left sidebar state
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

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    console.log("Sidebar state:", !sidebarOpen);
  };

  // Handle image selection from the panel
  const handleImageSelect = async (image, imageData) => {
    console.log("Selected image:", image.name, "with data:", imageData);
    
    if (!modelRef.current) {
      console.error("Model not initialized yet");
      return;
    }
    
    try {
      setLoading(true); // Show loading indicator
      
      // Predict with the selected image data
      modelRef.current.predict(imageData, function (result) {
        console.log("Prediction with new image completed:", result);
      
        // Check if result is a Float32Array or similar
        if (result instanceof Float32Array || Array.isArray(result)) {
          // Map probabilities to labels
          const top5 = Array.from(result)
            .map((value, index) => ({ value, label: outputLabels[index] || `Class ${index}` }))
            .sort((a, b) => b.value - a.value) // Sort by confidence
            .slice(0, 5) // Get top 5 predictions
            .map(item => `${item.label}: ${(item.value).toFixed(2)}%`) // Format as "Label: Confidence%"
            .join(", ");
      
          setPrediction(`Top predictions: ${top5}`);
        } else {
          setPrediction("Prediction complete! Check visualization.");
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Error predicting with selected image:", error);
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
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-1",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-1",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-2",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-2",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-3",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-3",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-4",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-4",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({ 
        initStatus: "open",
        layerName: "DW-Conv2D-5",
        tooltip: "Depthwise Convolution - Expanded View"
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-5",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-6",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-6",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-7",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-7",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-8",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-8",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-9",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-9",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-10",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-10",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-11",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-11",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-12",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-12",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.DepthwiseConv2d({
        layerName: "DW-Conv2D-13",
        tooltip: "Depthwise Convolution",
      }));
      
      model.add(new TSP.layers.Conv2d({
        layerName: "PW-Conv2D-13",
        tooltip: "Pointwise Convolution",
      }));
      
      model.add(new TSP.layers.GlobalPooling2d({
        layerName: "Global Pooling",
        tooltip: "Average Pooling across spatial dimensions"
      }));

      // Use the external "result" variable as outputs
      model.add(
        new TSP.layers.Output1d({
          layerName: "Classification Output",
          tooltip: "1000 ImageNet Classes",
          paging: true,
          segmentLength: 200,
          outputs: outputLabels, 
        })
      );

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
          
          // Fix the predict method call - TensorSpace expects a direct callback function,
          // not an object with successCallback
          model.predict(data, function (result) {
            console.log("Prediction completed:", result);
          
            // Check if result is a Float32Array or similar
            if (result instanceof Float32Array || Array.isArray(result)) {
              // Map probabilities to labels
              const top5 = Array.from(result)
                .map((value, index) => ({ value, label: outputLabels[index] || `Class ${index}` }))
                .sort((a, b) => b.value - a.value) // Sort by confidence
                .slice(0, 5) // Get top 5 predictions
                .map(item => `${item.label}: ${(item.value).toFixed(2)}%`) // Format as "Label: Confidence%"
                .join(", ");
          
              setPrediction(`Top predictions: ${top5}`);
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
        <div
          key={index}
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
    });
  };

  return (
    <div className="visualizer-container" style={{ 
      position: "relative", 
      width: "100vw", 
      height: "100vh", 
      overflow: "hidden",
      backgroundColor: "#121212",
      fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif"
    }}>
      {/* Main canvas - adjust width to accommodate left sidebar when open */}
      <div id="container" style={{ 
        width: "100%", 
        height: "100%",
        position: "absolute",
        top: 0,
        left: leftSidebarOpen ? "350px" : 0,
        transition: "left 0.3s ease",
        right: sidebarOpen ? "350px" : 0,
      }}></div>
      
      {/* Left sidebar toggle button */}
      <button 
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        style={{
          position: "absolute",
          top: "20px",
          left: leftSidebarOpen ? "370px" : "20px",
          backgroundColor: "rgba(76, 175, 80, 0.9)",
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
          transition: "left 0.3s ease",
          fontSize: "20px"
        }}
      >
        {leftSidebarOpen ? "←" : "→"}
      </button>
      
      {/* EnhancedImagePanel as left sidebar */}
      <EnhancedImagePanel 
        isOpen={leftSidebarOpen} 
        onSelectImage={handleImageSelect} 
      />
      
      {/* Toggle right sidebar button */}
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
      
      {/* Consolidated sidebar with tabs */}
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
          height: "calc(100% - 50px)" // Adjust for tab height
        }}>
          {/* Details Tab */}
          {activeTab === 'details' && (
            <>
              <h3 style={{ 
                marginTop: 0, 
                borderBottom: "2px solid #4285f4", 
                paddingBottom: "10px",
                color: "#202124",
                fontWeight: "500"
              }}>
                Layer Information {selectedLayer && `- ${selectedLayer.name}`}
              </h3>
              
              {selectedLayer ? (
                <div>
                  <div style={{ 
                    marginBottom: "15px", 
                    backgroundColor: "rgba(66, 133, 244, 0.1)",
                    padding: "15px",
                    borderRadius: "10px"
                  }}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#202124" }}>{selectedLayer.name}</h4>
                    <span style={{ 
                      backgroundColor: "#4285f4", 
                      padding: "5px 10px", 
                      borderRadius: "15px", 
                      fontSize: "0.8em",
                      color: "white",
                      display: "inline-block"
                    }}>
                      {selectedLayer.type}
                    </span>
                  </div>
                  
                  <div style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    padding: "15px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                  }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {selectedLayer.filters !== "N/A" && (
                          <tr>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Filters:</td>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.filters}</td>
                          </tr>
                        )}
                        {selectedLayer.kernelSize !== "N/A" && (
                          <tr>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Kernel Size:</td>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.kernelSize}</td>
                          </tr>
                        )}
                        {selectedLayer.outputShape !== "N/A" && (
                          <tr>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Output Shape:</td>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.outputShape}</td>
                          </tr>
                        )}
                        {selectedLayer.strides !== "N/A" && (
                          <tr>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Stride:</td>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.strides}</td>
                          </tr>
                        )}
                        {selectedLayer.activation !== "N/A" && (
                          <tr>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Activation:</td>
                            <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.activation}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div style={{ marginTop: "20px", fontSize: "0.9em", color: "#5f6368", textAlign: "center" }}>
                    <button 
                      onClick={bindLayerClickEvents}
                      style={{
                        padding: "10px 15px",
                        backgroundColor: "#4285f4",
                        color: "white",
                        border: "none",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontSize: "0.9em",
                        marginTop: "10px",
                        boxShadow: "0 2px 5px rgba(66,133,244,0.3)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      Refresh Layer Interactions
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  color: "#5f6368", 
                  fontSize: "0.9em", 
                  textAlign: "center",
                  marginTop: "30px"
                }}>
                  <div style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 20px auto",
                    borderRadius: "50%",
                    backgroundColor: "rgba(66,133,244,0.1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: "40px", color: "#4285f4" }}>?</span>
                  </div>
                  <p>Select a layer from the visualization to view its details.</p>
                  <p>Explore the neural network architecture by interacting with the 3D visualization.</p>
                  <button 
                    onClick={bindLayerClickEvents}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#4285f4",
                      color: "white",
                      border: "none",
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontSize: "0.9em",
                      marginTop: "20px",
                      boxShadow: "0 2px 5px rgba(66,133,244,0.3)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Enable Layer Interactions
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* List Tab */}
          {activeTab === 'list' && (
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
          )}
        </div>
      </div>

      {/* Loading overlay - improved */}
      {loading && (
        <div
          id="loadingPad"
          style={{
            position: "fixed",
            height: "100%",
            width: "100%",
            top: 0,
            left: 0,
            backgroundColor: "rgba(3, 29, 50, 0.95)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              id="loading"
              src="/assets/loading.gif"
              alt="Loading..."
              style={{ width: "200px", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}
            />
            <div style={{
              position: "absolute",
              bottom: "-20px",
              left: "0",
              right: "0",
              height: "4px",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "2px",
              overflow: "hidden"
            }}>
              <div style={{
                height: "100%",
                width: "30%",
                backgroundColor: "#4285f4",
                borderRadius: "2px",
                animation: "loadingBar 1.5s infinite ease-in-out"
              }}></div>
            </div>
          </div>
          <p style={{ 
            color: "white", 
            marginTop: "40px",
            letterSpacing: "1px",
            fontSize: "16px"
          }}>
            Initializing neural network visualization...
          </p>
        </div>
      )}

      {/* Improved prediction output bar */}
      <div 
        style={{ 
          position: "fixed", 
          bottom: "20px", 
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "80%",
          width: "auto",
          backgroundColor: "rgba(0,0,0,0.7)", 
          color: "white", 
          padding: "15px 25px",
          textAlign: "center",
          zIndex: 10,
          borderRadius: "30px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)",
          display: prediction ? "block" : "none"
        }}>
        <p style={{ margin: 0, fontSize: "1em", fontWeight: "300" }}>{prediction}</p>
      </div>

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
