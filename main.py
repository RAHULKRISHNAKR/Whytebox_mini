import torch
import torchvision
import torchvision.transforms as transforms
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from manim import *

class CNNVisualization(Scene):
    def construct(self):
        # Title
        title = Text("CNN Image Classification Visualization").scale(0.8)
        self.play(Write(title))
        self.play(title.animate.to_edge(UP))
        self.wait(1)
        
        # Load pre-trained model (ResNet18)
        model = torchvision.models.resnet18(pretrained=True)
        model.eval()
        
        # Define the image preprocessing
        preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        
        # Load image labels
        with open("imagenet_classes.txt") as f:
            categories = [s.strip() for s in f.readlines()]
        
        # Load and preprocess the image
        img_path = "test_image.jpg"  # Replace with your image path
        input_image = Image.open(img_path)
        input_tensor = preprocess(input_image)
        input_batch = input_tensor.unsqueeze(0)
        
        # Create a list to store activation maps
        activation = {}
        def get_activation(name):
            def hook(model, input, output):
                activation[name] = output.detach()
            return hook
        
        # Register hooks for key layers
        model.conv1.register_forward_hook(get_activation('conv1'))
        model.layer1[0].conv1.register_forward_hook(get_activation('layer1.0'))
        model.layer2[0].conv1.register_forward_hook(get_activation('layer2.0'))
        model.layer3[0].conv1.register_forward_hook(get_activation('layer3.0'))
        model.layer4[0].conv1.register_forward_hook(get_activation('layer4.0'))
        
        # Forward pass
        with torch.no_grad():
            output = model(input_batch)
        
        # Get the predicted class
        _, index = torch.max(output, 1)
        percentage = torch.nn.functional.softmax(output, dim=1)[0] * 100
        pred_class = categories[index[0]]
        confidence = percentage[index[0]].item()
        
        # Display original image
        img_array = np.array(input_image.resize((224, 224)))
        h, w = img_array.shape[:2]
        img_mobject = ImageMobject(img_array).scale(2)
        img_label = Text("Input Image").scale(0.6).next_to(img_mobject, DOWN)
        
        self.play(FadeIn(img_mobject), Write(img_label))
        self.wait(1)
        self.play(img_mobject.animate.scale(0.5).to_edge(LEFT))
        self.play(img_label.animate.next_to(img_mobject, DOWN))
        
        # Create network architecture visualization
        architecture = []
        layer_names = ["Conv1", "Layer1", "Layer2", "Layer3", "Layer4", "FC", "Output"]
        layer_sizes = [64, 64, 128, 256, 512, 1000, 1]
        
        prev_rect = None
        for i, (name, size) in enumerate(zip(layer_names, layer_sizes)):
            height = min(0.5 + size / 1000, 3)  # Scale the height based on channels
            width = 0.7
            
            if name == "Output":
                rect = Rectangle(height=0.7, width=width, fill_opacity=0.7, fill_color=BLUE)
                label = Text(pred_class, font_size=20).next_to(rect, DOWN, buff=0.1)
                conf_text = Text(f"{confidence:.2f}%", font_size=16).next_to(label, DOWN, buff=0.1)
                group = VGroup(rect, label, conf_text)
            else:
                rect = Rectangle(height=height, width=width, fill_opacity=0.7, 
                                fill_color=interpolate_color(BLUE, RED, i/len(layer_names)))
                label = Text(name, font_size=20).next_to(rect, DOWN, buff=0.1)
                channel_text = Text(f"{size} channels", font_size=16).next_to(label, DOWN, buff=0.1)
                group = VGroup(rect, label, channel_text)
            
            if prev_rect:
                group.next_to(prev_rect, RIGHT, buff=0.5)
            else:
                group.next_to(img_mobject, RIGHT, buff=1)
            
            architecture.append(group)
            prev_rect = group
        
        # Show network architecture
        for i, group in enumerate(architecture):
            self.play(Create(group[0]))
            self.play(Write(group[1:]))
            if i < len(architecture) - 1:
                arrow = Arrow(architecture[i][0].get_right(), architecture[i+1][0].get_left(), buff=0.1)
                self.play(Create(arrow))
        
        # Animate data flow
        data_circle = Circle(radius=0.2, fill_opacity=1, color=YELLOW)
        data_circle.move_to(img_mobject.get_center())
        self.play(FadeIn(data_circle))
        
        # Animate through each layer
        for i in range(len(architecture)):
            target = architecture[i][0].get_center()
            self.play(data_circle.animate.move_to(target))
            
            # For key layers, show feature maps
            if i < len(architecture) - 2:  # Skip FC and Output for feature maps
                layer_key = list(activation.keys())[i] if i < len(activation) else None
                
                if layer_key:
                    # Get a sample of feature maps
                    act = activation[layer_key][0].cpu().numpy()
                    num_features = min(4, act.shape[0])  # Show at most 4 feature maps
                    
                    feature_maps = VGroup()
                    for j in range(num_features):
                        # Normalize the feature map for visualization
                        feat_map = act[j]
                        feat_map = (feat_map - feat_map.min()) / (feat_map.max() - feat_map.min() + 1e-8)
                        
                        # Create a small visualization of the feature map
                        h, w = feat_map.shape
                        feat_img = ImageMobject(np.uint8(plt.cm.viridis(feat_map)*255))
                        feat_img.height = 0.6
                        
                        if j == 0:
                            feat_img.next_to(architecture[i][0], UP, buff=0.3)
                        else:
                            feat_img.next_to(feature_maps[-1], RIGHT, buff=0.2)
                        
                        feature_maps.add(feat_img)
                    
                    # Show feature maps briefly
                    self.play(FadeIn(feature_maps))
                    self.wait(0.5)
                    self.play(FadeOut(feature_maps))
            
            # Emphasize the final prediction
            if i == len(architecture) - 1:
                self.play(architecture[i][0].animate.set_color(GREEN), 
                        Indicate(architecture[i][1]), 
                        Indicate(architecture[i][2]))
        
        # Final result text
        result_text = Text(f"Predicted: {pred_class} ({confidence:.2f}%)")
        result_text.scale(0.8).to_edge(DOWN)
        self.play(Write(result_text))
        self.wait(2)

# To run the animation:
# manim -pql cnn_visualization.py CNNVisualization