import { Moon, Sun } from "lucide-react";
import { Alert, AlertContent, AlertTitle } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";

export default function Page() {
  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      <div className="flex flex-col gap-2">
        <Alert>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertContent>
            You can add components to your app using the cli.
          </AlertContent>
        </Alert>

        <Alert variant="warning">
          <AlertTitle>Warning</AlertTitle>
          <AlertContent>
            This action is irreversible. Please proceed with caution.
          </AlertContent>
        </Alert>

        <Alert variant="error">
          <AlertTitle>Error</AlertTitle>
          <AlertContent>
            Your session has expired. Please log in again.
          </AlertContent>
        </Alert>

        <Alert variant="success">
          <AlertTitle>Success</AlertTitle>
          <AlertContent>
            Your changes have been saved successfully.
          </AlertContent>
        </Alert>

        <Alert variant="info">
          <AlertTitle>Info</AlertTitle>
          <AlertContent>
            This is some important information you should know.
          </AlertContent>
        </Alert>
      </div>

      <div className="flex flex-col gap-2">
        <Alert withAccentBorder>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertContent>
            You can add components to your app using the cli.
          </AlertContent>
        </Alert>

        <Alert variant="warning" withAccentBorder>
          <AlertTitle>Warning</AlertTitle>
          <AlertContent>
            This action is irreversible. Please proceed with caution.
          </AlertContent>
        </Alert>

        <Alert variant="error" withAccentBorder>
          <AlertTitle>Error</AlertTitle>
          <AlertContent>
            Your session has expired. Please log in again.
          </AlertContent>
        </Alert>

        <Alert variant="success" withAccentBorder>
          <AlertTitle>Success</AlertTitle>
          <AlertContent>
            Your changes have been saved successfully.
          </AlertContent>
        </Alert>

        <Alert variant="info" withAccentBorder>
          <AlertTitle>Info</AlertTitle>
          <AlertContent>
            This is some important information you should know.
          </AlertContent>
        </Alert>
      </div>
      <Separator className="col-span-2 my-10" />
      <div className="flex flex-col gap-2">
        <Alert variant="info" dismissible>
          <AlertTitle>Dismissible</AlertTitle>
          <AlertContent>
            To show the dismissible button
          </AlertContent>
        </Alert>
        <Alert Icon={Sun} variant={"warning"}>
          <AlertTitle>Custom Icons</AlertTitle>
          <AlertContent>Example usage of Custom Icon</AlertContent>
        </Alert>
      </div>
    </div>
  );
}
