export const mock_bandwidth = [{
  source_ip: '172.25.0.1 fgfgfgfgf',
  destination_ip: '172.25.0.2',
  result: [
    { bucket: '2025-02-14 01:55:37+00', bandwidth: '0' },
    { bucket: '2025-02-14 01:55:36+00', bandwidth: '912964' },
    { bucket: '2025-02-14 01:55:35+00', bandwidth: '100' },
    { bucket: '2025-02-14 01:55:34+00', bandwidth: '2529977' },
    { bucket: '2025-02-14 01:55:33+00', bandwidth: '2599' },
    { bucket: '2025-02-14 01:55:32+00', bandwidth: '5343534' },
    { bucket: '2025-02-14 00:13:57+00', bandwidth: '0' },
    { bucket: '2025-02-14 00:13:56+00', bandwidth: '0' },
    { bucket: '2025-02-14 00:13:55+00', bandwidth: '95868' },
    { bucket: '2025-02-14 00:13:54+00', bandwidth: '52292' },
    { bucket: '2025-02-14 00:13:53+00', bandwidth: '2432' },
    { bucket: '2025-02-14 00:13:52+00', bandwidth: '841406' },
    { bucket: '2025-02-14 00:13:51+00', bandwidth: '42178' },
    { bucket: '2025-02-14 00:13:50+00', bandwidth: '354' },
    { bucket: '2025-02-14 00:13:49+00', bandwidth: '65634' },
    { bucket: '2025-02-14 00:13:48+00', bandwidth: '62024' },
    { bucket: '2025-02-14 00:13:47+00', bandwidth: '5765756' },
    { bucket: '2025-02-14 00:13:46+00', bandwidth: '0' },
    { bucket: '2025-02-14 00:13:45+00', bandwidth: '0' },
    { bucket: '2025-02-14 00:13:44+00', bandwidth: '134450' },
  ],
}]

// Function to generate new data points
// const generateNewDataPoint = () => {
//   const now = new Date()
//   const formattedTime = now.toISOString().split('.')[0] + '+00'
//   const newBandwidth = Math.floor(Math.random() * 20).toString() // Random bandwidth value within a smaller range

//   return { bucket: formattedTime, bandwidth: newBandwidth }
// }

// // Function to generate new IP addresses
// const generateNewIP = () => {
//   const getRandomOctet = () => Math.floor(Math.random() * 256)
//   return `172.25.${getRandomOctet()}.${getRandomOctet()}`
// }

// Function to update the mock_bandwidth array
// const updateMockBandwidth = () => {
//   mock_bandwidth.forEach((entry) => {
//     entry.result.unshift(generateNewDataPoint()); // Add new data point to the beginning of the array
//     if (entry.result.length > 20) {
//       entry.result.pop(); // Remove the oldest data point if the array exceeds 20 items
//     }
//   });

//   // Add new IPs with the same structure
//   const newSourceIP = generateNewIP();
//   const newDestinationIP = generateNewIP();
//   mock_bandwidth.push({
//     source_ip: newSourceIP,
//     destination_ip: newDestinationIP,
//     result: Array.from({ length: 20 }, generateNewDataPoint), // Generate initial data points
//   });
// };

// Update the mock_bandwidth array every second
// setInterval(updateMockBandwidth, 1000);
