import { ConfigProps } from "~/components/platform/RecordV2/types";

export interface IProps {
    record: React.ReactNode;
    record_summary: React.ReactNode;
    entity_code: string;
    entity_name: string;
    config?: ConfigProps
}
