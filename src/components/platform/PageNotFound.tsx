import Image from "next/image";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <>
      <div className="grid grid-cols-1 grid-rows-[1fr,auto,1fr] bg-white lg:grid-cols-[max(50%,36rem),1fr] h-screen overflow-hidden">
        <header className="mx-auto w-full  px-6 pt-16 sm:pt-16 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-14">
          <a href="#">
            <Image
              width={60}
              height={60}
              alt=""
               src="/tailwindLogo.svg"
              className="h-8 w-auto"
            />
          </a>
        </header>
        <main className="mx-auto w-full  px-6 py-2 sm:py-32 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:px-14">
          <div className="w-full text-center lg:text-left relative z-10">
            <div>
              <span className="text-primary text-xl font-semibold">404</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl ">
              Page not found
            </h1>
            <p className="mt-2 text-xl leading-7 text-gray-400 mb-4">
              Sorry, we couldn’t find the page you’re looking for.
            </p>
            <Button variant={'outline'} className="border border-primary/50 text-primary" size={'xs'}>Try Again</Button>
          </div>
        </main>
        <div className=" lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
          <Image
            alt=""
            width={"1080"}
            height={"720"}
            src="/not-found.png"
            className="absolute lg:inset-0 md:bottom-[-260px] inset-auto h-full w-full object-cover  bottom-[-236px]"
          />
        </div>
        <footer>
            <div className="bg-gray-200 fixed bottom-0 py-4 text-xs w-full text-center text-gray-400">
                <span>All Right Reserved {new Date().getFullYear()} DNA Micro<sup>TM</sup></span>
            </div>
        </footer>
      </div>
    </>
  );
}
