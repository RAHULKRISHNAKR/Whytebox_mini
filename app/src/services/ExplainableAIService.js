import * as tf from '@tensorflow/tfjs';

/**
 * Service for using Explainable AI techniques with pre-generated visualizations
 */
class ExplainableAIService {
  constructor() {
    this.model = null;
    this.modelLoaded = false;
  }

  /**
   * Load the model from the specified URL
   * @param {string} modelUrl - URL to the model.json file
   */
  async loadModel(modelUrl) {
    try {
      console.log('Loading model from:', modelUrl);
      this.model = await tf.loadLayersModel(modelUrl);
      console.log('Model loaded successfully');
      this.modelLoaded = true;
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }

  /**
   * Get pre-generated visualization path for the specified method
   * @param {string} imageName - Name of the input image (e.g., 'cat', 'dog')
   * @param {string} method - Explanation method (gradcam, saliency, integrated, lime, shap)
   * @returns {Object} Object containing the image path and mock prediction data
   */
  getVisualization(imageName, method) {
    // Convert method to abbreviation used in filenames
    const methodAbbr = this.getMethodAbbreviation(method);
    
    // Create path to pre-generated image
    const imagePath = `/assets/images/explanations/${imageName}_${methodAbbr}.jpg`;
    console.log(`Using pre-generated explanation: ${imagePath}`);
    
    // Return mock result in same format as original implementation expected
    return {
      overlay: imagePath,
      heatmap: imagePath, // Same image used for both
      prediction: {
        class: 0, // Mock class ID
        score: "95.00", // Mock confidence score
        targetClass: 0 // Mock target class
      }
    };
  }
  
  /**
   * Convert method name to abbreviation used in filenames
   * @param {string} method - Method name
   * @returns {string} Two-letter abbreviation
   */
  getMethodAbbreviation(method) {
    const abbreviations = {
      'gradcam': 'gr',
      'saliency': 'sa',
      'integrated': 'in',
      'lime': 'li',
      'shap': 'sh'
    };
    return abbreviations[method] || method.substring(0, 2);
  }

  /**
   * Check if the model is loaded
   * @returns {boolean} Whether the model is loaded
   */
  isModelLoaded() {
    return this.modelLoaded;
  }
  
  // Add method aliases to maintain API compatibility
  generateGradCAM(image, classIndex) {
    return this.getVisualization(image.id || 'cat', 'gradcam');
  }
  
  generateSaliencyMap(image, classIndex) {
    return this.getVisualization(image.id || 'cat', 'saliency');
  }
  
  generateIntegratedGradients(image, classIndex) {
    return this.getVisualization(image.id || 'cat', 'integrated');
  }
  
  generateLIME(image, classIndex) {
    return this.getVisualization(image.id || 'cat', 'lime');
  }
  
  generateSHAP(image, classIndex) {
    return this.getVisualization(image.id || 'cat', 'shap');
  }
}

// Export as a singleton instance
export default new ExplainableAIService();
