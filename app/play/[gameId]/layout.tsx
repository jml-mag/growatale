import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component to wrap around the children components.
 * 
 * @param children - The child components to be wrapped by the Layout.
 * @returns A React component that renders its children.
 */
export default function Layout({
  children,
}: Readonly<LayoutProps>) {
  return <div>{children}</div>;
}
