import React, { useState } from 'react';

const EnhancedImagePanel = ({ isOpen, onSelectImage }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Predefined image slots with metadata
  const imageSlots = [
    {
      id: 1,
      name: "Cat",
      description: "Domestic cat image",
      thumbnailUrl: "https://placekitten.com/200/200", 
      dataFile: "image_topology.json"
    },
    {
      id: 2,
      name: "Dog",
      description: "Canine image",
      thumbnailUrl: "https://placedog.net/200/200",
      dataFile: "image_topology.json" // Using same file as example, would use different files in real app
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
      
      // Call the parent component's function with both the image metadata and the data
      onSelectImage(image, data);
    } catch (error) {
      console.error("Error loading image data:", error);
    }
  };

  return (
    <div 
      className="enhanced-image-panel"
      style={{ 
        position: "absolute",
        top: 0,
        left: isOpen ? "0" : "-320px", // Ensure this value is correct
        zIndex: 10, // Ensure this is higher than other elements
        transition: "left 0.3s ease",
      }}
    >
      <div style={{ 
        borderBottom: "1px solid #3c4043",
        padding: "20px",
        textAlign: "center"
      }}>
        <h2 style={{ 
          margin: "0",
          fontSize: "24px",
          fontWeight: "500"
        }}>Select Input Image</h2>
        <p style={{ 
          margin: "10px 0 0",
          opacity: 0.7,
          fontSize: "14px"
        }}>Click an image to run the model</p>
      </div>

      <div style={{ padding: "20px" }}>
        {imageSlots.map(image => (
          <div 
            key={image.id}
            onClick={() => handleImageSelect(image)}
            style={{
              padding: "15px",
              margin: "0 0 20px",
              backgroundColor: selectedSlot === image.id ? "rgba(66, 133, 244, 0.2)" : "rgba(60, 64, 67, 0.3)",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              border: selectedSlot === image.id ? "1px solid #4285f4" : "1px solid transparent",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              if (selectedSlot !== image.id) {
                e.currentTarget.style.backgroundColor = "rgba(60, 64, 67, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedSlot !== image.id) {
                e.currentTarget.style.backgroundColor = "rgba(60, 64, 67, 0.3)";
              }
            }}
          >
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              overflow: "hidden",
              flexShrink: 0
            }}>
              <img 
                src={image.thumbnailUrl} 
                alt={image.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }} 
              />
            </div>
            <div style={{ marginLeft: "15px" }}>
              <h3 style={{ 
                margin: "0 0 5px",
                fontSize: "18px",
                fontWeight: "500"
              }}>{image.name}</h3>
              <p style={{ 
                margin: "0",
                opacity: 0.7,
                fontSize: "14px"
              }}>{image.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedImagePanel;
