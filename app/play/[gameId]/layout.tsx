// @/app/play/[gameId]/layout.tsx

'use client';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: Readonly<LayoutProps>) => {
  return (
    <div>{children}</div>
  );
};

export default Layout;
