'use client'

import { Button } from '@headlessui/react'
import { ImageIcon, Pencil, Trash } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Loader } from '~/components/ui/loader'

import DeleteConfirmationDialog from '../_components/DeleteConfirmationDialog'

import { handleSaveUrl } from './action/updateImageUrl'

const FormSchema = z.object({
  upload: z.array(z.string()),
});

function UploadComponent(props: any) {
  const { details, entity, actions } = props || {}

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>): Promise<any[]> => {
    try {
      if (!details.data?.id || !entity || !data?.upload?.length) {
        return await Promise.resolve([]);
      }

      const formData = {
        id: details?.data?.id,
        entity,
        params: {
          image_url: data?.upload?.[0],
        },
      }

      await handleSaveUrl(formData)
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
      formKey="upload"
      formSchema={ FormSchema }
      handleSubmit={ handleSave }
      customDesign={ {
        formClassName: '!grid-cols-1',
      } }

      fields={ [
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
          required: true,
        },
      ] }
    />
  )
}

export default function ProfileImage({details, entity} : any) {
  const [openDialog, setOpenDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const convertToBase64 = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/file/${details?.data?.image_url}/download`)
        const blob = await response.blob()
        
        const reader = new FileReader()
        reader.onloadend = () => {
          setImageUrl(reader.result as string)
          setLoading(false)
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        console.error('Error converting image:', error)
      }
    }
    
    convertToBase64()
  }, [])


  const { actions } = useSideDrawer()
  const config = {
    title: 'Upload Image',
    sideDrawerWidth: '30dvw',
    overlayEnabled: true,
    body: {
      component: UploadComponent,
      componentProps: {
        details: details,
        entity: entity,
        actions: actions,
      }
    },
    onCloseSideDrawer() {
      //
    },
  }

  return (
    <div className="mt-1 px-4 flex justify-center">
      <div className='relative group'>
        <div
          title="image placeholder"
          className="bg-muted w-full md:w-[300px] h-[150px] flex items-center justify-center cursor-pointer"
          onClick={ () => {
            actions?.openSideDrawer(config)
          } }
        >
               
          {imageUrl ?  
              <Image
                alt="record image"
                className="rounded-md w-full object-cover h-full"
                src={ imageUrl || "/dummyImage.png" }
                height={ 300 }
                width={ 300 }
              />  :  loading ? <Loader size='md' label='loading' variant='circularShadow'/> : <ImageIcon className="size-6 text-primary opacity-70" />
          }
          
        </div>
        <div className='absolute left-0 bottom-0 opacity-0 group-hover:opacity-100 flex gap-x-2 justify-center transition-opacity duration-300 bg-default/20 w-full p-1'>
          <Button
            className='bg-white rounded-md p-1 hover:opacity-45'
            aria-label="View image"
            title="View image"
          >
            <ImageIcon className="size-3 text-default/70" />
          </Button>
          <Button
            className='bg-white rounded-md p-1 hover:opacity-45'
            aria-label="Edit image"
            title="Edit image"
            onClick={ () => {
              actions?.openSideDrawer(config)
            } }
          >
            <Pencil className="size-3 text-primary" />
          </Button>
          <Button
            className='bg-white rounded-md p-1 hover:opacity-45'
            onClick={ () => {
              setOpenDialog(true)
            } }
            aria-label="Delete image"
            title="Delete image"
          >
            <Trash className="size-3 text-danger" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <DeleteConfirmationDialog
        open={ openDialog }
        onChangeContext={ (setOpenDialog) }
        onConfirm={ async () => {
          setOpenDialog(false)
        } }
      />
    </div>
  )
}
