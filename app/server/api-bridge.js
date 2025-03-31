/**
 * This bridge script loads both the new server.js and the original api.js functionality
 * to ensure backward compatibility with the ExplainableAI features
 */
console.log('Starting WhyteBox API Bridge...');

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const imageProcessingRoutes = require('./routes/imageProcessing');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== Middleware =====
// Enable CORS with specific options
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Parse JSON request body with increased limits for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the public directory - UPDATED with more explicit logging
app.use(express.static(path.join(__dirname, '../public')));
console.log(`Serving static files from: ${path.join(__dirname, '../public')}`);

// ===== Configure multer for file uploads =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/assets/data/uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `user-image-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ===== Routes =====
console.log('Registering combined routes:');
console.log('- GET /api/test');
console.log('- POST /api/process-image');
console.log('- POST /api/explainable-ai');

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Unified API server is running', 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Image processing routes
app.use('/api', imageProcessingRoutes);

// API endpoint for image upload and processing (from api.js)
app.post('/api/process-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const imagePath = req.file.path;
  const baseFilename = path.basename(req.file.filename, path.extname(req.file.filename));
  const outputDir = path.join(__dirname, '../public/assets/images/explanations');
  
  // Create explanations directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Check if both script paths exist and use the first available one
  const scriptPaths = [
    path.join(__dirname, '../scripts/xai.py'),
  ];

  let scriptPath = null;
  for (const path of scriptPaths) {
    if (fs.existsSync(path)) {
      scriptPath = path;
      break;
    }
  }

  if (!scriptPath) {
    console.error('No Python script found at any of the expected locations');
    return res.status(500).json({ 
      error: 'Python script not found', 
      details: 'Check installation paths'
    });
  }

  console.log(`Using Python script: ${scriptPath}`);

  // Execute the Python script for model visualization
  exec(`python "${scriptPath}" --image_path "${imagePath}" --output_dir "${outputDir}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return res.status(500).json({ error: 'Failed to process image' });
    }

    console.log(`Python script output: ${stdout}`);
    if (stderr) console.error(`Python script errors: ${stderr}`);

    // Define the explanation methods and their filename abbreviations
    const methods = {
      'saliency': 'sa',
      'integrated': 'in',
      'lime': 'li',
      'shap': 'sh'
    };
    
    const results = {};
    const imageId = baseFilename;
    
    // Check what files were actually generated
    for (const [method, abbr] of Object.entries(methods)) {
      const expectedFilePath = path.join(outputDir, `${imageId}_${abbr}.jpg`);
      const publicPath = `/assets/images/explanations/${imageId}_${abbr}.jpg`;
      
      if (fs.existsSync(expectedFilePath)) {
        results[method] = publicPath;
      } else {
        console.warn(`Warning: Expected file not found: ${expectedFilePath}`);
      }
    }
    
    return res.json({
      success: true,
      imageId: imageId,
      explanations: results
    });
  });
});

// ExplainableAI route handler
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
    console.log(`Saving explanations to: ${outputDir}`);
    
    // Generate a unique ID for this image
    const imageId = `xai_${Date.now()}`;
    const imagePath = path.join(outputDir, `${imageId}.jpg`);
    
    // Save the base64 image data as a file
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));
    console.log(`Saved input image to: ${imagePath}`);
    
    // Check multiple paths for the XAI script
    const possibleScriptPaths = [
      path.join(__dirname, '../scripts/xai.py'),
      
    ];
    
    let pythonScript = null;
    for (const scriptPath of possibleScriptPaths) {
      if (fs.existsSync(scriptPath)) {
        pythonScript = scriptPath;
        break;
      }
    }
    
    if (!pythonScript) {
      console.error('Python XAI script not found at any of the expected locations');
      return res.status(500).json({ 
        error: 'Python script not found', 
        details: `Checked paths: ${possibleScriptPaths.join(', ')}` 
      });
    }
    
    console.log(`Executing Python script: python "${pythonScript}" --image_path "${imagePath}" --output_dir "${outputDir}"`);
    
    exec(`python "${pythonScript}" --image_path "${imagePath}" --output_dir "${outputDir}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing XAI script: ${error.message}`);
        return res.status(500).json({ error: 'Failed to process XAI request', details: error.message });
      }
      
      console.log(`XAI script output: ${stdout}`);
      if (stderr) console.error(`XAI script errors: ${stderr}`);
      
      // Wait a short time to ensure files are fully written
      setTimeout(() => {
        // Define the explanation methods and their filename abbreviations
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
            console.log(`Found explanation file: ${expectedFilePath}`);
            // Check file size to ensure it's not empty or corrupt
            const stats = fs.statSync(expectedFilePath);
            console.log(`File size: ${stats.size} bytes`);
            
            if (stats.size > 0) {
              results[method] = publicPath;
            } else {
              console.warn(`Warning: File exists but is empty: ${expectedFilePath}`);
            }
          } else {
            console.warn(`Warning: Expected file not found: ${expectedFilePath}`);
          }
        }
        
        console.log(`Sending response with results:`, results);
        return res.json({
          success: true,
          imageId: imageId,
          explanations: results
        });
      }, 500); // Small delay to ensure file system has completed writing
    });
  } catch (error) {
    console.error('Server error processing ExplainableAI request:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
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

// Create app/python directory if it doesn't exist and copy the XAI script
(function setupPythonScripts() {
  try {
    const pythonDir = path.join(__dirname, '../python');
    if (!fs.existsSync(pythonDir)) {
      fs.mkdirSync(pythonDir, { recursive: true });
    }
    
    // Source XAI script - check multiple possible locations
    const possibleSourcePaths = [
      path.join(__dirname, '../../ZExplainability/xai.py'),
      path.join(__dirname, '../scripts/xai.py')
    ];
    
    let sourceXaiScript = null;
    for (const sourcePath of possibleSourcePaths) {
      if (fs.existsSync(sourcePath)) {
        sourceXaiScript = sourcePath;
        break;
      }
    }
    
    if (sourceXaiScript) {
      // Destination in app/python
      const destXaiScript = path.join(pythonDir, 'xai.py');
      
      // Copy the file if it doesn't exist or source is newer
      if (!fs.existsSync(destXaiScript) || 
          fs.statSync(sourceXaiScript).mtime > fs.statSync(destXaiScript).mtime) {
        fs.copyFileSync(sourceXaiScript, destXaiScript);
        console.log(`Copied XAI script to ${destXaiScript}`);
      }
      
      // Create compatibility symlink
      const compatScript = path.join(pythonDir, 'explainable_ai.py');
      if (!fs.existsSync(compatScript)) {
        // Create a Python redirect script instead of a symlink
        fs.writeFileSync(compatScript, 
          `# This is a compatibility script that redirects to xai.py\n` +
          `import os\n` +
          `import sys\n` +
          `# Get the directory of this script\n` +
          `script_dir = os.path.dirname(os.path.abspath(__file__))\n` +
          `# Path to the real script\n` +
          `target_script = os.path.join(script_dir, 'xai.py')\n` +
          `# Forward all arguments\n` +
          `os.execv(sys.executable, [sys.executable, target_script] + sys.argv[1:])\n`
        );
        console.log(`Created compatibility script ${compatScript}`);
      }
    } else {
      console.warn('Could not find source XAI script to copy');
    }
  } catch (error) {
    console.error('Error setting up Python scripts:', error);
  }
})();

// Start the unified server
app.listen(PORT, () => {
  console.log(`🚀 Unified API server running on port ${PORT}`);
  console.log(`API test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Explainable AI endpoint: http://localhost:${PORT}/api/explainable-ai`);
  console.log(`Image processing endpoint: http://localhost:${PORT}/api/process-image`);
});
