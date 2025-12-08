import React from 'react';

import type { ILayoutProps } from './types';

const Layout = (props: ILayoutProps) => {

    const { children } = props;
    return (
        <div>
            {children}
        </div>
    );
}

export const dynamic = 'force-dynamic'

export default Layout;