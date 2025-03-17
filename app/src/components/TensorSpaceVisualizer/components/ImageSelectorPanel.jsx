import React from 'react';
import '../../../styles/TensorVisualizer.css';

const ImageSelectorPanel = ({ isOpen, onSelectImage }) => {
  // Sample images for demonstration
  const sampleImages = [
    { id: 1, name: "Cat", path: "/assets/images/cat.jpg", category: "Animal" },
    { id: 2, name: "Dog", path: "/assets/images/dog.jpg", category: "Animal" },
    { id: 3, name: "Bird", path: "/assets/images/bird.jpg", category: "Animal" },
    { id: 4, name: "Keyboard", path: "/assets/images/keyboard.jpg", category: "Object" },
    { id: 5, name: "Coffee Mug", path: "/assets/images/coffee_mug.jpg", category: "Object" },
    { id: 6, name: "Car", path: "/assets/images/car.jpg", category: "Vehicle" },
  ];

  // Group images by category
  const groupedImages = sampleImages.reduce((acc, img) => {
    if (!acc[img.category]) {
      acc[img.category] = [];
    }
    acc[img.category].push(img);
    return acc;
  }, {});

  return (
    <div 
      className="image-selector-sidebar"
      style={{ 
        position: "absolute",
        top: 0,
        left: isOpen ? "0" : "-320px",
        width: "320px", 
        height: "100%",
        backgroundColor: "white", 
        borderRight: "1px solid #eaeaea",
        overflow: "auto",
        boxShadow: "3px 0 15px rgba(0,0,0,0.1)",
        zIndex: 5,
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      <div style={{ 
        padding: "25px 20px 20px",
        borderBottom: "1px solid #eaeaea",
        background: "linear-gradient(to right, #f8f9fa, white)"
      }}>
        <h3 style={{ 
          margin: "0", 
          fontSize: "1.3rem",
          fontWeight: "600",
          color: "#202124",
          display: "flex",
          alignItems: "center"
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: "10px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#4285f4"/>
          </svg>
          Select Input
        </h3>
        <p style={{ 
          margin: "10px 0 0", 
          fontSize: "0.9rem",
          color: "#5f6368"
        }}>
          Choose an image to analyze with the neural network
        </p>
      </div>

      <div style={{ padding: "15px" }}>
        {Object.entries(groupedImages).map(([category, images]) => (
          <div key={category} style={{ marginBottom: "20px" }}>
            <h4 style={{ 
              fontSize: "0.85rem", 
              color: "#5f6368", 
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: "10px 5px",
              fontWeight: "500"
            }}>
              {category}
            </h4>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {images.map(image => (
                <div 
                  key={image.id}
                  onClick={() => onSelectImage(image)}
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  <div style={{ position: "relative", paddingTop: "75%" }}>
                    <img 
                      src={image.path} 
                      alt={image.name}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }} 
                    />
                  </div>
                  <div style={{ 
                    padding: "10px", 
                    backgroundColor: "white",
                    borderTop: "1px solid #f5f5f5"
                  }}>
                    <span style={{ fontWeight: "500", fontSize: "0.9rem" }}>{image.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div style={{ 
          textAlign: "center", 
          margin: "25px 0 15px",
          padding: "15px",
          borderRadius: "8px",
          backgroundColor: "#f5f5f5"
        }}>
          <button className="visualizer-button" style={{ margin: "0 auto" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" style={{ marginRight: "8px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7V9H15V7H19ZM9 7V11H5V7H9ZM19 13V17H15V13H19ZM9 15V17H5V15H9ZM21 5H13V11H21V5ZM11 5H3V13H11V5ZM21 11H13V19H21V11ZM11 13H3V19H11V13Z" fill="white"/>
            </svg>
            Upload Custom Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSelectorPanel;
