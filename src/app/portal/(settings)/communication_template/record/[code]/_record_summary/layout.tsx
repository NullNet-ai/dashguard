import React from "react";
import type { ILayoutProps } from "./types";
const Layout = ({ children }: ILayoutProps) => <div>{children}</div>;
export const dynamic = 'force-dynamic'

export default Layout;
