import L from "leaflet";
import { getTrafficColor } from "./getTrafficColor";

export const createFlowLine = (
    from: any,
    to: any,
    trafficLevel: any,
    condition = null
  ) => {
    // Determine line color based on condition or traffic level
    let lineColor = getTrafficColor(trafficLevel);
    
    if (condition) {
      switch (condition) {
        case 'High': lineColor = 'rgba(255, 0, 0, 0.7)'; break;
        case 'Medium': lineColor = 'rgba(255, 165, 0, 0.7)'; break;
        case 'Low': lineColor = 'rgba(0, 128, 0, 0.7)'; break;
      }
    }
    
    // Calculate line width based on traffic level (1-3px)
    const lineWidth = 3;
    
    // Create curved line between points
    const curvePoints: any = [];
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // Create a curved path using sine function for curvature
      const lng = from[1] * (1 - t) + to[1] * t;
      const lat = from[0] * (1 - t) + to[0] * t + Math.sin(Math.PI * t) * 5;
      
      curvePoints.push([lat, lng]);
    }
    
    // Create the curved line
    const line = L.polyline(curvePoints, {
      color: lineColor,
      weight: lineWidth,
      opacity: 0.8,
      dashArray: '5, 5',
      className: 'traffic-flow-line',
    });
    
    return line;
  };