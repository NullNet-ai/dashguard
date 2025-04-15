export interface ILayoutProps {
    children: React.ReactNode;
    [key: string]: React.ReactNode | undefined;
}

export interface IRouteParams {
    id: string;
}
