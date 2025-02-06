import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { Fragment } from "react";
import { type UseFormReturn } from "react-hook-form";
import { FormField } from "~/components/ui/form";

interface IInstallationDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  selectOptions?: Record<string, any>;
}

export default function CustomInstallationDetails({
  form,
}: IInstallationDetails) {
  const copyToClipboard = async (value: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        return;
      } catch (err) {
        console.error('Clipboard API failed:', err);
      }
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = value;
      
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      textArea.remove();
      
      if (successful) {
      } else {
        console.error('execCommand copy failed');
      }
    } catch (err) {
      console.error('Fallback copy method failed:', err);
    }
  };

  const handleCopyClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: string,
  ) => {
    event.preventDefault();
    copyToClipboard(value);
  };

  // Rest of your component remains the same
  return (
    <Fragment>
      <FormField
        name="firewall"
        control={form.control}
        render={() => {
          return (
            <div className="grid grid-cols-1 gap-2">
              <p className="col-span-2">
                Download the following package for your PfSense and install
                using the following directions:
              </p>
              <div className="col-span-2">

              <div className="mt-2  space-x-4">
                <p>1. Download the package</p>
                <input
                  type="text"
                  value="curl-o https://wallmon.ai/wallmon.pkg"
                  readOnly
                  className="mt-1 md:w-96 rounded-md border-orange-300 bg-orange-100 p-2 text-orange-500"
                />
                <button
                  className="my-auto"
                  onClick={(event) =>
                    handleCopyClick(
                      event,
                      "curl-o https://wallmon.ai/wallmon.pkg",
                    )
                  }
                >
                  <DocumentDuplicateIcon
                    data-test-id="device-download-copy-btn"
                    className="h-5 w-5 text-gray-400"
                  />
                </button>
              </div>
              </div>
              <div className="col-span-2">
              <div className="mt-2 space-x-4">
                <p>2. Install package using the following command:</p>
                <input
                  type="text"
                  value="pkg install Wallmon.pkg"
                  readOnly
                  className="mt-1  md:w-96 rounded-md border-indigo-300 bg-indigo-50 p-2 text-indigo-700"
                />
                <button
                  className="my-auto"
                  onClick={(event) =>
                    handleCopyClick(event, "pkg install Wallmon.pkg")
                  }
                >
                  <DocumentDuplicateIcon
                    data-test-id="device-install-copy-btn"
                    className="h-5 w-5 text-gray-400"
                  />
                </button>
              </div>
              </div>
              
              <div className="mt-2 space-x-4">
                <p>3. Confirm Installation using command</p>
                <input
                  type="text"
                  value="Wallmon --version"
                  readOnly
                  className="mt-1  md:w-96 rounded-md border-green-300 bg-green-100 p-2 text-green-600"
                />
                <button
                  className="my-auto"
                  onClick={(event) =>
                    handleCopyClick(event, "Wallmon --version")
                  }
                >
                  <DocumentDuplicateIcon
                    data-test-id="device-confirm-copy-btn"
                    className="h-5 w-5 text-gray-400"
                  />
                </button>
              </div>
            </div>
          );
        }}
      />
    </Fragment>
  );
}