import { toast } from "sonner";
import { Alert, AlertContent, AlertTitle } from "~/components/ui/alert";

export const AppSecretGenerationInfo = () => {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <Alert variant="info" dismissible>
        <AlertTitle>New key generated.</AlertTitle>
        <AlertContent>
          Please update the configuration to establish the connection.
        </AlertContent>
      </Alert>
    </div>
  );
};
