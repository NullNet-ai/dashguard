import { RecordProps } from "~/components/platform/RecordV2/types";

type TCustomProps = RecordProps & {};
interface ITab {
    id: string;
    name: string;
    tabName: string;
}

export interface IProps {
    record: React.ReactNode;
    record_summary: React.ReactNode;
    tabs: ITab[];
    customProps: TCustomProps;
}


