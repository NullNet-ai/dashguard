export interface IRecordWrapperContext {
    isCollapseRecordSummary: boolean;
    onClickCollapseButton?: () => void;
    summaryChildren?: React.ReactNode;
}

export interface IRecordWrapperProviderProps {
    children: React.ReactNode;
    summaryChildren?: React.ReactNode;
}