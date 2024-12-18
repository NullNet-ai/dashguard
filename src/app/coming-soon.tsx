import Image from "next/image";

export default function NewComingSoon() {
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
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl ">
              Coming Soon
            </h1>
            <p className="mt-2 text-xl leading-7 text-gray-400">
              Thank you for your patient!
            </p>
          </div>
        </main>
        <div className=" lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
          <Image
            alt=""
            width={"1080"}
            height={"720"}
            src="/coming-soon.png"
            className="absolute md:inset-0  inset-auto h-full w-full object-cover bottom-[-200px]"
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
