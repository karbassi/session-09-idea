import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hairstylist Booking Platform",
  description: "Book your mobile hairstyling appointments with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
