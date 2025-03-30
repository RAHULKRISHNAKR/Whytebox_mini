# Explanation Samples

This directory contains pre-generated example visualizations used as fallbacks when the real-time explanation generation encounters errors.

## Naming Convention

Files follow this naming pattern:
- `[image_name]_[method_abbreviation].jpg`

Where:
- `image_name` is the name of the input image (cat, dog, bird, car)
- `method_abbreviation` is a two-letter code for the explanation method:
  - `gr` - Grad-CAM
  - `sa` - Saliency Maps
  - `in` - Integrated Gradients
  - `li` - LIME
  - `sh` - SHAP

## Generation

These samples were generated using the script at:
`app/scripts/generate_explanation_samples.js`

You can regenerate these samples if needed by running:
