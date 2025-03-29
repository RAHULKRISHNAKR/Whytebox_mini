import cv2
import numpy as np
import json
import os

# List of image file paths
image_paths = [
r"D:\Projects\Personal\GitHub\Whytebox2.0\zsample\car.png"
]

# ImageNet means for normalization
imagenet_means = np.array([123.68, 116.779, 103.939], dtype=np.float32)

# Directory to save JSON files
output_dir = r"D:\Projects\Personal\GitHub\Whytebox2.0\zsample\json_outputs"
os.makedirs(output_dir, exist_ok=True)

for image_path in image_paths:
    # Load image
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


    if img is None:
        print(f"Warning: Could not load image {image_path}")
        continue

    # Resize to 224x224
    img = cv2.resize(img, (224, 224), interpolation=cv2.INTER_AREA)

    # Convert to float32
    img = img.astype(np.float32)

    # Subtract ImageNet means
    img -= imagenet_means

    # Reshape to (1, 224, 224, 3) for model input
    img = np.expand_dims(img, axis=0)

    # Flatten and round values
    flat_data = [round(float(value)) if value.is_integer() else float(value) for value in img.flatten()]

    # Save to JSON file
    image_name = os.path.splitext(os.path.basename(image_path))[0]
    json_path = os.path.join(output_dir, f"{image_name}.json")

    with open(json_path, "w") as f:
        json.dump(flat_data, f, separators=(',', ':'))

    print(f"JSON file saved successfully: {json_path}")
