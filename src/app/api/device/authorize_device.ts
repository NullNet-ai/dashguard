import axios from 'axios';

export async function authorizeDevice(device_id: string, token: string) {
  const host = process.env.WG_SERVER_IP;
  
  const response = await axios.post(
    `http://${host}:4444/wallguard/api/v1/authorize_device`,
    {
      device_id: device_id,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.status != 200)
    throw new Error(`Failed to authorize device: ${response.data}`);
}
