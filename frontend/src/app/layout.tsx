import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoTasker",
  description:
    "Describe a repetitive task in chat. AutoTasker designs an SOP and runs a background agent on a schedule.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
