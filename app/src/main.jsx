import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import * as THREE from "three";
import Stats from "stats-js";
import TWEEN from "@tweenjs/tween.js";
import TrackballControls from "three-trackballcontrols";
import * as tf from "@tensorflow/tfjs";

// Initialize TensorFlow.js to ensure it's ready
tf.ready().then(() => {
  console.log("TensorFlow.js is ready!");
}).catch(err => {
  console.error("Error initializing TensorFlow.js:", err);
});

window.THREE = THREE;
window.TrackballControls = TrackballControls;
window.Stats = Stats;
window.TWEEN = TWEEN;
window.tf = tf;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
