import { api } from "~/trpc/server";

const packets = await api.packet.fetchPacketsIP({});

  // Get unique IPs for nodes
const uniqueIPs = [...new Set(packets?.flatMap(packet => [packet.source_ip, packet.destination_ip]))];

  // Create nodes in a grid layout
const GRID_SPACING = 250;
const GRID_COLUMNS = Math.ceil(Math.sqrt(uniqueIPs.length));

export const nodes = uniqueIPs.map((ip, index) => ({
  id: ip,
  position: {
    x: (index % GRID_COLUMNS) * GRID_SPACING,
    y: Math.floor(index / GRID_COLUMNS) * GRID_SPACING
  },
  data: { label: ip },
  style: {
    width: 180,
    height: 40,
    border: '1px solid #000000',
    borderRadius: 8,
    padding: '10px',
    backgroundColor: '#f8fafc',
    fontSize: '14px'
  }
}));

// Create edges between connected IPs
export const edges = packets?.map((packet, index) => ({
  id: `e${index}`,
  source: packet.source_ip,
  target: packet.destination_ip,
  // animated: true,
  style: { 
    stroke: '#000000',
    strokeWidth: 1.5
  },
  type: 'smoothstep',
  markerEnd: {
    type: 'arrow'
  }
}));