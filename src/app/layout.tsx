import type {Metadata} from "next";

import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Funcy",
  description: "Generated by appncy",
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="container m-auto grid min-h-screen grid-rows-[auto_1fr_auto] gap-8 px-4 font-sans antialiased">
        <header className="text-xl leading-[4rem] font-bold">
          <Link href="/">Funcy</Link>
        </header>
        {children}
        <footer className="text-center leading-[4rem] opacity-70">
          Funcy™ made with ❤️ by goncy
        </footer>
      </body>
    </html>
  );
}
