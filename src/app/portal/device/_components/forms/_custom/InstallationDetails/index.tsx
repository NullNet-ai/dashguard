import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { useToast } from '~/context/ToastProvider'

import { FormField } from '~/components/ui/form'

interface IInstallationDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>
  selectOptions?: Record<string, any>
  defaultValues?: Record<string, any>
}

export default function CustomInstallationDetails({
  form,
  defaultValues
}: IInstallationDetails) {
  const toast = useToast()
  const {download_url} = defaultValues ?? {}
  const copyToClipboard = async (value: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value)
        toast.success('Copied to clipboard!')
        return
      }
      catch (err) {
        toast.error('Failed to copy to clipboard')
      }
    }

    try {
      const textArea = document.createElement('textarea')
      textArea.value = value

      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'

      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      textArea.remove()

      if (successful) {
        toast.success('Copied to clipboard!')
      }
      else {
        toast.error('Failed to copy to clipboard')
      }
    }
    catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleCopyClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
    value: string,
  ) => {
    event.preventDefault()
    await copyToClipboard(value)
  }

  // Rest of your component remains the same
  return (
    <FormField
      control={form.control}
      name="firewall"
      render={() => {
        return (
          <div className='grid grid-cols-1 gap-2'>
            <p className='col-span-2'>
              {"Download the following package for your PfSense and install"}
              {" using the following directions:"}
            </p>
            <div className='col-span-2'>

              <div className='mt-2  space-x-4'>
                <p>1. Download the package</p>
                <input
                  className='mt-1 md:w-96 rounded-md border-orange-300 bg-orange-100 p-2 text-orange-500'
                  readOnly={ true }
                  type='text'
                  value={`curl -o pfSense-pkg-wallguard.pkg -L ${download_url}`}
                />
                <button
                  className='my-auto'
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleCopyClick(
                    event, `curl -o pfSense-pkg-wallguard.pkg -L ${download_url}`,
                  ) }
                >
                  <DocumentDuplicateIcon
                    className='h-5 w-5 text-gray-400'
                    data-test-id='device-download-copy-btn'
                  />
                </button>
              </div>
            </div>
            <div className='col-span-2'>
              <div className='mt-2 space-x-4'>
                <p>2. Install package using the following command:</p>
                <input
                  className='mt-1  md:w-96 rounded-md border-indigo-300 bg-indigo-50 p-2 text-indigo-700'
                  readOnly={ true }
                  type='text'
                  value='pkg install Wallmon.pkg'
                />
                <button
                  className='my-auto'
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleCopyClick(event, 'pkg install Wallmon.pkg') }
                >
                  <DocumentDuplicateIcon
                    className='h-5 w-5 text-gray-400'
                    data-test-id='device-install-copy-btn'
                  />
                </button>
              </div>
            </div>

            <div className='mt-2 space-x-4'>
              <p>3. Confirm Installation using command</p>
              <input
                className='mt-1  md:w-96 rounded-md border-green-300 bg-green-100 p-2 text-green-600'
                readOnly={true}
                type='text'
                value='Wallmon --version'
              />
              <button
                className='my-auto'
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleCopyClick(event, 'Wallmon --version') }
              >
                <DocumentDuplicateIcon
                  className='h-5 w-5 text-gray-400'
                  data-test-id='device-confirm-copy-btn'
                />
              </button>
            </div>
          </div>
        )
      } }
    />
  )
}
