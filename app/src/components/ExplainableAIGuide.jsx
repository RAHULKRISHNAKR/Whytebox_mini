import React from 'react';
import './ExplainableAIGuide.css';

const ExplainableAIGuide = ({ onClose }) => {
  return (
    <div className="explainable-ai-guide">
      <div className="guide-content">
        <div className="guide-header">
          <h2>Explainable AI Guide</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="guide-section">
          <h3>What is Explainable AI?</h3>
          <p>
            Explainable AI (XAI) refers to techniques and methods that help humans understand 
            how artificial intelligence systems make decisions. These tools are especially 
            important for deep learning models like neural networks, which are often 
            considered "black boxes" due to their complex, opaque nature.
          </p>
          
          <div className="analogy">
            <h4>Think of it like this:</h4>
            <p>
              Imagine you ask a friend for restaurant recommendations, and they give you one. 
              If they just say "go to restaurant X" with no explanation, you'd have to trust 
              them blindly. But if they explain "restaurant X has great Italian food, reasonable 
              prices, and a nice atmosphere," you understand their reasoning and can decide 
              whether their recommendation makes sense for you.
            </p>
          </div>
          
          <div className="why-xai">
            <h4>Why is Explainable AI important?</h4>
            <ul className="importance-points">
              <li><span className="point-icon">⚖️</span> <strong>Trust & Transparency</strong>: Users need to understand AI decisions for critical applications</li>
              <li><span className="point-icon">🔍</span> <strong>Debugging</strong>: Developers can identify and fix biases or errors in models</li>
              <li><span className="point-icon">🎓</span> <strong>Learning</strong>: Researchers can gain insights into how models work</li>
              <li><span className="point-icon">📋</span> <strong>Compliance</strong>: Many industries require explainable decisions for regulatory purposes</li>
            </ul>
          </div>
        </div>
        
        <div className="guide-section">
          <h3>Available Explanation Methods</h3>
          
          <div className="explanation-method">
            <h4>Grad-CAM (Gradient-weighted Class Activation Mapping)</h4>
            <p>
              Grad-CAM highlights the regions of an image that influenced the model's 
              prediction for a specific class by using the gradients flowing into the 
              final convolutional layer.
            </p>
            <div className="method-example">
              <img src="/assets/images/guide/gradcam-example.jpg" alt="Grad-CAM example" />
              <p className="caption">Red/yellow areas show regions contributing to the prediction</p>
            </div>
            <p className="interpretation-tip">
              <strong>How to interpret:</strong> Brighter areas (red/yellow) indicate regions 
              that strongly influenced the model's decision for the target class.
            </p>
            <div className="use-case">
              <span className="use-case-icon">🔍</span>
              <p><strong>Best for:</strong> Locating the exact regions in the image that influenced a specific classification</p>
            </div>
          </div>
          
          <div className="explanation-method">
            <h4>Saliency Maps</h4>
            <p>
              Saliency maps show which pixels in the input image need to be changed the least 
              to affect the classification score the most. They highlight the most sensitive 
              parts of the image.
            </p>
            <div className="method-example">
              <img src="/assets/images/guide/saliency-example.jpg" alt="Saliency map example" />
              <p className="caption">Brighter pixels indicate higher importance</p>
            </div>
            <p className="interpretation-tip">
              <strong>How to interpret:</strong> Bright areas show pixels that have the greatest 
              influence on the model's output.
            </p>
            <div className="use-case">
              <span className="use-case-icon">🔍</span>
              <p><strong>Best for:</strong> Identifying sensitive pixels that have maximum impact on classification</p>
            </div>
          </div>
          
          <div className="explanation-method">
            <h4>Integrated Gradients</h4>
            <p>
              This method attributes the prediction of a deep network to its input features by 
              integrating gradients along a path from a baseline (typically a black image) to 
              the input.
            </p>
            <div className="method-example">
              <img src="/assets/images/guide/integrated-example.jpg" alt="Integrated Gradients example" />
              <p className="caption">Attribution of prediction to each input pixel</p>
            </div>
            <p className="interpretation-tip">
              <strong>How to interpret:</strong> Red indicates positive contribution to the prediction, 
              blue indicates negative contribution.
            </p>
            <div className="use-case">
              <span className="use-case-icon">🧮</span>
              <p><strong>Best for:</strong> Getting detailed attribution with theoretical guarantees about completeness</p>
            </div>
          </div>
          
          <div className="explanation-method">
            <h4>LIME (Local Interpretable Model-agnostic Explanations)</h4>
            <p>
              LIME explains predictions by approximating the model locally with a simpler model 
              that's easier to understand. It perturbs the input and sees how the predictions change.
            </p>
            <div className="method-example">
              <img src="/assets/images/guide/lime-example.jpg" alt="LIME example" />
              <p className="caption">Green shows positive contribution, red shows negative</p>
            </div>
            <p className="interpretation-tip">
              <strong>How to interpret:</strong> Green segments positively contribute to the classification, 
              while red segments negatively affect it.
            </p>
            <div className="use-case">
              <span className="use-case-icon">🧩</span>
              <p><strong>Best for:</strong> Getting human-interpretable explanations that work with any model</p>
            </div>
          </div>
          
          <div className="explanation-method">
            <h4>SHAP (SHapley Additive exPlanations)</h4>
            <p>
              SHAP uses game theory to assign each feature an importance value for a particular prediction. 
              It's based on Shapley values, a concept from cooperative game theory.
            </p>
            <div className="method-example">
              <img src="/assets/images/guide/shap-example.jpg" alt="SHAP example" />
              <p className="caption">Red increases prediction, blue decreases it</p>
            </div>
            <p className="interpretation-tip">
              <strong>How to interpret:</strong> Red areas push the prediction value higher, 
              blue areas push it lower. The intensity shows how strong the effect is.
            </p>
            <div className="use-case">
              <span className="use-case-icon">⚖️</span>
              <p><strong>Best for:</strong> Getting mathematically fair attribution of feature importance</p>
            </div>
          </div>
        </div>
        
        <div className="guide-section">
          <h3>Why Use Different Methods?</h3>
          <p>
            Each explanation method has different strengths and limitations:
          </p>
          <div className="comparison-table">
            <div className="table-header">
              <div className="table-cell">Method</div>
              <div className="table-cell">Speed</div>
              <div className="table-cell">Accuracy</div>
              <div className="table-cell">Interpretability</div>
            </div>
            <div className="table-row">
              <div className="table-cell"><strong>Grad-CAM</strong></div>
              <div className="table-cell">
                <span className="performance-indicator high">Fast</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator medium">Medium</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator high">High</span>
              </div>
            </div>
            <div className="table-row">
              <div className="table-cell"><strong>Saliency Maps</strong></div>
              <div className="table-cell">
                <span className="performance-indicator high">Fast</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator low">Variable</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator medium">Medium</span>
              </div>
            </div>
            <div className="table-row">
              <div className="table-cell"><strong>Integrated Gradients</strong></div>
              <div className="table-cell">
                <span className="performance-indicator medium">Medium</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator high">High</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator medium">Medium</span>
              </div>
            </div>
            <div className="table-row">
              <div className="table-cell"><strong>LIME</strong></div>
              <div className="table-cell">
                <span className="performance-indicator low">Slow</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator medium">Medium</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator high">High</span>
              </div>
            </div>
            <div className="table-row">
              <div className="table-cell"><strong>SHAP</strong></div>
              <div className="table-cell">
                <span className="performance-indicator low">Slow</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator high">High</span>
              </div>
              <div className="table-cell">
                <span className="performance-indicator high">High</span>
              </div>
            </div>
          </div>
          <p>
            By comparing explanations from multiple methods, you can get a more complete picture of 
            how the model is making decisions.
          </p>
        </div>
        
        <div className="guide-controls">
          <button className="start-exploring-btn" onClick={onClose}>
            Start Exploring
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplainableAIGuide;
