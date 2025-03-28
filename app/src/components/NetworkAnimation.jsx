import React, { useState, useEffect, useRef } from 'react';
import './NetworkAnimation.css';

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
      <div className="network-animation-controls">
        <button
          onClick={() => {
            if (isAnimating) stopAnimation();
            else animateNetworkProcessing();
          }}
          className="network-animation__button"
        >
          {isAnimating ? "⏸" : "▶️"}
        </button>
        
        <div>Speed:</div>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={animationSpeed}
          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
        />
        <div>{animationSpeed}x</div>
        
        <div>
          {isAnimating ? (
            <>
              <span className="pulse-indicator"></span>
              <span>Layer {currentAnimatingLayer + 1}/{modelRef.current?.layers?.length || '?'}</span>
            </>
          ) : animationComplete ? (
            <>Complete!</>
          ) : (
            <>Ready</>
          )}
        </div>
      </div>
      
      {isAnimating && modelRef.current && modelRef.current.layers && (
        <div className="network-animation-progress" />
      )}
      
      {isAnimating && currentAnimatingLayer >= 0 && modelRef.current?.layers[currentAnimatingLayer] && (
        <div className="layer-info-tooltip">
          <strong>{modelRef.current.layers[currentAnimatingLayer].config?.layerName || `Layer ${currentAnimatingLayer}`}</strong>
          <p>{getLayerExplanation(modelRef.current.layers[currentAnimatingLayer].layerType).split('\n')[0]}</p>
        </div>
      )}
    </>
  );
};

export default NetworkAnimation;