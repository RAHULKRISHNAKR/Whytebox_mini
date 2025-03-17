import React from 'react';

const BeginnersGuide = ({ onClose }) => {
  return (
    <div className="beginners-guide">
      <div className="guide-content">
        <div className="guide-header">
          <h2>Understanding Computer Vision - For Complete Beginners</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <section className="guide-section">
          <h3>What is a CNN?</h3>
          <p>
            A <strong>Convolutional Neural Network (CNN)</strong> is like a brain that learns to see. 
            Just as you can recognize a cat in a photo, a CNN can be trained to do the same!
          </p>
          <div className="analogy">
            <h4>Real-life Analogy</h4>
            <p>
              Imagine you're trying to find Waldo in a crowded picture. You don't look at every tiny detail at once.
              Instead, your eyes scan for patterns - red and white stripes, glasses, etc.
              A CNN works the same way! It learns to recognize important patterns.
            </p>
          </div>
        </section>
        
        <section className="guide-section">
          <h3>How Does It Work?</h3>
          <ol className="process-list">
            <li>
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Seeing Features</strong>: First layers detect simple features like edges and colors
                  <div className="example-image">
                    <img src="/assets/images/guide/simple-features.jpg" alt="Simple features like edges" />
                    <div className="image-caption">Edge detection in early layers</div>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Combining Features</strong>: Middle layers combine these to find patterns like "whiskers" or "wheels"
                  <div className="example-image">
                    <img src="/assets/images/guide/combined-features.jpg" alt="Combined features like shapes" />
                    <div className="image-caption">Pattern combination in middle layers</div>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Making Decisions</strong>: Final layers put everything together to decide "That's a cat!" or "That's a car!"
                  <div className="example-image">
                    <img src="/assets/images/guide/final-decision.jpg" alt="Final classification" />
                    <div className="image-caption">Classification in final layers</div>
                  </div>
                </div>
              </div>
            </li>
          </ol>
        </section>
        
        <section className="guide-section">
          <h3>Why Do We Need to Explain AI?</h3>
          <p>
            AI systems can sometimes be "black boxes" - we know they work, but not exactly how they make decisions.
            <strong>Explainable AI</strong> helps us peek inside to understand:
          </p>
          <ul className="benefits-list">
            <li>
              <div className="benefit-icon">🔍</div>
              <div>Which parts of an image influenced the decision most</div>
            </li>
            <li>
              <div className="benefit-icon">🧩</div>
              <div>What patterns the AI has learned to recognize</div>
            </li>
            <li>
              <div className="benefit-icon">⚠️</div>
              <div>When and why the AI might make mistakes</div>
            </li>
          </ul>
        </section>
        
        <div className="guide-controls">
          <button className="primary-btn" onClick={onClose}>
            Got it, let's explore!
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeginnersGuide;