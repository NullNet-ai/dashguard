import { useEffect } from "react";
import { useEventEmitter } from "~/context/EventEmitterProvider";

const useRefetchRecord = ({
  refetch,
  form_key,
}: {
  refetch: any;
  form_key: string;
}) => {
  const eventEmitter = useEventEmitter();
  useEffect(() => {
    const fetchDetails = async (data: { status: string }) => {
      if (data.status !== "done") return;
      refetch();
    };
    eventEmitter.on(`formStatus:${form_key}`, fetchDetails);
    return () => {
      eventEmitter.off(`formStatus:${form_key}`, fetchDetails);
    };
  }, [form_key, eventEmitter, refetch]);
};

export default useRefetchRecord;
