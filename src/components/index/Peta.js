import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "/indonesia.geojson";

function Content() {
  const [position, setPosition] = useState({ coordinates: [120, -2], zoom: 1 });

  const handleMoveEnd = (pos) => {
    setPosition(pos);
  };

  return (
    <div className="content-wrapper">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1000 }}
        style={{ width: "50%", height: "300px" }}
      >
        <ZoomableGroup
          projectionConfig={{
            scale: 1000,
            center: [120, -2], // biar fokus ke Indonesia
          }}
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={1}
          maxZoom={8}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: "#D6D6DA", outline: "none" },
                    hover: { fill: "rgba(51, 177, 255, 1)", outline: "none" },
                    pressed: { fill: "#E42", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

export default Content;
