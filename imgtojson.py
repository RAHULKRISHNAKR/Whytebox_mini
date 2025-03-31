import cv2
import numpy as np
import json
import os
import sys

# Directory to save JSON files - use absolute path as specified
output_dir = r"app\public\assets\data"
os.makedirs(output_dir, exist_ok=True)

# ImageNet means for normalization
imagenet_means = np.array([123.68, 116.779, 103.939], dtype=np.float32)

def process_image(image_path):
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Warning: Could not load image {image_path}")
        return False
        
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

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
    return True

if __name__ == "__main__":
    # Handle command-line arguments
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        process_image(image_path)
    else:
        # Default behavior: process the list of images
        image_paths = [
            r"zsample/car2.png",
            # Add more default images if needed
        ]
        
        for image_path in image_paths:
            process_image(image_path)
