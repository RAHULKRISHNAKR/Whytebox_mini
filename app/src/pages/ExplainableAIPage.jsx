import React, { useState, useEffect, useRef } from 'react';
import * as tf from "@tensorflow/tfjs";
import Navigation from '../components/Navigation';
import ExplainableAIService from '../services/ExplainableAIService';
import ExplainableAIGuide from '../components/ExplainableAIGuide';
import './ExplainableAIPage.css';

function ExplainableAIPage() {
  // Basic state
  const [activeMethod, setActiveMethod] = useState('gradcam');
  const [loading, setLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Additional state for enhanced functionality
  const [selectedImage, setSelectedImage] = useState('cat');
  const [selectedClass, setSelectedClass] = useState('');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonMethod, setComparisonMethod] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [visualizationResults, setVisualizationResults] = useState({
    gradcam: null,
    saliency: null,
    integrated: null,
    lime: null,
    shap: null
  });
  
  // Reference to store loaded image elements
  const imageElements = useRef({});
  
  // Record processing times for method comparison
  const [processingTimes, setProcessingTimes] = useState({
    gradcam: null,
    saliency: null,
    integrated: null,
    lime: null,
    shap: null
  });
  
  // Model classes (simplified for demo)
  const [availableClasses, setAvailableClasses] = useState([
    { id: 'cat', label: 'Cat' },
    { id: 'dog', label: 'Dog' },
    { id: 'bird', label: 'Bird' },
    { id: 'car', label: 'Car' }
  ]);
  
  // Sample images from TensorSpace model
  const images = [
    { id: 'cat', name: 'Cat', path: '/assets/data/cat.jpg' },
    { id: 'dog', name: 'Dog', path: '/assets/data/dog.jpg' },
    { id: 'bird', name: 'Bird', path: '/assets/data/bird.png' },
    { id: 'car', name: 'Car', path: '/assets/data/car1.png' }
  ];
  
  // Add new state for custom image upload
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Load model and preload images when component mounts
  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);

        // Load model
        const success = await ExplainableAIService.loadModel('/assets/models/mobilenetv1/model.json');
        setModelLoaded(success);

        // Preload images (existing logic)
        for (const img of images) {
          const imageElement = new Image();
          imageElement.crossOrigin = "anonymous";
          imageElement.src = img.path;

          await new Promise((resolve) => {
            imageElement.onload = resolve;
            imageElement.onerror = () => {
              console.error(`Failed to load image: ${img.path}`);
              resolve();
            };
          });

          imageElements.current[img.id] = imageElement;
        }
      } catch (error) {
        console.error("Error initializing:", error);
      } finally {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      // Clear TensorFlow.js backend to avoid duplicate variable registration
      tf.disposeVariables();
      tf.engine().reset();
      console.log("ExplainableAIPage unmounted. TensorFlow.js backend reset.");
    };
  }, []);
  
  // Handler for image selection
  const handleImageSelect = (e) => {
    setSelectedImage(e.target.value);
    // Reset visualizations when image changes
    setVisualizationResults({
      gradcam: null,
      saliency: null,
      integrated: null,
      lime: null,
      shap: null
    });
    // Reset processing times too
    setProcessingTimes({
      gradcam: null,
      saliency: null,
      integrated: null,
      lime: null,
      shap: null
    });
  };
  
  // Handler for class selection
  const handleClassSelect = (e) => {
    setSelectedClass(e.target.value);
  };
  
  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage({
        file,
        preview: reader.result,
        id: 'custom',  // Use 'custom' as the ID for uploaded images
        name: file.name,
        path: reader.result,  // Store the data URL as the path for preview
      });
      
      // Automatically select the custom image
      setSelectedImage('custom');
      
      // Reset visualizations when a new image is uploaded
      setVisualizationResults({
        gradcam: null,
        saliency: null,
        integrated: null,
        lime: null,
        shap: null
      });
      
      setProcessingTimes({
        gradcam: null,
        saliency: null,
        integrated: null,
        lime: null,
        shap: null
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Generate visualization based on selected method and image
  const handleGenerateVisualization = async () => {
    if (!modelLoaded) return;
    
    setLoading(true);
    
    try {
      // For uploaded custom image, process through the API
      if (selectedImage === 'custom' && uploadedImage) {
        setIsUploading(true);
        setUploadStatus('Uploading image and generating explanations...');
        
        const startTime = performance.now();
        
        // Create base64 representation of the image for the explainable AI endpoint
        const reader = new FileReader();
        const imagePromise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(uploadedImage.file);
        });
        
        const imageBase64 = await imagePromise;
        
        // Update server endpoint to ensure correctness
        const serverEndpoint = 'http://localhost:3001/api/explainable-ai';
        // Send the image to the API endpoint
        const response = await fetch(serverEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageBase64,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to process image');
        }
        
        const data = await response.json();
        console.log("API response:", data); // Log the response for debugging
        
        const endTime = performance.now();
        const processingTime = (endTime - startTime).toFixed(2);
        
        // Update the image ID to match what the server returned
        setUploadedImage(prev => ({
          ...prev,
          id: data.imageId
        }));
        
        // Update processing times and visualization results for all methods
        const newProcessingTimes = { ...processingTimes };
        const newVisualizationResults = { ...visualizationResults };
        
        // Add safety check for explanations object
        if (data.explanations && typeof data.explanations === 'object') {
          Object.entries(data.explanations).forEach(([method, path]) => {
            console.log(`Setting visualization for ${method}: ${path}`);
            // Ensure the path starts with a leading slash if needed
            const fixedPath = path.startsWith('/') ? path : `/${path}`;
            newProcessingTimes[method] = processingTime;
            newVisualizationResults[method] = fixedPath;
          });
        } else {
          console.warn('No explanations returned from the API', data);
          throw new Error('No explanations generated. Please try a different image.');
        }
        
        setProcessingTimes(newProcessingTimes);
        setVisualizationResults(newVisualizationResults);
        
        setUploadStatus('Explanations generated successfully!');
        console.log(`Generated explanations for custom image in ${processingTime}ms`);
        
        // Set the active method to one that was successfully generated (if current one wasn't)
        if (!newVisualizationResults[activeMethod]) {
          const generatedMethod = Object.keys(data.explanations)[0];
          if (generatedMethod) {
            setActiveMethod(generatedMethod);
            console.log(`Switching to method ${generatedMethod} which was successfully generated`);
          }
        }
      } 
      // For pre-existing images, use the pre-generated explanations
      else {
        const startTime = performance.now();
        
        // Generate path to pre-generated image
        const methodAbbr = getMethodAbbreviation(activeMethod);
        const imagePath = `/assets/images/explanations/${selectedImage}_${methodAbbr}.jpg`;

        // Verify the image path exists
        fetch(imagePath)
          .then(response => {
            if (!response.ok) {
              console.error(`Image not found at path: ${imagePath}`);
              throw new Error('Image not found');
            }
          })
          .catch(err => {
            console.error(`Error verifying image path: ${imagePath}`, err);
          });

        // Simulate processing delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const endTime = performance.now();
        const processingTime = (endTime - startTime).toFixed(2);
        
        // Update processing time and visualization result
        setProcessingTimes(prev => ({
          ...prev,
          [activeMethod]: processingTime
        }));
        
        setVisualizationResults(prev => ({
          ...prev,
          [activeMethod]: imagePath
        }));
        
        console.log(`Loaded ${activeMethod} visualization in ${processingTime}ms`);
      }
    } catch (error) {
      console.error("Error processing visualization:", error);
      setUploadStatus(`Error: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };
  
  // Helper function to get method abbreviation
  const getMethodAbbreviation = (method) => {
    const abbreviations = {
      'gradcam': 'gr',
      'saliency': 'sa',
      'integrated': 'in',
      'lime': 'li',
      'shap': 'sh'
    };
    return abbreviations[method] || method.substring(0, 2);
  };
  
  // Toggle comparison mode
  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    
    // If enabling comparison mode, set the comparison method to the current non-active method
    if (!comparisonMode) {
      const methods = ['gradcam', 'saliency', 'integrated', 'lime', 'shap'];
      const availableMethods = methods.filter(m => m !== activeMethod && visualizationResults[m] !== null);
      if (availableMethods.length > 0) {
        setComparisonMethod(availableMethods[0]);
      } else {
        // If no other method has been generated, select first available
        const firstAvailable = methods.find(m => m !== activeMethod);
        setComparisonMethod(firstAvailable);
      }
    } else {
      setComparisonMethod('');
    }
  };
  
  // Clear all visualizations
  const clearVisualizations = () => {
    setVisualizationResults({
      gradcam: null,
      saliency: null,
      integrated: null,
      lime: null,
      shap: null
    });
    setProcessingTimes({
      gradcam: null,
      saliency: null,
      integrated: null,
      lime: null,
      shap: null
    });
  };
  
  // Helper function to debug image loading issues
  const handleImageError = (method, path) => {
    console.error(`Failed to load ${method} image from path: ${path}`);
    console.error(`Full URL would be: ${window.location.origin}${path}`);
    
    // Try to fetch the image directly to check response
    fetch(path)
      .then(response => {
        console.log(`Fetch response for ${path}:`, response.status, response.ok ? 'OK' : 'Failed');
      })
      .catch(err => {
        console.error(`Fetch error for ${path}:`, err);
      });
      
    return `/assets/images/error-placeholder.jpg`;
  };

  return (
    <div className="explainable-ai-container">
      <Navigation />
      
      {showGuide && <ExplainableAIGuide onClose={() => setShowGuide(false)} />}
      
      <div className="explainable-header">
        <h1>Explainable AI Techniques</h1>
        <p className="header-description">
          Understand what your neural network sees and how it makes decisions
          <button 
            className="show-guide-btn" 
            onClick={() => {
              console.log("Guide button clicked, setting showGuide to true");
              setShowGuide(true);
            }}
            title="Open Explainable AI Guide"
          >
            ?
          </button>
        </p>
      </div>
      
      <div className="explainable-content">
        <div className="methods-sidebar">
          <h3>Visualization Methods</h3>
          <div className="method-list">
            <button 
              className={`method-btn ${activeMethod === 'gradcam' ? 'active' : ''}`}
              onClick={() => setActiveMethod('gradcam')}
            >
              Grad-CAM
              {visualizationResults.gradcam && (
                <span className="result-indicator" title={`Generated in ${processingTimes.gradcam}ms`}>✓</span>
              )}
            </button>
            <button 
              className={`method-btn ${activeMethod === 'saliency' ? 'active' : ''}`}
              onClick={() => setActiveMethod('saliency')}
            >
              Saliency Maps
              {visualizationResults.saliency && (
                <span className="result-indicator" title={`Generated in ${processingTimes.saliency}ms`}>✓</span>
              )}
            </button>
            <button 
              className={`method-btn ${activeMethod === 'integrated' ? 'active' : ''}`}
              onClick={() => setActiveMethod('integrated')}
            >
              Integrated Gradients
              {visualizationResults.integrated && (
                <span className="result-indicator" title={`Generated in ${processingTimes.integrated}ms`}>✓</span>
              )}
            </button>
            <button
              className={`method-btn ${activeMethod === 'lime' ? 'active' : ''}`}
              onClick={() => setActiveMethod('lime')}
            >
              LIME
              {visualizationResults.lime && (
                <span className="result-indicator" title={`Generated in ${processingTimes.lime}ms`}>✓</span>
              )}
            </button>
            <button
              className={`method-btn ${activeMethod === 'shap' ? 'active' : ''}`}
              onClick={() => setActiveMethod('shap')}
            >
              SHAP
              {visualizationResults.shap && (
                <span className="result-indicator" title={`Generated in ${processingTimes.shap}ms`}>✓</span>
              )}
            </button>
          </div>
          
          <div className="comparison-controls">
            <button 
              className={`comparison-btn ${comparisonMode ? 'active' : ''}`}
              onClick={toggleComparisonMode}
              disabled={Object.values(visualizationResults).filter(v => v !== null).length < 2}
            >
              {comparisonMode ? 'Disable Comparison' : 'Enable Comparison'}
            </button>
            
            {comparisonMode && (
              <div className="comparison-selector">
                <label>Compare with:</label>
                <select 
                  value={comparisonMethod} 
                  onChange={e => setComparisonMethod(e.target.value)}
                >
                  {['gradcam', 'saliency', 'integrated', 'lime', 'shap']
                    .filter(method => method !== activeMethod && visualizationResults[method] !== null)
                    .map(method => (
                      <option key={method} value={method}>
                        {getMethodShortName(method)} ({processingTimes[method]}ms)
                      </option>
                    ))}
                </select>
              </div>
            )}
            
            <button 
              className="clear-btn"
              onClick={clearVisualizations}
              disabled={!Object.values(visualizationResults).some(val => val !== null)}
            >
              Clear All Visualizations
            </button>
          </div>
        </div>
        
        <div className="visualization-area">
          <div className="method-info">
            <h2>{getMethodTitle(activeMethod)}</h2>
            <p>{getMethodDescription(activeMethod)}</p>
            {processingTimes[activeMethod] && (
              <p className="processing-time">
                Generation time: <span>{processingTimes[activeMethod]}ms</span>
              </p>
            )}
          </div>
          
          <div className={`visualization-display ${comparisonMode ? 'comparison-mode' : ''}`}>
            {loading ? (
              <div className="loading-indicator">
                <div className="loader"></div>
                <p>Generating visualization...</p>
                <p className="loading-hint">This may take up to 30 seconds for complex methods like LIME and SHAP</p>
              </div>
            ) : comparisonMode ? (
              // Split view for comparison mode
              <>
                <div className="visualization-panel">
                  <h4>{getMethodShortName(activeMethod)} ({processingTimes[activeMethod]}ms)</h4>
                  {visualizationResults[activeMethod] ? (
                    <img 
                      src={visualizationResults[activeMethod]} 
                      alt={`${activeMethod} visualization`} 
                      className="visualization-image"
                      onError={(e) => {
                        e.target.src = handleImageError(activeMethod, visualizationResults[activeMethod]);
                        e.target.alt = 'Error loading image';
                      }}
                    />
                  ) : (
                    <div className="empty-visualization">
                      <p>No visualization generated yet</p>
                    </div>
                  )}
                </div>
                <div className="visualization-divider"></div>
                <div className="visualization-panel">
                  <h4>{getMethodShortName(comparisonMethod)} ({processingTimes[comparisonMethod]}ms)</h4>
                  {visualizationResults[comparisonMethod] ? (
                    <img 
                      src={visualizationResults[comparisonMethod]} 
                      alt={`${comparisonMethod} visualization`} 
                      className="visualization-image"
                      onError={(e) => {
                        e.target.src = handleImageError(comparisonMethod, visualizationResults[comparisonMethod]);
                        e.target.alt = 'Error loading image';
                      }}
                    />
                  ) : (
                    <div className="empty-visualization">
                      <p>No visualization generated yet</p>
                    </div>
                  )}
                </div>
              </>
            ) : visualizationResults[activeMethod] ? (
              // Single visualization view
              <img 
                src={visualizationResults[activeMethod]} 
                alt={`${activeMethod} visualization`} 
                className="visualization-image"
                onError={(e) => {
                  e.target.src = handleImageError(activeMethod, visualizationResults[activeMethod]);
                  e.target.alt = 'Error loading image';
                }}
              />
            ) : (
              // Empty state
              <div className="placeholder-content">
                <p>Select an image and click "Generate" to create a visualization</p>
              </div>
            )}
          </div>
          
          <div className="controls-panel">
            <div className="image-selector">
              <label>Select Image:</label>
              <select 
                value={selectedImage} 
                onChange={handleImageSelect}
                disabled={isUploading}
              >
                {images.map(img => (
                  <option key={img.id} value={img.id}>{img.name}</option>
                ))}
                {uploadedImage && (
                  <option key="custom" value="custom">Custom: {uploadedImage.name}</option>
                )}
              </select>
              
              {/* Add file upload input */}
              <div className="file-upload">
                <label htmlFor="image-upload" className="upload-btn">
                  Upload Image
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={isUploading}
                />
                {uploadStatus && <div className="upload-status">{uploadStatus}</div>}
              </div>
            </div>
            
            <div className="class-selector">
              <label>Target Class:</label>
              <select value={selectedClass} onChange={handleClassSelect}>
                <option value="">Top Prediction</option>
                {availableClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.label}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="generate-btn"
              onClick={handleGenerateVisualization}
              disabled={loading || !modelLoaded}
            >
              {loading ? 'Generating...' : 'Generate Visualization'}
            </button>
          </div>
          
          <div className="technique-tips">
            <h4>Tips for {getMethodShortName(activeMethod)}</h4>
            <ul>
              {activeMethod === 'lime' && (
                <>
                  <li>LIME works by perturbing the input and analyzing how the model responds.</li>
                  <li>Green areas show features that positively contribute to the prediction.</li>
                  <li>Red areas show features that negatively impact the prediction.</li>
                </>
              )}
              {activeMethod === 'shap' && (
                <>
                  <li>SHAP assigns importance values to each feature using game theory concepts.</li>
                  <li>Red indicates features that increase the prediction value.</li>
                  <li>Blue indicates features that decrease the prediction value.</li>
                </>
              )}
              {activeMethod === 'gradcam' && (
                <>
                  <li>Grad-CAM uses gradients flowing into the final convolutional layer.</li>
                  <li>It works well for CNN architectures and highlights regions of interest.</li>
                  <li>Red/yellow areas show regions that strongly activate the target class.</li>
                </>
              )}
              {activeMethod === 'saliency' && (
                <>
                  <li>Saliency maps use direct gradients from the output to the input.</li>
                  <li>Brighter areas have more influence on the model's decision.</li>
                  <li>Try different target classes to see what features the model looks for.</li>
                </>
              )}
              {activeMethod === 'integrated' && (
                <>
                  <li>Integrated Gradients accumulate gradients along an interpolation path.</li>
                  <li>This method is more theoretically sound than simpler approaches.</li>
                  <li>It shows pixel-level contributions to the prediction.</li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <div className="explanation-panel">
          <h3>How to Interpret</h3>
          <div className="interpretation-guide">
            <p>{getInterpretationGuide(activeMethod)}</p>
          </div>
          
          {selectedImage && (visualizationResults[activeMethod] || selectedImage === 'custom') && (
            <div className="original-image">
              <h4>Original Image</h4>
              <img 
                src={selectedImage === 'custom' ? uploadedImage?.path : images.find(img => img.id === selectedImage)?.path} 
                alt="Original input" 
                className="original-image-preview"
              />
            </div>
          )}
          
          {comparisonMode && visualizationResults[activeMethod] && visualizationResults[comparisonMethod] && (
            <div className="methods-comparison">
              <h4>Method Comparison</h4>
              <p>
                <strong>{getMethodShortName(activeMethod)}</strong> vs. <strong>{getMethodShortName(comparisonMethod)}</strong>:
                {getMethodComparison(activeMethod, comparisonMethod)}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Model loading indicator */}
      {!modelLoaded && (
        <div className="model-loading-overlay">
          <div className="model-loading-content">
            <div className="loader"></div>
            <p>Loading MobileNet model...</p>
            <p className="model-loading-hint">This may take a moment depending on your connection speed.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for shorter method names in UI
function getMethodShortName(method) {
  const shortNames = {
    'gradcam': 'Grad-CAM',
    'saliency': 'Saliency',
    'integrated': 'Int. Gradients',
    'lime': 'LIME',
    'shap': 'SHAP'
  };
  return shortNames[method] || method;
}

// Helper functions for method information
function getMethodTitle(method) {
  const titles = {
    'gradcam': 'Gradient-weighted Class Activation Mapping (Grad-CAM)',
    'saliency': 'Saliency Maps',
    'integrated': 'Integrated Gradients',
    'lime': 'Local Interpretable Model-agnostic Explanations (LIME)',
    'shap': 'SHapley Additive exPlanations (SHAP)'
  };
  return titles[method] || 'Select a Method';
}

function getMethodDescription(method) {
  const descriptions = {
    'gradcam': 'Grad-CAM visualizes the regions of input that are important for predictions by using the gradients of target concepts, flowing into the final convolutional layer to produce a coarse localization map.',
    'saliency': 'Saliency maps highlight the parts of an image that are most influential to the classification decision by computing the gradient of the output with respect to the input.',
    'integrated': 'Integrated Gradients attributes the prediction of a deep network to its input features by accumulating gradients along a straight-line path from a baseline to the input.',
    'lime': 'LIME explains the predictions of any classifier by learning an interpretable model locally around the prediction, providing insight into which features contribute most to the prediction.',
    'shap': 'SHAP (SHapley Additive exPlanations) explains the output of any machine learning model using a game theoretic approach to ensure fair distribution of feature importance values.'
  };
  return descriptions[method] || 'Select a method to see its description.';
}

function getInterpretationGuide(method) {
  const guides = {
    'gradcam': 'In Grad-CAM visualizations, the highlighted areas (usually in red/yellow) show regions that strongly influence the model\'s prediction for the target class. Brighter colors indicate stronger influence.',
    'saliency': 'Brighter pixels in a saliency map indicate features that would change the prediction the most if modified. Focus on the brightest areas to understand what the model considers important.',
    'integrated': 'Integrated Gradients show which pixels contribute positively (red) or negatively (blue) to the prediction. The intensity indicates the strength of the contribution.',
    'lime': 'LIME highlights regions of the image in green that positively contribute to the classification and in red that negatively impact it. The stronger the color, the stronger the effect.',
    'shap': 'In SHAP visualizations, red areas increase the prediction value while blue areas decrease it. The magnitude of values indicates how strongly each pixel influences the prediction.'
  };
  return guides[method] || 'Select a method to see interpretation guidelines.';
}

// Helper function to get method comparison information
function getMethodComparison(method1, method2) {
  const comparisons = {
    'gradcam-saliency': ' Grad-CAM is class-specific and highlights larger regions, while Saliency Maps provide more pixel-level detail.',
    'gradcam-integrated': ' Grad-CAM focuses on convolutional features, while Integrated Gradients considers all pixels equally and has stronger theoretical guarantees.',
    'gradcam-lime': ' Grad-CAM works at feature-map level, while LIME works by analyzing perturbations of the input in a model-agnostic way.',
    'gradcam-shap': ' Grad-CAM is specific to CNNs, while SHAP provides guarantees of fairness and consistency across all features.',
    'saliency-integrated': ' Saliency Maps use direct gradients, while Integrated Gradients accumulate gradients along a path, avoiding gradient saturation issues.',
    'saliency-lime': ' Saliency Maps are more fine-grained but susceptible to noise, while LIME uses superpixels for more human-interpretable explanations.',
    'saliency-shap': ' Saliency Maps tell you what pixels matter, while SHAP tells you how much each region contributes to the prediction.',
    'integrated-lime': ' Integrated Gradients provides pixel-level attribution, while LIME works at the superpixel level for more interpretable results.',
    'integrated-shap': ' Both aim for theoretical soundness, but SHAP uses game theory principles while Integrated Gradients uses a path integral approach.',
    'lime-shap': ' Both are model-agnostic and use perturbations, but SHAP guarantees consistent attribution values based on game theory.'
  };
  
  // Try both orderings
  return comparisons[`${method1}-${method2}`] || comparisons[`${method2}-${method1}`] || 
         ' Both methods highlight important features but use different approaches to explain model predictions.';
}

export default ExplainableAIPage;
