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

  const DEBUG = true;

  const debugLog = (message, data = null) => {
    if (DEBUG) {
      console.log(`[NetworkAnimation] ${message}`, data || '');
    }
  };

  const validateModel = (model) => {
    if (!model) {
      debugLog('Model is null or undefined');
      return false;
    }

    // Check if layers exist and have required properties
    if (!model.layers || !Array.isArray(model.layers)) {
      debugLog('Model layers are missing or not an array');
      return false;
    }

    // Log model properties for debugging
    debugLog('Model properties:', Object.keys(model));
    debugLog('First layer properties:', Object.keys(model.layers[0] || {}));

    return true; // Remove strict validation temporarily for debugging
  };
  
  // Automatically trigger animation when component becomes visible
  useEffect(() => {
    if (isVisible && !isAnimating && !animationComplete && modelRef.current) {
      if (!validateModel(modelRef.current)) {
        console.error('Invalid model configuration');
        return;
      }
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

  // Update model animation speed
  useEffect(() => {
    if (modelRef.current?.setAnimationTimeRatio) {
      const ratio = Math.min(Math.max(animationSpeed, 0.5), 3.0);
      modelRef.current.setAnimationTimeRatio(ratio);
    }
  }, [animationSpeed, modelRef.current]);

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
    if (!modelRef.current?.isInitialized) {
      debugLog('Model not initialized');
      return;
    }
  
    try {
      setIsAnimating(true);
      setAnimationComplete(false);
      setCurrentAnimatingLayer(-1);
  
      // Reset any previous animations
      resetLayerVisuals();
  
      // Wait for TensorSpace to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
  
      for (let i = 0; i < modelRef.current.layers.length; i++) {
        if (!isAnimating) break;
        
        setCurrentAnimatingLayer(i);
        await handleLayerAnimation(modelRef.current.layers[i], i);
        
        if (i < modelRef.current.layers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, calculateAnimationDelay(animationSpeed)));
        }
      }
  
      setAnimationComplete(true);
      setIsAnimating(false);
      onAnimationComplete?.();
    } catch (error) {
      debugLog('Animation error:', error);
      stopAnimation();
    }
  };

  // Function to animate each layer sequentially
  const animateNextLayer = async (layerIndex) => {
    debugLog(`Animating layer ${layerIndex}`);

    if (!isAnimating) {
      debugLog('Animation stopped');
      return;
    }
  
    if (!modelRef.current) {
      debugLog('No model reference');
      return;
    }
  
    if (layerIndex >= modelRef.current.layers.length) {
      debugLog('Animation complete');
      setIsAnimating(false);
      setAnimationComplete(true);
      onAnimationComplete?.();
      return;
    }
  
    try {
      const layer = modelRef.current.layers[layerIndex];
      debugLog('Current layer:', {
        index: layerIndex,
        name: layer.config?.layerName,
        type: layer.layerType
      });
  
      setCurrentAnimatingLayer(layerIndex);
      await handleLayerAnimation(layer, layerIndex);
  
      const delay = calculateAnimationDelay(animationSpeed);
      debugLog(`Waiting ${delay}ms before next layer`);
  
      return new Promise(resolve => {
        animationTimeoutRef.current = setTimeout(async () => {
          await resetLayer(layer, layerIndex);
          await animateNextLayer(layerIndex + 1);
          resolve();
        }, delay);
      });
    } catch (error) {
      debugLog('Error in animation:', error);
      stopAnimation();
    }
  };

  // Function to stop animation
  const stopAnimation = () => {
    clearTimeout(animationTimeoutRef.current);
    setIsAnimating(false);
    resetLayerVisuals();
  };

  const handleLayerAnimation = async (layer, index) => {
    debugLog(`Animating layer ${index}`, layer);

    if (!layer) return;

    try {
      // Store original properties
      originalLayerColors.current[index] = {
        color: layer.color,
        opacity: layer.minOpacity
      };

      // Initial delay before animation starts
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Handle TensorSpace specific methods
      if (layer.handleClick) {
        debugLog('Triggering layer click');
        await layer.handleClick();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Try to open layer if possible
      if (layer.openLayer && !layer.isOpen) {
        debugLog('Opening layer');
        await layer.openLayer();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Highlight layer using available properties
      try {
        // Try different methods to highlight the layer
        if (layer.neuralGroup) {
          debugLog('Highlighting neural group');
          layer.neuralGroup.children.forEach(child => {
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.opacity = 1;
                  mat.emissive = new THREE.Color(0x00ffff);
                  mat.emissiveIntensity = 0.5;
                });
              } else {
                child.material.opacity = 1;
                child.material.emissive = new THREE.Color(0x00ffff);
                child.material.emissiveIntensity = 0.5;
              }
            }
          });
        }

        // Set layer properties if available
        if (layer.isEmissive !== undefined) {
          layer.isEmissive = true;
        }
        
        if (layer.minOpacity !== undefined) {
          layer.minOpacity = 1;
        }
      } catch (error) {
        debugLog('Layer highlight error:', error);
      }

      // Wait for main animation delay
      await new Promise(resolve => setTimeout(resolve, calculateAnimationDelay(animationSpeed)));
    } catch (error) {
      debugLog('Layer animation error:', error);
    }
  };

  // Add to NetworkAnimation component
  const calculateAnimationDelay = (speed) => {
    const baseDelay = 10000; // Increased from 2000 to 10000ms (10 seconds)
    const minDelay = 2000;   // Increased minimum delay to 2 seconds
    return Math.max(baseDelay / speed, minDelay);
  };

  const resetLayer = (layer, index) => {
    try {
      const originalProps = originalLayerColors.current[index];
      if (!originalProps) return;

      // Reset layer properties
      if (layer.neuralGroup) {
        layer.neuralGroup.children.forEach(child => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.opacity = originalProps.opacity || 0.7;
                mat.emissive = new THREE.Color(0x000000);
                mat.emissiveIntensity = 0;
              });
            } else {
              child.material.opacity = originalProps.opacity || 0.7;
              child.material.emissive = new THREE.Color(0x000000);
              child.material.emissiveIntensity = 0;
            }
          }
        });
      }

      // Reset emissive property
      if (layer.isEmissive !== undefined) {
        layer.isEmissive = false;
      }

      // Reset opacity
      if (layer.minOpacity !== undefined) {
        layer.minOpacity = originalProps.opacity || 0.7;
      }

    } catch (error) {
      debugLog('Layer reset error:', error);
    }
  };

  const applyVisualEffects = (element) => {
    if (!element) return;
    
    element.style.transition = "all 0.5s ease";
    element.classList.add("layer-animation");
    
    // Store original transform
    const originalTransform = element.style.transform || '';
    element.dataset.originalTransform = originalTransform;
    
    // Apply new transform
    element.style.transform = `${originalTransform} scale(1.05)`;
  };
  
  const removeVisualEffects = (element) => {
    if (!element) return;
    
    element.classList.remove("layer-animation");
    
    // Restore original transform
    if (element.dataset.originalTransform) {
      element.style.transform = element.dataset.originalTransform;
      delete element.dataset.originalTransform;
    }
    
    element.style.transition = "";
  };

  const checkDOMElements = () => {
    debugLog('Checking DOM elements');
    
    // Check container
    const container = document.getElementById('container');
    if (!container) {
      debugLog('Container element missing');
      return false;
    }
  
    // Wait for layer elements to be created
    const waitForLayers = () => {
      return new Promise((resolve) => {
        const checkElements = () => {
          const layerElements = container.querySelectorAll('[class*="layer"]');
          if (layerElements.length > 0) {
            debugLog(`Found ${layerElements.length} layer elements`);
            resolve(true);
          } else {
            setTimeout(checkElements, 100);
          }
        };
        checkElements();
      });
    };
  
    return waitForLayers();
  };

  const findLayerElement = (layerIndex) => {
    // Try multiple ways to find the layer element
    const selectors = [
      `[data-layer-index="${layerIndex}"]`,
      `[class*="layer"][data-index="${layerIndex}"]`,
      `.layer-${layerIndex}`,
      `div[id*="layer_${layerIndex}"]`,
      // TensorSpace specific selectors
      `[class*="mesh-${layerIndex}"]`,
      `[class*="aggregation-${layerIndex}"]`,
      `[class*="neural-${layerIndex}"]`
    ];
  
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    
    // Fallback: try to find by layer type
    const layer = modelRef.current?.layers[layerIndex];
    if (layer?.layerType) {
      return document.querySelector(`[class*="${layer.layerType.toLowerCase()}"]`);
    }
    
    return null;
  };

  useEffect(() => {
    debugLog('Model Reference Changed:', {
      hasModel: !!modelRef.current,
      layerCount: modelRef.current?.layers?.length,
      layers: modelRef.current?.layers?.map(l => ({
        name: l.config?.layerName,
        type: l.layerType,
        hasColor: !!l.setLayerColor,
        canOpen: !!l.openLayer
      }))
    });
  }, [modelRef.current]);

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
          min="0.1"    // Changed from 0.5 to 0.1 for slower speeds
          max="2.0"    // Reduced from 3.0 to 2.0
          step="0.1"   // Smaller steps for finer control
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
          maxWidth: "800px",
          height: "6px",
          background: "linear-gradient(90deg, #4285f4, #34a853)",
          borderRadius: "3px",
          transition: "width 0.3s ease-out"
        }} />
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

// Debug commands to run in browser console
window.debugNetwork = {
  getModelInfo: () => {
    const model = document.querySelector('#root')?.__reactFiber$?.child?.child?.child?.memoizedProps?.modelRef?.current;
    console.log('Model:', model);
    console.log('Layers:', model?.layers);
  },
  checkLayers: () => {
    const elements = document.querySelectorAll('div[id*="layer_"]');
    console.log('Layer elements:', elements);
  },
  inspectLayer: (index) => {
    const layer = modelRef.current?.layers[index];
    console.log('Layer:', layer);
    console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(layer)));
    console.log('Element:', findLayerElement(index));
  },
  checkLayerProperties: (index) => {
    const layer = modelRef.current?.layers[index];
    if (!layer) return console.log('Layer not found');
    
    console.log('Layer Properties:', {
      hasNeuralGroup: !!layer.neuralGroup,
      childCount: layer.neuralGroup?.children?.length,
      hasMaterial: layer.neuralGroup?.children[0]?.material,
      isEmissive: layer.isEmissive,
      minOpacity: layer.minOpacity,
      color: layer.color,
      type: layer.layerType,
      name: layer.config?.layerName
    });
    
    // Log first child's material properties
    const firstChild = layer.neuralGroup?.children[0];
    if (firstChild?.material) {
      console.log('Material properties:', 
        Array.isArray(firstChild.material) 
          ? firstChild.material[0] 
          : firstChild.material
      );
    }
  }
};

export default NetworkAnimation;
