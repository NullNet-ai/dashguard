'use server'

import { api } from '~/trpc/server'

export const getImageData = async (imageID: string[]) => {
  try {
    const data = await api.files.getFileById({
      ids: imageID,
      pluck_fields: [
        'filename',
        'filepath',
        'mimetype',
        'download_path',
        'size',
        'originalname',
      ],
    })

    return data
  }
  catch (error) {
    console.error('Error fetching image data:', error)
    return null
  }
}
