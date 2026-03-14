import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

// Load your specific Poppins font weights
const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Health Companion",
  description: "Your health, our priority.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the Poppins font and the light gray background from your CSS */}
      <body className={`${poppins.className} bg-[#f5f7fa] text-[#1e293b] min-h-screen flex flex-col`}>
        <Toaster position="top-right" />
        
        {/* Navbar */}
        <Navbar />

        {/* Main Page Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="text-center py-8 text-[#94a3b8] text-sm bg-white border-t border-gray-100 mt-auto w-full">
          <p>&copy; 2026 Health Companion. Your health, our priority.</p>
        </footer>

      </body>
    </html>
  );
}
