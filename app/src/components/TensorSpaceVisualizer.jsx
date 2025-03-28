import React, { useEffect, useState, useRef } from "react";
import * as TSP from "tensorspace";
import EnhancedImagePanel from "./EnhancedImagePanel";
import NetworkAnimation from "./NetworkAnimation";
import LayerSidebar from "./LayerSidebar";
import LoadingOverlay from "./LoadingOverlay";
import PredictionBar from "./PredictionBar";
import "./TensorSpaceVisualizer.css";
import Navigation from "./Navigation";

const TensorSpaceVisualizer = () => {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showAnimationControls, setShowAnimationControls] = useState(false);
  const [animationSpeed] = useState(1);
  const [gradcamImage, setGradcamImage] = useState(null);
  const initCalled = useRef(false);
  const modelRef = useRef(null);
  const outputLabels = window.result || Array.from({ length: 1000 }, (_, i) => `label${i + 1}`);

  // Layer click handler
  const handleLayerClick = (layer) => {
    const layerInfo = {
      name: layer.config?.layerName || "Unknown Layer",
      type: layer.layerType || "Unknown",
      filters: layer.filters || "N/A",
      kernelSize: layer.kernelSize ? `${layer.kernelSize[0]}x${layer.kernelSize[1]}` : "N/A",
      inputShape: layer.inputShape ? layer.inputShape.join(" x ") : "N/A",
      outputShape: layer.outputShape ? layer.outputShape.join(" x ") : "N/A",
      strides: layer.strides ? `${layer.strides[0]}x${layer.strides[1]}` : "N/A",
      activation: layer.config?.activation || "N/A",
      depth: layer.depth || "N/A",
      height: layer.height || "N/A",
      width: layer.width || "N/A",
      originalLayer: layer,
    };
    setSelectedLayer(layerInfo);
    setSidebarOpen(true);
    setActiveTab("details");
  };

  // Bind layer click events
  const bindLayerClickEvents = () => {
    if (!modelRef.current) return;
    setTimeout(() => {
      const container = document.getElementById("container");
      if (!container) return;
      const layerElements = container.querySelectorAll('div[class*="layer"]');
      layerElements.forEach((element, index) => {
        const layerData = modelRef.current.layers[index] || { layerName: `Layer ${index}`, type: "Unknown" };
        element.addEventListener("click", (e) => {
          e.preventDefault();
          handleLayerClick(layerData);
        });
        element.style.cursor = "pointer";
      });
    }, 3000);
  };

  // Check if image exists
  const checkImageExists = async (url) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Handle image selection
  const handleImageSelect = async (image) => {
    if (!modelRef.current) return;
    setLoading(true);
    setPrediction(null);
    setGradcamImage(null);
    setShowAnimationControls(false);

    const gradcamPath = `/assets/data/${image.name}_GC.jpg`;
    const gradcamExists = await checkImageExists(gradcamPath);
    setGradcamImage(gradcamExists ? gradcamPath : null);

    const jsonFilePath = {
      Cat: "/assets/data/cat.json",
      Dog: "/assets/data/dog.json",
      Bird: "/assets/data/bird.json",
      Car: "/assets/data/car.json",
      Coffeepot: "/assets/data/coffeepot.json",
    }[image.name] || "/assets/data/image_topology.json";

    const response = await fetch(jsonFilePath);
    const imageData = await response.json();
    setLoading(false);
    modelRef.current.predict(imageData, (result) => {
      window.currentPredictionResult = result;
      setTimeout(() => setShowAnimationControls(true), 300);
    });
  };

  // Handle animation complete
  const handleAnimationComplete = () => {
    const result = window.currentPredictionResult;
    if (result instanceof Float32Array || Array.isArray(result)) {
      const top5 = Array.from(result)
        .map((value, index) => ({ value, label: outputLabels[index] || `Class ${index}` }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map((item) => `${item.label}: ${(item.value).toFixed(2)}%`)
        .join(", ");
      setPrediction(`Top predictions: ${top5}`);
    } else {
      setPrediction("Prediction complete! Check visualization.");
    }
  };
  const getLayerExplanation = (layerType) => {
    const explanations = {
      'RGBInput': 'Accepts RGB image data as input with three channels (Red, Green, Blue). This is the starting point of the neural network where raw pixel data enters the model.',
      'Conv2d': 'Convolutional 2D layer that applies learnable filters to the input to extract features. These filters scan the input data to detect patterns like edges, textures, or shapes.',
      'DepthwiseConv2d': 'A specialized convolution that processes each input channel separately using a single filter per channel. This reduces computation while still capturing spatial patterns.',
      'GlobalPooling2d': 'Reduces the spatial dimensions by taking the average of all values in each feature map. This converts a 3D tensor to a 1D feature vector suitable for final classification.',
      'Output1d': 'The final layer that outputs the classification predictions. Values represent the probability scores for each possible class.'
    };

    return explanations[layerType] || 'Processes input data through trainable parameters to extract or transform features in the neural network.';
  };
  
  // Removed duplicate declaration of bindLayerClickEvents

  // Initialize TensorSpace model
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
          animationTimeRatio: 1.0, // Default animation speed
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
  
        // Initialize the model and load the default image_topology.json
        model.init(async function () {
          try {
            console.log("Model initialized successfully!");
            
            // Set initial animation speed
            if (model.setAnimationTimeRatio) {
              model.setAnimationTimeRatio(animationSpeed);
            }
            
            // After initialization, bind click events
            bindLayerClickEvents();
            
            // Load default image_topology.json
            try {
              setLoading(true);
              const response = await fetch("/assets/data/image_topology.json");
              if (!response.ok) {
                throw new Error(`Failed to fetch default image data: ${response.status}`);
              }
              const imageData = await response.json();
              
              // Predict with the default image data
              model.predict(imageData, function (result) {
                console.log("Default prediction completed:", result);
              
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
                  setPrediction("Default visualization loaded. Select an image to see different results.");
                }
                setLoading(false);
              });
            } catch (error) {
              console.error("Error loading default image data:", error);
              setPrediction("Error loading default visualization. Please select an image.");
              setLoading(false);
            }
            
            // Set animation options
            if (model.setAnimationTimeRatio) {
              model.setAnimationTimeRatio(0.8);
            }
          } catch (error) {
            console.error("Error during model initialization:", error);
            setPrediction("Error initializing model: " + error.message);
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
      <div className="visualizer-container">
        <Navigation />
        <div
          id="container"
          className={`visualizer-canvas ${leftSidebarOpen ? "left-open" : ""} ${sidebarOpen ? "right-open" : ""}`}
        />
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className={`toggle-button left ${leftSidebarOpen ? "shifted" : ""}`}
        >
          {leftSidebarOpen ? "←" : "→"}
        </button>
        <EnhancedImagePanel
          isOpen={leftSidebarOpen}
          onSelectImage={handleImageSelect}
          gradcamImage={gradcamImage}
          topOffset="60px"
        />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`toggle-button right ${sidebarOpen ? "shifted" : ""}`}
        >
          {sidebarOpen ? "→" : "←"}
        </button>
        <LayerSidebar
  isOpen={sidebarOpen}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  selectedLayer={selectedLayer}
  layers={modelRef.current?.layers || []}
  onLayerSelect={handleLayerClick}
  getLayerExplanation={getLayerExplanation}
  bindLayerClickEvents={bindLayerClickEvents}
/>
        <LoadingOverlay isLoading={loading} />
        <PredictionBar prediction={prediction} />
        <NetworkAnimation
          key={showAnimationControls ? "visible" : "hidden"}
          modelRef={modelRef}
          isVisible={showAnimationControls}
          onAnimationComplete={handleAnimationComplete}
          getLayerExplanation={(layerType) => "Explanation for " + layerType}
          animationSpeed={animationSpeed}
        />
      </div>
    );
  };

export default TensorSpaceVisualizer;