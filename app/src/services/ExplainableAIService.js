import * as tf from '@tensorflow/tfjs';

/**
 * Service for implementing Explainable AI techniques using TensorFlow.js
 */
class ExplainableAIService {
  constructor() {
    this.model = null;
    this.inputTensor = null;
    this.lastLayer = null;
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
      
      // Get the last convolutional layer for Grad-CAM
      const layers = this.model.layers;
      for (let i = layers.length - 1; i >= 0; i--) {
        if (layers[i].name.includes('conv') && layers[i].output.shape.length === 4) {
          this.lastLayer = layers[i];
          console.log(`Using ${this.lastLayer.name} as the target layer for Grad-CAM`);
          break;
        }
      }
      
      this.modelLoaded = true;
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }

  /**
   * Preprocess an image for the model
   * @param {HTMLImageElement} image - The image element to process
   * @returns {tf.Tensor} The preprocessed image tensor
   */
  preprocessImage(image) {
    return tf.tidy(() => {
      // Convert the image to a tensor
      let tensor = tf.browser.fromPixels(image)
        .toFloat()
        .expandDims();
      
      // Normalize the image (MobileNet expects values between -1 and 1)
      tensor = tf.div(tf.sub(tensor, 127.5), 127.5);
      
      // Resize if needed (MobileNet expects 224x224)
      if (tensor.shape[1] !== 224 || tensor.shape[2] !== 224) {
        tensor = tf.image.resizeBilinear(tensor, [224, 224]);
      }
      
      this.inputTensor = tensor;
      return tensor;
    });
  }

  /**
   * Generate Grad-CAM visualization
   * @param {HTMLImageElement} image - The input image
   * @param {number|null} classIndex - Optional target class index (uses predicted class if not provided)
   * @returns {Object} The visualization result including the heatmap
   */
  async generateGradCAM(image, classIndex = null) {
    if (!this.model || !this.lastLayer) {
      throw new Error('Model not loaded or compatible layer not found');
    }

    // Use regular function instead of tf.tidy to avoid scope issues
    try {
      // Preprocess the image
      const inputTensor = this.preprocessImage(image);
      
      // Get the target class index if not provided
      let targetClassIndex = classIndex;
      
      if (targetClassIndex === null) {
        // Get the predicted class
        const predictions = this.model.predict(inputTensor);
        targetClassIndex = tf.argMax(predictions, 1).dataSync()[0];
      }
      
      // Create a model that outputs both the predictions and the activations of the last conv layer
      const gradModel = tf.model({
        inputs: this.model.inputs,
        outputs: [
          this.lastLayer.output,
          this.model.outputs[0]
        ]
      });
      
      // Get the activations and predictions
      const outputs = gradModel.predict(inputTensor);
      // Handle both array output and non-array output
      const convOutputs = Array.isArray(outputs) ? outputs[0] : outputs;
      const predictions = Array.isArray(outputs) ? outputs[1] : this.model.predict(inputTensor);
      
      // Use a different approach with tf.valueAndGrads for gradient calculation
      const targetClass = targetClassIndex;
      
      // Define a loss function to compute gradients
      const computeLoss = () => {
        const targetClassPredictions = tf.slice(
          predictions, 
          [0, targetClass], 
          [1, 1]
        );
        return targetClassPredictions;
      };
      
      // Use valueAndGrads instead of grad
      const { value, grads } = tf.valueAndGrads(computeLoss)();
      
      // Continue with the rest of the implementation
      // Handle gradients with respect to convOutputs
      // This is a simplification - in real implementation, we would need 
      // to compute gradients with respect to the last conv layer
      
      // Since we can't directly get gradients with respect to the intermediates,
      // let's use a simplified approach
      
      // Extract features from the last convolutional layer
      const features = convOutputs.squeeze([0]);
      
      // Global average pooling to get feature importance
      const pooledFeatures = tf.mean(features, [0, 1]);
      
      // Use these pooled features as weights for the feature maps
      const weightedFeatures = tf.mul(
        features,
        pooledFeatures.reshape([1, 1, pooledFeatures.shape[0]])
      );
      
      // Take the mean across feature channels
      let heatmap = tf.mean(weightedFeatures, -1);
      
      // Apply ReLU to the heatmap
      heatmap = tf.relu(heatmap);
      
      // Normalize the heatmap
      const max = tf.max(heatmap);
      heatmap = tf.div(heatmap, max);
      
      // Convert to visualization format
      const heatmapData = this.convertHeatmapToCanvas(heatmap, image.width, image.height);
      const overlayData = this.overlayHeatmap(image, heatmapData);
      
      // Get predictions
      const predictedClass = tf.argMax(predictions, 1).dataSync()[0];
      const predictedScore = tf.max(predictions).dataSync()[0] * 100;
      
      // Clean up tensors
      inputTensor.dispose();
      convOutputs.dispose();
      predictions.dispose();
      heatmap.dispose();
      max.dispose();
      
      return {
        heatmap: heatmapData.toDataURL(),
        overlay: overlayData.toDataURL(),
        prediction: {
          class: predictedClass,
          score: predictedScore.toFixed(2),
          targetClass: targetClassIndex
        }
      };
    } catch (error) {
      console.error("GradCAM error:", error);
      throw error;
    }
  }

  /**
   * Generate Saliency Map visualization
   * @param {HTMLImageElement} image - The input image
   * @param {number|null} classIndex - Optional target class index (uses predicted class if not provided)
   * @returns {Object} The visualization result
   */
  async generateSaliencyMap(image, classIndex = null) {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    return tf.tidy(() => {
      // Preprocess the image
      const inputTensor = this.preprocessImage(image);
      
      // Get the target class index if not provided
      let targetClassIndex = classIndex;
      
      if (targetClassIndex === null) {
        // Get the predicted class
        const predictions = this.model.predict(inputTensor);
        targetClassIndex = tf.argMax(predictions, 1).dataSync()[0];
      }
      
      // Define a gradient function for the target class
      const gradFunction = tf.grad(x => {
        const predictions = this.model.predict(x);
        return predictions.slice([0, targetClassIndex], [1, 1]);
      });
      
      // Calculate gradients of input with respect to the target class score
      const gradients = gradFunction(inputTensor);
      
      // Take the absolute value to get the magnitude of the gradient
      const absoluteGradients = tf.abs(gradients).squeeze();
      
      // Reduce to a single channel by taking the maximum across RGB channels
      const saliencyMap = tf.max(absoluteGradients, -1);
      
      // Normalize the saliency map
      const max = tf.max(saliencyMap);
      const normalizedMap = tf.div(saliencyMap, max);
      
      // Convert to visualization format
      const heatmapData = this.convertSaliencyToCanvas(normalizedMap, image.width, image.height);
      const overlayData = this.overlayHeatmap(image, heatmapData);
      
      // Get predictions
      const predictions = this.model.predict(inputTensor);
      const predictedClass = tf.argMax(predictions, 1).dataSync()[0];
      const predictedScore = tf.max(predictions).dataSync()[0] * 100;
      
      return {
        heatmap: heatmapData.toDataURL(),
        overlay: overlayData.toDataURL(),
        prediction: {
          class: predictedClass,
          score: predictedScore.toFixed(2),
          targetClass: targetClassIndex
        }
      };
    });
  }

  /**
   * Generate Integrated Gradients visualization
   * @param {HTMLImageElement} image - The input image
   * @param {number|null} classIndex - Optional target class index (uses predicted class if not provided)
   * @param {number} steps - Number of steps for the integration (default: 50)
   * @returns {Object} The visualization result
   */
  async generateIntegratedGradients(image, classIndex = null, steps = 50) {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    return tf.tidy(() => {
      // Preprocess the image
      const inputTensor = this.preprocessImage(image);
      
      // Get the target class index if not provided
      let targetClassIndex = classIndex;
      
      if (targetClassIndex === null) {
        // Get the predicted class
        const predictions = this.model.predict(inputTensor);
        targetClassIndex = tf.argMax(predictions, 1).dataSync()[0];
      }
      
      // Create a baseline (black image)
      const baseline = tf.zeros(inputTensor.shape);
      
      // Generate scaled inputs from baseline to input
      const scaledInputs = [];
      for (let i = 0; i <= steps; i++) {
        const scale = i / steps;
        const scaledInput = tf.add(
          tf.mul(inputTensor, tf.scalar(scale)),
          tf.mul(baseline, tf.scalar(1 - scale))
        );
        scaledInputs.push(scaledInput);
      }
      
      // Compute gradients for each scaled input
      const gradFunction = tf.grad(x => {
        const predictions = this.model.predict(x);
        return predictions.slice([0, targetClassIndex], [1, 1]);
      });
      
      // Calculate gradients for each step
      const gradients = scaledInputs.map(input => gradFunction(input));
      
      // Average the gradients
      let summedGradients = tf.zerosLike(gradients[0]);
      for (const gradient of gradients) {
        summedGradients = tf.add(summedGradients, gradient);
      }
      
      // Multiply by (input - baseline) / steps for Riemann approximation
      const avgGradients = tf.div(summedGradients, tf.scalar(steps + 1));
      const inputDiff = tf.sub(inputTensor, baseline);
      const integratedGrads = tf.mul(avgGradients, inputDiff);
      
      // Reduce to single channel and normalize
      const attributions = tf.abs(tf.sum(integratedGrads, -1)).squeeze();
      const max = tf.max(attributions);
      const normalizedAttributions = tf.div(attributions, max);
      
      // Convert to visualization format
      const heatmapData = this.convertSaliencyToCanvas(normalizedAttributions, image.width, image.height);
      const overlayData = this.overlayHeatmap(image, heatmapData);
      
      // Get predictions
      const predictions = this.model.predict(inputTensor);
      const predictedClass = tf.argMax(predictions, 1).dataSync()[0];
      const predictedScore = tf.max(predictions).dataSync()[0] * 100;
      
      return {
        heatmap: heatmapData.toDataURL(),
        overlay: overlayData.toDataURL(),
        prediction: {
          class: predictedClass,
          score: predictedScore.toFixed(2),
          targetClass: targetClassIndex
        }
      };
    });
  }

  /**
   * Generate LIME visualization (simplified implementation)
   * @param {HTMLImageElement} image - The input image
   * @param {number|null} classIndex - Optional target class index (uses predicted class if not provided)
   * @param {number} numSamples - Number of perturbed samples to generate (default: 50)
   * @returns {Object} The visualization result
   */
  async generateLIME(image, classIndex = null, numSamples = 50) {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    return tf.tidy(() => {
      // Preprocess the image
      const inputTensor = this.preprocessImage(image);
      
      // Get the target class index if not provided
      let targetClassIndex = classIndex;
      const predictions = this.model.predict(inputTensor);
      
      if (targetClassIndex === null) {
        // Get the predicted class
        targetClassIndex = tf.argMax(predictions, 1).dataSync()[0];
      }
      
      // Get the prediction score for the target class
      const originalScore = predictions.arraySync()[0][targetClassIndex];
      
      // Create a segmentation map (simplified - just divides the image into 8x8 grid)
      const segmentSize = 28; // 224 / 8
      const numSegments = 8;
      
      // Create a matrix to hold attribution values for each segment
      const attributions = new Array(numSegments * numSegments).fill(0);
      
      // Create perturbed samples by masking random segments
      for (let i = 0; i < numSamples; i++) {
        // Create a random binary mask for segments
        const segmentMask = new Array(numSegments * numSegments)
          .fill(0)
          .map(() => Math.random() > 0.5 ? 1 : 0);
        
        // Create an image mask based on the segment mask
        const imageMask = tf.tidy(() => {
          // Create an empty mask
          const mask = tf.ones([1, 224, 224, 1]);
          
          // Fill in the mask based on segments
          for (let y = 0; y < numSegments; y++) {
            for (let x = 0; x < numSegments; x++) {
              const segmentIdx = y * numSegments + x;
              if (segmentMask[segmentIdx] === 0) {
                // Zero out this segment
                const yStart = y * segmentSize;
                const xStart = x * segmentSize;
                mask.slice(
                  [0, yStart, xStart, 0], 
                  [1, segmentSize, segmentSize, 1]
                ).assign(tf.zeros([1, segmentSize, segmentSize, 1]));
              }
            }
          }
          return mask;
        });
        
        // Apply the mask to the input
        const perturbedInput = tf.mul(inputTensor, imageMask);
        
        // Get prediction for perturbed input
        const perturbedPrediction = this.model.predict(perturbedInput);
        const perturbedScore = perturbedPrediction.arraySync()[0][targetClassIndex];
        
        // Calculate importance of each segment based on how it affects prediction
        const scoreDiff = originalScore - perturbedScore;
        for (let j = 0; j < numSegments * numSegments; j++) {
          // If segment is present (1), add the score difference
          if (segmentMask[j] === 1) {
            attributions[j] += scoreDiff;
          }
        }
      }
      
      // Normalize attributions
      const maxAttribution = Math.max(...attributions.map(a => Math.abs(a)));
      const normalizedAttributions = attributions.map(a => a / maxAttribution);
      
      // Create a heatmap from the attributions
      const heatmapCanvas = document.createElement('canvas');
      heatmapCanvas.width = image.width;
      heatmapCanvas.height = image.height;
      const ctx = heatmapCanvas.getContext('2d');
      
      // Create a heatmap by coloring each segment
      for (let y = 0; y < numSegments; y++) {
        for (let x = 0; x < numSegments; x++) {
          const segmentIdx = y * numSegments + x;
          const value = normalizedAttributions[segmentIdx];
          
          // Skip if attribution is too low
          if (Math.abs(value) < 0.2) continue;
          
          // Set color based on positive or negative attribution
          if (value > 0) {
            // Positive attribution (green)
            ctx.fillStyle = `rgba(0, 255, 0, ${Math.abs(value) * 0.7})`;
          } else {
            // Negative attribution (red)
            ctx.fillStyle = `rgba(255, 0, 0, ${Math.abs(value) * 0.7})`;
          }
          
          // Fill the segment
          const xPos = x * (image.width / numSegments);
          const yPos = y * (image.height / numSegments);
          const width = image.width / numSegments;
          const height = image.height / numSegments;
          ctx.fillRect(xPos, yPos, width, height);
        }
      }
      
      // Overlay the heatmap on the original image
      const overlayData = this.overlayLIME(image, heatmapCanvas);
      
      // Get prediction info
      const predictedClass = tf.argMax(predictions, 1).dataSync()[0];
      const predictedScore = tf.max(predictions).dataSync()[0] * 100;
      
      return {
        heatmap: heatmapCanvas.toDataURL(),
        overlay: overlayData.toDataURL(),
        prediction: {
          class: predictedClass,
          score: predictedScore.toFixed(2),
          targetClass: targetClassIndex
        }
      };
    });
  }

  /**
   * Generate SHAP visualization (simplified implementation for browser)
   * @param {HTMLImageElement} image - The input image
   * @param {number|null} classIndex - Optional target class index (uses predicted class if not provided)
   * @param {number} numSamples - Number of samples for SHAP approximation (default: 50)
   * @returns {Object} The visualization result
   */
  async generateSHAP(image, classIndex = null, numSamples = 50) {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    return tf.tidy(() => {
      // Preprocess the image
      const inputTensor = this.preprocessImage(image);
      
      // Get the target class index if not provided
      let targetClassIndex = classIndex;
      const predictions = this.model.predict(inputTensor);
      
      if (targetClassIndex === null) {
        // Get the predicted class
        targetClassIndex = tf.argMax(predictions, 1).dataSync()[0];
      }
      
      // For SHAP, we'll use a simplified approach since true SHAP is computationally expensive
      // We'll use kernel SHAP with superpixels (similar to LIME but with Shapley values)
      
      // Create a segmentation map (simplified - just divides the image into 8x8 grid)
      const segmentSize = 28; // 224 / 8
      const numSegments = 8;
      
      // Create arrays to hold attribution values and weights for each segment
      const attributions = new Array(numSegments * numSegments).fill(0);
      const weights = new Array(numSegments * numSegments).fill(0);
      
      // Get baseline prediction (gray image)
      const baseline = tf.ones(inputTensor.shape).mul(tf.scalar(0.5));
      const baselinePred = this.model.predict(baseline);
      const baselineScore = baselinePred.arraySync()[0][targetClassIndex];
      
      // Create random coalitions (combinations of segments)
      for (let i = 0; i < numSamples; i++) {
        // Create a random binary mask for segments
        const segmentMask = new Array(numSegments * numSegments)
          .fill(0)
          .map(() => Math.random() > 0.5 ? 1 : 0);
        
        // Count segments included in this coalition
        const numIncluded = segmentMask.filter(v => v === 1).length;
        
        // Skip if all or none are included (no marginal contribution)
        if (numIncluded === 0 || numIncluded === numSegments * numSegments) {
          continue;
        }
        
        // Calculate shapley kernel weight
        const shapleyWeight = this.calculateShapleyWeight(numIncluded, numSegments * numSegments);
        
        // Create an image with only the included segments from original image
        const coalitionImage = tf.tidy(() => {
          // Start with baseline
          const result = tf.clone(baseline);
          
          // Add in original segments where mask is 1
          for (let y = 0; y < numSegments; y++) {
            for (let x = 0; x < numSegments; x++) {
              const segmentIdx = y * numSegments + x;
              if (segmentMask[segmentIdx] === 1) {
                // Copy this segment from original
                const yStart = y * segmentSize;
                const xStart = x * segmentSize;
                
                const segment = inputTensor.slice(
                  [0, yStart, xStart, 0], 
                  [1, segmentSize, segmentSize, 3]
                );
                
                // Insert segment into result
                const segmentAssign = result.slice(
                  [0, yStart, xStart, 0], 
                  [1, segmentSize, segmentSize, 3]
                ).assign(segment);
              }
            }
          }
          return result;
        });
        
        // Get prediction for coalition image
        const coalitionPred = this.model.predict(coalitionImage);
        const coalitionScore = coalitionPred.arraySync()[0][targetClassIndex];
        
        // Calculate marginal contribution
        const contribution = coalitionScore - baselineScore;
        
        // Distribute contribution to each included segment
        for (let j = 0; j < segmentMask.length; j++) {
          if (segmentMask[j] === 1) {
            attributions[j] += contribution * shapleyWeight;
            weights[j] += shapleyWeight;
          }
        }
      }
      
      // Normalize attributions by weights
      const normalizedAttributions = attributions.map((a, i) => 
        weights[i] > 0 ? a / weights[i] : 0
      );
      
      // Find max absolute attribution for normalization
      const maxAbsAttribution = Math.max(...normalizedAttributions.map(a => Math.abs(a)));
      const scaledAttributions = normalizedAttributions.map(a => a / maxAbsAttribution);
      
      // Create a heatmap from the attributions
      const heatmapCanvas = document.createElement('canvas');
      heatmapCanvas.width = image.width;
      heatmapCanvas.height = image.height;
      const ctx = heatmapCanvas.getContext('2d');
      
      // Draw attributions as a heatmap
      for (let y = 0; y < numSegments; y++) {
        for (let x = 0; x < numSegments; x++) {
          const segmentIdx = y * numSegments + x;
          const value = scaledAttributions[segmentIdx];
          
          // Use red-blue color scheme: red for positive, blue for negative
          let r = 0, g = 0, b = 0, alpha = 0.7;
          if (value > 0) {
            r = Math.round(255 * value);
            g = 0;
            b = 0;
          } else {
            r = 0;
            g = 0;
            b = Math.round(255 * Math.abs(value));
          }
          
          // Skip very low values
          if (Math.abs(value) < 0.1) continue;
          
          // Fill the segment
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          const xPos = x * (image.width / numSegments);
          const yPos = y * (image.height / numSegments);
          const width = image.width / numSegments;
          const height = image.height / numSegments;
          ctx.fillRect(xPos, yPos, width, height);
        }
      }
      
      // Overlay the heatmap on the original image
      const overlayData = this.overlayLIME(image, heatmapCanvas);
      
      // Get prediction info
      const predictedClass = tf.argMax(predictions, 1).dataSync()[0];
      const predictedScore = tf.max(predictions).dataSync()[0] * 100;
      
      return {
        heatmap: heatmapCanvas.toDataURL(),
        overlay: overlayData.toDataURL(),
        prediction: {
          class: predictedClass,
          score: predictedScore.toFixed(2),
          targetClass: targetClassIndex
        }
      };
    });
  }

  /**
   * Helper method to calculate Shapley kernel weight
   * @param {number} coalitionSize - Size of the coalition
   * @param {number} totalFeatures - Total number of features
   * @returns {number} The weight for this coalition size
   */
  calculateShapleyWeight(coalitionSize, totalFeatures) {
    // Shapley kernel weight formula
    const numerator = totalFeatures - 1;
    const denominator = coalitionSize * (totalFeatures - coalitionSize);
    
    // Handle edge cases
    if (coalitionSize === 0 || coalitionSize === totalFeatures) {
      return 0;
    }
    
    return numerator / denominator;
  }

  /**
   * Convert a saliency tensor to a canvas (grayscale)
   * @param {tf.Tensor} saliency - The saliency tensor
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @returns {HTMLCanvasElement} The canvas with the saliency map
   */
  convertSaliencyToCanvas(saliency, width, height) {
    // Resize saliency if needed
    const resizedSaliency = tf.tidy(() => {
      return tf.image.resizeBilinear(
        saliency.expandDims(-1).expandDims(0),
        [height, width]
      ).squeeze();
    });
    
    // Get the data from the tensor
    const saliencyData = resizedSaliency.dataSync();
    
    // Create a canvas to draw the saliency
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create the image data
    const imageData = ctx.createImageData(width, height);
    
    // Set pixel values (white for important, black for not)
    for (let i = 0; i < saliencyData.length; i++) {
      const value = saliencyData[i];
      const idx = i * 4;
      
      // Use white for important areas
      const intensity = Math.round(value * 255);
      imageData.data[idx] = intensity;
      imageData.data[idx + 1] = intensity;
      imageData.data[idx + 2] = intensity;
      imageData.data[idx + 3] = 255; // Full opacity
    }
    
    // Put the image data on the canvas
    ctx.putImageData(imageData, 0, 0);
    resizedSaliency.dispose();
    
    return canvas;
  }

  /**
   * Custom overlay for LIME and SHAP visualizations
   * @param {HTMLImageElement} image - The original image
   * @param {HTMLCanvasElement} heatmapCanvas - The heatmap canvas
   * @returns {HTMLCanvasElement} The canvas with the overlay
   */
  overlayLIME(image, heatmapCanvas) {
    // Create a canvas for the overlay
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    
    // Draw the original image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Draw the heatmap with transparency
    ctx.globalAlpha = 0.7;
    ctx.drawImage(heatmapCanvas, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    
    return canvas;
  }

  /**
   * Convert a heatmap tensor to a canvas
   * @param {tf.Tensor} heatmap - The heatmap tensor
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @returns {HTMLCanvasElement} The canvas with the heatmap
   */
  convertHeatmapToCanvas(heatmap, width, height) {
    // Resize heatmap if needed
    const resizedHeatmap = tf.tidy(() => {
      return tf.image.resizeBilinear(
        heatmap.expandDims(-1).expandDims(0),
        [height, width]
      ).squeeze();
    });
    
    // Get the data from the tensor
    const heatmapData = resizedHeatmap.dataSync();
    
    // Create a canvas to draw the heatmap
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Create the image data
    const imageData = ctx.createImageData(width, height);
    
    // Set pixel values (colormap - blue to red)
    for (let i = 0; i < heatmapData.length; i++) {
      const value = heatmapData[i];
      const idx = i * 4;
      
      // Jet colormap: blue -> cyan -> yellow -> red
      let r, g, b;
      if (value < 0.25) {
        r = 0;
        g = 4 * value;
        b = 1;
      } else if (value < 0.5) {
        r = 0;
        g = 1;
        b = 1 - 4 * (value - 0.25);
      } else if (value < 0.75) {
        r = 4 * (value - 0.5);
        g = 1;
        b = 0;
      } else {
        r = 1;
        g = 1 - 4 * (value - 0.75);
        b = 0;
      }
      
      imageData.data[idx] = Math.round(r * 255);
      imageData.data[idx + 1] = Math.round(g * 255);
      imageData.data[idx + 2] = Math.round(b * 255);
      imageData.data[idx + 3] = 255; // Full opacity
    }
    
    // Put the image data on the canvas
    ctx.putImageData(imageData, 0, 0);
    resizedHeatmap.dispose();
    
    return canvas;
  }

  /**
   * Overlay a heatmap on the original image
   * @param {HTMLImageElement} image - The original image
   * @param {HTMLCanvasElement} heatmapCanvas - The heatmap canvas
   * @returns {HTMLCanvasElement} The canvas with the overlay
   */
  overlayHeatmap(image, heatmapCanvas) {
    // Create a canvas for the overlay
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    
    // Draw the original image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Draw the heatmap with transparency
    ctx.globalAlpha = 0.6;
    ctx.drawImage(heatmapCanvas, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    
    return canvas;
  }

  /**
   * Check if the model is loaded
   * @returns {boolean} Whether the model is loaded
   */
  isModelLoaded() {
    return this.modelLoaded;
  }
}

// Export as a singleton instance
export default new ExplainableAIService();
