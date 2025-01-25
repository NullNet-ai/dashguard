function ComingSoon() {
  return (
    <div className="flex min-h-full flex-col bg-white pb-12 pt-36">
      <main className="mx-auto flex w-full max-w-7xl grow flex-col justify-center px-6 lg:px-8">
        <div className="flex shrink-0 justify-center">
          <a href="#" className="inline-flex">
            <span className="sr-only">Your Company</span>
            <img
              alt=""
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              className="h-12 w-auto"
            />
          </a>
        </div>
        <div className="py-16">
          <div className="text-center">
            <p className="text-base font-semibold text-indigo-600">
              Coming Soon
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Something exciting is coming soon.
            </h1>
            <p className="mt-2 text-base text-gray-500">
              Stay tuned for updates.
            </p>
            <div className="mt-6">
              <a
                href="/portal/dashboard"
                className="text-base font-medium text-indigo-600 hover:text-indigo-500"
              >
                Go back home
                <span aria-hidden="true"> &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </main>
      <footer className="mx-auto w-full max-w-7xl shrink-0 px-6 lg:px-8">
        <nav className="flex justify-center space-x-4">
          <a
            href="#"
            className="text-sm font-medium text-gray-500 hover:text-gray-600"
          >
            Contact Support
          </a>
          <span
            aria-hidden="true"
            className="inline-block border-l border-gray-300"
          />
          <a
            href="#"
            className="text-sm font-medium text-gray-500 hover:text-gray-600"
          >
            Status
          </a>
        </nav>
      </footer>
    </div>
  );
}

export default ComingSoon;
