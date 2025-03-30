import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react' // Add useEffect import
import '../styles/HomePage.css' // Fix the CSS import path
import BeginnersGuide from '../components/BeginnersGuide'
import Navigation from '../components/Navigation';
// Add a placeholder image if you don't have one yet
// import visualizationImage from '../assets/network-visualization.png';
// Use this as fallback if the image doesn't exist
const placeholderImage = "https://placehold.co/600x400/1a1a2e/8e9aff?text=Neural+Network+Visualization";

function HomePage() {
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  // Add state for animations
  const [animate, setAnimate] = useState(false);
  
  // Add useEffect to trigger animations after component mounts
  useEffect(() => {
    setAnimate(true);
  }, []);
  
  // Function to handle navigation with debugging
  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };
  
  // Only using MobileNetV1 for now
  const currentModelInfo = {
    name: "MobileNetV1",
    description: "The original MobileNet architecture that introduced depthwise separable convolutions for efficient deep learning on mobile devices.",
    features: [
      { label: "Architecture", value: "28 layers including depthwise and pointwise convolutions" },
      { label: "Parameters", value: "~4.2 million parameters" },
      { label: "Input Size", value: "224×224 RGB images" },
      { label: "Output", value: "1000-class classification (ImageNet)" },
      { label: "Key Feature", value: "First model to use depthwise separable convolutions for mobile" }
    ]
  };

  return (
    <div className="home-page">
      {/* Add Navigation bar */}
      <Navigation />
      
      {showGuide && <BeginnersGuide onClose={() => setShowGuide(false)} />}
      
      {/* Add animate-in class for animations */}
      <div className={`hero-section ${animate ? 'animate-in' : ''}`}>
        <div className="hero-background-element"></div>
        <h1>WhyteBox: Neural Network Visualizer</h1>
        <p className="tagline">Explore and understand Convolutional Neural Networks through interactive 3D visualization</p>
        
        <div className="hero-buttons">
          <button 
            className="view-model-btn" 
            onClick={() => handleNavigation('/layer-visualizer')}
            style={{ position: 'relative', zIndex: 2 }}
          >
            View Model
            <span className="btn-icon">→</span>
          </button>
          
          <button 
            className="guide-btn" 
            onClick={() => setShowGuide(true)}
          >
            Beginners Guide
            <span className="btn-icon">?</span>
          </button>
        </div>
      </div>
      
      {/* Add the section divider */}
      <div className="section-divider">
        <span className="divider-icon">◆</span>
      </div>
      
      {/* Add Why WhyteBox section */}
      <div className={`why-whytebox ${animate ? 'animate-in' : ''}`}>
        <h2>Why WhyteBox?</h2>
        <div className="why-content">
          <div className="why-text">
            <p>Neural networks are often described as "black boxes" due to their complex, opaque nature. WhyteBox aims to transform them into "white boxes" by:</p>
            <ul className="benefits-list">
              <li><span className="benefit-icon">🔎</span>Making neural network internals transparent and understandable</li>
              <li><span className="benefit-icon">🎓</span>Providing educational insights for students and researchers</li>
              <li><span className="benefit-icon">💡</span>Demystifying how convolutional networks process and interpret images</li>
              <li><span className="benefit-icon">🛠️</span>Offering a tool for debugging and improving neural network models</li>
            </ul>
          </div>
          <div className="stats-panel">
            <div className="stat-item">
              <span className="stat-number">48x</span>
              <span className="stat-description">Faster understanding of CNN architectures with visual learning</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-description">Open-source visualization tooling</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">28</span>
              <span className="stat-description">Layers visualized in the current model</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add visualization preview section */}
      <div className="visualization-preview">
        <div className="preview-content">
          <h2>Interactive 3D Visualization</h2>
          <p>Dive into the architecture of neural networks through our interactive 3D environment. Explore layers, filters, and activations like never before.</p>
          <button 
            className="preview-btn" 
            onClick={() => handleNavigation('/layer-visualizer')}
            style={{ position: 'relative', zIndex: 2 }}
          >
            Explore Now
            <span className="btn-icon">→</span>
          </button>
        </div>
        <div className="preview-image">
          {/* Use placeholder image if you don't have the import yet */}
          <img src={placeholderImage} alt="Neural Network Visualization Preview" />
          <div className="image-glow"></div>
        </div>
      </div>
      
      {/* Add Explainable AI feature card after the visualization preview section */}
      <div className="explainable-ai-preview">
        <div className="preview-content">
          <h2>Understand Your Model's Decisions</h2>
          <p>
            Our Explainable AI tools help you look inside the "black box" of neural networks. 
            See what features influence predictions and why the model makes certain decisions.
          </p>
          
          <div className="xai-techniques">
            <div className="technique-card">
              <div className="technique-icon">🔍</div>
              <h3>Grad-CAM</h3>
              <p>Highlights regions of input that activate specific classes</p>
            </div>
            
            <div className="technique-card">
              <div className="technique-icon">📊</div>
              <h3>LIME</h3>
              <p>Explains predictions by approximating the model locally</p>
            </div>
            
            <div className="technique-card">
              <div className="technique-icon">🧮</div>
              <h3>SHAP</h3>
              <p>Calculates feature importance using game theory principles</p>
            </div>
          </div>
          
          <button 
            className="preview-btn" 
            onClick={() => handleNavigation('/explainable-ai')}
          >
            Explore Explainable AI
            <span className="btn-icon">→</span>
          </button>
        </div>
        <div className="preview-image">
          <img src="/assets/images/explainable-ai-preview.jpg" alt="Explainable AI visualization" />
          <div className="preview-caption">
            Visualization showing which parts of an image influence the model's prediction
          </div>
        </div>
      </div>
      
      {/* Update model info panel with header and badge */}
      <div className="model-info-panel">
        <div className="model-header">
          <h2>About {currentModelInfo.name}</h2>
          <span className="model-badge">Current Model</span>
        </div>
        <p>{currentModelInfo.description}</p>
        <ul className="model-features">
          {currentModelInfo.features.map((feature, index) => (
            <li key={index}>
              <strong>{feature.label}:</strong> 
              <span className="feature-value">{feature.value}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="project-details">
        <div className="detail-section">
          <h2>About This Project</h2>
          <p>WhyteBox is an interactive tool designed to demystify Convolutional Neural Networks (CNNs). 
             By visualizing the architecture and internal workings of CNNs in 3D, we aim to make 
             deep learning more accessible and understandable.</p>
        </div>
        
        <div className="detail-section">
          <h2>Key Features</h2>
          <ul className="feature-list">
            <li>
              <span className="feature-icon">🔍</span>
              <div>
                <h3>3D Model Visualization</h3>
                <p>Explore CNN architecture in an interactive 3D environment</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🧠</span>
              <div>
                <h3>Layer Inspection</h3>
                <p>View and understand different layers and their functions</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">🔄</span>
              <div>
                <h3>Real-time Processing</h3>
                <p>See how images are processed through the network</p>
              </div>
            </li>
            <li>
              <span className="feature-icon">💡</span>
              <div>
                <h3>Explainable AI</h3>
                <p>Understand how and why the model makes specific predictions</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="detail-section">
          <h2>How to Use</h2>
          <ol className="steps-list">
            <li>Click the "View Model" button to load the 3D CNN visualization</li>
            <li>Use your mouse to rotate and explore the model from different angles</li>
            <li>Click on specific layers to see detailed information</li>
            <li>Toggle different visualization options to understand model behavior</li>
          </ol>
        </div>
        
        {/* Update the team section with team members */}
        <div className="detail-section team-section">
          <h2>About the Team</h2>
          <p>This project was developed as part of the KTU S6 Data Science Mini Project by a passionate team of students dedicated to making AI more accessible.</p>
          <div className="team-members">
            <div className="team-member">
              <div className="member-avatar">R</div>
              <div className="member-info">
                <h3>Rahul Krishna K R</h3>
              </div>
            </div>
            <div className="team-member">
              <div className="member-avatar">A</div>
              <div className="member-info">
                <h3>Azeem N</h3>
              </div>
            </div>
            <div className="team-member">
              <div className="member-avatar">K</div>
              <div className="member-info">
                <h3>Keerthana Kamal</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add footer section */}
      <footer className="home-footer">
        <p>© 2025 WhyteBox | KTU S6 Data Science Mini Project</p>
        <div className="footer-links">
          <a href="https://github.com/CoderZ865/Whytebox2.0" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="#" onClick={(e) => {e.preventDefault(); setShowGuide(true);}}>Beginners Guide</a>
          <a href="rahulkridhna@gmail.com">Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;