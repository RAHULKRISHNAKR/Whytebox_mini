import React from 'react';

const PredictionBar = ({ prediction }) => {
  if (!prediction) return null;
  
  return (
    <div 
      style={{ 
        position: "fixed", 
        bottom: "20px", 
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "80%",
        width: "auto",
        backgroundColor: "rgba(0,0,0,0.7)", 
        color: "white", 
        padding: "15px 25px",
        textAlign: "center",
        zIndex: 10,
        borderRadius: "30px",
        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
        backdropFilter: "blur(10px)",
        display: prediction ? "block" : "none"
      }}
    >
      <p style={{ margin: 0, fontSize: "1em", fontWeight: "300" }}>{prediction}</p>
    </div>
  );
};

export default React.memo(PredictionBar);
