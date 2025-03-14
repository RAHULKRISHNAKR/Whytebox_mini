import React, { useEffect, useState, useRef} from "react";
import * as TSP from "tensorspace";

// Other libraries (THREE, Stats, TWEEN, TrackballControls) can be imported via npm if needed

const TensorSpaceVisualizer = () => {
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);
  const initCalled = useRef(false);
  const outputLabels = window.result //&& Array.isArray(window.result))
  // ? window.result
  // : Array.from({ length: 1000 }, (_, i) => `label${i + 1}`);

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;
  
    async function init() {
      // Get the container element (make sure the div below has id "container")
      const container = document.getElementById("container");
      if (!container) {
        console.error("Container element not found.");
        return;
      }

      // Initialize the TensorSpace model with statistics enabled
      let model = new TSP.models.Sequential(container, { stats: true });

      // Define the network layers
      model.add(new TSP.layers.RGBInput());
      model.add(new TSP.layers.Conv2d({ initStatus: "open" }));
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d({ initStatus: "open" }));
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.DepthwiseConv2d());
      model.add(new TSP.layers.Conv2d());
      model.add(new TSP.layers.GlobalPooling2d());

      // Use the external "result" variable (loaded via imagenet_result.js) as outputs
      model.add(
        new TSP.layers.Output1d({
          paging: true,
          segmentLength: 200,
          outputs: outputLabels, // Make sure window.result is defined (e.g. by including imagenet_result.js in public/index.html)
        })
      );

      model.load({
        type: "keras",
        url: "/assets/models/mobilenetv1/model.json",
      });

      // Initialize the model and then load the sample input for prediction.
      model.init(async function () {
        try {
          const response = await fetch("/assets/data/coffeepot.json");
          const data = await response.json();
          model.predict(data);
          setPrediction("Prediction Loaded! Check Visualization.");
          setLoading(false);
        } catch (error) {
          console.error("Error fetching sample input:", error);
        }
      });
    }

    init();
  }, []);

  return (
    <div>
      {/* The container where TensorSpace will render the visualization */}
      <div id="container" style={{ width: "1280px", height: "100vh" }}></div>

      {/* Loading overlay */}
      {loading && (
        <div
          id="loadingPad"
          style={{
            position: "fixed",
            height: "100%",
            width: "100%",
            top: 0,
            left: 0,
            backgroundColor: "#031D32",
            zIndex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            id="loading"
            src="/assets/loading.gif"
            alt="Loading..."
            style={{ width: "30%" }}
          />
        </div>
      )}

      {/* Prediction output */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h2>Prediction Output</h2>
        <p>{prediction || "Loading..."}</p>
      </div>
    </div>
  );
};

export default TensorSpaceVisualizer;
