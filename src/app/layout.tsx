import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../../src/components/theme-provider";
import { connectToDatabase } from "../../src/lib/mongodb";
import TanStackQueryProviderWrapper from "../../src/components/providers/tanstack-query-provider-wrapper";
import AuthProvider from "../../src/components/providers/auth-provider";

// Initialize database connection when the app starts
connectToDatabase().catch(console.error);

// Add metadata for the app
export const metadata = {
  title: "GlobalExpress - Worldwide Delivery Services",
  description: "Fast, reliable, and sustainable worldwide delivery services",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TanStackQueryProviderWrapper>
            <AuthProvider>{children}</AuthProvider>
          </TanStackQueryProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
