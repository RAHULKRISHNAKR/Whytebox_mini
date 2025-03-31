import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications import MobileNet
from tensorflow.keras.models import Model
import cv2
import os

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = tf.keras.applications.mobilenet.preprocess_input(img_array)
    return img_array, img

def get_gradcam(model, img_array, class_index, layer_name):
    grad_model = Model(inputs=model.input, outputs=[model.get_layer(layer_name).output, model.output])

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        loss = predictions[:, class_index]

    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = tf.reduce_sum(tf.multiply(pooled_grads, conv_outputs), axis=-1)

    heatmap = np.maximum(heatmap, 0)
    heatmap /= np.max(heatmap)

    return heatmap

def overlay_heatmap(img_path, heatmap, output_path):
    img = cv2.imread(img_path)
    img = cv2.resize(img, (224, 224))
    
    heatmap = cv2.resize(heatmap, (224, 224))
    heatmap = np.uint8(255 * heatmap)

    colormap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img, 0.5, colormap, 0.5, 0)

    cv2.imwrite(output_path, overlay)
    print(f"Output saved to {output_path}")

def process_images(img_paths):
    model = MobileNet(weights='imagenet')

    for img_path in img_paths:
        if not os.path.isfile(img_path):
            print(f"Error: {img_path} does not exist.")
            continue
        
        ext = os.path.splitext(img_path)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png']:
            print(f"Error: Unsupported file format for {img_path}. Please use JPG or PNG.")
            continue
        
        try:
            img_array, original_img = preprocess_image(img_path)
            preds = model.predict(img_array)
            class_index = np.argmax(preds[0])
            class_label = tf.keras.applications.mobilenet.decode_predictions(preds, top=1)[0][0][1]
            print(f"Processing: {img_path} | Predicted Class: {class_label}")

            heatmap = get_gradcam(model, img_array, class_index, 'conv_pw_13_relu')
            output_path = os.path.splitext(img_path)[0] + '_GC.jpg'
            overlay_heatmap(img_path, heatmap, output_path)
        except Exception as e:
            print(f"Error processing {img_path}: {e}")

if __name__ == "__main__":
    img_paths = [
r"zsample\car2.png"
]  # Add as many images as you'd like
    process_images(img_paths)
