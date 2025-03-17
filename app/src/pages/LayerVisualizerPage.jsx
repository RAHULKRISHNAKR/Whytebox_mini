import { useNavigate } from 'react-router-dom'
import TensorSpaceVisualizer from '../components/TensorSpaceVisualizer'
import '../styles/LayerVisualizerPage.css'

function LayerVisualizerPage() {
  const navigate = useNavigate()

  return (
    <div className="layer-visualizer-container">
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