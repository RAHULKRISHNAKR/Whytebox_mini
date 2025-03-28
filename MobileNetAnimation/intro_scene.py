from manim import *

class MobileNetV1Introduction(Scene):
    def construct(self):
        # Create title and subtitle, arranged vertically
        title = Text("MobileNet V1", font_size=72, color=BLUE)
        subtitle = Text("Efficient CNN for Mobile Devices", font_size=36, color=YELLOW)
        title_and_subtitle = VGroup(title, subtitle).arrange(DOWN, buff=0.5)
        
        # Display title and subtitle together
        self.play(Write(title))
        self.wait(1)

        self.play(Write(subtitle))
        self.wait(2)
        
        # Fade out both title and subtitle simultaneously
        self.play(FadeOut(title_and_subtitle))
        self.wait(1)
        
        # Display key points as a bullet list
        points = BulletedList(
            "Developed by Google in 2017",
            "Optimized for low latency and minimal computation",
            "Utilizes depthwise separable convolutions",
            "Adjustable via width and resolution multipliers",
            font_size=32,
            buff=0.5
        )
        self.play(Write(points))
        self.wait(4)
        
        # Fade out the bullet points
        self.play(FadeOut(points))
        self.wait(1)