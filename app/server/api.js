const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for React app
app.use(cors());

// Configure storage for uploaded files
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
    // Use a secure random filename to prevent path traversal attacks
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

// API endpoint for image upload and processing
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

  // Path to the Python script - updated to use the script in app/scripts
  const pythonScriptPath = path.join(__dirname, '../scripts/xai.py');
  
  console.log(`Processing image: ${imagePath}`);
  console.log(`Running Python script: ${pythonScriptPath}`);

  // Run the Python script with the uploaded image and specify output directory
  exec(`python "${pythonScriptPath}" --image_path "${imagePath}" --output_dir "${outputDir}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      return res.status(500).json({ 
        error: 'Failed to generate explanations',
        details: error.message
      });
    }
    
    console.log(`Python script output: ${stdout}`);
    
    if (stderr) {
      console.error(`Python script error: ${stderr}`);
    }
    
    // Extract just the numeric part of the filename for consistency
    const numericId = baseFilename.replace('user-image-', '');
    const simplifiedId = `xai_${numericId}`;
    
    console.log(`Using simplified ID for explanations: ${simplifiedId}`);
    
    // Collect the generated visualization paths with simplified naming
    const methods = {
      'gradcam': 'gr',
      'saliency': 'sa',
      'integrated': 'in',
      'lime': 'li',
      'shap': 'sh'
    };
    
    const results = {};
    
    // Check what files were actually generated using the new format with "_input_"
    for (const [method, abbr] of Object.entries(methods)) {
      const filePath = path.join(outputDir, `${simplifiedId}_input_${abbr}.jpg`);
      const publicPath = `/assets/images/explanations/${simplifiedId}_input_${abbr}.jpg`;
      
      if (fs.existsSync(filePath)) {
        console.log(`Found explanation file: ${filePath}`);
        results[method] = publicPath;
      } else {
        console.warn(`Warning: Expected file not found: ${filePath}`);
      }
    }
    
    return res.json({
      success: true,
      imageId: simplifiedId, // Return the simplified ID
      explanations: results
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
