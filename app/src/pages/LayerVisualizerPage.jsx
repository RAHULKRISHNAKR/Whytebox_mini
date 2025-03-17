import { useNavigate } from 'react-router-dom'
import TensorSpaceVisualizer from '../components/TensorSpaceVisualizer'
import '../styles/LayerVisualizerPage.css'

function LayerVisualizerPage() {
  const navigate = useNavigate()

  return (
    <div className="layer-visualizer-container">
      <header className="visualizer-header">
        <h1>Neural Network Layer Visualization</h1>
        <p className="header-description">Interactive 3D visualization of neural network architecture</p>
      </header>
      
      <main className="visualizer-content">
        <div className="visualizer-wrapper">
          <TensorSpaceVisualizer />
        </div>
        
        <div className="controls-panel">
          <button 
            className="back-button"
            onClick={() => navigate('/')}
          >
            <span className="button-icon">←</span> Back to Home
          </button>
        </div>
      </main>
      
      <footer className="visualizer-footer">
        <p>WhyteBox Neural Network Visualization Tool</p>
      </footer>
    </div>
  )
}

export default LayerVisualizerPage