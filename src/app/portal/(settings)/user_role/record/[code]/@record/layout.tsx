"use client"
import React from "react";
import { useSearchParams } from "next/navigation";

import type { ILayoutProps } from "./types";

const Layout = (props: ILayoutProps) => {

    const searchParams = useSearchParams()

    const slot = props[searchParams.get('current_tab') ?? 'dashboard']

    if (!slot) {
        return <div>Coming Soon</div>
    }
    return <div>
        {slot}
    </div> 
}

export default Layout;