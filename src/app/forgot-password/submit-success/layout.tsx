import React from 'react';
import Image from 'next/image';

export default function Layout() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center font-sans text-gray-800">
      {/* <AlertCircle size={48} className="text-red-500" /> */}
      <Image
        alt="Password Reset Successful"
        className="mb-2"
        src="/successSubmit.svg"
        width={250}
        height={250}
      />
      <h1 className="my-4 text-3xl font-bold">Password Reset Request Submitted!</h1>
      <p className="text-lg text-gray-600">
        Your password reset request has been processed.
      </p>
      <p className="text-lg text-gray-600">
        We've sent an email with instructions to set a new password.
      </p>
      <p className="text-lg text-gray-600">
        Please check your inbox and follow the link in the email to complete the
        process.
      </p>
      <p className="text-lg text-gray-600">
        If you don’t see it, check your spam or junk folder.
      </p>
    </div>
  );
}
