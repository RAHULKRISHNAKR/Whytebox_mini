import React, { useState, useEffect } from 'react';
import './EnhancedImagePanel.css';

/**
 * EnhancedImagePanel component for selecting and preprocessing images
 * for neural network visualization with TensorSpace
 */
const EnhancedImagePanel = ({ isOpen, onSelectImage, gradcamImage, topOffset = "0" }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('samples'); // 'samples' or 'upload'
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("idle"); // idle, processing, success, error
  
  // Fetch sample images on component mount
  useEffect(() => {
    const fetchSampleImages = async () => {
      try {
      const sampleImages = [
        { 
        id: 1, 
        name: 'Cat', 
        path: 'assets/data/cat.jpg',
        thumbnail: 'assets/data/cat.jpg',
        jsonPath: 'assets/data/cat.json'
        },
        { 
        id: 2, 
        name: 'Dog', 
        path: 'assets/data/dog.jpg',
        thumbnail: 'assets/data/dog.jpg',
        jsonPath: 'assets/data/dog.json'
        },
        { 
        id: 3, 
        name: 'Bird', 
        path: 'assets/data/bird.png',
        thumbnail: 'assets/data/bird.png',
        jsonPath: 'assets/data/bird.json'
        },
        { 
        id: 4, 
        name: 'Car', 
        path: 'assets/data/car1.png',
        thumbnail: 'assets/data/car1.png',
        jsonPath: 'assets/data/car1.json'
        },
        { 
        id: 5, 
        name: 'Goldfish', 
        path: 'assets/data/goldfish.png',
        thumbnail: 'assets/data/goldfish.png',
        jsonPath: 'assets/data/goldfish.json'
        }
      ];

        // Verify images exist
        await Promise.all(sampleImages.map(async (image) => {
          const response = await fetch(image.path);
          if (!response.ok) throw new Error(`Image not found: ${image.path}`);
        }));
        
        setImages(sampleImages);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load sample images:', error);
        setIsLoading(false);
      }
    };
    
    fetchSampleImages();
  }, []);
  
  // Handle image click - simplified to just pass the image to parent
  const handleImageClick = (image) => {
    setSelectedImage(image);
    onSelectImage({
      ...image,
      gradcamPath: `assets/data/${image.name.toLowerCase()}_GC.jpg`
    });
  };
  
  // Handle file selection - now just for preview
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Clear any previous processing state
    setUploadError(null);
    setProcessingStatus("idle");
    setSelectedFile(file);
    
    // Show a preview of the image
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageObj = {
        id: Date.now(),
        name: file.name.split('.')[0], // Use filename without extension
        path: e.target.result,
        thumbnail: e.target.result,
        isUploaded: true,
        isProcessing: false
      };
      
      setSelectedImage(imageObj);
    };
    
    reader.readAsDataURL(file);
  };
  
  // Separate process to handle the image processing
  const processSelectedImage = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setProcessingStatus("processing");
    setUploadError(null);
    
    // Update the image object to show processing state
    if (selectedImage) {
      const processingImageObj = {
        ...selectedImage,
        isProcessing: true
      };
      setSelectedImage(processingImageObj);
    }
    
    try {
      // Create a FormData object to send the file to the server
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      // Send the image to the server for processing
      console.log("Sending image to server for processing...");
      
      // Use the full server URL to avoid proxy issues
      const serverUrl = 'http://localhost:3001'; // Explicit server URL
      const apiUrl = `${serverUrl}/api/process-image`;
      console.log(`Submitting to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      
      // Log response status for debugging
      console.log("Server response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server error (${response.status}): ${response.statusText || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log("Processing successful, received:", data);
      
      // Update the image object with the JSON file path
      const processedImageObj = {
        ...selectedImage,
        jsonPath: data.jsonPath,
        isProcessing: false
      };
      
      setSelectedImage(processedImageObj);
      setProcessingStatus("success");
      
      // Don't automatically pass to the parent yet - let user click the visualize button
      
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError(`${error.message}. Make sure the server is running on port 3001.`);
      
      // Still set the image but mark it as having an error
      if (selectedImage) {
        const errorImageObj = {
          ...selectedImage,
          isProcessing: false,
          hasError: true
        };
        
        setSelectedImage(errorImageObj);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Separate visualization function for processed uploaded images
  const visualizeProcessedImage = () => {
    if (!selectedImage || !selectedImage.jsonPath) return;
    
    // Pass the processed image to parent component
    onSelectImage(selectedImage);
  };
  
  // Replace the handleFileUpload function with the simplified one
  const handleFileUpload = handleFileSelect;
  
  return (
    <div className="image-panel" style={{
      position: 'absolute',
      top: "0", // Start from the top since nav is hidden by default
      left: isOpen ? 0 : '-350px',
      width: '350px',
      height: '100%', // Use full height
      backgroundColor: 'rgba(245, 245, 245, 0.95)',
      borderRight: '1px solid #ddd',
      boxShadow: '5px 0 15px rgba(0,0,0,0.2)',
      zIndex: 10,
      transition: 'left 0.3s ease',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ 
        padding: '20px', 
        margin: 0,
        borderBottom: '1px solid #ddd',
        textAlign: 'center',
        color: '#4CAF50'
      }}>
        Image Selection
      </h3>
      
      <div className="image-panel__tabs">
        <div
          onClick={() => setActiveTab('samples')}
          className={`image-panel__tab ${activeTab === 'samples' ? 'image-panel__tab--active' : ''}`}
        >
          Sample Images
        </div>
        <div
          onClick={() => setActiveTab('upload')}
          className={`image-panel__tab ${activeTab === 'upload' ? 'image-panel__tab--active' : ''}`}
        >
          Upload Image
        </div>
      </div>
      
      <div className="image-panel__content">
        {activeTab === 'samples' && (
          <div>
            {isLoading ? (
              <div>Loading sample images...</div>
            ) : (
              <div className="image-panel__grid">
                {images.map(image => (
                  <div
                    key={image.id}
                    onClick={() => handleImageClick(image)}
                    className={`image-panel__grid-item ${selectedImage?.id === image.id ? 'image-panel__grid-item--selected' : ''}`}
                  >
                    <div className="image-panel__thumbnail">
                      <img
                        src={image.thumbnail}
                        alt={image.name}
                        onError={(e) => {
                          console.error(`Failed to load thumbnail for ${image.name} from ${image.thumbnail}`);
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="image-error">
                              <span>${image.name}</span>
                              <small>Failed to load</small>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    <div className="image-panel__label">{image.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Upload Image Tab */}
      {activeTab === 'upload' && (
        <div className="upload-container">
          <div className="upload-box">
            <p>Upload an image to visualize:</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="image-upload"
              disabled={isProcessing}
            />
            <label htmlFor="image-upload" className={`select-image-btn ${isProcessing ? 'disabled' : ''}`}>
              {isProcessing ? 'Processing...' : 'Select Image'}
            </label>
          </div>
          
          {uploadError && (
            <div className="upload-error">
              <p>Error: {uploadError}</p>
              <p>Please try a different image.</p>
            </div>
          )}
          
          {selectedImage?.isUploaded && (
            <div className="selected-image-container">
              <h4>Selected Image</h4>
              <div className="image-preview">
                <img src={selectedImage.path} alt={selectedImage.name} />
              </div>
              <p>{selectedImage.name}</p>
              
              {/* Processing status indicators */}
              {isProcessing && (
                <div className="processing-indicator">
                  <span className="spinner"></span>
                  <p>Converting image...</p>
                </div>
              )}
              
              {selectedImage.hasError && (
                <p className="processing-error">Failed to process image</p>
              )}
              
              {/* Show process button if we have a selected file but haven't processed it yet */}
              {selectedFile && processingStatus === "idle" && (
                <button 
                  onClick={processSelectedImage}
                  className="process-btn"
                  disabled={isProcessing}
                >
                  Process Image
                </button>
              )}
              
              {/* Show processing status */}
              {processingStatus === "processing" && (
                <p className="processing-status">Processing image...</p>
              )}
              
              {processingStatus === "success" && (
                <div className="success-message">
                  <p>✓ Image processed successfully!</p>
                  <button 
                    onClick={visualizeProcessedImage}
                    className="visualize-btn"
                  >
                    Visualize Now
                  </button>
                </div>
              )}
              
              {processingStatus === "error" && (
                <div className="error-message">
                  <p>Failed to process image. Please try another one.</p>
                  <button 
                    onClick={processSelectedImage}
                    className="retry-btn"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* For sample images or already processed uploaded images */}
      {selectedImage && 
       !selectedImage.isProcessing && 
       !selectedImage.hasError && 
       (activeTab === 'samples' || (activeTab === 'upload' && processingStatus !== 'idle' && processingStatus !== 'processing')) && (
        <div className="image-action-container">
          <p>Selected: <strong>{selectedImage.name}</strong></p>
          <button
            onClick={() => activeTab === 'samples' ? handleImageClick(selectedImage) : visualizeProcessedImage()}
            disabled={isLoading || isProcessing}
            className="visualize-btn"
          >
            {isLoading ? 'Processing...' : 'Visualize with this image'}
          </button>
        </div>
      )}

      {/* GradCAM visualization */}
      {gradcamImage && (
        <div className="gradcam-container">
          <h4>GradCAM Visualization</h4>
          <img
            src={gradcamImage}
            alt={`GradCAM visualization for ${selectedImage?.name}`}
            onError={(e) => {
              console.error('Error loading GradCAM image:', gradcamImage);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                  GradCAM visualization not available for ${selectedImage?.name}
                </div>
              `;
            }}
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default EnhancedImagePanel;