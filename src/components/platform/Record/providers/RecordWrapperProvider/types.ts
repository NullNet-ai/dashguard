export interface IRecordWrapperContext {
    isCollapseRecordSummary: boolean;
    onClickCollapseButton?: () => void;
}

export interface IRecordWrapperProviderProps {
    children: React.ReactNode;
}