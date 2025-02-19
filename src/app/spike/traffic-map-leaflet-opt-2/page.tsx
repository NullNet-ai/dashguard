// // pages/index.js
// import Head from 'next/head';
// import Map from './components/Map';

// export default function Home() {
//   return (
//     <div>
//       <Head>
//         <title>Next.js Leaflet Map</title>
//         <meta name="description" content="A simple map using Next.js and Leaflet" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <main>
//         <h1>Welcome to the Next.js Leaflet Map!</h1>
//         <Map />
//       </main>
//     </div>
//   );
// }
'use client';

// import { useEffect } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet.heat';

// const Map = () => {
//   useEffect(() => {
//     const map = L.map('map').setView([14.5995, 120.9842], 13); // Centered on Manila, Philippines

//     // Base Map (OpenStreetMap)
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(map);

//     // Heatmap Layer (Using Leaflet.heat)
//     const heatmapData = [
//       [14.5995, 120.9842, 0.5], // Manila
//       [14.6500, 121.0300, 0.8], // Quezon City
//       [14.5500, 121.0000, 0.3], // Makati
//     ];
//     L.heatLayer(heatmapData, { radius: 25 }).addTo(map);

//     // Traffic Data (Custom GeoJSON or Overlay)
//     const trafficData = {
//       type: 'FeatureCollection',
//       features: [
//         {
//           type: 'Feature',
//           properties: {},
//           geometry: {
//             type: 'LineString',
//             coordinates: [
//               [120.9842, 14.5995], // Manila
//               [121.0300, 14.6500], // Quezon City
//             ],
//           },
//         },
//       ],
//     };
//     L.geoJSON(trafficData, {
//       style: { color: 'red', weight: 5 },
//     }).addTo(map);

//     return () => {
//       map.remove();
//     };
//   }, []);

//   return <div id="map" style={{ height: '100vh', width: '100%' }} />;
// };

// export default Map;

// pages/index.js
import Map from './components/Map';
import MapOption1 from './components/MapOption1';
import MapOption2NoCountry from './components/MapOption2NoCountry';

export default function Home() {
  return (
    <div>
      <h1>Traffic Flow to Philippines Server</h1>
      <MapOption2NoCountry />
    </div>
  );
}