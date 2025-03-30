"""
XAI visualization program for images

Installation instructions:
1. Install basic requirements:
   pip install torch torchvision pillow matplotlib opencv-python captum lime shap

2. Install pytorch-grad-cam from GitHub:
   pip install git+https://github.com/jacobgil/pytorch-grad-cam.git

Usage: python xai.py path/to/your/image.jpg
"""

import os
import argparse
import numpy as np
import torch
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import matplotlib.pyplot as plt
import cv2

# For Grad-CAM
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

# For other techniques
from captum.attr import IntegratedGradients, Saliency
import lime
from lime import lime_image
import shap

def preprocess_image(img_path):
    """Load and preprocess image for model input"""
    img = Image.open(img_path).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                             std=[0.229, 0.224, 0.225])
    ])
    input_tensor = transform(img).unsqueeze(0)
    return img, input_tensor

def generate_gradcam(img_path, model, target_layer, device, save_path):
    """Generate and save Grad-CAM visualization"""
    img, input_tensor = preprocess_image(img_path)
    input_tensor = input_tensor.to(device)
    
    # RGB image for visualization
    rgb_img = np.array(img.resize((224, 224))) / 255.0
    
    # Setup Grad-CAM - fixed API parameter
    cam = GradCAM(model=model, target_layers=[target_layer])
    
    # Generate CAM
    grayscale_cam = cam(input_tensor=input_tensor, targets=None)
    grayscale_cam = grayscale_cam[0, :]
    
    # Overlay heatmap on image
    visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
    
    # Save the visualization
    plt.imshow(visualization)
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    
    return visualization

def generate_saliency_map(img_path, model, device, save_path):
    """Generate and save Saliency Map visualization"""
    img, input_tensor = preprocess_image(img_path)
    input_tensor = input_tensor.to(device)
    input_tensor.requires_grad = True
    
    # Get predicted class
    with torch.no_grad():
        output = model(input_tensor)
        pred_class = output.argmax().item()
    
    # Setup Saliency
    saliency = Saliency(model)
    
    # Generate saliency map with target class
    attribution = saliency.attribute(input_tensor, target=pred_class)
    
    # Convert to numpy for visualization
    saliency_map = attribution.squeeze().cpu().permute(1, 2, 0).sum(dim=2).numpy()
    saliency_map = np.maximum(saliency_map, 0)
    saliency_map /= saliency_map.max()
    
    # Save the visualization
    plt.imshow(saliency_map, cmap='hot')
    plt.colorbar()
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    
    return saliency_map

def generate_integrated_gradients(img_path, model, device, save_path):
    """Generate and save Integrated Gradients visualization"""
    img, input_tensor = preprocess_image(img_path)
    input_tensor = input_tensor.to(device)
    
    # Get predicted class
    with torch.no_grad():
        output = model(input_tensor)
        pred_class = output.argmax().item()
    
    # Setup Integrated Gradients
    ig = IntegratedGradients(model)
    
    # Define baseline (black image)
    baseline = torch.zeros_like(input_tensor).to(device)
    
    # Generate attribution with target class
    attributions = ig.attribute(input_tensor, baseline, target=pred_class, n_steps=50)
    
    # Process attribution for visualization
    att_map = attributions.squeeze().cpu().permute(1, 2, 0).sum(dim=2).numpy()
    att_map = np.maximum(att_map, 0) / np.max(att_map)
    
    # Save the visualization
    plt.imshow(att_map, cmap='hot')
    plt.colorbar()
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    
    return att_map

def generate_lime(img_path, model, device, save_path):
    """Generate and save LIME visualization"""
    img, input_tensor = preprocess_image(img_path)
    img_np = np.array(img.resize((224, 224)))
    
    # Create a function that the LIME explainer can use
    def model_predict(images):
        batch = torch.stack([transforms.ToTensor()(image) for image in images])
        batch = transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                    std=[0.229, 0.224, 0.225])(batch)
        batch = batch.to(device)
        logits = model(batch)
        probs = F.softmax(logits, dim=1).detach().cpu().numpy()
        return probs
    
    # Setup LIME explainer
    explainer = lime_image.LimeImageExplainer()
    explanation = explainer.explain_instance(
        np.array(img.resize((224, 224))), 
        model_predict,
        top_labels=5, 
        hide_color=0, 
        num_samples=1000
    )
    
    # Get the explanation for the top predicted class
    _, mask = explanation.get_image_and_mask(
        explanation.top_labels[0], 
        positive_only=True, 
        num_features=5, 
        hide_rest=False
    )
    
    # Create visualization
    heatmap = cv2.applyColorMap(np.uint8(255 * mask), cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    result = heatmap * 0.3 + img_np * 0.7
    
    # Save the visualization
    plt.imshow(result.astype('uint8'))
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    
    return result

def generate_shap(img_path, model, device, save_path):
    """Generate and save SHAP visualization"""
    img, input_tensor = preprocess_image(img_path)
    input_tensor = input_tensor.to(device)
    
    try:
        # First approach: Try using a simpler SHAP implementation
        # Get model prediction
        with torch.no_grad():
            output = model(input_tensor)
            pred_class = output.argmax().item()
        
        # Create a simplified version of the model (wrapper function)
        def model_wrapper(images):
            with torch.no_grad():
                return model(images).cpu().numpy()
        
        # Use KernelExplainer instead of DeepExplainer
        masker = shap.maskers.Image("inpaint_telea", (224, 224, 3))
        explainer = shap.Explainer(model_wrapper, masker)
        
        # Convert input to numpy for KernelExplainer
        input_numpy = input_tensor.cpu().numpy()
        
        # Get SHAP values
        shap_values = explainer(input_numpy, max_evals=100, batch_size=50)
        
        # Create visualization
        shap_img = shap_values.values[0, :, :, :]
        shap_numpy = np.sum(np.abs(shap_img), axis=-1)
        shap_numpy = (shap_numpy - np.min(shap_numpy)) / (np.max(shap_numpy) - np.min(shap_numpy))
        
    except Exception as e:
        print(f"SHAP encountered an error: {e}")
        print("Falling back to alternative visualization...")
        
        # Fallback to a simpler gradient-based visualization
        img, input_tensor = preprocess_image(img_path)
        input_tensor = input_tensor.to(device)
        input_tensor.requires_grad = True
        
        # Get predicted class
        with torch.no_grad():
            output = model(input_tensor)
            pred_class = output.argmax().item()
            
        # Zero all gradients
        model.zero_grad()
        
        # Forward pass with gradients
        output = model(input_tensor)
        output[0, pred_class].backward()
        
        # Get gradients
        gradients = input_tensor.grad.abs()
        
        # Process for visualization
        shap_numpy = gradients.squeeze().cpu().sum(dim=0).numpy()
        shap_numpy = (shap_numpy - np.min(shap_numpy)) / (np.max(shap_numpy) - np.min(shap_numpy))
    
    # Save the visualization
    plt.imshow(shap_numpy, cmap='hot')
    plt.colorbar()
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()
    
    return shap_numpy

def main():
    """Main function to process image and generate all visualizations"""
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Generate explainability visualizations for an image")
    parser.add_argument("--image_path", help="Path to the input image")
    parser.add_argument("--output_dir", help="Directory to save the output visualizations")
    args = parser.parse_args()
    
    # Setup device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load pre-trained model
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
    model = model.to(device)
    model.eval()
    
    # Get image path from command line args or use default
    if args.image_path:
        img_path = args.image_path
    else:
        img_path = "C:/Users/rahul/OneDrive/Documents/GitHub/Whytebox2.0/zsample/dog.jpg"
    
    # Determine output directory - prioritize provided output_dir, then use app's explanations folder
    if args.output_dir:
        output_dir = args.output_dir
    else:
        # When processing an uploaded image, always save to public/assets/images/explanations
        # This ensures consistency regardless of where the script is run from
        if 'uploads' in img_path:
            # Navigate to the explanations directory relative to the app root
            app_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
            output_dir = os.path.join(app_root, "public", "assets", "images", "explanations")
        else:
            # For other images, use the directory where the script is located
            output_dir = os.path.dirname(img_path)
    
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Extract filename and clean it to prevent duplication
    base_name = os.path.splitext(os.path.basename(img_path))[0]
    
    # Remove any existing "xai_" prefix if present
    if base_name.startswith('xai_'):
        base_name = base_name[4:]  # Remove the "xai_" prefix
    
    # For uploaded images, extract just the numeric part if it's a user-image
    if base_name.startswith('user-image-'):
        # Extract just the timestamp/numeric part
        base_name = base_name.split('user-image-')[1]
    
    # Remove any duplicate "_input" suffixes that might be present
    if '_input' in base_name:
        base_name = base_name.split('_input')[0]
    
    # Generate a clean base filename with just one prefix
    base_filename = f"xai_{base_name}"
    
    print(f"Using base filename: {base_filename}")
    
    # Generate and save all visualizations using the correct format (without "_input_")
    # Grad-CAM
    target_layer = model.layer4[-1]
    gradcam_path = os.path.join(output_dir, f"{base_filename}_gr.jpg")
    generate_gradcam(img_path, model, target_layer, device, gradcam_path)
    print(f"Grad-CAM saved: {gradcam_path}")
    
    # Saliency Map
    saliency_path = os.path.join(output_dir, f"{base_filename}_sa.jpg")
    generate_saliency_map(img_path, model, device, saliency_path)
    print(f"Saliency Map saved: {saliency_path}")
    
    # Integrated Gradients
    ig_path = os.path.join(output_dir, f"{base_filename}_in.jpg")
    generate_integrated_gradients(img_path, model, device, ig_path)
    print(f"Integrated Gradients saved: {ig_path}")
    
    # LIME
    lime_path = os.path.join(output_dir, f"{base_filename}_li.jpg")
    generate_lime(img_path, model, device, lime_path)
    print(f"LIME explanation saved: {lime_path}")
    
    # SHAP
    shap_path = os.path.join(output_dir, f"{base_filename}_sh.jpg")
    generate_shap(img_path, model, device, shap_path)
    print(f"SHAP explanation saved: {shap_path}")
    
    print(f"All visualizations generated successfully for {img_path}")
    print(f"Output directory: {output_dir}")

if __name__ == "__main__":
    main()