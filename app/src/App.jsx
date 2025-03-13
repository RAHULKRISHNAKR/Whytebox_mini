import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LayerVisualizerPage from './pages/LayerVisualizerPage'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/layer-visualizer" element={<LayerVisualizerPage />} />
      </Routes>
    </Router>
  )
}

export default App