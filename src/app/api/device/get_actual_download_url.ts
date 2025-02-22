import axios from "axios";

export async function getActualDownloadURL() {
  try {
     const {data} = await axios.get('https://api.github.com/repos/NullNet-ai/wallguard/releases/latest')

    const asset = data.assets.find((asset: Record<string,any>) => asset.name.startsWith("pfSense-pkg-wallguard"));
    
    return asset?.browser_download_url; 
  } catch (error) {
    return ''
    
  }

}