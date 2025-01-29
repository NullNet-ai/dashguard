import Image from "next/image";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <>
      <div className="grid h-screen grid-cols-1 grid-rows-[1fr,auto,1fr] overflow-hidden bg-white lg:grid-cols-[max(50%,36rem),1fr]">
        <header className="mx-auto w-full px-6 pt-16 sm:pt-16 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-14">
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
        <main className="mx-auto w-full px-6 py-2 sm:py-32 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:px-14">
          <div className="relative z-10 w-full text-center lg:text-left">
            <div>
              <span className="text-xl font-semibold text-primary">404</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Page not found
            </h1>
            <p className="mb-4 mt-2 text-xl leading-7 text-gray-400">
              Sorry, we couldn’t find the page you’re looking for.
            </p>
            <Button
              variant={"outline"}
              className="border border-primary/50 text-primary"
              size={"xs"}
            >
              Try Again
            </Button>
          </div>
        </main>
        <div className="lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
          <Image
            alt=""
            width={"1080"}
            height={"720"}
            src="/not-found.png"
            className="absolute inset-auto bottom-[-236px] h-full w-full object-cover md:bottom-[-260px] lg:inset-0"
          />
        </div>
        <footer>
          <div className="fixed bottom-0 w-full bg-gray-200 py-4 text-center text-xs text-gray-400">
            <span>
              All Right Reserved {new Date().getFullYear()} DNA Micro
              <sup>TM</sup>
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
