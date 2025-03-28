import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LayerVisualizerPage from './pages/LayerVisualizerPage'
import AnimationPage from './pages/AnimationPage';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/layer-visualizer" element={<LayerVisualizerPage />} />
        <Route path="/animation" element={<AnimationPage />} />
      </Routes>
    </Router>
  )
}

export default App