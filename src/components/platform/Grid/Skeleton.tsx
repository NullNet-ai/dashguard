import { Separator } from '~/components/ui/separator';

export default function Skeleton() {
  return (
    <div className="w-full max-w-full  h-full animate-pulse  ">

      {/* List skeleton items */}
      <div className="space-y-3 mt-2 p-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <>
            <div className="flex-row gap-2 ml-0 flex">
              <div className="h-6 w-8 rounded-full ml-0 mt-0 animate-pulse bg-primary/25 dark:bg-neutral-700"></div>
              <div className="flex-col gap-1 mt-2 w-full ml-0 flex">
                <div className="h-4 w-24 rounded-sm animate-pulse bg-primary/25 dark:bg-neutral-700"></div>
                <div className="h-5 w-full rounded-sm animate-pulse bg-primary/25 dark:bg-neutral-700"></div>
              </div>
              <div className="h-7 w-20 rounded-lg ml-1.5 mr-3 animate-pulse bg-primary/25 dark:bg-neutral-700"></div>
            </div>
            <div className="flex-col gap-0 mt-4 flex">
              <div className="flex-row h-6 ml-9 flex">
                <div className="h-4 w-16 rounded-sm ml-0 animate-pulse bg-primary/25 dark:bg-neutral-700"></div>
                <div className="h-4 w-20 rounded-sm ml-2 animate-pulse bg-primary/25 dark:bg-neutral-700"></div>
                <div className="h-4 w-11 rounded-full ml-2 animate-pulse bg-primary/25 dark:bg-neutral-700"></div>
                <div className="h-4 w-11 rounded-full ml-2 animate-pulse bg-primary/25 dark:bg-neutral-700"></div>
              </div>
            </div>


            <Separator dashed />
          </>
        ))}
      </div>
    </div>
  );
}
