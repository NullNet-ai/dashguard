import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import React from "react";
import { Fragment } from "react";
import { type UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "~/components/ui/form";
import Image from "next/image";
import { InfoIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CredentialsGenerator } from "~/server/utils/credentials";
import { AppSecretGenerationInfo } from "../AppSecretGenerationInfo";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";

interface ISetupDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  orgAccount?: Record<string, string> | null;
  isFromRecord?: boolean;
  params?: Record<string, any>;
}

const addTestIdName = ({
  type,
  name,
}: {
  type: string;
  name: string;
}): string => `device_${name}-${type}-${name}`;

export default function CustomSetupDetails({
  form,
  orgAccount,
  isFromRecord,
  params,
}: ISetupDetails) {
  const { control } = form;
  const { account_id } = orgAccount || {};

  const toast = useToast();
  const [showInfo, setShowInfo] = React.useState<boolean>(false);

  const updateOrgAccount = api.device.updateOrganizationAccount.useMutation();

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };
  const handleCopyClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: string,
  ) => {
    event.preventDefault();
    copyToClipboard(value);
  };

  const handleGenerateNewKey = async () => {
    try {
      const new_generated_app_secret = CredentialsGenerator.generateAppSecret();
      const response = await updateOrgAccount.mutateAsync({
        id: params?.id,
        account_secret: new_generated_app_secret,
      });

      if (!!response && Object.keys(response).length) {
        toast.success(`${response?.message}`);
      }
      form.setValue("app_secret", new_generated_app_secret, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });

      setShowInfo(true);
    } catch (error) {
      toast.error("Failed to update Organization Account");
    }
  };

  const app_secret = form.watch("app_secret");

  return (
    <FormField
      name="Firewall"
      control={form.control}
      render={() => {
        return (
          <FormItem>
            <Fragment>
              {showInfo && !!app_secret && <AppSecretGenerationInfo />}
              <div className="flex flex-col">
                <div className="grid grid-cols-2 gap-4">
                  <div className="mt-2 space-x-2">
                    <label
                      className="block text-md"
                      data-test-id={addTestIdName({
                        type: "lbl",
                        name: "server_url",
                      })}
                    >
                      Server URL
                    </label>
                    <input
                      data-test-id={addTestIdName({
                        type: "inp",
                        name: "server_url",
                      })}
                      type="text"
                      value="https://wallgaurd.ai/"
                      readOnly
                      className="mt-1 min-w-[80%] rounded-md border-orange-300 bg-orange-100 p-2 text-orange-500"
                    />
                    <button
                      className="my-auto"
                      data-test-id={addTestIdName({
                        type: "cpy",
                        name: "server_url",
                      })}
                      onClick={(event) =>
                        handleCopyClick(event, "https://wallgaurd.ai/")
                      }
                    >
                      <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                  <FormField
                    name={`app_id`}
                    control={control}
                    render={() => {
                      return (
                        <div className="mt-2 space-x-2">
                          <label
                            className="block text-md"
                            data-test-id={addTestIdName({
                              type: "lbl",
                              name: "app_id",
                            })}
                          >
                            APP ID
                          </label>
                          <input
                            data-test-id={addTestIdName({
                              type: "inp",
                              name: "app_id",
                            })}
                            type="text"
                            value={account_id}
                            readOnly
                            className="mt-1 min-w-[80%] rounded-md border-green-300 bg-green-100 p-2 text-green-600"
                          />
                          <button
                            data-test-id={addTestIdName({
                              type: "cpy",
                              name: "app_id",
                            })}
                            className="my-auto"
                            onClick={(event) =>
                              handleCopyClick(event, `${account_id}`)
                            }
                          >
                            <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                          </button>
                        </div>
                      );
                    }}
                  />
                  <FormField
                    name={`app_secret`}
                    control={control}
                    render={(formRenderProps) => {
                      const { field } = formRenderProps;
                      return (
                        <div className="mt-2 space-x-2">
                          <label
                            className="block text-md"
                            data-test-id={addTestIdName({
                              type: "lbl",
                              name: "app_secret",
                            })}
                          >
                            APP Secret
                          </label>
                          <input
                            data-test-id={addTestIdName({
                              type: "inp",
                              name: "app_secret",
                            })}
                            type="text"
                            value={app_secret || "***************"}
                            readOnly
                            className="mt-1 min-w-[80%] rounded-md border-gray-300 bg-gray-100 p-2 text-gray-800"
                          />
                          {!!app_secret && (
                            <button
                              data-test-id={addTestIdName({
                                type: "cpy",
                                name: "app_secret",
                              })}
                              className="my-auto"
                              onClick={(event) =>
                                handleCopyClick(event, `${app_secret}`)
                              }
                            >
                              <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                            </button>
                          )}
                          {isFromRecord && (
                            <Button
                              onClick={handleGenerateNewKey}
                              className="mt-2 border border-primary text-primary"
                              size={"xs"}
                              color="secondary"
                              variant={"secondary"}
                              disabled={field?.disabled}
                            >
                              Generate new key
                            </Button>
                          )}
                        </div>
                      );
                    }}
                  />
                </div>
                <FormField
                  name={`wallguard_configuration`}
                  control={control}
                  render={() => {
                    return (
                      <div className="mt-12">
                        <div className="mb-4">
                          <FormLabel
                            data-test-id={addTestIdName({
                              type: "lbl",
                              name: "wallguard_configuration",
                            })}
                          >
                            Wallguard Configuration
                          </FormLabel>
                          <div className="item mt-2 flex gap-x-2 rounded-md bg-primary/10 p-3 text-primary lg:max-w-[70%]">
                            <InfoIcon className="size-4 shrink-0 text-primary" />
                            <div>
                              <h2 className="text-sm font-bold">
                                Configure Firewall
                              </h2>
                              <p className="text-sm">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit, sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua. Ut
                                enim ad minim veniam, quis nostrud exercitation
                                ullamco laboris nisi ut aliquip ex ea commodo
                                consequat. Duis aute irure dolor in
                                reprehenderit in voluptate velit esse cillum
                                dolore eu fugiat nulla pariatur. Excepteur sint
                                occaecat cupidatat non proident, sunt in culpa
                                qui officia deserunt mollit anim id est laborum.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="">
                          <Image
                            alt=""
                            width={"1080"}
                            height={"720"}
                            src="/pfSense.png"
                            className="relative w-[100%] max-w-[70%] object-cover md:inset-0"
                          />
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            </Fragment>
          </FormItem>
        );
      }}
    />
  );
}
