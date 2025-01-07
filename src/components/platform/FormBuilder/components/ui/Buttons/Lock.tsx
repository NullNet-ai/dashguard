import { LockOpenIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";

export default function LockButton({
  handleLock,
  dataTestID,
}: {
  handleLock: (e: React.MouseEvent<HTMLButtonElement>) => void;
  dataTestID: string;
}) {
  return (
    <Button
      data-test-id={dataTestID}
      size={"icon"}
      variant={"ghost"}
      onClick={handleLock}
      className="m-auto h-6 w-6 rounded-full"
    >
      <LockOpenIcon className="h-4 w-4 cursor-pointer text-blue-500" />
    </Button>
  );
}
