import tensorflow as tf
import numpy as np
import base64
import json
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
from tensorflow.keras.models import Model
from io import BytesIO
from PIL import Image

# Function to encode images to base64
def encode_image(image_array):
    img = Image.fromarray(image_array)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

# Load pre-trained MobileNetV2
model = tf.keras.applications.MobileNetV2(weights='imagenet', input_shape=(224, 224, 3))

# Define layers to visualize
selected_layer_names = ['block_1_expand_relu', 'block_3_expand_relu', 'block_6_expand_relu']
intermediate_outputs = [model.get_layer(name).output for name in selected_layer_names]
intermediate_model = Model(inputs=model.input, outputs=intermediate_outputs)

# Load and preprocess an image
img_path = '1.jpg'  # Replace with your image path
img = image.load_img(img_path, target_size=(224, 224))
img_array = image.img_to_array(img).astype('uint8')
img_array_input = np.expand_dims(img_array, axis=0)
img_array_input = preprocess_input(img_array_input)

# Get intermediate feature maps
feature_maps = intermediate_model.predict(img_array_input)

# Get final prediction
preds = model.predict(img_array_input)
top_preds = decode_predictions(preds, top=5)[0]

# Prepare data for JSON
output_data = {
    "input_image": encode_image(img_array),
    "layers": []
}

for layer_name, feature_map in zip(selected_layer_names, feature_maps):
    feature_map_img = feature_map[0, :, :, 0]  # First channel for visualization
    feature_map_img = (feature_map_img - feature_map_img.min()) / (feature_map_img.max() - feature_map_img.min())
    feature_map_img = (feature_map_img * 255).astype('uint8')
    output_data["layers"].append({
        "layer_name": layer_name,
        "feature_map": encode_image(feature_map_img)
    })

# Add predictions
output_data["predictions"] = [
    {"class": class_name, "probability": float(prob)} for (_, class_name, prob) in top_preds
]

# Save JSON file
with open("layer_data.json", "w") as f:
    json.dump(output_data, f, indent=4)
