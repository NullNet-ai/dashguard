import { AlertCircle } from 'lucide-react';
import React from 'react';

export default function Layout() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center font-sans text-gray-800">
      <AlertCircle size={48} className="text-red-500" />
      <h1 className="my-4 text-3xl font-bold">Link Expired</h1>
      <p className="text-lg text-gray-600">
        The link you followed has expired. Please request a new one.
      </p>
    </div>
  );
}
