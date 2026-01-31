import type { Metadata } from "next";
import { inter, geist, sourceCodePro } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shrike Media | Elite Creative Engineering",
  description: "Premium photography, videography, and technical consultation for brands that demand excellence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${geist.variable} ${sourceCodePro.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
