const express = require('express');
const cors = require('cors');
const path = require('path');
const imageProcessingRoutes = require('./routes/imageProcessing');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS with more specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'], // Allow React dev server
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON request body
app.use(express.json());

// Increase payload size limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Print all registered routes for debugging
console.log('Registering routes:');
console.log('- GET /api/test');
console.log('- POST /api/process-image');
console.log('- POST /api/explainable-ai (from api.js)');

// Image processing routes
app.use('/api', imageProcessingRoutes);

// ExplainableAI route handler - adding compatibility with the API endpoint
app.post('/api/explainable-ai', (req, res) => {
  if (!req.body || !req.body.image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    // Get image data from request
    const imageData = req.body.image;
    const outputDir = path.join(__dirname, '../public/assets/images/explanations');
    
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate a unique ID for this image
    const imageId = `xai_${Date.now()}`;
    const imagePath = path.join(outputDir, `${imageId}_input.jpg`);
    
    // Save the base64 image data as a file
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));
    
    console.log(`ExplainableAI processing image: ${imagePath}`);
    
    // Path to the Python script
    const pythonScriptPath = path.join(__dirname, '../scripts/xai.py');
    
    // Run the Python script
    exec(`python "${pythonScriptPath}" --image_path "${imagePath}" --output_dir "${outputDir}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ExplainableAI script: ${error}`);
        return res.status(500).json({ 
          error: 'Failed to generate explanations',
          details: error.message
        });
      }
      
      console.log(`ExplainableAI script output: ${stdout}`);
      
      if (stderr) {
        console.error(`ExplainableAI script error: ${stderr}`);
      }
      
      // Collect the generated visualization paths
      const methods = {
        'gradcam': 'gr',
        'saliency': 'sa',
        'integrated': 'in',
        'lime': 'li',
        'shap': 'sh'
      };
      
      const results = {};
      
      // Check what files were actually generated
      for (const [method, abbr] of Object.entries(methods)) {
        const expectedFilePath = path.join(outputDir, `${imageId}_${abbr}.jpg`);
        const publicPath = `/assets/images/explanations/${imageId}_${abbr}.jpg`;
        
        if (fs.existsSync(expectedFilePath)) {
          results[method] = publicPath;
        }
      }
      
      return res.json({
        success: true,
        imageId: imageId,
        explanations: results
      });
    });
  } catch (error) {
    console.error('Server error processing ExplainableAI request:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Debug endpoint at root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    endpoints: [
      { method: 'GET', path: '/api/test', description: 'Test if API is working' },
      { method: 'POST', path: '/api/process-image', description: 'Process an image for visualization' },
      { method: 'POST', path: '/api/explainable-ai', description: 'Generate XAI visualizations' }
    ] 
  });
});

// For debugging - log all routes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.originalUrl}`);
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log(`Test the API with: http://localhost:${PORT}/api/test`);
});
