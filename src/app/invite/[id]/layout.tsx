import SessionChecker from '../../session-checker';

export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <section>
            <SessionChecker/>
            {children}
        </section>
    );
}