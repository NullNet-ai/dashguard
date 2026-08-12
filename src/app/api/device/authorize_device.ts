import axios from 'axios';

export async function authorizeDevice(device_id: string, token: string) {
  const host = process.env.WG_SERVER_IP;
  console.log("🚀 ~ authorizeDevice ~ host:", host)
  
  const response = await axios.post(
    `${host}/wallguard/api/v1/authorize_device`,
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

  if (response.status != 200) {
    throw new Error(`Failed to authorize device: ${response.data}`);
  }
  return response.data
}
