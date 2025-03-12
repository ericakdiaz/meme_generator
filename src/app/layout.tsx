import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Meme Generator",
  description: "Generate and vote on AI-created memes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <nav className="bg-white shadow-lg w-full sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <div className="flex justify-between items-center h-16">
              <a href="/" className="text-xl font-bold text-gray-800">
                AI Meme Generator
              </a>
              <div className="flex space-x-4">
                <a href="/" className="text-gray-600 hover:text-gray-800">
                  Home
                </a>
                <a
                  href="/trending"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Trending
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="w-full max-w-6xl mx-auto px-4">{children}</main>
      </body>
    </html>
  );
}
