import { SidebarProvider } from '~/components/ui/sidebar';
import SessionChecker from '../session-checker';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={false} className='block'>
            <section className='h-screen flex flex-col'>
            <SessionChecker />
                {children}
            </section>
        </SidebarProvider>

    );
}