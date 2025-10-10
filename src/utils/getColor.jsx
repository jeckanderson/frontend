import { scaleLinear } from "d3-scale";

export const getColor = (value, min, max) => {
  if (min === max || isNaN(value)) return "#9bc1d0ff"; // warna default
  const colorScale = scaleLinear()
    .domain([min, max])
    .range(["#cfe2f3", "#0e67a1ff"]); // cerah → gelap
  return colorScale(value);
};
