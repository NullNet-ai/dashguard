import Image from "next/image";
import { Button } from "~/components/ui/button";
import { AlertCircle } from 'lucide-react';

export default function LinkExpiredPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-gray-800 font-sans text-center p-6 bg-white">
            <header className="w-full py-4 flex justify-center items-center ">
                    <Image
                              width={60}
                              height={60}
                              alt=""
                               src="/tailwindLogo.svg"
                              className="h-8 w-auto"
                            />
            </header>
            <main className='flex-1 justify-center items-center flex flex-col'>
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h1 className="text-3xl font-bold my-4">Link Expired</h1>
            <p className="text-lg text-gray-600 mb-4">The link you followed has expired. Please request a new one.</p>
        
            </main>
           
            <footer className="mt-auto py-2 text-xs w-full text-center text-slate-400">
                <span>All Right Reserved {new Date().getFullYear()} DNA Micro<sup>TM</sup></span>
            </footer>
        </div>
    );
}
