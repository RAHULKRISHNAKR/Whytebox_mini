import LayerVisualizer from '../components/LayerVisualizer'
import { useNavigate } from 'react-router-dom'

function LayerVisualizerPage() {
  const navigate = useNavigate()

  return (
    <div>
      <LayerVisualizer />
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  )
}

export default LayerVisualizerPage