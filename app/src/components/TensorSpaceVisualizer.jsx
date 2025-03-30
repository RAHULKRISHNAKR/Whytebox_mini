import React, { useEffect, useState, useRef } from "react";
import * as TSP from "tensorspace";
import * as tf from "@tensorflow/tfjs"; // Import TensorFlow.js for softmax
import EnhancedImagePanel from "./EnhancedImagePanel";
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
  const [gradcamImage, setGradcamImage] = useState(null);
  const initCalled = useRef(false);
  const modelRef = useRef(null);
  const outputLabels = Array.isArray(window.result) ? 
    window.result : 
    Array.from({ length: 1000 }, (_, i) => `Class ${i + 1}`);
  
  useEffect(() => {
    if (!window.result) {
      console.warn('ImageNet labels not loaded, using fallback class names');
    }
  }, []);

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

    // Check for GradCAM image availability
    let gradcamPath;
    if (image.isUploaded) {
      // For uploaded images, there might not be a GradCAM yet
      gradcamPath = null;
    } else {
      // For sample images, look for the GradCAM image
      gradcamPath = `/assets/data/${image.name.toLowerCase()}_GC.jpg`;
      const gradcamExists = await checkImageExists(gradcamPath);
      gradcamPath = gradcamExists ? gradcamPath : null;
    }
    setGradcamImage(gradcamPath);

    // Determine JSON file path
    let jsonFilePath;
    if (image.jsonPath) {
      // Use the provided JSON path if available (from uploaded images)
      jsonFilePath = image.jsonPath;
    } else {
      // For sample images, use the predefined paths
      jsonFilePath = {
        Cat: "/assets/data/cat.json",
        Dog: "/assets/data/dog.json",
        Bird: "/assets/data/bird.json",
        Car: "/assets/data/car.json",
        Goldfish: "/assets/data/goldfish.json",
      }[image.name] || "/assets/data/image_topology.json";
    }

    try {
      const response = await fetch(jsonFilePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch image data: ${response.status}`);
      }
      const imageData = await response.json();
      
      // Execute prediction
      modelRef.current.predict(imageData, (result) => {
        // Process prediction results directly
        if (result instanceof Float32Array || Array.isArray(result)) {
          const top5 = Array.from(result)
            .map((value, index) => ({ value, label: outputLabels[index] || `Class ${index}` }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .map((item) => `${item.label}: ${(item.value).toFixed(2)}%`) // Convert to percentage
            .join(", ");
          setPrediction(`Top predictions: ${top5}`);
        } else {
          setPrediction("Prediction complete! Check visualization.");
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching or processing image data:", error);
      setPrediction("Error processing image. Please try another one.");
      setLoading(false);
    }
  };

  const getLayerExplanation = (layerType) => {
    switch (layerType) {
      case "RGBInput":
        return "This layer represents the input RGB image with dimensions 224x224x3.";
      case "Conv2d":
        return "This is a 2D convolutional layer, which applies convolution operations to the input.";
      case "DepthwiseConv2d":
        return "This is a depthwise convolutional layer, which applies depthwise convolution operations.";
      case "GlobalPooling2d":
        return "This layer performs global pooling, reducing the spatial dimensions to a single value.";
      case "Output1d":
        return "This layer represents the output of the model, typically used for classification.";
      default:
        return "No explanation available for this layer type.";
    }
  };

  // Initialize TensorSpace model
  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;

    async function init() {
      const container = document.getElementById("container");
      if (!container) {
        console.error("Container element not found.");
        return;
      }

      try {
        // Clear any existing model
        if (modelRef.current && typeof modelRef.current.dispose === "function") {
          modelRef.current.dispose();
          modelRef.current = null;
        }

        // Initialize with unique scope name
        let model = new TSP.models.Sequential(container, { 
          stats: true,
          animationTimeRatio: 1.0,
          layerClick: handleLayerClick,
          onClick: handleLayerClick,
          scope: 'mobilenet_' + Date.now() // Add unique scope
        });
        
        modelRef.current = model;

        // Add layers to the model
        model.add(new TSP.layers.RGBInput({ 
          layerName: "RGB Input",
          tooltip: "Input: 224x224x3 RGB Image"
        }));
        
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
              model.setAnimationTimeRatio(0.8);
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

                // Process prediction results
                if (result instanceof Float32Array || Array.isArray(result)) {
                  const top5 = Array.from(result)
                    .map((value, index) => ({ value, label: outputLabels[index] || `Class ${index}` }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5)
                    .map(item => `${item.label}: ${(item.value).toFixed(2)}%`)
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
          } catch (error) {
            console.error("Error during model initialization:", error);
            setPrediction("Error initializing model: " + error.message);
            setLoading(false);
          }
        });
    
        // Handle layer click events
        model.layers.forEach((layer) => {
          const originalHandleClick = layer.handleClick;
          layer.handleClick = function (clickedElement) {
            if (originalHandleClick) {
              try {
                originalHandleClick.call(this, clickedElement);
              } catch (error) {
                console.error("Error in original handleClick:", error);
              }
            }
            console.log("Layer clicked:", this);
            handleLayerClick(layer);
          };
        });
      } catch (error) {
        console.error("Model initialization error:", error);
        setLoading(false);
      }
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
    </div>
  );
};

export default TensorSpaceVisualizer;