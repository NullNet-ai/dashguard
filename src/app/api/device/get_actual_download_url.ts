import axios from "axios";

export async function getActualDownloadURL() {
  try {
    
    const {data} = await axios.get(`${process.env.ACTUAL_DOWNLOAD_URL}`)

    const asset = data.assets.find((asset: Record<string,any>) => asset.name.startsWith("pfSense-pkg-wallguard"));

    
    return asset?.browser_download_url || '';
  } catch (error) {
    throw error
    
  }
  
}