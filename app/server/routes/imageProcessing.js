const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Set up multer for handling multipart/form-data
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + fileExt);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Add a test endpoint to check if the route is working
router.get('/test', (req, res) => {
  res.json({ status: 'API is working' });
});

// Process image route
router.post('/process-image', upload.single('image'), async (req, res) => {
  try {
    console.log('Processing image request received');
    
    if (!req.file) {
      console.error('No image file provided in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log(`Image received: ${req.file.originalname}, saved as: ${req.file.filename}`);
    
    const imagePath = req.file.path;
    const filename = path.basename(imagePath, path.extname(imagePath));
    
    // Path to the imgtojson.py script
    const scriptPath = path.join(__dirname, '../../../imgtojson.py');
    console.log(`Using Python script at: ${scriptPath}`);
    console.log(`Processing image at: ${imagePath}`);
    
    // Run the Python script with the image path
    const pythonProcess = spawn('python', [
      scriptPath,
      imagePath
    ]);

    let scriptOutput = '';
    let scriptError = '';

    // Collect data from script's stdout
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      scriptOutput += output;
      console.log(`Python script output: ${output}`);
    });

    // Collect error output if any
    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      scriptError += error;
      console.error(`Python script error: ${error}`);
    });

    // Handle script completion
    const exitCode = await new Promise((resolve) => {
      pythonProcess.on('close', resolve);
    });

    console.log(`Python script completed with exit code: ${exitCode}`);
    
    if (exitCode !== 0) {
      console.error(`Python script failed with exit code ${exitCode}`);
      console.error(`Error output: ${scriptError}`);
      return res.status(500).json({ error: 'Failed to process image', details: scriptError });
    }

    // Return the path to the JSON file
    const jsonPath = `/assets/data/${filename}.json`;
    console.log(`JSON file generated at: ${jsonPath}`);
    
    return res.json({
      success: true,
      jsonPath: jsonPath,
      message: 'Image processed successfully'
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: error.message || 'Failed to process image' });
  }
});

module.exports = router;
