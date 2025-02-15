'use client'

import { Button } from '@headlessui/react'
import { ImageIcon, Pencil, Trash } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { FormBuilder } from '~/components/platform/FormBuilder'
import { IHandleSubmit } from '~/components/platform/FormBuilder/types'
import { useSideDrawer } from '~/components/platform/SideDrawer'

import DeleteConfirmationDialog from '../_components/DeleteConfirmationDialog'

const FormSchema = z.object({
  upload: z.array(z.string()),
});

function UploadComponent() {
//  temporary only i will remove this once the column is added to the database
  // const _files = ['01JM3MZ9DW7697VM0E2YHNNKFK']

  // const { data }: any = api.files.getFileById.useQuery({
  //   ids: (_files as unknown as string[]) ?? "",
  //   pluck_fields: [
  //     "filename",
  //     "filepath",
  //     "mimetype",
  //     "download_path",
  //     "size",
  //     "originalname",
  //   ],
  // });

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>): Promise<any[]> => {
    try {
      alert(JSON.stringify(data, null, 2));
      return await Promise.resolve([]);
    }
    catch (error) {
      toast.error('Failed to submit Basic Details');
      return [];
    }
  };

  return (
    <FormBuilder
      formLabel='Upload Image'
      formKey="upload"
      formSchema={FormSchema}
      handleSubmit={handleSave}
      customDesign={{
        formClassName: '!grid-cols-1',
      }}
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
          required: true,
        },
      ]}
    />
  )
}

export default function ProfileImage() {
  const [openDialog, setOpenDialog] = useState(false)

  const { actions } = useSideDrawer()
  const config = {
    title: 'Upload Image',
    sideDrawerWidth: '30dvw',
    overlayEnabled: true,
    body: {
      component: UploadComponent,
    },
    onCloseSideDrawer() {
      //
    },
  }

  return (
    <div className="mt-2 p-2 px-4 flex justify-center">
      <div className='relative group'>
        <Button
          title="image placeholder"
          // className="bg-muted w-full md:w-[300px] h-[150px] grid place-content-center cursor-pointer"
          onClick={() => {
            actions?.openSideDrawer(config)
          }}
        >
          <Image
            alt="dummy image"
            className="rounded-md w-full object-cover"
            src="/dummyImage.png"
            height={300}
            width={300}
          />
          {/* <ImageIcon className="size-6 text-primary opacity-70" /> */}
        </Button>
        <div className='absolute left-0 bottom-2 opacity-0 group-hover:opacity-100 flex gap-x-2 justify-center transition-opacity duration-300 bg-default/20 w-full p-1'>
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
            onClick={() => {
              actions?.openSideDrawer(config)
            }}
          >
            <Pencil className="size-3 text-primary" />
          </Button>
          <Button
            className='bg-white rounded-md p-1 hover:opacity-45'
            onClick={() => {
              setOpenDialog(true)
            }}
            aria-label="Delete image"
            title="Delete image"
          >
            <Trash className="size-3 text-danger" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <DeleteConfirmationDialog
        open={openDialog}
        onChangeContext={(setOpenDialog)}
        onConfirm={async () => {
          setOpenDialog(false)
        }}
      />
    </div>
  )
}
