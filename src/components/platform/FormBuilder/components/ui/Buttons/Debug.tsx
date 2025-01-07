import { BugAntIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";

export default function DebugButton({
  handleDebug,
  dataTestID,
}: {
  handleDebug: (e: React.MouseEvent<HTMLButtonElement>) => void;
  dataTestID: string;
}) {
  return (
    <Button
      data-test-id={dataTestID}
      size={"icon"}
      variant={"ghost"}
      onClick={handleDebug}
      className="m-auto h-6 w-6 rounded-full bg-destructive/10 hover:bg-destructive/20"
      type="button"
    >
      <BugAntIcon className="h-4 w-4 cursor-pointer rounded-full border text-destructive" />
    </Button>
  );
}
