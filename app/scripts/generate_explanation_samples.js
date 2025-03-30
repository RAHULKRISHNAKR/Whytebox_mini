const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const tf = require('@tensorflow/tfjs-node');

// Ensure directories exist
const EXPLANATIONS_DIR = path.join(__dirname, '../public/assets/images/explanations');
if (!fs.existsSync(EXPLANATIONS_DIR)) {
  fs.mkdirSync(EXPLANATIONS_DIR, { recursive: true });
}

async function generateSampleExplanations() {
  console.log('Generating sample explanations for fallback use...');
  
  // List of sample images and methods
  const images = ['cat', 'dog', 'bird', 'car'];
  const methods = [
    { id: 'gradcam', abbr: 'gr' },
    { id: 'saliency', abbr: 'sa' },
    { id: 'integrated', abbr: 'in' },
    { id: 'lime', abbr: 'li' },
    { id: 'shap', abbr: 'sh' }
  ];
  
  // For each image and method combination
  for (const image of images) {
    console.log(`Processing ${image} image...`);
    const imagePath = path.join(__dirname, `../public/assets/data/${image}.png`);
    
    for (const method of methods) {
      const outputPath = path.join(EXPLANATIONS_DIR, `${image}_${method.abbr}.jpg`);
      
      // Create a simple colored canvas as placeholder
      const canvas = createCanvas(224, 224);
      const ctx = canvas.getContext('2d');
      
      // Draw a colored rectangle based on method
      switch(method.id) {
        case 'gradcam':
          drawGradientCanvas(ctx, '#ff0000', '#ffff00'); // Red to yellow
          break;
        case 'saliency':
          drawGradientCanvas(ctx, '#ffffff', '#000000'); // White to black
          break;
        case 'integrated':
          drawGradientCanvas(ctx, '#ff0000', '#0000ff'); // Red to blue
          break;
        case 'lime':
          drawGradientCanvas(ctx, '#00ff00', '#ff0000'); // Green to red
          break;
        case 'shap':
          drawGradientCanvas(ctx, '#ff0000', '#0000ff'); // Red to blue
          break;
      }
      
      // Overlay with the original image at 50% opacity
      try {
        const img = await loadImage(imagePath);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(img, 0, 0, 224, 224);
      } catch (err) {
        console.error(`Cannot load image ${imagePath}`, err);
      }
      
      // Save the result
      const buffer = canvas.toBuffer('image/jpeg');
      fs.writeFileSync(outputPath, buffer);
      console.log(`Created ${outputPath}`);
    }
  }
  
  console.log('Sample explanations generated successfully');
}

function drawGradientCanvas(ctx, color1, color2) {
  const gradient = ctx.createLinearGradient(0, 0, 224, 224);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 224, 224);
}

// Run the script
generateSampleExplanations().catch(console.error);
