import L from "leaflet";

export function animateFlowLine(map: any, points: [number, number][], options: any = {}) {
  const {
    animationStep = 2,
    animationFrameDelayMs = 0,
    animationStartDelayMs = 0,
    ...polylineOptions
  } = options ?? {};

  const line = L.polyline([], polylineOptions).addTo(map);
  let i = 0;

  const step = Math.max(1, Number(animationStep) || 1);
  const frameDelayMs = Math.max(0, Number(animationFrameDelayMs) || 0);
  const startDelayMs = Math.max(0, Number(animationStartDelayMs) || 0);

  let lastFrameTime = 0;
  function drawStep(now: number) {
    if (i < points.length) {
      if (frameDelayMs === 0 || now - lastFrameTime >= frameDelayMs) {
        line.setLatLngs(points.slice(0, i + 1));
        i += step;
        lastFrameTime = now;
      }
      requestAnimationFrame(drawStep);
      return;
    }

    line.setLatLngs(points);
  }

  if (startDelayMs > 0) {
    setTimeout(() => requestAnimationFrame(drawStep), startDelayMs);
  } else {
    requestAnimationFrame(drawStep);
  }
  return line;
}
