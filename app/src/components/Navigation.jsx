import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <>
      {/* Invisible hover area at the top of the screen */}
      <div 
        onMouseEnter={() => setIsVisible(true)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "25px",
          zIndex: 99
        }}
      />
      
      <nav 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: isVisible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-100%)",
          width: "auto",
          minWidth: "500px",
          maxWidth: "90%",
          backgroundColor: "rgba(18, 18, 18, 0.75)",
          backdropFilter: "blur(15px) saturate(180%)",
          zIndex: 100,
          padding: "15px 25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: isVisible ? "0 10px 30px rgba(0,0,0,0.15)" : "none",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: "none",
          borderBottomLeftRadius: "15px",
          borderBottomRightRadius: "15px",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, box-shadow 0.4s ease",
        }}
      >
        <div className="logo" style={{ 
          fontWeight: "700", 
          fontSize: "1.3rem",
          color: "#9ea8ff", 
          textShadow: "0 0 15px rgba(142, 154, 255, 0.5)",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
        }}>
          <span style={{ 
            display: "inline-block", 
            width: "12px", 
            height: "12px", 
            backgroundColor: "#8e9aff", 
            borderRadius: "50%", 
            marginRight: "10px",
            boxShadow: "0 0 10px rgba(142, 154, 255, 0.8)"
          }}></span>
          WhyteBox
        </div>
        
        <div className="nav-links" style={{
          display: "flex",
          gap: "30px"
        }}>
          {[
            { path: "/", label: "Home" },
            { path: "/layer-visualizer", label: "Visualization" },
            { path: "/animation", label: "Animation" }
          ].map(link => (
            <Link 
              key={link.path}
              to={link.path} 
              style={{
                color: location.pathname === link.path ? "#9ea8ff" : "rgba(255, 255, 255, 0.7)",
                textDecoration: "none",
                fontWeight: location.pathname === link.path ? "600" : "normal",
                padding: "8px 12px",
                borderRadius: "8px",
                position: "relative",
                transition: "all 0.3s ease, transform 0.2s ease",
                background: location.pathname === link.path ? "rgba(142, 154, 255, 0.1)" : "transparent",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== link.path) {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== link.path) {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              <span style={{
                position: "absolute",
                bottom: "0",
                left: "50%",
                width: location.pathname === link.path ? "30px" : "0",
                height: "2px",
                transform: "translateX(-50%)",
                backgroundColor: "#8e9aff",
                borderRadius: "2px",
                transition: "width 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)",
                boxShadow: location.pathname === link.path ? "0 0 8px rgba(142, 154, 255, 0.8)" : "none"
              }}></span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
