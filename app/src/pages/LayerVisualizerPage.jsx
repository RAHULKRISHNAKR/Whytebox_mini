import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import TensorSpaceVisualizer from '../components/TensorSpaceVisualizer.jsx'
import BeginnersGuide from '../components/BeginnersGuide'
import './LayerVisualizerPage.css'

function LayerVisualizerPage() {
  const navigate = useNavigate()
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div className="layer-visualizer-container">
      {showGuide && <BeginnersGuide onClose={() => setShowGuide(false)} />}
      
      <main className="visualizer-content">
        <div className="visualizer-wrapper">
          <TensorSpaceVisualizer />
        </div>
      </main>
      
      <footer className="visualizer-footer">
        <p>WhyteBox Neural Network Visualization Tool • Interactive 3D Exploration of MobileNetV1</p>
      </footer>
    </div>
  )
}

export default LayerVisualizerPage