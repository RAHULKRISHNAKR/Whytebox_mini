import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as tf from '@tensorflow/tfjs';
import ExplainableAIService from '../services/ExplainableAIService';

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => {
  return {
    loadLayersModel: vi.fn(),
    browser: {
      fromPixels: vi.fn(() => ({
        toFloat: vi.fn(() => ({
          expandDims: vi.fn(() => ({
            shape: [1, 224, 224, 3]
          }))
        }))
      }))
    },
    div: vi.fn(),
    sub: vi.fn(),
    image: {
      resizeBilinear: vi.fn()
    },
    model: vi.fn(),
    tidy: vi.fn((fn) => fn()),
    grad: vi.fn(),
    valueAndGrads: vi.fn(),
    mean: vi.fn(),
    mul: vi.fn(),
    relu: vi.fn(),
    max: vi.fn(),
    argMax: vi.fn(),
    slice: vi.fn(),
    abs: vi.fn(),
    zerosLike: vi.fn(),
    add: vi.fn(),
    scalar: vi.fn(),
    zeros: vi.fn(),
    ones: vi.fn(),
    clone: vi.fn(),
    dispose: vi.fn(),
    expandDims: vi.fn(),
    squeeze: vi.fn(),
    sum: vi.fn(),
    dataSync: vi.fn(() => [0]),
    arraySync: vi.fn(() => [[0.5]])
  };
});

// Mock HTML Canvas API
const mockCanvasContext = {
  createImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(224 * 224 * 4)
  })),
  putImageData: vi.fn(),
  drawImage: vi.fn(),
  globalAlpha: 1.0,
  fillStyle: '',
  fillRect: vi.fn()
};

global.document = {
  createElement: vi.fn(() => ({
    getContext: vi.fn(() => mockCanvasContext),
    width: 224,
    height: 224,
    toDataURL: vi.fn(() => 'data:image/png;base64,mockImageData')
  }))
};

describe('ExplainableAIService', () => {
  let mockImage;
  
  beforeEach(() => {
    // Create a mock image
    mockImage = {
      width: 224,
      height: 224
    };
    
    // Setup TensorFlow mocks
    tf.loadLayersModel.mockResolvedValue({
      layers: [
        { name: 'conv2d_1', output: { shape: [null, 112, 112, 64] } }
      ],
      predict: vi.fn(() => ({
        dataSync: vi.fn(() => [0.9]),
        arraySync: vi.fn(() => [[0.9]]),
        slice: vi.fn(() => ({ dataSync: vi.fn(() => [0.9]) }))
      })),
      inputs: [],
      outputs: [{}]
    });
    
    // Reset any internal state
    ExplainableAIService.model = null;
    ExplainableAIService.lastLayer = null;
    ExplainableAIService.modelLoaded = false;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should load a model successfully', async () => {
    const result = await ExplainableAIService.loadModel('test/model.json');
    expect(result).toBe(true);
    expect(ExplainableAIService.modelLoaded).toBe(true);
    expect(tf.loadLayersModel).toHaveBeenCalledWith('test/model.json');
  });
  
  it('should preprocess an image correctly', () => {
    ExplainableAIService.preprocessImage(mockImage);
    expect(tf.browser.fromPixels).toHaveBeenCalledWith(mockImage);
  });
  
  it('should generate Grad-CAM visualization', async () => {
    // Setup
    ExplainableAIService.model = {
      predict: vi.fn(() => ({
        dataSync: vi.fn(() => [0]),
        arraySync: vi.fn(() => [[0.5]])
      })),
      inputs: [],
      outputs: [{}]
    };
    ExplainableAIService.lastLayer = { output: {} };
    ExplainableAIService.modelLoaded = true;
    
    // Execute
    const result = await ExplainableAIService.generateGradCAM(mockImage);
    
    // Verify
    expect(result).toHaveProperty('overlay');
    expect(result).toHaveProperty('heatmap');
    expect(result).toHaveProperty('prediction');
  });
  
  // Add more tests for other explanation methods as needed
});
