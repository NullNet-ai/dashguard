import { SidebarProvider } from '~/components/ui/sidebar';
import SessionChecker from '../session-checker';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={false} className='block'>
            <section>
                <SessionChecker />
                {children}
            </section>
        </SidebarProvider>

    );
}