import { Toaster } from 'sonner';

export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <section>
            <Toaster />
            {children}
        </section>
    );
}