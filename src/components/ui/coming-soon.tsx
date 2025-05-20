import Image from "next/image";

type TComingProps = {
  type: "page" | "component" | 'inner-component';
};

export default function NewComingSoon({ type = "page" }: TComingProps) {

  if (type === 'inner-component') {
    return (
      <div className="w-full p-4  md:px-8 h-[calc(100vh-320px)]  relative">
        <div className="w-full flex flex-col lg:flex-row h-full text-center lg:text-left relative z-10  items-center lg:justify-between justify-start">
          <div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl ">
              Coming Soon
            </h1>
            <p className="mt-2 text-xl leading-7 text-gray-400">
              Thank you for your patience!
            </p>
          </div>
          <div className="lg:block relative  lg:-top-[40px] lg:-right-10">
            <Image
              alt=""
              width={"1080"}
              height={"720"}
              src="/coming-soon.png"
              className="w-[100%] relative object-cover md:inset-0"
            />
          </div>
        </div>
      </div>
    )
  }

  if (type === "component") {
    return (
      <div className="w-full p-4  px-8 h-[calc(100vh-150px)]  relative">
        <div className="w-full flex flex-col lg:flex-row h-full text-center lg:text-left relative z-10  items-center lg:justify-between justify-start">
          <div>
            <a href="#" className="text-center justify-center lg:justify-start flex ">
              <Image
                width={60}
                height={60}
                alt=""
                src="/tailwindLogo.svg"
                className="h-8 w-auto relative lg:-top-40"
              />
            </a>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl ">
              Coming Soon
            </h1>
            <p className="mt-2 text-xl leading-7 text-gray-400">
              Thank you for your patience!
            </p>
          </div>
          <div className="lg:block relative  lg:-top-[40px] lg:-right-10">
            <Image
              alt=""
              width={"1080"}
              height={"720"}
              src="/coming-soon.png"
              className="w-[100%] relative object-cover md:inset-0"
            />
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Coming Soon
            </h1>
            <p className="mt-2 text-xl leading-7 text-gray-400">
              Thank you for your patience!
            </p>
          </div>
        </main>
        <div className="lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
          <Image
            alt=""
            width={"1080"}
            height={"720"}
            src="/coming-soon.png"
            className="absolute inset-auto bottom-[-200px] h-full w-full object-cover md:inset-0"
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
