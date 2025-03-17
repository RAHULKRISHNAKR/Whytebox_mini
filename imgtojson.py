import cv2
import numpy as np
import json

# Load image as BGR (OpenCV loads as BGR by default)
img = cv2.imread("C:/Users/rahul/OneDrive/Documents/GitHub/Whytebox2.0/zsample/cat.png")

# Resize to 224x224
img = cv2.resize(img, (224, 224), interpolation=cv2.INTER_AREA)  # Resize while keeping quality

# Convert to float32
img = img.astype(np.float32)

# Subtract ImageNet means (to match pre-trained models)
imagenet_means = np.array([123.68, 116.779, 103.939], dtype=np.float32)
img -= imagenet_means  # This creates negative values

# Reshape to (1, 224, 224, 3) for model input
img = np.expand_dims(img, axis=0)

# Convert to a flattened list with natural rounding
flat_data = [round(float(value)) if value.is_integer() else float(value) for value in img.flatten()]

# Save to JSON file
with open("image_topology_cat.json", "w") as f:
    json.dump(flat_data, f, separators=(',', ':'))

print("JSON file saved successfully!")
