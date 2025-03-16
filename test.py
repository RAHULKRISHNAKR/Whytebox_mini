from tensorflow.keras.models import load_model

model = load_model("mobilenet_v1.h5")
model.summary()
