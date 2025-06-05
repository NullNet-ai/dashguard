
import * as turf from '@turf/turf';

export const findValidPointInPolygon = (feature: any): [number, number] | null => {
  try {
    const geometry = feature.geometry;
    
    // For small countries, try multiple approaches
    const approaches = [
      // 1. Try centroid first
      () => {
        const centroid = turf.centroid(feature);
        const [lng, lat]: any = centroid.geometry.coordinates;
        if (turf.booleanPointInPolygon(turf.point([lng, lat]), feature)) {
          return [lat, lng];
        }
        return null;
      },
      
      // 2. Try point on surface (better for complex shapes)
      () => {
        try {
          const pointOnSurface = turf.pointOnFeature(feature);
          const [lng, lat] = pointOnSurface.geometry.coordinates;
          return [lat, lng];
        } catch (e) {
          return null;
        }
      },
      
      // 3. Sample multiple points from the polygon
      () => {
        if (geometry.type === "Polygon") {
          const coords = geometry.coordinates[0];
          // Try points at 1/4, 1/2, and 3/4 along the polygon boundary
          for (const fraction of [0.25, 0.5, 0.75]) {
            const index = Math.floor(coords.length * fraction);
            const [lng, lat] = coords[index];
            if (turf.booleanPointInPolygon(turf.point([lng, lat]), feature)) {
              return [lat, lng];
            }
          }
        } else if (geometry.type === "MultiPolygon") {
          // For MultiPolygon, try the largest polygon
          let largestPolygon = null;
          let largestArea = 0;
          
          for (const polygon of geometry.coordinates) {
            try {
              const poly = turf.polygon(polygon);
              const area = turf.area(poly);
              if (area > largestArea) {
                largestArea = area;
                largestPolygon = polygon;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (largestPolygon) {
            const coords = largestPolygon[0];
            for (const fraction of [0.25, 0.5, 0.75]) {
              const index = Math.floor(coords.length * fraction);
              const [lng, lat] = coords[index];
              if (turf.booleanPointInPolygon(turf.point([lng, lat]), feature)) {
                return [lat, lng];
              }
            }
          }
        }
        return null;
      },
      
      // 4. Use bounding box center as last resort
      () => {
        const bbox = turf.bbox(feature);
        const centerLng = (bbox[0] + bbox[2]) / 2;
        const centerLat = (bbox[1] + bbox[3]) / 2;
        return [centerLat, centerLng];
      }
    ];
    
    // Try each approach until one works
    for (const approach of approaches) {
      const result = approach();
      if (result) {
        if (Array.isArray(result) && result.length === 2 && typeof result[0] === 'number' && typeof result[1] === 'number') {
          return result as [number, number];
        }
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding valid point in polygon:', error);
    return null;
  }
};