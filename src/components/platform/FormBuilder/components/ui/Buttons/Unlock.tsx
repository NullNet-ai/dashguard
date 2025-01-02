import { BugAntIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Button } from "~/components/ui/button";

export default function UnLockButton({
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
      <LockClosedIcon className="h-4 w-4 cursor-pointer rounded-full border" />
    </Button>
  );
}
