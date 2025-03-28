from manim import *

class MobileNetV1FirstLayer(Scene):
    def construct(self):
        # 1. Represent the input image
        input_rect = Rectangle(width=6, height=6, color=WHITE)
        input_text = Text("224×224×3 Input", font_size=36)
        input_group = VGroup(input_rect, input_text).arrange(DOWN, buff=0.5)
        self.play(FadeIn(input_group))
        self.wait(1)

        # 2. Represent the convolution kernel
        kernel = Square(side_length=1, color=GREEN)
        kernel_text = Text("3×3 Kernel", font_size=24, color=GREEN)
        kernel_group = VGroup(kernel, kernel_text).arrange(DOWN, buff=0.2)
        kernel_group.next_to(input_group, RIGHT, buff=1.5)
        self.play(FadeIn(kernel_group))
        self.wait(1)

        # 3. Indicate filter count and stride
        filter_info = Text("32 Filters, Stride = 2", font_size=24, color=YELLOW)
        filter_info.next_to(kernel_group, DOWN, buff=0.5)
        self.play(FadeIn(filter_info))
        self.wait(1)

        # 4. Animate the convolution operation on a sample patch:
        # Create a small patch of the input (a copy of a part of the grid)
        patch = input_rect.copy().scale(0.3).move_to(input_rect.get_top() + RIGHT*1.5)
        self.play(FadeIn(patch))
        self.wait(0.5)

        # Animate the kernel sliding over the patch (simulate one convolution step)
        kernel_start = kernel_group.get_center()
        kernel_end = patch.get_center()
        self.play(kernel_group.animate.move_to(kernel_end), run_time=2)
        self.wait(1)
        
        # 5. Show the resulting output feature map
        output_rect = Rectangle(width=3, height=3, color=BLUE)
        output_text = Text("Output: 112×112×32", font_size=28, color=BLUE)
        output_group = VGroup(output_rect, output_text).arrange(DOWN, buff=0.3)
        output_group.next_to(input_group, DOWN, buff=1.5)
        self.play(FadeIn(output_group, shift=DOWN))
        self.wait(2)

        # 6. Clear the scene or prepare for next transformation
        self.play(FadeOut(VGroup(input_group, kernel_group, filter_info, patch, output_group)))
        self.wait(1)
