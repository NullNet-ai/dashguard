import React, { useState } from "react";
import { Fragment } from "react";
import { type UseFormReturn } from "react-hook-form";
import { FormField } from "~/components/ui/form";
import { CheckIcon } from "lucide-react";
import { Loader } from "~/components/ui/loader";

interface IConfirmationDetails {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  selectOptions?: Record<string, any>;
}

export default function CustomConfirmationDetails({
  form,
}: IConfirmationDetails) {
  const [showLoremIpsum, setShowLoremIpsum] = useState(false);

  const handleClick = () => {
    setShowLoremIpsum(true);
  };

  const instructions = [
    {
      icon: CheckIcon,
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      icon: CheckIcon,
      message:
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      icon: CheckIcon,
      message:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    },
    {
      icon: CheckIcon,
      message:
        "Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.",
    },
  ];

  return (
    <Fragment>
      <FormField
        name="confirmation"
        control={form.control}
        render={() => {
          return (
            <div className="flex min-h-[calc(100vh-400px)] flex-col">
              <div className="w-full text-md lg:max-w-[80%]">
                <p>
                  Wait for your firewall to connect. Once connected you will see
                  it showing its name and API Key including some system
                  information here. If your firewall is not connecting follow{" "}
                  <a
                    href="#"
                    className="font-bold underline"
                    onClick={handleClick}
                  >
                    these
                  </a>{" "}
                  steps to troubleshoot.
                </p>

                <div className="flex flex-col gap-y-2 p-4">
                  {instructions.map((instruction, index) => (
                    <>
                      <p key={index} className="flex gap-x-2">
                        <instruction.icon className="size-5 text-success" />

                        <span style={{ backgroundColor: "transparent" }}>
                          {instruction.message}
                        </span>
                      </p>
                    </>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center">
                <Loader
                  size={"md"}
                  variant={"circularShadow"}
                  className="border-t-primary"
                  label=""
                />
                <p className="mt-2">Waiting for connection ...</p>
              </div>
            </div>
          );
        }}
      />
    </Fragment>
  );
}
