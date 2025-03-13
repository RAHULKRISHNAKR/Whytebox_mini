import React, { useState } from "react";
import Tree from "react-d3-tree";
import layerData from "../assets/layer_data.json";

const LayerVisualizer = () => {
  const [data] = useState(layerData);

  const buildLayerTree = (layers, predictions) => {
    if (layers.length === 0) {
      return {
        name: "Predictions",
        type: "predictions",
        predictions: predictions,
      };
    }
    const [currentLayer, ...restLayers] = layers;
    return {
      name: currentLayer.layer_name,
      image: currentLayer.feature_map,
      type: "layer",
      children: [buildLayerTree(restLayers, predictions)],
    };
  };

  const treeData = {
    name: "Input Image",
    image: data.input_image,
    type: "input",
    children: [buildLayerTree(data.layers, data.predictions)],
  };

  const renderCustomNode = ({ nodeDatum }) => {
    if (nodeDatum.type === "input" || nodeDatum.type === "layer") {
      return (
        <foreignObject width={180} height={180}>
          <div style={{ width: "180px", height: "180px", position: "relative" }}>
            <img
              src={`data:image/png;base64,${nodeDatum.image}`}
              alt={nodeDatum.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain", // Keeps aspect ratio
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
            <p
              style={{
                position: "absolute",
                bottom: "5px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255, 255, 255, 0.8)",
                padding: "3px 7px",
                borderRadius: "5px",
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              {nodeDatum.name}
            </p>
          </div>
        </foreignObject>
      );
    } else if (nodeDatum.type === "predictions") {
        return (
            <foreignObject width={250} height={nodeDatum.predictions.length * 25 + 50}>
              <div
                style={{
                  width: "auto",
                  padding: "10px",
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  textAlign: "center",
                  boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
                  overflow: "visible",
                }}
              >
                <h2
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "5px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Predictions:
                </h2>
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {nodeDatum.predictions.map((pred, index) => (
                    <p
                      key={index}
                      style={{
                        fontSize: "12px",
                        fontWeight: index === 0 ? "bold" : "normal",
                        color: index === 0 ? "green" : "gray",
                        margin: "4px 0",
                        whiteSpace: "normal", // Allow text wrapping
                        wordBreak: "break-word",
                      }}
                    >
                      {pred.class} ({(pred.probability * 100).toFixed(2)}%)
                    </p>
                  ))}
                </div>
              </div>
            </foreignObject>
          );
    }
  };

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-xl font-bold mb-4">Layer Visualization</h1>
      <div style={{ width: "900px", height: "700px", overflow: "hidden" }}>
        <Tree
          data={treeData}
          orientation="vertical"
          collapsible={false}
          translate={{ x: 450, y: 100 }} // Adjust positioning
          separation={{ siblings: 2, nonSiblings: 3 }} // Increase spacing
          nodeSize={{ x: 200, y: 250 }} // More spacing between nodes
          renderCustomNodeElement={renderCustomNode}
        />
      </div>
    </div>
  );
};

export default LayerVisualizer;
