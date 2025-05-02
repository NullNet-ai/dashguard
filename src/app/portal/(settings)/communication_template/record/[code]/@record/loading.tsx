import { Loader } from '~/components/ui/loader';

export default function Loading() {
  return (
    <div className="flex h-full min-h-[calc(100dvh-160px)] w-full items-center justify-center">
      <Loader
        className="bg-primary text-primary"
        label="Fetching data..."
        size="lg"
        variant="spinner"
      />
    </div>
  );
}
