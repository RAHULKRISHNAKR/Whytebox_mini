import React, { useState } from 'react';
import '../../../styles/TensorVisualizer.css';

const EnhancedImagePanel = ({ isOpen, onSelectImage }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Predefined image slots with metadata
  const imageSlots = [
    {
      id: 1,
      name: "Cat",
      description: "Domestic cat image",
      thumbnailUrl: "kk.jpg", 
      dataFile: "image_topology.json"
    },
    {
      id: 2,
      name: "Dog",
      description: "Canine image",
      thumbnailUrl: "https://placedog.net/200/200",
      dataFile: "image_topology.json"
    },
    {
      id: 3,
      name: "Bird",
      description: "Avian species",
      thumbnailUrl: "https://via.placeholder.com/200x200?text=Bird",
      dataFile: "image_topology.json"
    },
    {
      id: 4,
      name: "Keyboard",
      description: "Computer input device",
      thumbnailUrl: "https://via.placeholder.com/200x200?text=Keyboard",
      dataFile: "image_topology.json"
    },
    {
      id: 5,
      name: "Coffee Cup",
      description: "Morning essential",
      thumbnailUrl: "https://via.placeholder.com/200x200?text=Coffee+Cup",
      dataFile: "image_topology.json"
    }
  ];

  const handleImageSelect = async (image) => {
    setSelectedSlot(image.id);
    
    try {
      // Fetch the data file associated with the image
      const response = await fetch(`/assets/data/${image.dataFile}`);
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Call the parent component's handler with both the image metadata and data
      onSelectImage({...image, name: image.name}, data);
    } catch (error) {
      console.error("Error loading image data:", error);
      // Show elegant error notification instead of alert
      showErrorToast(`Failed to load image data: ${error.message}`);
    }
  };
  
  // Function to show toast notification for errors
  const showErrorToast = (message) => {
    // In a real implementation, you'd use a toast component
    console.error(message);
    // Simplified error display
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.bottom = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.backgroundColor = '#d93025';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px 20px';
    errorDiv.style.borderRadius = '4px';
    errorDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    errorDiv.style.zIndex = '9999';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      document.body.removeChild(errorDiv);
    }, 5000);
  };

  return (
    <div 
      className="enhanced-image-panel"
      style={{ 
        position: "absolute",
        top: 0,
        left: isOpen ? "0" : "-350px",
        width: "350px", 
        height: "100%",
        backgroundColor: "rgba(34, 35, 38, 0.97)", 
        color: "#fff",
        borderRight: "1px solid #3c4043",
        overflow: "auto",
        boxShadow: "5px 0 20px rgba(0,0,0,0.3)",
        zIndex: 20,
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backdropFilter: "blur(10px)"
      }}
    >
      <div style={{ 
        background: "linear-gradient(135deg, #222326 0%, #3c4043 100%)",
        padding: "25px 20px",
        borderBottom: "1px solid #3c4043",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at top right, rgba(66, 133, 244, 0.1), transparent 70%)",
          zIndex: 0
        }}></div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ 
            margin: "0",
            fontSize: "1.5rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: "10px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 17V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V17C3 18.1 3.9 19 5 19H11V21H7V23H17V21H13V19H19C20.1 19 21 18.1 21 17ZM19 17H5V5H19V17Z" fill="#4285f4"/>
            </svg>
            Neural Network Input
          </h2>
          <p style={{ 
            margin: "10px 0 0",
            opacity: "0.8",
            fontSize: "0.95rem",
            maxWidth: "90%"
          }}>
            Select an image to analyze through the model layers
          </p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {imageSlots.map(image => (
          <div 
            key={image.id}
            onClick={() => handleImageSelect(image)}
            style={{
              padding: "16px",
              margin: "0 0 16px",
              backgroundColor: selectedSlot === image.id 
                ? "rgba(66, 133, 244, 0.15)" 
                : "rgba(53, 54, 58, 0.6)",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              border: selectedSlot === image.id 
                ? "1px solid rgba(66, 133, 244, 0.5)" 
                : "1px solid transparent",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (selectedSlot !== image.id) {
                e.currentTarget.style.backgroundColor = "rgba(53, 54, 58, 0.8)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedSlot !== image.id) {
                e.currentTarget.style.backgroundColor = "rgba(53, 54, 58, 0.6)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              overflow: "hidden",
              flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.1)",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, rgba(255,255,255,0.1), transparent)",
                zIndex: 1
              }}></div>
              <img 
                src={image.thumbnailUrl} 
                alt={image.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }} 
              />
              {selectedSlot === image.id && (
                <div style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  backgroundColor: "#4285f4",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="white"/>
                  </svg>
                </div>
              )}
            </div>
            <div style={{ marginLeft: "16px" }}>
              <h3 style={{ 
                margin: "0 0 8px",
                fontSize: "1rem",
                fontWeight: "500"
              }}>{image.name}</h3>
              <p style={{ 
                margin: "0",
                fontSize: "0.85rem",
                opacity: "0.7",
                lineHeight: "1.3"
              }}>{image.description}</p>
              
              {selectedSlot === image.id && (
                <div style={{
                  marginTop: "12px",
                  fontSize: "0.8rem",
                  color: "#8ab4f8",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <span style={{ marginRight: "6px" }}>Currently active</span>
                  <div style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#8ab4f8",
                    animation: "pulse 1.5s infinite"
                  }}></div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div style={{
          marginTop: "24px",
          padding: "20px",
          borderRadius: "12px",
          border: "1px dashed rgba(255,255,255,0.2)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, rgba(66,133,244,0.05), transparent)",
            zIndex: 0
          }}></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" style={{ marginBottom: "12px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="rgba(255,255,255,0.5)"/>
            </svg>
            <h4 style={{ margin: "0 0 8px", color: "rgba(255,255,255,0.8)" }}>Upload Your Own Image</h4>
            <p style={{ margin: "0 0 16px", fontSize: "0.85rem", opacity: "0.6" }}>
              Use your own image to test the neural network
            </p>
            <button className="visualizer-button" style={{ margin: "0 auto" }}>
              Select File
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0.6;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedImagePanel;
