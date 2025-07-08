import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Loader } from '~/components/ui/loader';

export default function CustomConfirmationDetails() {
  const instructions = [
    {
      icon: CheckIcon,
      message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      icon: CheckIcon,
      message:
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
      icon: CheckIcon,
      message:
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    },
    {
      icon: CheckIcon,
      message:
        'Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor.',
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-400px)] flex-col">
      <div className="w-full text-md lg:max-w-[80%]">
        <p>Wait for your device to connect.</p>

        <div className="flex flex-col gap-y-2 p-4">
          {instructions.map((instruction, index) => (
            <>
              <p key={index} className="flex gap-x-2">
                <instruction.icon className="size-5 text-success" />

                <span style={{ backgroundColor: 'transparent' }}>
                  {instruction.message}
                </span>
              </p>
            </>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <Loader
          size={'md'}
          variant={'circularShadow'}
          className="border-t-primary"
          label=""
        />
        <p className="mt-2">Waiting for connection ...</p>
      </div>
    </div>
  );
}
