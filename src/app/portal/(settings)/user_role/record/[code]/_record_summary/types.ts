export interface ILayoutProps {
    children: React.ReactNode;
}

export interface IErrorProps {
    error: Error & { digest?: string },
    reset: () => void
}
