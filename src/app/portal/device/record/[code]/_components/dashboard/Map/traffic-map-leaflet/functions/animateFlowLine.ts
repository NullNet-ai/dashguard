import L from "leaflet";

export function animateFlowLine(map: any, points: [number, number][], options: any = {}) {
  const line = L.polyline([], options).addTo(map);
  let i = 0;
  const step = 35; // Increase this value for faster animation (e.g., 5 points per frame)
  function drawStep() {
    if (i < points.length) {
      line.setLatLngs(points.slice(0, i + 1));
      i += step;
      requestAnimationFrame(drawStep);
    } else {
      // Ensure the full line is always rendered at the end
      line.setLatLngs(points);
    }
  }
  drawStep();
  return line;
}