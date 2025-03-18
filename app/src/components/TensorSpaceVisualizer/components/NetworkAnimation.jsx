import React, { useState, useEffect, useRef } from 'react';

const NetworkAnimation = ({ 
  modelRef, 
  isVisible, 
  onAnimationComplete,
  getLayerExplanation 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [currentAnimatingLayer, setCurrentAnimatingLayer] = useState(-1);
  const [animationComplete, setAnimationComplete] = useState(false);
  const animationTimeoutRef = useRef(null);
  const originalLayerColors = useRef({});
  
  // Automatically trigger animation when component becomes visible
  useEffect(() => {
    if (isVisible && !isAnimating && !animationComplete && modelRef.current) {
      // Start animation after a short delay when the component becomes visible
      const autoStartTimer = setTimeout(() => {
        animateNetworkProcessing();
      }, 1000);
      
      return () => clearTimeout(autoStartTimer);
    }
  }, [isVisible, modelRef.current]);
  
  // Handle animation speed changes
  useEffect(() => {
    if (modelRef.current && modelRef.current.setAnimationTimeRatio) {
      modelRef.current.setAnimationTimeRatio(animationSpeed);
    }
  }, [animationSpeed, modelRef]);

  // Clean up animation on component unmount
  useEffect(() => {
    return () => {
      clearTimeout(animationTimeoutRef.current);
      
      // Reset any visual effects on unmount
      if (modelRef.current && modelRef.current.layers) {
        resetLayerVisuals();
      }
    };
  }, []);

  // Reset all visual effects on layers
  const resetLayerVisuals = () => {
    if (!modelRef.current || !modelRef.current.layers) return;
    
    // Reset all layer colors
    modelRef.current.layers.forEach((layer, idx) => {
      if (layer.setLayerColor && originalLayerColors.current[idx]) {
        try {
          layer.setLayerColor(originalLayerColors.current[idx]);
        } catch (e) {
          console.warn("Could not reset layer color:", e);
        }
      }
    });
    
    // Reset any visual effects
    const layerElements = document.querySelectorAll(`div[id*="layer_"]`);
    layerElements.forEach(el => {
      if (el && el.style) {
        el.style.boxShadow = "none";
        el.style.transition = "";
        el.classList.remove("layer-animation"); // Changed from "animating-layer" to match CSS
      }
    });
  };

  // Function to handle the layer-by-layer animation
  const animateNetworkProcessing = async () => {
    if (!modelRef.current || !modelRef.current.layers) {
      console.error("Model not initialized for animation");
      return;
    }
    
    // Reset animation state
    clearTimeout(animationTimeoutRef.current);
    setIsAnimating(true);
    setAnimationComplete(false);
    setCurrentAnimatingLayer(-1);
    
    // Save original colors/states if not already saved
    if (Object.keys(originalLayerColors.current).length === 0) {
      modelRef.current.layers.forEach((layer, idx) => {
        if (layer.color) {
          originalLayerColors.current[idx] = layer.color;
        }
      });
    }
    
    // Start animation sequence
    await animateNextLayer(0);
  };

  // Function to animate each layer sequentially
  const animateNextLayer = async (layerIndex) => {
    if (!isAnimating || !modelRef.current || layerIndex >= modelRef.current.layers.length) {
      // Animation complete or stopped
      setIsAnimating(false);
      setAnimationComplete(true);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
      return;
    }

    // Set current layer being animated
    setCurrentAnimatingLayer(layerIndex);
    
    // Get the current layer
    const layer = modelRef.current.layers[layerIndex];
    
    // Highlight the current layer
    if (layer.setLayerColor) {
      try {
        layer.setLayerColor(0x00ffff); // Cyan highlight color
      } catch (e) {
        console.warn("Could not set layer color:", e);
      }
    }
    
    // If layer has an "open" method (for layers that can open/close)
    if (layer.open && typeof layer.open === 'function') {
      try {
        layer.open();
      } catch (e) {
        console.warn("Could not open layer:", e);
      }
    }
    
    // Create a visual effect of data flowing through this layer
    const layerElement = document.querySelector(`div[id*="layer_${layerIndex}"]`);
    if (layerElement) {
      layerElement.style.transition = "all 0.5s ease";
      layerElement.style.boxShadow = "0 0 15px #00ffff";
      layerElement.classList.add("layer-animation"); // Changed from "animating-layer" to match CSS
      
      // Add a pulsing animation to make it more noticeable
      const existingTransform = layerElement.style.transform || '';
      layerElement.style.transform = existingTransform + ' scale(1.05)';
    }

    // Calculate delay based on animation speed (inverse relationship)
    const baseDelay = 2000; // Base delay in milliseconds
    const adjustedDelay = baseDelay / animationSpeed;
    
    // Wait for the delay time
    await new Promise(resolve => {
      animationTimeoutRef.current = setTimeout(() => {
        // Reset layer highlight
        if (layer.setLayerColor && originalLayerColors.current[layerIndex]) {
          try {
            layer.setLayerColor(originalLayerColors.current[layerIndex]);
          } catch (e) {
            console.warn("Could not reset layer color:", e);
          }
        }
        
        // Remove the visual effect
        if (layerElement) {
          layerElement.style.boxShadow = "none";
          layerElement.classList.remove("layer-animation"); // Changed to match the class name
          
          // Reset transform but keep any existing transforms
          const existingTransform = layerElement.style.transform || '';
          layerElement.style.transform = existingTransform.replace(' scale(1.05)', '');
        }
        
        resolve();
      }, adjustedDelay);
    });
    
    // Move to the next layer
    animateNextLayer(layerIndex + 1);
  };

  // Function to stop animation
  const stopAnimation = () => {
    clearTimeout(animationTimeoutRef.current);
    setIsAnimating(false);
    resetLayerVisuals();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Animation controls - floating panel */}
      <div className="network-animation-controls" style={{
        position: "absolute",
        top: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0,0,0,0.8)",
        borderRadius: "50px",
        padding: "12px 25px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        zIndex: 1000, // Ensure high z-index to appear above other elements
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.1)",
        animation: "fadeIn 0.5s ease-out"
      }}>
        {/* Play/Pause button */}
        <button
          onClick={() => {
            if (isAnimating) {
              stopAnimation();
            } else {
              animateNetworkProcessing();
            }
          }}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            outline: "none",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background-color 0.3s, transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          {isAnimating ? "⏸" : "▶️"}
        </button>
        
        {/* Speed control */}
        <div style={{ color: "white", fontSize: "14px", fontWeight: "500" }}>Speed:</div>
        <input 
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
          style={{
            width: "100px",
            accentColor: "#4285f4",
            cursor: "pointer"
          }}
        />
        <div style={{ color: "white", fontSize: "14px", width: "30px" }}>
          {animationSpeed}x
        </div>
        
        {/* Progress indicator */}
        <div style={{ 
          color: "white", 
          fontSize: "14px",
          marginLeft: "10px",
          display: "flex",
          alignItems: "center"
        }}>
          {isAnimating ? (
            <>
              <span 
                style={{ 
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#4CAF50",
                  borderRadius: "50%",
                  marginRight: "8px",
                  animation: "pulse 1s infinite" 
                }} 
              />
              <span>
                Layer {currentAnimatingLayer + 1}/{modelRef.current?.layers?.length || '?'}
              </span>
            </>
          ) : animationComplete ? (
            <>
              <span 
                style={{ 
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#8ab4f8",
                  borderRadius: "50%",
                  marginRight: "8px"
                }} 
              />
              <span>Complete!</span>
            </>
          ) : (
            <>
              <span 
                style={{ 
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#FFC107",
                  borderRadius: "50%",
                  marginRight: "8px"
                }} 
              />
              <span>Ready</span>
            </>
          )}
        </div>
      </div>
      
      {/* Animation progress bar */}
      {isAnimating && modelRef.current && modelRef.current.layers && (
        <div className="network-animation-progress" style={{
          position: "absolute",
          top: "140px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          maxWidth: "800px",
          height: "6px",
          backgroundColor: "rgba(255,255,255,0.2)",
          borderRadius: "3px",
          overflow: "hidden",
          zIndex: 1000,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            height: "100%",
            width: `${((currentAnimatingLayer + 1) / modelRef.current.layers.length) * 100}%`,
            background: "linear-gradient(90deg, #4285f4, #34a853)",
            borderRadius: "3px",
            transition: "width 0.3s ease-out"
          }} />
        </div>
      )}
      
      {/* Layer information tooltip during animation */}
      {isAnimating && currentAnimatingLayer >= 0 && modelRef.current?.layers[currentAnimatingLayer] && (
        <div className="layer-info-tooltip" style={{
          position: "absolute",
          top: "155px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "12px 20px",
          borderRadius: "8px",
          fontSize: "14px",
          zIndex: 1000,
          maxWidth: "80%",
          textAlign: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.1)",
          marginTop: "10px",
          backdropFilter: "blur(5px)",
          animation: "fadeIn 0.3s ease-out"
        }}>
          <strong style={{ fontSize: "16px", color: "#8ab4f8" }}>
            {modelRef.current.layers[currentAnimatingLayer].config?.layerName || `Layer ${currentAnimatingLayer}`}
          </strong>
          <p style={{ 
            margin: "8px 0 0", 
            opacity: 0.9, 
            fontSize: "14px",
            lineHeight: "1.4"
          }}>
            {getLayerExplanation(modelRef.current.layers[currentAnimatingLayer].layerType).split('\n')[0]}
          </p>
        </div>
      )}
      
      {/* Replace styled-jsx with regular style tag */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
            100% { opacity: 0.6; transform: scale(0.8); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px) translateX(-50%); }
            to { opacity: 1; transform: translateY(0) translateX(-50%); }
          }
          
          .layer-animation {
            animation: glow 1.5s infinite alternate;
          }
          
          @keyframes glow {
            from { box-shadow: 0 0 10px rgba(0, 255, 255, 0.6); }
            to { box-shadow: 0 0 20px rgba(0, 255, 255, 0.9); }
          }
          
          .network-animation-controls {
            transition: opacity 0.3s ease;
          }
          
          .network-animation-progress {
            transition: width 0.3s ease-out;
          }
          
          .layer-info-tooltip {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
    </>
  );
};

export default NetworkAnimation;
