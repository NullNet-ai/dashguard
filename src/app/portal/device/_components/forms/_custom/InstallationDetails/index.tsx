import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import React from "react";
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
  const copyToClipboard = (value: string) => {
    console.log("%c Line:16 🌮 value", "color:#42b983", value);
    navigator.clipboard.writeText(value).then(
      () => {
        console.log("Copied to clipboard successfully!");
      },
      (err) => {
        console.error("Failed to copy to clipboard: ", err);
      }
    );
  };

  const handleCopyClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    value: string,
  ) => {
    event.preventDefault();
    copyToClipboard(value);
  };

  return (
    <Fragment>
      <FormField
        name="firewall"
        control={form.control}
        render={() => {
          return (
            <div>
              <p>
                Download the following package for your PfSense and install
                using the following directions:
              </p>
              <div className="mt-2 space-x-2">
                <p>1. Download the package</p>
                <input
                  type="text"
                  value="curl-o https://wallmon.ai/wallmon.pkg"
                  readOnly
                  className="mt-1 min-w-96 rounded-md border-orange-300 bg-orange-100 p-2 text-orange-500"
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
              <div className="mt-2 space-x-2">
                <p>2. Install package using the following command:</p>
                <input
                  type="text"
                  value="pkg install Wallmon.pkg"
                  readOnly
                  className="mt-1 min-w-96 rounded-md border-indigo-300 bg-indigo-50 p-2 text-indigo-700"
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
              <div className="mt-2 space-x-2">
                <p>3. Confirm Installation using command</p>
                <input
                  type="text"
                  value="Wallmon --version"
                  readOnly
                  className="mt-1 min-w-96 rounded-md border-green-300 bg-green-100 p-2 text-green-600"
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
