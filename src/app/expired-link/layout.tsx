import React from 'react';
import Image from 'next/image';

export default function Layout() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center font-sans text-gray-800">
      {/* <AlertCircle size={48} className="text-red-500" /> */}
      <Image
        alt="Expired Email"
        className="mb-2"
        src="/expiredEmail.svg"
        width={250}
        height={250}
      />
      <h1 className="my-4 text-3xl font-bold">Link Expired</h1>
      <p className="text-lg text-gray-600">
        This link has expired. Request a new one to continue.
      </p>
    </div>
  );
}
