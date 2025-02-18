import axios from 'axios'

export async function getActualServerURL() {
  const {data} = await axios.get("http://{WG_SERVER_IP}:4444/v1/api/addr")
  
  return data
  }