import React from 'react';

const LoadingOverlay = ({ loading }) => {
  if (!loading) return null;
  
  return (
    <div
      id="loadingPad"
      style={{
        position: "fixed",
        height: "100%",
        width: "100%",
        top: 0,
        left: 0,
        backgroundColor: "rgba(3, 29, 50, 0.95)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          id="loading"
          src="/assets/loading.gif"
          alt="Loading..."
          style={{ width: "200px", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}
        />
        <div style={{
          position: "absolute",
          bottom: "-20px",
          left: "0",
          right: "0",
          height: "4px",
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: "2px",
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: "30%",
            backgroundColor: "#4285f4",
            borderRadius: "2px",
            animation: "loadingBar 1.5s infinite ease-in-out"
          }}></div>
        </div>
      </div>
      <p style={{ 
        color: "white", 
        marginTop: "40px",
        letterSpacing: "1px",
        fontSize: "16px"
      }}>
        Initializing neural network visualization...
      </p>
    </div>
  );
};

export default React.memo(LoadingOverlay);
