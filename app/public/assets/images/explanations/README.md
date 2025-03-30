# Explanation Samples

This directory contains pre-generated example visualizations used as fallbacks when the real-time explanation generation encounters errors.

## Naming Convention

Files follow this naming pattern:
- `[image_name]_[method_abbreviation].jpg`

Where:
- `image_name` is the name of the input image (cat, dog, bird, car) or a unique ID for user-uploaded images
- `method_abbreviation` is a two-letter code for the explanation method:
  - `gr` - Grad-CAM
  - `sa` - Saliency Maps
  - `in` - Integrated Gradients
  - `li` - LIME
  - `sh` - SHAP

## Generation

These samples can be generated in two ways:

1. For pre-built examples: Using the Python script at:
   `app/scripts/xai.py`

2. For user-uploaded images: Through the web interface by uploading an image and clicking "Generate Visualization"

User-uploaded images are processed by a Node.js API server that calls the Python script to generate the explanations. All explanations are stored in this directory for consistent access.
