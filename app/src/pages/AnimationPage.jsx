import React from 'react';
import Navigation from '../components/Navigation';
import NetworkAnimation from '../components/NetworkAnimation';
import { useNavigate } from 'react-router-dom';

function AnimationPage() {
  const navigate = useNavigate();
  
  return (
    <div className="animation-page" style={{
      minHeight: "100vh",
      backgroundColor: "#121212",
      color: "#e0e0e0",
      paddingTop: "60px", // For navigation
      fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif"
    }}>
      <Navigation />
      
      <div style={{
        padding: "40px 20px",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <h1 style={{ 
          fontSize: "2.2rem", 
          color: "#8e9aff",
          marginBottom: "20px"
        }}>
          Neural Network Animation
        </h1>
        
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "30px" }}>
          This page demonstrates how data flows through each layer of a neural network. 
          Select a visualization from the options below to begin exploring.
        </p>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          marginTop: "40px"
        }}>
          {/* Animation preview cards */}
          <div 
            style={{
              backgroundColor: "#1e1e24",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s",
              border: "1px solid #2a2a3a"
            }}
            onClick={() => navigate('/layer-visualizer')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h3 style={{ color: "#8e9aff", marginBottom: "15px" }}>Full Network Visualization</h3>
            <p>Explore how data flows through the entire neural network architecture.</p>
            <button style={{
              backgroundColor: "#8e9aff",
              color: "#121212",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              marginTop: "15px",
              fontWeight: "bold",
              cursor: "pointer"
            }}>
              Start Visualization
            </button>
          </div>
          
          <div 
            style={{
              backgroundColor: "#1e1e24",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s",
              border: "1px solid #2a2a3a"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h3 style={{ color: "#8e9aff", marginBottom: "15px" }}>Layer-by-Layer Animation</h3>
            <p>Watch how features are extracted through each layer of the network.</p>
            <button style={{
              backgroundColor: "#8e9aff",
              color: "#121212",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              marginTop: "15px",
              fontWeight: "bold",
              cursor: "pointer"
            }}>
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimationPage;
