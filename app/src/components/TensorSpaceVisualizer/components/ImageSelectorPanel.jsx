import React from 'react';

const ImageSelectorPanel = ({ isOpen, onSelectImage }) => {
  // Sample images for demonstration
  const sampleImages = [
    { id: 1, name: "Cat", path: "/assets/images/cat.jpg" },
    { id: 2, name: "Dog", path: "/assets/images/dog.jpg" },
    { id: 3, name: "Bird", path: "/assets/images/bird.jpg" },
    { id: 4, name: "Keyboard", path: "/assets/images/keyboard.jpg" },
    { id: 5, name: "Coffee Mug", path: "/assets/images/coffee_mug.jpg" },
    { id: 6, name: "Car", path: "/assets/images/car.jpg" },
  ];

  return (
    <div 
      className="image-selector-sidebar"
      style={{ 
        position: "absolute",
        top: 0,
        left: isOpen ? "0" : "-300px",
        width: "300px", 
        height: "100%",
        backgroundColor: "rgba(245, 245, 245, 0.95)", 
        borderRight: "1px solid #ddd",
        overflow: "auto",
        boxShadow: "5px 0 15px rgba(0,0,0,0.2)",
        zIndex: 5,
        transition: "left 0.3s ease",
        backdropFilter: "blur(10px)"
      }}
    >
      <h3 style={{ 
        margin: "15px 0", 
        textAlign: "center", 
        borderBottom: "2px solid #4285f4", 
        paddingBottom: "10px",
        color: "#202124"
      }}>
        Select Image
      </h3>
      <div style={{ padding: "0 15px" }}>
        {sampleImages.map(image => (
          <div 
            key={image.id}
            onClick={() => onSelectImage(image)}
            style={{
              padding: "10px",
              margin: "10px 0",
              backgroundColor: "#f5f5f5",
              borderRadius: "5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e0e0")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
          >
            <img 
              src={image.path} 
              alt={image.name}
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "4px",
                marginRight: "10px"
              }} 
            />
            <span style={{ fontWeight: "500" }}>{image.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSelectorPanel;
