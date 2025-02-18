import React from 'react';
import SessionChecker from '~/app/session-checker';

export default function Layout({children}: {children: React.ReactNode}) {
    return (
        <section>
            <SessionChecker />
            {children}
        </section>
    );
}