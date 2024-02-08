import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-subtle min-h-screen bg-slate-800 md:p-10 flex flex-col text-sm bg-gradient-to-br from-slate-700 to-slate-800`}
      >
        {children}
      </body>
    </html>
  );
}