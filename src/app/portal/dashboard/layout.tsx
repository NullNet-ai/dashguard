import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: any;
  contact: string;
  organization: string;
}

export default function Layout(props: LayoutProps) {
  const { params, children, ...rest } = props;
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pt-0 lg:-mt-4 md:mt-2">
      {/* {children} */}
      {/* <div>Contact: {contact}</div>
      <div>Organization: {organization}</div> */}
      {...Object.values(rest)}
    </section>
  );
}