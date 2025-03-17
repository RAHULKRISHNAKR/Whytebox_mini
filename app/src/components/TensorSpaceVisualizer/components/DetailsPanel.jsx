import React from 'react';

const DetailsPanel = ({ selectedLayer, bindLayerClickEvents }) => {
  return (
    <>
      <h3 style={{ 
        marginTop: 0, 
        borderBottom: "2px solid #4285f4", 
        paddingBottom: "10px",
        color: "#202124",
        fontWeight: "500"
      }}>
        Layer Information {selectedLayer && `- ${selectedLayer.name}`}
      </h3>
      
      {selectedLayer ? (
        <div>
          <div style={{ 
            marginBottom: "15px", 
            backgroundColor: "rgba(66, 133, 244, 0.1)",
            padding: "15px",
            borderRadius: "10px"
          }}>
            <h4 style={{ margin: "0 0 5px 0", color: "#202124" }}>{selectedLayer.name}</h4>
            <span style={{ 
              backgroundColor: "#4285f4", 
              padding: "5px 10px", 
              borderRadius: "15px", 
              fontSize: "0.8em",
              color: "white",
              display: "inline-block"
            }}>
              {selectedLayer.type}
            </span>
          </div>
          
          <div style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "15px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {selectedLayer.filters !== "N/A" && (
                  <tr>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Filters:</td>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.filters}</td>
                  </tr>
                )}
                {selectedLayer.kernelSize !== "N/A" && (
                  <tr>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Kernel Size:</td>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.kernelSize}</td>
                  </tr>
                )}
                {selectedLayer.outputShape !== "N/A" && (
                  <tr>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Output Shape:</td>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.outputShape}</td>
                  </tr>
                )}
                {selectedLayer.strides !== "N/A" && (
                  <tr>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Stride:</td>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.strides}</td>
                  </tr>
                )}
                {selectedLayer.activation !== "N/A" && (
                  <tr>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontWeight: "500", color: "#5f6368" }}>Activation:</td>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #eee", color: "#202124" }}>{selectedLayer.activation}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: "20px", fontSize: "0.9em", color: "#5f6368", textAlign: "center" }}>
            <button 
              onClick={bindLayerClickEvents}
              style={{
                padding: "10px 15px",
                backgroundColor: "#4285f4",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "0.9em",
                marginTop: "10px",
                boxShadow: "0 2px 5px rgba(66,133,244,0.3)",
                transition: "all 0.2s ease"
              }}
            >
              Refresh Layer Interactions
            </button>
          </div>
        </div>
      ) : (
        <div style={{ 
          color: "#5f6368", 
          fontSize: "0.9em", 
          textAlign: "center",
          marginTop: "30px"
        }}>
          <div style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 20px auto",
            borderRadius: "50%",
            backgroundColor: "rgba(66,133,244,0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "40px", color: "#4285f4" }}>?</span>
          </div>
          <p>Select a layer from the visualization to view its details.</p>
          <p>Explore the neural network architecture by interacting with the 3D visualization.</p>
          <button 
            onClick={bindLayerClickEvents}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "0.9em",
              marginTop: "20px",
              boxShadow: "0 2px 5px rgba(66,133,244,0.3)",
              transition: "all 0.2s ease"
            }}
          >
            Enable Layer Interactions
          </button>
        </div>
      )}
    </>
  );
};

export default React.memo(DetailsPanel);
