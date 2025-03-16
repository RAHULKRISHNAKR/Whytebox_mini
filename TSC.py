#!/usr/bin/env python
import os
import subprocess
import tensorflow as tf
from tensorflow.keras.applications import MobileNet

def main():
    # Load the pre-trained MobileNet (MobileNet V1)
    print("Loading MobileNet model...")
    model = MobileNet(weights='imagenet')

    # Compile the model manually
    model.compile(optimizer="adam", loss="categorical_crossentropy")

    # Save the model in H5 format in the current directory
    model_filename = "mobilenet_v1.h5"
    save_path = os.path.join(os.getcwd(), model_filename)
    print(f"Saving model to {save_path} ...")
    model.save(save_path)
    print("Model saved.")

    # Ensure the model file exists before conversion
    if not os.path.exists(save_path):
        print("Error: Model file not found! Conversion aborted.")
        return

    # Define the output directory for the TensorSpace conversion
    output_dir = os.path.join(os.getcwd(), "tensorspace_model")
    os.makedirs(output_dir, exist_ok=True)

    # Build the conversion command
    conversion_command = [
        "D:\Projects\Personal\GitHub\Whytebox2.0\.venv\Scripts\\tensorspace_converter.exe",
        "--input_model_from=tensorflow",
        "--input_model_format=tf_keras",
        "--output_layer_names=conv1,conv_dw_1,conv_pw_1,conv_dw_2,conv_pw_2,conv_dw_3,conv_pw_3,conv_dw_4,conv_pw_4,conv_dw_5,conv_pw_5,conv_dw_6,conv_pw_6,conv_dw_7,conv_pw_7,conv_dw_8,conv_pw_8,conv_dw_9,conv_pw_9,conv_dw_10,conv_pw_10,conv_dw_11,conv_pw_11,conv_dw_12,conv_pw_12,conv_dw_13,conv_pw_13,conv_preds",
        save_path,
        output_dir
    ]

    print("Converting model to TensorSpace format...")
    try:
        result = subprocess.run(conversion_command, check=False)
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)

        if result.returncode == 0:
            print("Conversion complete. Converted model saved to:", output_dir)
        else:
            print("Conversion failed with error:", result.stderr)

    except Exception as e:
        print("Conversion failed due to exception:", str(e))

if __name__ == "__main__":
    main()
