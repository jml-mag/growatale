import type { Metadata } from "next";
import { inter } from './fonts'
import "@/app/globals.css";


export const metadata: Metadata = {
  title: "Grow a Tale",
  description: "@matterandgas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
