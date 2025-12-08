'use client';
import { ClipboardCopy, EyeIcon, EyeOffIcon } from 'lucide-react';
import React, { useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { FormField, FormItem } from '~/components/ui/form';
import { useToast } from '~/context/ToastProvider';
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert';
import { CredentialsGenerator } from '../../../actions/credentialGenerator';
import { updateAppSecret } from '../../../actions/updateAppSecret';

interface ISetupDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  orgAccount?: Record<string, string> | null;
  isFromRecord?: boolean;
  params?: Record<string, any>;
  defaultValues?: Record<string, any>;
}

export const AppSecretGenerationInfo = () => {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <Alert variant="info" dismissible>
        <AlertTitle>New key generated.</AlertTitle>
        <AlertContent>Kindly copy the new key to a safe place.</AlertContent>
      </Alert>
    </div>
  );
};

export default function CustomSetupDetails({
  form,
  isFromRecord,
  params,
  defaultValues,
}: ISetupDetails) {
  const { control } = form || {};
  const { app_id, app_secret } = form.getValues() || {};
  const { account_id } = defaultValues || {};

  const toast = useToast();
  const [showInfo, setShowInfo] = React.useState<boolean>(false);
  const [showSecret, setShowSecret] = useState(true);

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleGenerateNewKey = async () => {
    try {
      const generatedAppSecret = CredentialsGenerator.generateAppSecret();

      await updateAppSecret({
        app_id,
        app_secret: generatedAppSecret,
        account_id: account_id,
        device_id : params?.id
      });
      form.setValue('app_secret', generatedAppSecret, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });

      // Show the info alert after successful generation
      setShowInfo(true);

      // Auto hide the info after 5 seconds
      setTimeout(() => {
        setShowInfo(false);
      }, 5000);
    } catch (error) {
      toast.error('Failed to update Organization Account');
    }
  };

  const is_from_record = params?.shell_type === 'record';

  return (
    <FormField
      control={form.control}
      name="Firewall"
      render={() => {
        return (
          <FormItem className="contents">
            <>
              {showInfo && !!app_secret && <AppSecretGenerationInfo />}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`app_id`}
                  render={() => {
                    return (
                      <div className="col-span-1">
                        <div className="mt-2 space-x-2">
                          <label className="block text-md">APP ID</label>
                          <div className="relative w-[70%]">
                            <input
                              className="mt-1 w-full rounded-md border-green-300 bg-green-100 p-2 pr-10 text-green-600"
                              readOnly={true}
                              type="text"
                              value={app_id}
                            />
                            <button
                              className="absolute inset-y-0 right-2 flex items-center text-green-600 hover:text-green-800"
                              type="button"
                              onClick={() => copyToClipboard(app_id)}
                            >
                              <ClipboardCopy className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />

                <FormField
                  control={control}
                  name={`app_secret`}
                  render={(formRenderProps) => {
                    const { field } = formRenderProps;
                    return (
                      <div className="mt-2 space-x-2">
                        <label className="block text-md">APP Secret</label>
                        <div className="relative w-[70%]">
                          <input
                            className="mt-1 w-full rounded-md border-blue-300 bg-blue-100 p-2 pr-20 text-gray-800"
                            readOnly={true}
                            type={
                              showSecret ? 'text' : 'password'
                            }
                            value={app_secret || '*************'}
                          />
                          <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                            {(
                              <>
                                <button
                                  className="text-gray-400 hover:text-gray-600"
                                  type="button"
                                  onClick={() => setShowSecret(!showSecret)}
                                >
                                  {showSecret ? (
                                    <EyeIcon className="h-5 w-5" />
                                  ) : (
                                    <EyeOffIcon className="h-5 w-5" />
                                  )}
                                </button>
                               {app_secret && <button
                                  className="text-gray-400 hover:text-gray-600"
                                  type="button"
                                  onClick={() => copyToClipboard(app_secret)}
                                >
                                  <ClipboardCopy className="h-5 w-5" />
                                </button>}
                              </>
                            )}
                          </div>
                        </div>
                        {app_secret ? (
                          <p className="mt-1 text-sm text-blue-500">
                            This secret will be fully encrypted in an hour. Please copy it somewhere safe.
                          </p> ) :
                          <p className="mt-1 text-sm text-red-500">
                            The app secret is now fully encrypted.
                          </p>
                        }
                        {(!app_secret || isFromRecord) && (
                          <Button
                            className="mt-2"
                            disabled={field?.disabled}
                            size={'xs'}
                            onClick={handleGenerateNewKey}
                          >
                            Generate new key
                          </Button>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </>
          </FormItem>
        );
      }}
    />
  );
}
