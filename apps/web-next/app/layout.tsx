import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeiOS",
  description: "Personal AI Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
