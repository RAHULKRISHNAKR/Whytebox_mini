import React from "react";
import "./PredictionBar.css";

const PredictionBar = ({ prediction }) => {
  if (!prediction) return null;
  return (
    <div className="prediction-bar">
      <p>{prediction}</p>
    </div>
  );
};

export default PredictionBar;