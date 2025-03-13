import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <h1>Welcome to Whytebox</h1>
      <button 
        onClick={() => navigate('/layer-visualizer')}
        className="visualizer-button"
      >
        Open Layer Visualizer
      </button>
    </div>
  )
}

export default HomePage