  import React, { useState, useEffect } from 'react';

/**
 * EnhancedImagePanel component for selecting and preprocessing images
 * for neural network visualization with TensorSpace
 */
const EnhancedImagePanel = ({ isOpen, onSelectImage }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('samples'); // 'samples' or 'upload'
  
  // Fetch sample images on component mount
  useEffect(() => {
    const fetchSampleImages = async () => {
      try {
        // This would typically fetch from an API or local directory
        // For now we'll use placeholder sample images
        const sampleImages = [
          { id: 1, name: 'Cat', path: '/assets/samples/cat.jpg', thumbnail: '/assets/samples/thumbnails/cat.jpg' },
          { id: 2, name: 'Dog', path: '/assets/samples/dog.jpg', thumbnail: '/assets/samples/thumbnails/dog.jpg' },
          { id: 3, name: 'Bird', path: '/assets/samples/bird.jpg', thumbnail: '/assets/samples/thumbnails/bird.jpg' },
          { id: 4, name: 'Car', path: '/assets/samples/car.jpg', thumbnail: '/assets/samples/thumbnails/car.jpg' },
        ];
        
        setImages(sampleImages);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load sample images:', error);
        setIsLoading(false);
      }
    };
    
    fetchSampleImages();
  }, []);
  
  // Handle image click - process it for the model
  const handleImageClick = async (image) => {
    try {
      setSelectedImage(image);
      setIsLoading(true);
      
      // In a real app, this would preprocess the image for your model
      // Here we're simulating loading the image data
      const response = await fetch('/assets/data/image_topology.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch sample data: ${response.status}`);
      }
      const imageData = await response.json();
      
      // Pass the selected image and its processed data to parent
      onSelectImage(image, imageData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsLoading(false);
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageObj = {
        id: Date.now(),
        name: file.name,
        path: e.target.result,
        thumbnail: e.target.result,
        isUploaded: true
      };
      
      setSelectedImage(imageObj);
      
      // In a real app, you would preprocess the uploaded image here
      // For demo, we'll use the same sample data
      try {
        setIsLoading(true);
        const response = await fetch('/assets/data/image_topology.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch sample data: ${response.status}`);
        }
        const imageData = await response.json();
        
        // Pass the uploaded image and its processed data to parent
        onSelectImage(imageObj, imageData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing uploaded image:', error);
        setIsLoading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: isOpen ? 0 : '-350px',
      width: '350px',
      height: '100%',
      backgroundColor: 'rgba(245, 245, 245, 0.95)',
      borderRight: '1px solid #ddd',
      boxShadow: '5px 0 15px rgba(0,0,0,0.2)',
      zIndex: 5,
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
      
      {/* Tab navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
        <div 
          onClick={() => setActiveTab('samples')}
          style={{
            flex: 1,
            padding: '15px 0',
            textAlign: 'center',
            fontWeight: activeTab === 'samples' ? '500' : 'normal',
            borderBottom: activeTab === 'samples' ? '3px solid #4CAF50' : 'none',
            cursor: 'pointer',
            color: activeTab === 'samples' ? '#4CAF50' : '#5f6368',
            transition: 'all 0.2s ease'
          }}
        >
          Sample Images
        </div>
        <div 
          onClick={() => setActiveTab('upload')}
          style={{
            flex: 1,
            padding: '15px 0',
            textAlign: 'center',
            fontWeight: activeTab === 'upload' ? '500' : 'normal',
            borderBottom: activeTab === 'upload' ? '3px solid #4CAF50' : 'none',
            cursor: 'pointer',
            color: activeTab === 'upload' ? '#4CAF50' : '#5f6368',
            transition: 'all 0.2s ease'
          }}
        >
          Upload Image
        </div>
      </div>
      
      <div style={{ 
        padding: '20px',
        overflowY: 'auto',
        flexGrow: 1
      }}>
        {/* Sample Images Tab */}
        {activeTab === 'samples' && (
          <div>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Loading sample images...
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)',
                gridGap: '15px' 
              }}>
                {images.map(image => (
                  <div 
                    key={image.id} 
                    onClick={() => handleImageClick(image)}
                    style={{
                      cursor: 'pointer',
                      border: selectedImage?.id === image.id ? '3px solid #4CAF50' : '1px solid #ddd',
                      borderRadius: '10px',
                      padding: '10px',
                      backgroundColor: 'white',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: selectedImage?.id === image.id ? 
                        '0 5px 15px rgba(76, 175, 80, 0.3)' : '0 2px 5px rgba(0,0,0,0.05)',
                      transform: selectedImage?.id === image.id ? 'translateY(-2px)' : 'none'
                    }}
                  >
                    <div style={{ 
                      height: '100px', 
                      backgroundImage: `url(${image.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '5px',
                      marginBottom: '8px'
                    }}></div>
                    <div style={{ 
                      textAlign: 'center', 
                      fontWeight: selectedImage?.id === image.id ? '500' : 'normal',
                      color: selectedImage?.id === image.id ? '#4CAF50' : '#333'
                    }}>
                      {image.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Upload Image Tab */}
        {activeTab === 'upload' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              border: '2px dashed #ccc',
              borderRadius: '10px',
              padding: '40px 20px',
              marginBottom: '20px',
              backgroundColor: 'rgba(76, 175, 80, 0.05)'
            }}>
              <p style={{ marginTop: 0 }}>Upload an image to visualize:</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload" style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontWeight: '500'
              }}>
                Select Image
              </label>
            </div>
            
            {selectedImage?.isUploaded && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>Selected Image</h4>
                <div style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  overflow: 'hidden',
                  border: '2px solid #4CAF50',
                  borderRadius: '10px',
                  marginBottom: '10px'
                }}>
                  <img 
                    src={selectedImage.path} 
                    alt={selectedImage.name}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
                <p>{selectedImage.name}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {selectedImage && (
        <div style={{ 
          padding: '15px 20px', 
          borderTop: '1px solid #ddd',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <p style={{ 
            margin: '0 0 10px 0',
            fontSize: '14px',
            color: '#333'
          }}>
            Selected: <strong>{selectedImage.name}</strong>
          </p>
          <button 
            onClick={() => handleImageClick(selectedImage)}
            disabled={isLoading}
            style={{
              padding: '8px 15px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: isLoading ? 'wait' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 2px 5px rgba(76,175,80,0.3)',
              transition: 'all 0.2s ease',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Processing...' : 'Visualize with this image'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedImagePanel;
