import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/constants";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${APP_NAME}`,
  description: "ระบบแจ้งซ่อมและติดตามงานซ่อมสำหรับหอพัก TSC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${kanit.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
