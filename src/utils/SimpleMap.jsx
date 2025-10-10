import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

export const SimpleMap = ({
  geoData,
  provinsiData,
  onSelectProvince,
  geoStyle,
}) => {
  const [mapData, setMapData] = useState(null);
  // const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    if (geoData) setMapData(geoData);
  }, [geoData]);

  const getColor = (kode_pro) => {
    const prov = provinsiData?.find((p) => p.kode_pro === kode_pro);
    if (!prov) return "#E0E0E0";

    const jumlah = prov.total_jml_rev_sekolah || 0;
    if (jumlah > 200) return "#F28E2B";
    if (jumlah > 100) return "#F5B041";
    if (jumlah > 50) return "#F8C471";
    return "#FAD7A0";
  };

  // useEffect(() => {
  //   fetch(
  //     "https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-prov.geojson"
  //   )
  //     .then((res) => res.json())
  //     .then((data) => setGeoData(data));
  // }, []);

  return (
    <div style={{ width: "100%", height: 320 }}>
      {mapData && (
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1660, // skala sedang, nanti bisa kamu sesuaikan
            center: [118, -2.5], // posisi tengah Indonesia (longitude, latitude)
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={mapData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const kode_pro = parseInt(geo?.properties?.kode_pro ?? 0, 10);
                const fillColor =
                  geoStyle?.fill || getColor(kode_pro) || "#EEE";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke="#FFF"
                    onClick={() =>
                      onSelectProvince?.({
                        kode_pro,
                        nama_wilayah: geo?.properties?.nama_wilayah,
                      })
                    }
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#3498DB", outline: "none" },
                      pressed: { fill: "#1F618D", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      )}
    </div>
  );
};
