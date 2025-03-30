# Explainable AI Module Documentation

This document provides detailed information about the Explainable AI module in WhyteBox.

## Overview

The Explainable AI module allows users to visualize and understand how neural networks make decisions. It implements various state-of-the-art techniques to generate visual explanations for image classifications.

## Explanation Methods

### Grad-CAM

Gradient-weighted Class Activation Mapping (Grad-CAM) uses the gradients of any target concept flowing into the final convolutional layer to produce a coarse localization map highlighting the important regions in the image for predicting the concept.

**Implementation**: `ExplainableAIService.generateGradCAM(image, classIndex)`

**Parameters**:
- `image`: HTMLImageElement - The input image
- `classIndex`: number|null - Optional target class index (uses predicted class if not provided)

**Returns**: Object containing heatmap, overlay, and prediction information

### Saliency Maps

Saliency maps show which pixels in the input image would need to be changed the least to affect the classification score the most.

**Implementation**: `ExplainableAIService.generateSaliencyMap(image, classIndex)`

### Integrated Gradients

Integrated Gradients attribute the prediction of a deep network to its input features by accumulating gradients along a path from a baseline (usually a black image) to the input.

**Implementation**: `ExplainableAIService.generateIntegratedGradients(image, classIndex, steps)`

### LIME

Local Interpretable Model-agnostic Explanations (LIME) explains predictions by approximating the model locally with a simpler, interpretable model.

**Implementation**: `ExplainableAIService.generateLIME(image, classIndex, numSamples)`

### SHAP

SHapley Additive exPlanations (SHAP) use game theory to assign each feature an importance value for a particular prediction.

**Implementation**: `ExplainableAIService.generateSHAP(image, classIndex, numSamples)`

## API Reference

### ExplainableAIService

Core service implementing the explanation algorithms.

#### Methods

| Method | Description |
|--------|-------------|
| `loadModel(modelUrl)` | Loads a TensorFlow.js model from the specified URL |
| `preprocessImage(image)` | Preprocesses an image for the model |
| `generateGradCAM(image, classIndex)` | Generates Grad-CAM visualization |
| `generateSaliencyMap(image, classIndex)` | Generates saliency map visualization |
| `generateIntegratedGradients(image, classIndex, steps)` | Generates integrated gradients visualization |
| `generateLIME(image, classIndex, numSamples)` | Generates LIME visualization |
| `generateSHAP(image, classIndex, numSamples)` | Generates SHAP visualization |
| `isModelLoaded()` | Checks if the model is loaded |

## Usage Example

```jsx
import ExplainableAIService from '../services/ExplainableAIService';

// Load the model
await ExplainableAIService.loadModel('/path/to/model.json');

// Generate an explanation
const imageElement = document.getElementById('myImage');
const explanation = await ExplainableAIService.generateGradCAM(imageElement);

// Display the result
document.getElementById('result').src = explanation.overlay;
```

## Performance Considerations

- Explanation generation can be computationally intensive, especially for LIME and SHAP
- Consider using the pre-generated fallbacks for demonstrations
- For real-time applications, Grad-CAM and Saliency Maps are typically faster

## Browser Compatibility

This module requires:
- TensorFlow.js support
- WebGL for GPU acceleration (falls back to CPU)
- Canvas API support
