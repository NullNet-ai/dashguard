'use client'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { EyeIcon, EyeOffIcon, InfoIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { Button } from '~/components/ui/button'
import { FormField, FormItem, FormLabel } from '~/components/ui/form'
import { useToast } from '~/context/ToastProvider'
import { CredentialsGenerator } from '~/server/utils/credentials'
import { api } from '~/trpc/react'

import { AppSecretGenerationInfo } from '../AppSecretGenerationInfo'

interface ISetupDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>
  orgAccount?: Record<string, string> | null
  isFromRecord?: boolean
  params?: Record<string, any>
}

const addTestIdName = ({
  type,
  name,
}: {
  type: string
  name: string
}): string => `device_${name}-${type}-${name}`

export default function CustomSetupDetails({
  form,
  orgAccount,
  isFromRecord,
  params,
}: ISetupDetails) {
  const { control, formState } = form || {}
  const { defaultValues } = formState || {}
  const { account_id, account_secret } = orgAccount || {}

  const toast = useToast()
  const [showInfo, setShowInfo] = React.useState<boolean>(false)
  const [showSecret, setShowSecret] = useState(false)
  const updateOrgAccount = api.device.updateOrganizationAccount.useMutation()

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value).catch((err) => {
      console.error('Failed to copy text: ', err)
    })
  }
  const handleCopyClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: string,
  ) => {
    event.preventDefault()
    copyToClipboard(value)
  }

  const handleGenerateNewKey = async () => {
    try {
      const new_generated_app_secret = CredentialsGenerator.generateAppSecret()
      const response = await updateOrgAccount.mutateAsync({
        id: params?.id,
        account_secret: new_generated_app_secret,
      })

      if (!!response && Object.keys(response).length) {
        toast.success(`${response?.message}`)
      }
      form.setValue('app_secret', new_generated_app_secret, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      })

      setShowInfo(true)
    }
    catch (error) {
      toast.error('Failed to update Organization Account')
    }
  }

  const acct_secret = form.watch('app_secret')

  const app_secret = defaultValues?.account_secret || acct_secret

  return (
    <FormField
      control={form.control}
      name="Firewall"
      render={() => {
        return (
          <FormItem className='contents'>
            <>
              {showInfo && !!app_secret && <AppSecretGenerationInfo />}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <div className="mt-2 space-x-2">
                    <label
                      className='block text-md'
                      data-test-id = { addTestIdName({ type: 'lbl', name: 'server_url' }) }
                    >
                      Server URL
                    </label>
                    <input
                      className="mt-1 min-w-[70%] rounded-md border-orange-300 bg-orange-100 p-2 text-orange-500"
                      data-test-id={addTestIdName({
                        type: 'inp',
                        name: 'server_url',
                      })}
                      readOnly={true}
                      type="text"
                      value="https://wallgaurd.ai/"
                    />
                    <button
                      className="my-auto"
                      data-test-id={addTestIdName({
                        type: 'cpy',
                        name: 'server_url',
                      })}
                      onClick={(event) => handleCopyClick(event, 'https://wallgaurd.ai/') }
                    >
                      <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
                <FormField
                  control={control}
                  name={`app_id`}
                  render={() => {
                    return (
                      <div className="col-span-1">

                        <div className="mt-2 space-x-2">
                          <label
                            className="block text-md"
                            data-test-id={addTestIdName({
                              type: 'lbl',
                              name: 'app_id',
                            })}
                          >
                            APP ID
                          </label>
                          <input
                            className="mt-1 min-w-[70%] rounded-md border-green-300 bg-green-100 p-2 text-green-600"
                            data-test-id={addTestIdName({
                              type: 'inp',
                              name: 'app_id',
                            })}
                            readOnly={true}
                            type="text"
                            value={account_id}
                          />
                          <button
                            className="my-auto"
                            data-test-id={addTestIdName({
                              type: 'cpy',
                              name: 'app_id',
                            })}
                            onClick={(event) => handleCopyClick(event, `${account_id}`) }
                          >
                            <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )
                  } }
                />

                <FormField
                  control={control}
                  name={`app_secret`}
                  render={(formRenderProps) => {
                    const { field } = formRenderProps
                    return (
                      <div className="mt-2 space-x-2">
                        <label
                          className="block text-md"
                          data-test-id={addTestIdName({
                            type: 'lbl',
                            name: 'app_secret',
                          })}
                        >
                          APP Secret
                        </label>
                        <div className="relative w-[70%]">
                          <input
                            className="mt-1 w-full rounded-md border-gray-300 bg-gray-100 p-2 pr-10 text-gray-800"
                            data-test-id={addTestIdName({
                              type: 'inp',
                              name: 'app_secret',
                            })}
                            readOnly={true}
                            type={showSecret ? 'text' : 'password'}
                            value={account_secret || app_secret || '***************'}
                          />
                          {/* Eye Toggle Button Inside Input */}
                          <button
                            className = "absolute inset-y-0 right-2 flex items-center"
                            disabled = { field?.disabled }
                            type = "button"
                            onClick = { () => setShowSecret(!showSecret) }
                          >
                            {showSecret
                              ? (
                                  <EyeIcon className="h-5 w-5 text-gray-400" />
                                )
                              : (
                                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                                )}
                          </button>
                          {/* Copy Button Below Input */}
                          {(!!app_secret || !!account_secret) && (
                            <button
                              className="ml-2 absolute -right-6 top-3"
                              data-test-id={addTestIdName({
                                type: 'cpy',
                                name: 'app_secret',
                              })}
                              onClick={(event) => handleCopyClick(event, `${app_secret || account_secret}`)}
                            >
                              <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                            </button>
                          )}
                        </div>

                        <br />
                        {isFromRecord && (
                          <Button
                            className="mt-2"
                            disabled={field?.disabled}
                            size={"xs"}
                            onClick={handleGenerateNewKey}
                          >
                            Generate new key
                          </Button>
                        )}
                      </div>

                    )
                  } }
                />
                <br />
                <FormField
                  control={control}
                  name={`wallguard_configuration`}
                  render={() => {
                    return (
                      <div className="col-span-1 mt-12">
                        <div className="mb-4">
                          <FormLabel
                            data-test-id={addTestIdName({
                              type: 'lbl',
                              name: 'wallguard_configuration',
                            })}
                          >
                            {"Wallguard Configuration"}
                          </FormLabel>
                          <div className="item mt-2 flex gap-x-2 rounded-md bg-primary/10 p-3 text-primary lg:max-w-[70%]">
                            <InfoIcon className="size-4 shrink-0 text-primary" />
                            <div>
                              <h2 className="text-sm font-bold">
                                {"Configure Firewall"}
                              </h2>
                              <p className="text-sm">
                                {"Lorem ipsum dolor sit amet, consectetur"}
                                {"adipiscing elit, sed do eiusmod tempor"}
                                {"incididunt ut labore et dolore magna aliqua. Ut"}
                                {"enim ad minim veniam, quis nostrud exercitation"}
                                {"ullamco laboris nisi ut aliquip ex ea commodo"}
                                {"consequat. Duis aute irure dolor in"}
                                {"reprehenderit in voluptate velit esse cillum"}
                                {"dolore eu fugiat nulla pariatur. Excepteur sint"}
                                {"occaecat cupidatat non proident, sunt in culpa"}
                                {"qui officia deserunt mollit anim id est laborum."}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="">
                          <Image
                            alt=""
                            className="relative w-[100%] max-w-[70%] object-cover md:inset-0"
                            height={"720"}
                            src="/pfSense.png"
                            width={"1080"}
                          />
                        </div>
                      </div>
                    )
                  } }
                />
              </div>
            </>
          </FormItem>
        )
      } }
    />
  )
}
