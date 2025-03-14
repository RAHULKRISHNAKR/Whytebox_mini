import { useNavigate } from 'react-router-dom'
import TensorSpaceVisualizer from '../components/TensorSpaceVisualizer'

function LayerVisualizerPage() {
  const navigate = useNavigate()

  return (
    <div>
      <TensorSpaceVisualizer />
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  )
}

export default LayerVisualizerPage