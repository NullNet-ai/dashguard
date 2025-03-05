'use client'

import { Button } from '@headlessui/react'
import { ImageIcon, Pencil, PencilIcon, Trash } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { FilePreview } from '~/components/platform/FileUpload/FilePreview'
import { FormBuilder } from '~/components/platform/FormBuilder'
import { IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Loader } from '~/components/ui/loader'
import { cn } from '~/lib/utils'

import DeleteConfirmationDialog from '../_components/DeleteConfirmationDialog'

import { getImageData } from './action/getImageData'
import { handleSaveUrl } from './action/updateImageUrl'

const FormSchema = z.object({
  upload: z.array(z.string()),
  edited_files: z.array(z.string()),
});

function UploadComponent(props: any) {
  const { details, entity, actions, metadata } = props || {}

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>): Promise<any[]> => {
    try {
      if ((!details.data?.id || !entity || !data?.upload?.length) && !data?.edited_files?.length) {
        return await Promise.resolve([]);
      }
      const image_url = data?.edited_files?.[0] ? data?.edited_files[0] : data?.upload[0]

      const formData = {
        id: details?.data?.id,
        entity,
        params: {
          image_url,
        },
      }

      await handleSaveUrl(formData)
      metadata?.setImageId(image_url)

      actions?.closeSideDrawer()
      return await Promise.resolve([]);
    }
    catch (error) {
      toast.error('Failed to save image');
      return [];
    }
  };

  return (
    <FormBuilder
      formLabel='Upload Image'
      customConfig={{
        defaultState: 'unlock',
      }}
      formKey="upload"
      formSchema={FormSchema}
      handleSubmit={handleSave}
      customDesign={{
        formClassName: '!grid-cols-1',
      }}
      defaultValues= {
        {
          upload: [
            metadata?.imageId || details?.data?.image_url || '',
          ],
          edited_files: [],
        }
      } 
      // {...(metadata?.imageId || details?.data?.image_url
      //   ? {
      //       defaultValues: {
      //         upload: [
      //           metadata?.imageId || details?.data?.image_url || '',
      //         ],
      //         edited_files: [],
      //       },
      //     }
      //   : {})}
      fields={[
        {
          id: 'upload',
          fileDropzoneOptions: {
            multiple: false,
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg'],
            },
            maxFiles: 1,
          },
          name: 'upload',
          type: 'image',
          formType: 'file',
          label: ' ',
          placeholder: 'upload',
        },
      ]}
    />
  )
}

export default function ProfileImage({ details, entity, token }: any) {
  const [openDialog, setOpenDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageId, setImageId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [imageInfo, setImageInfo] = useState<any>({})

  useEffect(() => {
    const convertToBase64 = async () => {
      try {
        if ((token && details?.data?.image_url) || (imageId && token)) {
          const stringID = imageId ? imageId : details?.data?.image_url
          setLoading(true)
          const response = await fetch(`/api/file/${stringID}/download`)

          const imgInfo = await getImageData([stringID])
          setImageInfo(imgInfo ? imgInfo[0] : {})

          const blob = await response.blob()
          const reader = new FileReader()
          reader.onloadend = () => {
            setImageUrl(reader.result as string)
            setLoading(false)
          }
          reader.readAsDataURL(blob)
        }
      }
      catch (error) {
        console.error('Error converting image:', error)
      }
    }

    void convertToBase64()
  }, [token, imageId])

  const { actions } = useSideDrawer()
  const config = {
    header: 'Upload Image',
    sideDrawerWidth: '30dvw',
    body: {
      component: UploadComponent,
      componentProps: {
        details,
        entity,
        actions,
        metadata: {
          setImageId,
          imageId,
        },
      },
    },
    onCloseSideDrawer() {
      //
    },
  }

  const handleRemove = async () => {
    const formData = {
      id: details?.data?.id,
      entity,
      params: {
        image_url: null,
      },
    }
    await handleSaveUrl(formData)
    setImageUrl('')
    setImageId('')
  }

  return (
    <>
      <div className="mt-1 px-4 flex justify-center">
        <div className='relative group'>
          <div
            title="Record summary image"
            className="bg-muted w-full md:w-[277px] h-[150px] flex items-center justify-center cursor-pointer"
            onClick={() => {
              if(imageUrl)  {
                setIsPreviewModalOpen(true)
              }
              else {
                actions?.openSideDrawer(config)
              }
            }}
          >

            {imageUrl
              ? (
                  <Image
                    alt="record image"
                    className='rounded-md w-full object-cover h-full'
                    src={imageUrl || '/dummyImage.png'}
                    height={300}
                    width={300}
                  />
                )
              : loading ? <Loader size='md' label='loading' variant='circularShadow' /> : <ImageIcon className="size-6 text-primary opacity-70" />}

          </div>
          {imageUrl
            ? (
                <div className='absolute left-0 bottom-0 opacity-0 group-hover:opacity-100 flex gap-x-2 justify-center transition-opacity duration-300 bg-default/20 w-full p-1'>
                  <Button
                    className={cn(`bg-white rounded-md p-1 hover:opacity-45`, `${!imageUrl ? 'opacity-45' : ''}`)}
                    aria-label="View image"
                    title="View image"
                    disabled={!imageUrl}
                    onClick={() => {
                      setIsPreviewModalOpen(true)
                    }}
                  >
                    <ImageIcon className="size-3 text-default/70" />
                  </Button>
                  <Button
                    className={cn(`bg-white rounded-md p-1 hover:opacity-45`, `${!imageUrl ? 'opacity-45' : ''}`)}
                    aria-label="Edit image"
                    title="Edit image"
                    disabled={!imageUrl}
                    onClick={() => {
                      actions?.openSideDrawer(config)
                    }}
                  >
                    <Pencil className="size-3 text-primary" />
                  </Button>
                  <Button
                    className={cn(`bg-white rounded-md p-1 hover:opacity-45`, `${!imageUrl ? 'opacity-45' : ''}`)}
                    disabled={!imageUrl}
                    onClick={() => {
                      setOpenDialog(true)
                    }}
                    aria-label="Delete image"
                    title="Delete image"
                  >
                    <Trash className="size-3 text-danger" aria-hidden="true" />
                  </Button>
                </div>
              )
            : (
                <button
                  onClick={() => {
                    actions?.openSideDrawer(config)
                  }}
                  className='absolute bottom-1 right-1 text-primary text-sm bg-white size-6 p-1 flex items-center justify-center hover:opacity-70'
                >
                  <PencilIcon className='size-4' />
                </button>
              ) }
        </div>
        <DeleteConfirmationDialog
          open={openDialog}
          onChangeContext={(setOpenDialog)}
          onConfirm={async () => {
            await handleRemove()
            setOpenDialog(false)
          }}
        />
      </div>
      <FilePreview
        imageSrc={imageUrl || ''}
        isPreviewModalOpen={isPreviewModalOpen}
        setIsPreviewModalOpen={setIsPreviewModalOpen}
        isImageFile={true}
        previewSrc={null}
        isPdfFile={false}
        filename={imageInfo?.originalname}
      />

    </>
  )
}
