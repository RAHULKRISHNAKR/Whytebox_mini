from manim import *
import itertools as it

config.background_color = BLACK
config.frame_width = 16
config.frame_height = 9
config.pixel_width = 1920
config.pixel_height = 1080

class MobileNetV1Visualization(Scene):
    def construct(self):
        # MobileNet architecture configuration - now explicitly showing depthwise and pointwise operations separately
        # Format: [output_channels, stride, layer_type]
        mobilenet_config = [
            # input: 224x224x3
            [32, 2, 'conv'],     # Standard conv: 224x224x3 -> 112x112x32
            
            # Block 1
            [32, 1, 'dw'],       # Depthwise: 112x112x32 -> 112x112x32 (depth multiplier=1)
            [64, 1, 'pw'],       # Pointwise: 112x112x32 -> 112x112x64
            
            # Block 2
            [64, 2, 'dw'],       # Depthwise: 112x112x64 -> 56x56x64
            [128, 1, 'pw'],      # Pointwise: 56x56x64 -> 56x56x128
            [128, 1, 'dw'],      # Depthwise: 56x56x128 -> 56x56x128
            [128, 1, 'pw'],      # Pointwise: 56x56x128 -> 56x56x128
            
            # Block 3
            [128, 2, 'dw'],      # Depthwise: 56x56x128 -> 28x28x128
            [256, 1, 'pw'],      # Pointwise: 28x28x128 -> 28x28x256
            [256, 1, 'dw'],      # Depthwise: 28x28x256 -> 28x28x256
            [256, 1, 'pw'],      # Pointwise: 28x28x256 -> 28x28x256
            
            # Block 4
            [256, 2, 'dw'],      # Depthwise: 28x28x256 -> 14x14x256
            [512, 1, 'pw'],      # Pointwise: 14x14x256 -> 14x14x512
            [512, 1, 'dw'],      # Depthwise: 14x14x512 -> 14x14x512
            [512, 1, 'pw'],      # Pointwise: 14x14x512 -> 14x14x512
            
            # Block 5 - In real model, block 4 repeats 5 times, simplified here
            [512, 2, 'dw'],      # Depthwise: 14x14x512 -> 7x7x512
            [1024, 1, 'pw'],     # Pointwise: 7x7x512 -> 7x7x1024
            [1024, 1, 'dw'],     # Depthwise: 7x7x1024 -> 7x7x1024
            [1024, 1, 'pw'],     # Pointwise: 7x7x1024 -> 7x7x1024
            
            # Classification
            [1000, 1, 'fc']      # FC: 7x7x1024 -> 1x1x1000 (includes average pooling)
        ]
        
        # Layer types for coloring
        layer_types = ['input'] + [config[2] for config in mobilenet_config]
        
        # Create layer sizes for visualization
        # We'll normalize the sizes to make the visualization manageable
        layer_sizes = [6]  # Input layer (RGB channels)
        
        for channels, stride, type in mobilenet_config:
            # Scale down the actual channel numbers for better visualization
            if type == 'dw':
                # Depthwise preserves channel count but operates per-channel
                size = min(12, max(4, channels // 32))
            elif type == 'pw':
                # Pointwise changes channel count
                size = min(14, max(5, channels // 32))
            elif type == 'conv':
                size = min(10, max(4, channels // 4))
            else:  # fc
                size = min(10, max(4, channels // 100))
                
            layer_sizes.append(size)
        
        # Initialize the custom MobileNet visualization
        nn = MobileNetMobject(
            layer_sizes,
            layer_types=layer_types,
            layer_to_layer_buff=1.3,  # More space between layers
            neuron_to_neuron_buff=0.2,  # More space between neurons
        )
        
        # Add custom captions for model blocks
        captions = self.create_block_captions(nn, mobilenet_config)
        
        # Position the network
        nn.scale(0.65)  # Smaller scale to fit the more detailed model
        nn.to_edge(LEFT, buff=0.5)  # Align to left side
        
        # Add title
        title = Text("MobileNet V1 Architecture")
        title.scale(1.2)
        title.to_edge(UP, buff=0.5)
        
        # Add legend
        legend = self.create_legend()
        legend.scale(0.7)
        legend.to_edge(RIGHT, buff=0.5)
        
        # Add parameter count annotation
        params_text = VGroup(
            Text("Total parameters: 4.2 million"),
            Text("9x fewer parameters than VGG-16")
        ).arrange(DOWN, aligned_edge=LEFT)
        params_text.scale(0.8)
        params_text.to_corner(DR, buff=0.5)
        
        # Add depthwise separable conv explanation
        dw_explanation = self.create_dw_explanation()
        dw_explanation.to_edge(RIGHT, buff=1.0)
        dw_explanation.shift(2*UP)
        
        # Animation sequence
        self.play(Write(title))
        self.wait(0.5)
        
        # Show network structure
        self.play(FadeIn(nn))
        self.wait(1)
        
        # Add captions
        self.play(FadeIn(captions))
        self.play(FadeIn(legend))
        self.play(FadeIn(params_text))
        self.wait(1)

        self.play(FadeOut(captions))
        self.play(FadeOut(legend))   
        self.play(FadeOut(nn))
        self.play(FadeOut(params_text))        
        
        # Show explanation of depthwise separable convolution
        self.play(FadeIn(dw_explanation))
        
        # Final pause
        self.wait(2)
    
    def create_block_captions(self, nn, config):
        """Create captions for the different blocks in the network"""
        captions = VGroup()
        
        # Input layer
        input_caption = Text("Input\n224×224×3")
        input_caption.scale(0.5)
        input_caption.next_to(nn.layers[0], DOWN, buff=0.2)
        captions.add(input_caption)
        
        # Track spatial dimensions
        spatial_dims = 224
        channels = 3
        
        # Add captions for each block
        for i, (out_channels, stride, type) in enumerate(config):
            layer_idx = i + 1  # +1 because of input layer
            
            # Update dimensions
            if stride == 2:
                spatial_dims = spatial_dims // 2
            
            if type == 'conv':
                caption_text = f"Standard Conv\n{spatial_dims}×{spatial_dims}×{out_channels}"
                channels = out_channels
            elif type == 'dw':
                caption_text = f"Depthwise Conv\n{spatial_dims}×{spatial_dims}×{channels}"
                # DW keeps same number of channels
            elif type == 'pw':
                caption_text = f"Pointwise Conv\n{spatial_dims}×{spatial_dims}×{out_channels}"
                channels = out_channels
            else:  # fc
                caption_text = f"FC Layer\n1000 classes"
                
            if stride == 2:
                caption_text = "Stride 2\nDown-sampling\n" + caption_text
                
            caption = Text(caption_text)
            caption.scale(0.4)
            caption.next_to(nn.layers[layer_idx], DOWN, buff=0.2)
            captions.add(caption)
            
        return captions
            
    def create_legend(self):
        """Create a legend explaining the visualization"""
        legend = VGroup()
        
        items = [
            (BLUE, "Standard Convolution"),
            (GREEN, "Depthwise Convolution"),
            (TEAL, "Pointwise (1×1) Convolution"),
            (RED, "Strided Convolution (s=2)"),
            (GOLD, "Fully Connected Layer"),
            (WHITE, "Input Layer")
        ]
        
        for color, text in items:
            dot = Dot(color=color, radius=0.15)
            label = Text(text)  # Changed from TextMobject
            label.scale(0.8)
            label.next_to(dot, RIGHT, buff=0.3)
            item = VGroup(dot, label)
            legend.add(item)
        
        legend.arrange(DOWN, aligned_edge=LEFT, buff=0.2)
        
        # Add a background rectangle
        bg_rect = SurroundingRectangle(legend, color=DARK_GREY, buff=0.3)
        bg_rect.set_fill(BLACK, opacity=0.7)
        legend_title = Text("Legend")
        legend_title.scale(0.9)
        legend_title.next_to(bg_rect, UP, buff=0.1)
        
        return VGroup(bg_rect, legend, legend_title)
    
    def create_dw_explanation(self):
        """Create a visual explanation of depthwise separable convolution"""
        title = Text("Depthwise Separable Convolution")  # Changed from TextMobject
        title.scale(0.9)
        
        # Create a simple diagram
        standard_conv = Rectangle(height=1.5, width=1.5)
        standard_conv.set_fill(BLUE, opacity=0.6)
        standard_label = Text("Standard\nConvolution")  # Changed from TextMobject
        standard_label.scale(0.7)
        standard_label.next_to(standard_conv, DOWN, buff=0.2)
        standard_group = VGroup(standard_conv, standard_label)
        
        arrow = Arrow(LEFT, RIGHT, color=WHITE)
        
        dw_conv = Rectangle(height=1.5, width=0.7)
        dw_conv.set_fill(GREEN, opacity=0.6)
        dw_label = Text("Depthwise\nConvolution")  # Changed from TextMobject
        dw_label.scale(0.7)
        dw_label.next_to(dw_conv, DOWN, buff=0.2)
        
        plus = Text("+")
        
        pw_conv = Rectangle(height=1.5, width=0.7)
        pw_conv.set_fill(TEAL, opacity=0.6)
        pw_label = Text("Pointwise\nConvolution")  # Changed from TextMobject
        pw_label.scale(0.7)
        pw_label.next_to(pw_conv, DOWN, buff=0.2)
        
        # Arrange the elements
        dw_pw_group = VGroup(dw_conv, dw_label, plus, pw_conv, pw_label)
        dw_pw_group.arrange(RIGHT, buff=0.3)
        
        equation = VGroup(standard_group, arrow, dw_pw_group)
        equation.arrange(RIGHT, buff=0.5)
        
        # Create efficiency text
        efficiency_text = Text(
            "Reduces computation by ~9x with minimal\naccuracy loss compared to standard convolution"
        )
        efficiency_text.scale(0.7)
        efficiency_text.next_to(equation, DOWN, buff=0.5)
        
        # Create a surrounding box
        explanation_group = VGroup(title, equation, efficiency_text)
        explanation_group.arrange(DOWN, buff=0.4)
        
        bg_rect = SurroundingRectangle(explanation_group, color=DARK_GREY, buff=0.5)
        bg_rect.set_fill(BLACK, opacity=0.7)
        
        return VGroup(bg_rect, explanation_group)
    
    def highlight_dw_pw_pair(self, nn):
        """Highlight a depthwise-pointwise pair to show how they work together"""
        # Find a good example pair - using the second block (indices 3 and 4)
        dw_idx = 3  # This is a depthwise layer with stride 2
        pw_idx = 4  # This is the following pointwise layer
        
        dw_layer = nn.layers[dw_idx]
        pw_layer = nn.layers[pw_idx]
        
        # Create highlight rectangles
        dw_highlight = SurroundingRectangle(dw_layer, color=YELLOW, buff=0.15)
        pw_highlight = SurroundingRectangle(pw_layer, color=YELLOW, buff=0.15)
        
        # Create explanation text
        dw_text = Text("1. Depthwise: filters apply to\neach input channel separately")
        dw_text.scale(0.6)
        dw_text.next_to(dw_highlight, UP, buff=0.2)
        
        pw_text = Text("2. Pointwise: 1×1 convolution\ncombines filtered channels")
        pw_text.scale(0.6)
        pw_text.next_to(pw_highlight, UP, buff=0.2)
        
        # Highlight the depthwise layer
        self.play(
            Create(dw_highlight),
            Write(dw_text)
        )
        self.wait(1.5)
        
        # Highlight the pointwise layer
        self.play(
            Create(pw_highlight),
            Write(pw_text)
        )
        self.wait(1.5)
        
        # Connect them with an arrow to show the flow
        arrow = Arrow(
            dw_layer.get_right(), 
            pw_layer.get_left(), 
            color=YELLOW,
            buff=0.1
        )
        self.play(Create(arrow))
        
        # Show combined effect
        combined_text = Text(
            "Together they replace a standard convolution\nbut with far fewer parameters"
        )
        combined_text.scale(0.7)
        combined_text.next_to(arrow, DOWN, buff=0.5)
        self.play(Write(combined_text))
        self.wait(2)
        
        # Clean up
        self.play(
            FadeOut(dw_highlight),
            FadeOut(pw_highlight),
            FadeOut(dw_text),
            FadeOut(pw_text),
            FadeOut(arrow),
            FadeOut(combined_text)
        )

# A customizable Sequential Neural Network
class NeuralNetworkMobject(VGroup):
    def __init__(
        self,
        neural_network,
        neuron_radius=0.15,
        neuron_to_neuron_buff=MED_SMALL_BUFF,
        layer_to_layer_buff=LARGE_BUFF,
        neuron_stroke_width=2,
        neuron_fill_opacity=1,
        edge_color=LIGHT_GREY,
        edge_stroke_width=2,
        edge_propogation_color=YELLOW,
        max_shown_neurons=16,
        input_neuron_color=WHITE,
        hidden_layer_neuron_color=WHITE,
        output_neuron_color=WHITE,
        *args,
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        # Store all the parameters
        self.layer_sizes = neural_network
        self.neuron_radius = neuron_radius
        self.neuron_to_neuron_buff = neuron_to_neuron_buff
        self.layer_to_layer_buff = layer_to_layer_buff
        self.neuron_stroke_width = neuron_stroke_width
        self.neuron_fill_opacity = neuron_fill_opacity
        self.edge_color = edge_color
        self.edge_stroke_width = edge_stroke_width
        self.edge_propogation_color = edge_propogation_color
        self.max_shown_neurons = max_shown_neurons
        
        # Add color attributes
        self.input_neuron_color = input_neuron_color
        self.hidden_layer_neuron_color = hidden_layer_neuron_color
        self.output_neuron_color = output_neuron_color
        
        # Additional configuration
        self.include_output_labels = False
        self.brace_for_large_layers = True
        self.arrow = False
        self.arrow_tip_size = 0.1
        
        # Initialize the network
        self.add_neurons()
        self.add_edges()
        self.add_to_back(self.layers)

    # Helper method for constructor
    def add_neurons(self):
        layers = VGroup(*[
            self.get_layer(size, index)
            for index, size in enumerate(self.layer_sizes)
        ])
        layers.arrange_submobjects(RIGHT, buff=self.layer_to_layer_buff)
        self.layers = layers
        if self.include_output_labels:
            self.label_outputs_text()
    # Helper method for constructor
    def get_nn_fill_color(self, index):
        if index == -1 or index == len(self.layer_sizes) - 1:
            return self.output_neuron_color
        if index == 0:
            return self.input_neuron_color
        else:
            return self.hidden_layer_neuron_color
    # Helper method for constructor
    def get_layer(self, size, index=-1):
        layer = VGroup()
        n_neurons = size
        if n_neurons > self.max_shown_neurons:
            n_neurons = self.max_shown_neurons
        neurons = VGroup(*[
            Circle(
                radius=self.neuron_radius,
                stroke_color=self.get_nn_fill_color(index),
                stroke_width=self.neuron_stroke_width,
                fill_color=BLACK,
                fill_opacity=self.neuron_fill_opacity,
            )
            for x in range(n_neurons)
        ])
        neurons.arrange_submobjects(
            DOWN, buff=self.neuron_to_neuron_buff
        )
        for neuron in neurons:
            neuron.edges_in = VGroup()
            neuron.edges_out = VGroup()
        layer.neurons = neurons
        layer.add(neurons)

        if size > n_neurons:
            dots = MathTex("\\vdots")
            dots.move_to(neurons)
            VGroup(*neurons[:len(neurons) // 2]).next_to(
                dots, UP, MED_SMALL_BUFF
            )
            VGroup(*neurons[len(neurons) // 2:]).next_to(
                dots, DOWN, MED_SMALL_BUFF
            )
            layer.dots = dots
            layer.add(dots)
            if self.brace_for_large_layers:
                brace = Brace(layer, LEFT)
                brace_label = brace.get_tex(str(size))
                layer.brace = brace
                layer.brace_label = brace_label
                layer.add(brace, brace_label)

        return layer
    # Helper method for constructor
    def add_edges(self):
        self.edge_groups = VGroup()
        for l1, l2 in zip(self.layers[:-1], self.layers[1:]):
            edge_group = VGroup()
            for n1, n2 in it.product(l1.neurons, l2.neurons):
                edge = self.get_edge(n1, n2)
                edge_group.add(edge)
                n1.edges_out.add(edge)
                n2.edges_in.add(edge)
            self.edge_groups.add(edge_group)
        self.add_to_back(self.edge_groups)
    # Helper method for constructor
    def get_edge(self, neuron1, neuron2):
        if self.arrow:
            return Arrow(
                neuron1.get_center(),
                neuron2.get_center(),
                buff=self.neuron_radius,
                stroke_color=self.edge_color,
                stroke_width=self.edge_stroke_width,
                tip_length=self.arrow_tip_size
            )
        return Line(
            neuron1.get_center(),
            neuron2.get_center(),
            buff=self.neuron_radius,
            stroke_color=self.edge_color,
            stroke_width=self.edge_stroke_width,
        )
    
    # Labels each input neuron with a char l or a LaTeX character
    def label_inputs(self, l):
        self.output_labels = VGroup()
        for n, neuron in enumerate(self.layers[0].neurons):
            label = MathTex(f"{l}_{{{n + 1}}}")  # Changed from TexMobject
            label.set_height(0.3 * neuron.get_height())
            label.move_to(neuron)
            self.output_labels.add(label)
        self.add(self.output_labels)

    # Labels each output neuron with a char l or a LaTeX character
    def label_outputs(self, l):
        self.output_labels = VGroup()
        for n, neuron in enumerate(self.layers[-1].neurons):
            label = MathTex(f"{l}_{{{n + 1}}}")  # Changed from TexMobject
            label.set_height(0.4 * neuron.get_height())
            label.move_to(neuron)
            self.output_labels.add(label)
        self.add(self.output_labels)

    # Labels each neuron in the output layer with text according to an output list
    def label_outputs_text(self, outputs):
        self.output_labels = VGroup()
        for n, neuron in enumerate(self.layers[-1].neurons):
            label = Text(outputs[n])
            label.set_height(0.75*neuron.get_height())
            label.move_to(neuron)
            label.shift((neuron.get_width() + label.get_width()/2)*RIGHT)
            self.output_labels.add(label)
        self.add(self.output_labels)

    # Labels the hidden layers with a char l or a LaTeX character
    def label_hidden_layers(self, l):
        self.output_labels = VGroup()
        for layer in self.layers[1:-1]:
            for n, neuron in enumerate(layer.neurons):
                label = MathTex(f"{l}_{n + 1}")
                label.set_height(0.4 * neuron.get_height())
                label.move_to(neuron)
                self.output_labels.add(label)
        self.add(self.output_labels)

class MobileNetMobject(NeuralNetworkMobject):
    def __init__(
        self,
        neural_network,
        layer_types=None,
        neuron_radius=0.15,
        layer_to_layer_buff=1.3,
        neuron_to_neuron_buff=0.2,
        neuron_stroke_width=2,
        neuron_fill_opacity=0.8,
        edge_color=LIGHT_GREY,
        edge_stroke_width=1.5,
        max_shown_neurons=16,
        *args,
        **kwargs
    ):
        # Initialize layer types first
        self.layer_types = layer_types or ["input"] + ["hidden"] * (len(neural_network) - 2) + ["output"]
        self.layer_colors = {
            "input": WHITE,
            "conv": BLUE,
            "dw": GREEN,
            "pw": TEAL,
            "fc": GOLD,
            "hidden": LIGHT_GREY
        }
        
        # Call parent constructor
        super().__init__(
            neural_network,
            neuron_radius=neuron_radius,
            layer_to_layer_buff=layer_to_layer_buff,
            neuron_to_neuron_buff=neuron_to_neuron_buff,
            neuron_stroke_width=neuron_stroke_width,
            neuron_fill_opacity=neuron_fill_opacity,
            edge_color=edge_color,
            edge_stroke_width=edge_stroke_width,
            max_shown_neurons=max_shown_neurons,
            input_neuron_color=self.layer_colors["input"],
            hidden_layer_neuron_color=LIGHT_GREY,
            output_neuron_color=self.layer_colors["fc"],
            *args,
            **kwargs
        )
        
        # Add visual elements
        self.colorize_layers()
        self.add_layer_marks()

    def colorize_layers(self):
        for i, layer_type in enumerate(self.layer_types):
            color = self.layer_colors.get(layer_type, LIGHT_GREY)
            for neuron in self.layers[i].neurons:
                neuron.stroke_color = color

    def add_layer_marks(self):
        """Add visual markers for stride-2 layers and other special layers"""
        self.layer_marks = VGroup()
        
        for i, layer_type in enumerate(self.layer_types):
            layer = self.layers[i]
            
            # Skip input layer
            if i == 0:
                continue
                
            # Add stride marker for stride-2 layers
            if i < len(self.layer_types) - 1 and self.layer_types[i] in ['dw', 'conv']:
                # Create a small triangle marker
                marker = Triangle(fill_opacity=1, color=RED)
                marker.set_height(0.2)
                marker.next_to(layer, UP, buff=0.1)
                self.layer_marks.add(marker)
                
            # Add special marker for fully connected layer
            if layer_type == 'fc':
                marker = Star(n=5, fill_opacity=1, color=GOLD)
                marker.set_height(0.25)
                marker.next_to(layer, UP, buff=0.1)
                self.layer_marks.add(marker)
        
        self.add(self.layer_marks)

# Note: To run this code, you'll need to have the provided NeuralNetworkMobject class
# and use a command like:
# py -m manim NNmanim.py MobileNetV1Visualization -pql --renderer=cairo

if __name__ == "__main__":
    # Set scene-specific configuration
    config.output_file = "mobilenet_v1_visualization"
    config.quality = "production_quality"
    
    # Render the scene
    scene = MobileNetV1Visualization()
    scene.render()