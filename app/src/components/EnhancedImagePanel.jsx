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
  
  // Fetch sample images on component mount
  useEffect(() => {
    const fetchSampleImages = async () => {
      try {
        const sampleImages = [
          { 
            id: 1, 
            name: 'Cat', 
            path: 'assets/data/cat.png',
            thumbnail: 'assets/data/cat.png',
            jsonPath: 'assets/data/cat.json'
          },
          { 
            id: 2, 
            name: 'Dog', 
            path: 'assets/data/dog.png',
            thumbnail: 'assets/data/dog.png',
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
            path: 'assets/data/car.png',
            thumbnail: 'assets/data/car.png',
            jsonPath: 'assets/data/car.json'
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
  
  // Handle file upload - simplified
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageObj = {
        id: Date.now(),
        name: file.name,
        path: e.target.result,
        thumbnail: e.target.result,
        isUploaded: true
      };
      
      setSelectedImage(imageObj);
      // Pass the uploaded image to parent
      onSelectImage(imageObj);
    };
    
    reader.readAsDataURL(file);
  };
  
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
            />
            <label htmlFor="image-upload" className="select-image-btn">
              Select Image
            </label>
          </div>
          
          {selectedImage?.isUploaded && (
            <div className="selected-image-container">
              <h4>Selected Image</h4>
              <div className="image-preview">
                <img src={selectedImage.path} alt={selectedImage.name} />
              </div>
              <p>{selectedImage.name}</p>
            </div>
          )}
        </div>
      )}

      {selectedImage && (
        <div className="image-action-container">
          <p>Selected: <strong>{selectedImage.name}</strong></p>
          <button
            onClick={() => handleImageClick(selectedImage)}
            disabled={isLoading}
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