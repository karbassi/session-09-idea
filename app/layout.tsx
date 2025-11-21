import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hairstylist Booking Platform",
  description: "Book your hairstyling appointment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
